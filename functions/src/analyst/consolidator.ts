import { getMacroEconomicData } from "../finance/fred";
import { getGdacsDisasters } from "../disasters/gdacs";
import { getSignificantEarthquakes } from "../geology/usgs";
import { getTopTechNews } from "../intelligence/hackernews";

export async function aggregateGlobalState(fredApiKey: string) {
    const [macro, disasters, geology, tech] = await Promise.all([
        getMacroEconomicData(fredApiKey),
        getGdacsDisasters(),
        getSignificantEarthquakes(),
        getTopTechNews()
    ]);

    return {
        timestamp: new Date().toISOString(),
        summary: {
            macro: macro.map(m => ({ series: m.title, value: m.value, change: m.changePct })),
            disasters: disasters.slice(0, 5).map(d => ({ type: d.type, title: d.title, level: d.alertLevel, country: d.country })),
            geology: geology.slice(0, 5).map((g: any) => ({ title: g.title, severity: g.severity, desc: g.desc })),
            tech: tech.slice(0, 5).map((t: any) => ({ title: t.title, score: t.score }))
        }
    };
}
