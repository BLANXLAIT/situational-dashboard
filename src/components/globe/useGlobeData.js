import { useState, useEffect, useCallback } from 'react';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function useGlobeData() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch('/api/globe/events');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setEvents(data.events || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchEvents]);

    return { events, loading, error, refetch: fetchEvents };
}
