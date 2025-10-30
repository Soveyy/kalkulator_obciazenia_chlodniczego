import { Window, AccumulationSettings, InternalGains, AllData, InputState, CalculationResults, Shading } from '../types';
import { PEOPLE_ACTIVITY_LEVELS, LIGHTING_TYPES } from '../constants';

// A placeholder for a more complex RTS implementation
function applyRTS(radiantGains: number[], rtsFactors: number[]): number[] {
    const coolingLoad = Array(24).fill(0);
    for (let hour = 0; hour < 24; hour++) {
        for (let i = 0; i < 24; i++) {
            coolingLoad[(hour + i) % 24] += radiantGains[hour] * rtsFactors[i];
        }
    }
    return coolingLoad;
}

function getRtsFactors(accumulation: AccumulationSettings, allData: AllData, solar: boolean): number[] {
    const { thermalMass, floorType, glassPercentage } = accumulation;
    const rtsSeriesType = solar ? 'solar' : 'nonsolar';
    
    // Fallback logic in case the exact key doesn't exist.
    const fallbackFactors = allData.rts['medium']['panels']['50'][rtsSeriesType];
    
    try {
        const factors = allData.rts[thermalMass]?.[floorType]?.[String(glassPercentage) as "10" | "50" | "90"]?.[rtsSeriesType];
        return factors || fallbackFactors;
    } catch(e) {
        console.error("Could not find RTS factors, using fallback.", e);
        return fallbackFactors;
    }
}

function getShadingFactor(window: Window, allData: AllData): number {
    const { shading, type: windowType } = window;
    if (!shading.enabled) return 1.0;
    
    // Find the correct DB for the window type, fallback to 'standard'
    const shadingDbForWindowType = allData.shading[windowType as keyof typeof allData.shading] || allData.shading.standard;

    try {
        switch (shading.type) {
            case 'louvers':
                // Using iac_diff for diffuse radiation as a simplification
                return shadingDbForWindowType.louvers?.[shading.location]?.[shading.color]?.[shading.setting]?.iac_diff || 1.0;
            case 'draperies':
                return shadingDbForWindowType.draperies?.[shading.setting]?.iac || 1.0;
            case 'roller_shades':
                return shadingDbForWindowType.roller_shades?.[shading.setting]?.iac || 1.0;
            case 'insect_screens':
                 return shadingDbForWindowType.insect_screens?.[shading.location]?.iac || 1.0;
            default:
                return 1.0;
        }
    } catch (e) {
        console.error("Error getting shading factor", e);
        return 1.0;
    }
}


export function generateTemperatureProfile(tExternalMax: number, month: string, allData: AllData): number[] {
    const tProfile: number[] = [];
    const monthData = allData.pvgis[month] || allData.pvgis['7'];
    if (!monthData || !monthData.T2m || monthData.T2m.length < 24) {
        // Fallback to a simple sinusoidal profile if data is missing
        const tMin = tExternalMax - 10;
        for (let i = 0; i < 24; i++) {
            const temp = (tExternalMax + tMin) / 2 - ((tExternalMax - tMin) / 2) * Math.cos((2 * Math.PI * (i - 14)) / 24);
            tProfile.push(temp);
        }
        return tProfile;
    }
    
    const hourlyTemps = monthData.T2m;
    const maxTempInProfile = Math.max(...hourlyTemps);
    const delta = tExternalMax - maxTempInProfile;
    
    return hourlyTemps.map((t: number) => t + delta);
}

export function calculateWorstMonth(windows: Window[], allData: AllData): string {
    if (!windows || windows.length === 0) return '7';

    let maxSolarGain = 0;
    let worstMonth = '7';

    // Ograniczenie do miesięcy od kwietnia do września
    for (let month = 4; month <= 9; month++) {
        let monthSolarGain = 0;
        const monthStr = month.toString();

        if (allData.nsrdb[monthStr]) {
            for (const window of windows) {
                const area = window.width * window.height;
                const dirData = allData.nsrdb[monthStr][window.direction];
                // Używamy Gcs (Global Clear Sky) do oceny najgorszego przypadku
                if (dirData && dirData.Gcs) {
                    const dailyIrradiance = dirData.Gcs.reduce((sum: number, val: number) => sum + val, 0);
                    monthSolarGain += dailyIrradiance * area * window.shgc;
                }
            }
        }
        
        if (monthSolarGain > maxSolarGain) {
            maxSolarGain = monthSolarGain;
            worstMonth = monthStr;
        }
    }

    return worstMonth;
}


export function calculateGainsForMonth(
    windows: Window[],
    input: InputState,
    tExtProfile: number[],
    month: string,
    allData: AllData,
    accumulation: AccumulationSettings,
    internalGains: InternalGains,
    isWithoutShading: boolean
): CalculationResults {
    const tInternal = parseFloat(input.tInternal) || 24;
    const roomArea = parseFloat(input.roomArea) || 20;

    const solarGainsGlobal = Array(24).fill(0);
    const solarGainsClearSky = Array(24).fill(0);
    const conductionGains = Array(24).fill(0);
    const incidentSolarPower = Array(24).fill(0);

    const rtsFactorsSolar = getRtsFactors(accumulation, allData, true);
    const rtsFactorsNonSolar = getRtsFactors(accumulation, allData, false);

    // Window Gains
    windows.forEach(win => {
        const area = win.width * win.height;
        const shgc = win.shgc;
        const u = win.u;
        
        const dirDataCS = allData.nsrdb[month]?.[win.direction] || { Gcs: Array(24).fill(0) };
        const dirDataGlobal = allData.pvgis[month]?.[win.direction] || { G: Array(24).fill(0) };
        
        const shadingFactor = isWithoutShading ? 1.0 : getShadingFactor(win, allData);

        for (let hour = 0; hour < 24; hour++) {
            const solarGainCS = (dirDataCS.Gcs[hour] || 0) * area * shgc * shadingFactor;
            const solarGainGlobal = (dirDataGlobal.G[hour] || 0) * area * shgc * shadingFactor;
            solarGainsClearSky[hour] += solarGainCS;
            solarGainsGlobal[hour] += solarGainGlobal;

            const tempDiff = tExtProfile[hour] - tInternal;
            conductionGains[hour] += u * area * tempDiff;
            
            incidentSolarPower[hour] += (dirDataCS.Gcs[hour] || 0) * area;
        }
    });
    
    const conductionGainsRadiant = conductionGains.map(g => g * 0.6); // Assume 60% is radiant
    const conductionGainsConvective = conductionGains.map(g => g * 0.4); // Assume 40% is convective

    // Internal Gains
    const internalGainsSensibleRadiant = Array(24).fill(0);
    const internalGainsSensibleConvective = Array(24).fill(0);
    const internalGainsLatent = Array(24).fill(0);

    // People
    if (internalGains.people.enabled) {
        const activity = PEOPLE_ACTIVITY_LEVELS[internalGains.people.activityLevel];
        if (activity) {
            for (let hour = internalGains.people.startHour; hour < internalGains.people.endHour; hour++) {
                internalGainsSensibleRadiant[hour] += internalGains.people.count * activity.sensible * activity.radiantFraction;
                internalGainsSensibleConvective[hour] += internalGains.people.count * activity.sensible * (1 - activity.radiantFraction);
                internalGainsLatent[hour] += internalGains.people.count * activity.latent;
            }
        }
    }

    // Lighting
    if (internalGains.lighting.enabled && roomArea > 0) {
        const lightingType = LIGHTING_TYPES[internalGains.lighting.type];
        if (lightingType) {
            for (let h = internalGains.lighting.startHour; h < internalGains.lighting.endHour; h++) {
                const totalHeat = internalGains.lighting.powerDensity * roomArea;
                const heatToSpace = totalHeat * lightingType.spaceFraction;
                internalGainsSensibleRadiant[h] += heatToSpace * lightingType.radiativeFraction;
                internalGainsSensibleConvective[h] += heatToSpace * (1 - lightingType.radiativeFraction);
            }
        }
    }
    
    // Equipment
    internalGains.equipment.forEach(item => {
        for (let hour = item.startHour; hour < item.endHour; hour++) {
            internalGainsSensibleRadiant[hour] += item.power * item.quantity * 0.5; // Assume 50% radiant
            internalGainsSensibleConvective[hour] += item.power * item.quantity * 0.5; // Assume 50% convective
        }
    });

    // Accumulation (RTS) & Load Components (Clear Sky)
    const solarLoadCS = accumulation.include ? applyRTS(solarGainsClearSky, rtsFactorsSolar) : solarGainsClearSky;
    const conductionLoad = accumulation.include ? applyRTS(conductionGainsRadiant, rtsFactorsNonSolar).map((r, i) => r + conductionGainsConvective[i]) : conductionGains;
    const internalSensibleLoad = accumulation.include ? applyRTS(internalGainsSensibleRadiant, rtsFactorsNonSolar).map((r, i) => r + internalGainsSensibleConvective[i]) : internalGainsSensibleRadiant.map((r, i) => r + internalGainsSensibleConvective[i]);
    
    const sensibleLoadCS = Array(24).fill(0).map((_, i) => solarLoadCS[i] + conductionLoad[i] + internalSensibleLoad[i]);
    const totalLoadCS = sensibleLoadCS.map((g, i) => Math.max(0, g + internalGainsLatent[i]));

    // Global calculations
    const solarRadiantLoadGlobal = accumulation.include ? applyRTS(solarGainsGlobal, rtsFactorsSolar) : solarGainsGlobal;
    const nonSolarRadiantLoad = accumulation.include ? applyRTS(conductionGainsRadiant.map((g,i) => g + internalGainsSensibleRadiant[i]), rtsFactorsNonSolar) : conductionGainsRadiant.map((g,i) => g + internalGainsSensibleRadiant[i]);
    const radiantLoadGlobal = solarRadiantLoadGlobal.map((g, i) => g + nonSolarRadiantLoad[i]);
    const sensibleLoadGlobal = radiantLoadGlobal.map((g, i) => g + conductionGainsConvective[i] + internalGainsSensibleConvective[i]);
    const totalLoadGlobal = sensibleLoadGlobal.map((g, i) => Math.max(0, g + internalGainsLatent[i]));

    // For internal gains chart
    const internalRadiantLoad = accumulation.include ? applyRTS(internalGainsSensibleRadiant, rtsFactorsNonSolar) : internalGainsSensibleRadiant;
    const internalSensibleLoadChart = internalRadiantLoad.map((g,i) => g + internalGainsSensibleConvective[i]);
    
    // For window gains chart
    const windowSolarLoadCS = accumulation.include ? applyRTS(solarGainsClearSky, rtsFactorsSolar) : solarGainsClearSky;
    const windowConductionLoad = accumulation.include ? applyRTS(conductionGainsRadiant, rtsFactorsNonSolar).map((r, i) => r + conductionGainsConvective[i]) : conductionGains;
    const windowSensibleLoadCS = windowSolarLoadCS.map((g, i) => g + windowConductionLoad[i]);
    
    const windowSolarLoadGlobal = accumulation.include ? applyRTS(solarGainsGlobal, rtsFactorsSolar) : solarGainsGlobal;
    const windowSensibleLoadGlobal = windowSolarLoadGlobal.map((g, i) => g + windowConductionLoad[i]);

    return {
        finalGains: {
            global: { sensible: sensibleLoadGlobal, latent: internalGainsLatent, total: totalLoadGlobal },
            clearSky: { sensible: sensibleLoadCS, latent: internalGainsLatent, total: totalLoadCS },
        },
        internalGainsLoad: {
            sensible: internalSensibleLoadChart, latent: internalGainsLatent, total: internalSensibleLoadChart.map((g,i) => g + internalGainsLatent[i])
        },
        windowGainsLoad: {
            global: { sensible: windowSensibleLoadGlobal, latent: Array(24).fill(0), total: windowSensibleLoadGlobal },
            clearSky: { sensible: windowSensibleLoadCS, latent: Array(24).fill(0), total: windowSensibleLoadCS },
        },
        components: {
            solarGainsGlobal,
            solarGainsClearSky,
            conductionGainsRadiant,
            conductionGainsConvective,
            internalGainsSensibleRadiant,
            internalGainsSensibleConvective,
            internalGainsLatent
        },
        loadComponents: {
            solar: solarLoadCS,
            conduction: conductionLoad,
            internalSensible: internalSensibleLoad
        },
        incidentSolarPower,
    };
}