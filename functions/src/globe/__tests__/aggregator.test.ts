import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all data source modules before importing aggregator
vi.mock('../../geology/usgs', () => ({
    getSignificantEarthquakes: vi.fn(),
}));
vi.mock('../../disasters/gdacs', () => ({
    getGdacsDisasters: vi.fn(),
}));
vi.mock('../../geology/spaceweather', () => ({
    getSpaceWeatherAlerts: vi.fn(),
}));
vi.mock('../../health/diseases', () => ({
    getOutbreakAlerts: vi.fn(),
}));
vi.mock('firebase-functions/logger', () => ({
    info: vi.fn(),
    warn: vi.fn(),
}));

import { aggregateGlobeData } from '../aggregator';
import { getSignificantEarthquakes } from '../../geology/usgs';
import { getGdacsDisasters } from '../../disasters/gdacs';
import { getSpaceWeatherAlerts } from '../../geology/spaceweather';
import { getOutbreakAlerts } from '../../health/diseases';

const mockUsgs = vi.mocked(getSignificantEarthquakes);
const mockGdacs = vi.mocked(getGdacsDisasters);
const mockNoaa = vi.mocked(getSpaceWeatherAlerts);
const mockWho = vi.mocked(getOutbreakAlerts);

beforeEach(() => {
    vi.resetAllMocks();
    mockUsgs.mockResolvedValue([]);
    mockGdacs.mockResolvedValue([]);
    mockNoaa.mockResolvedValue([]);
    mockWho.mockResolvedValue([]);
});

describe('aggregateGlobeData', () => {
    it('returns empty array when all sources return empty', async () => {
        const events = await aggregateGlobeData();
        expect(events).toEqual([]);
    });

    it('normalizes USGS earthquakes with lat/lng', async () => {
        mockUsgs.mockResolvedValue([{
            id: 'us123',
            type: 'Earthquake',
            severity: 'high',
            title: '7.2 Earthquake in Chile',
            time: 'Jan 1, 2026',
            timestamp: '2026-01-01T00:00:00.000Z',
            lat: -33.4,
            lng: -70.6,
            mag: 7.2,
            desc: 'Magnitude 7.2 earthquake',
        }]);

        const events = await aggregateGlobeData();
        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
            id: 'us123',
            source: 'usgs',
            lat: -33.4,
            lng: -70.6,
            severity: 0.9,
            isGlobal: false,
        });
    });

    it('normalizes GDACS disasters with lat/lng', async () => {
        mockGdacs.mockResolvedValue([{
            id: 'gdacs-EQ-999',
            type: 'Earthquake',
            eventCode: 'EQ',
            alertLevel: 'orange' as const,
            title: 'Earthquake in Turkey',
            country: 'Turkey',
            severity: 'Magnitude 6.0',
            time: 'Jan 1, 2026',
            timestamp: '2026-01-01T00:00:00.000Z',
            lat: 38.9,
            lng: 35.2,
            reportUrl: 'https://gdacs.org/report',
        }]);

        const events = await aggregateGlobeData();
        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
            source: 'gdacs',
            severity: 0.6,
            lat: 38.9,
            lng: 35.2,
        });
    });

    it('marks space weather events as global', async () => {
        mockNoaa.mockResolvedValue([{
            id: 'noaa-0-2026',
            type: 'Solar Flare',
            severity: 'high',
            title: 'Major solar storm',
            time: 'Jan 1, 2026',
            timestamp: '2026-01-01T00:00:00.000Z',
            desc: 'X-class flare detected',
        }]);

        const events = await aggregateGlobeData();
        expect(events).toHaveLength(1);
        expect(events[0].isGlobal).toBe(true);
        expect(events[0].source).toBe('noaa');
    });

    it('maps WHO outbreaks to country centroids', async () => {
        mockWho.mockResolvedValue([{
            id: 'who-marburg-brazil',
            title: 'Marburg virus disease — Brazil',
            summary: 'Outbreak reported',
            date: '2026-01-01',
            url: 'https://who.int/item',
            severity: 'high',
        }]);

        const events = await aggregateGlobeData();
        expect(events).toHaveLength(1);
        expect(events[0].lat).toBeCloseTo(-14.2, 0);
        expect(events[0].lng).toBeCloseTo(-51.9, 0);
    });

    it('skips WHO outbreaks with unrecognized country', async () => {
        mockWho.mockResolvedValue([{
            id: 'who-unknown',
            title: 'Disease outbreak in Atlantis',
            summary: 'Unknown location',
            date: '2026-01-01',
            url: 'https://who.int/item',
            severity: 'low',
        }]);

        const events = await aggregateGlobeData();
        expect(events).toHaveLength(0);
    });

    it('is resilient to individual source failures', async () => {
        mockUsgs.mockRejectedValue(new Error('USGS down'));
        mockGdacs.mockResolvedValue([{
            id: 'gdacs-TC-1',
            type: 'Tropical Cyclone',
            eventCode: 'TC',
            alertLevel: 'red' as const,
            title: 'Cyclone in Philippines',
            country: 'Philippines',
            severity: 'Category 5',
            time: 'Jan 1, 2026',
            timestamp: '2026-01-01T00:00:00.000Z',
            lat: 12.9,
            lng: 121.8,
            reportUrl: 'https://gdacs.org/report',
        }]);

        const events = await aggregateGlobeData();
        expect(events).toHaveLength(1);
        expect(events[0].source).toBe('gdacs');
    });
});
