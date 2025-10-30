import { AllData, Window, AccumulationSettings, CalculationResults } from '../types';
import { SHGC_DIFFUSE_MULTIPLIERS, SHGC_DIRECT_CORRECTION_CURVES } from '../constants';

function interpolate(x: number, x0: number, y0: number, x1: number, y1: number): number {
    return (x1 === x0) ? y0 : y0 + (x - x0) * (y1 - y0) / (x1 - x0);
}

function getCorrectedSHGC(window: Window, nsrdbDirData: any, hour: number) {
    const angleOfIncidence = nsrdbDirData.theta[hour];
    const baseSHGC = window.shgc;
    const diffuseMultiplier = SHGC_DIFFUSE_MULTIPLIERS[window.type] || 1.0;
    const shgc_diffuse = baseSHGC * diffuseMultiplier;
    if (angleOfIncidence >= 90) return { shgc_direct: 0, shgc_diffuse };

    const curve = SHGC_DIRECT_CORRECTION_CURVES[window.type];
    const angles = Object.keys(curve).map(Number);
    let x0 = angles.filter(a => a <= angleOfIncidence).pop();
    let x1 = angles.find(a => a >= angleOfIncidence);

    if (x0 === undefined) x0 = 0;
    if (x1 === undefined) x1 = 90;

    return {
        shgc_direct: baseSHGC * interpolate(angleOfIncidence, x0, curve[x0], x1, curve[x1]),
        shgc_diffuse
    };
}

function getRTSFactors(allData: AllData, massType: string, floorType: string, glassPercentage: number, radiationType: 'solar' | 'nonsolar'): number[] {
    let factorsByFloor = allData.rts[massType]?.[floorType];
    if (!factorsByFloor) {
        console.error(`Missing RTS data for mass: ${massType} and floor: ${floorType}`);
        return Array(24).fill(0);
    }

    const availableGlassPercentages = Object.keys(factorsByFloor).map(Number);
    let selectedGlassP = glassPercentage;
    if (!availableGlassPercentages.includes(glassPercentage)) {
        if (glassPercentage <= 30) selectedGlassP = 10;
        else if (glassPercentage <= 70) selectedGlassP = 50;
        else selectedGlassP = 90;
    }

    let factors = factorsByFloor[selectedGlassP]?.[radiationType] || [];
    if (factors.length === 0) {
        console.error(`Missing RTS data for ${massType}/${floorType}/${selectedGlassP}/${radiationType}`);
    }
    return factors.concat(Array(24 - factors.length).fill(0));
}


function applyRTS(radiantHeatGainProfile: number[], rtsFactors: number[]): number[] {
    const coolingLoadProfile = Array(24).fill(0);
    for (let n = 0; n < 24; n++) {
        let currentLoad = 0;
        for (let k = 0; k < 24; k++) {
            currentLoad += (rtsFactors[k] || 0) * (radiantHeatGainProfile[(n - k + 24) % 24] || 0);
        }
        coolingLoadProfile[n] = currentLoad;
    }
    return coolingLoadProfile;
}

export function generateTemperatureProfile(tExtMax: number, month: string, allData: AllData): number[] {
    const typicalProfile = allData.pvgis[month]?.T2m;
    if (!typicalProfile || typicalProfile.length !== 24) {
        const tAmplitude = 12.0;
        const tMin = tExtMax - tAmplitude;
        const tAvg = (tExtMax + tMin) / 2;
        const isSummerTime = (parseInt(month, 10) >= 4 && parseInt(month, 10) <= 10);
        const peakHourUTC = isSummerTime ? 13 : 14;
        const profile: number[] = [];
        for (let h = 0; h < 24; h++) {
            profile.push(tAvg + (tExtMax - tAvg) * Math.cos(2 * Math.PI * (h - peakHourUTC) / 24));
        }
        return profile;
    }
    const tTypMax = Math.max(...typicalProfile);
    const delta = tExtMax - tTypMax;
    return typicalProfile.map((t: number) => t + delta);
}

function getShadingFactors(window: Window, hour: number, month: string, allData: AllData, forceDisableShading = false) {
    if (forceDisableShading || !window.shading || !window.shading.enabled) {
        return { iac_beam: 1.0, iac_diff: 1.0, fr: 1.0, is_indoor: false };
    }

    const { type, location, setting } = window.shading;
    let { color, material } = window.shading;
    const windowTypeKey = window.type === 'custom' ? 'standard' : window.type;
    const db = allData.shading[windowTypeKey];

    if (!db) return { iac_beam: 1.0, iac_diff: 1.0, fr: 1.0, is_indoor: false };

    let factors;
    const is_indoor = location === 'indoor';

    switch (type) {
        case 'louvers':
            factors = db.louvers?.[location]?.[color]?.[setting];
            if (!factors) return { iac_beam: 1.0, iac_diff: 1.0, fr: 1.0, is_indoor };
            const nsrdbDirData = allData.nsrdb[month]?.[window.direction];
            const omega = nsrdbDirData?.omega?.[hour] ?? 0;
            const iac_beam = factors.iac0 + (factors.iac60 - factors.iac0) * Math.min(1.2 * omega, 60) / 60;
            return { iac_beam, iac_diff: factors.iac_diff, fr: factors.fr, is_indoor };
        case 'draperies':
            const draperyKey = material === 'sheer' ? 'sheer' : `${material}_${color}`;
            factors = db.draperies?.[draperyKey];
            break;
        case 'roller_shades':
            factors = db.roller_shades?.[setting];
            break;
        case 'insect_screens':
            factors = db.insect_screens?.[location];
            break;
        default:
            return { iac_beam: 1.0, iac_diff: 1.0, fr: 1.0, is_indoor: false };
    }

    if (!factors) return { iac_beam: 1.0, iac_diff: 1.0, fr: 1.0, is_indoor };
    const iac = factors.iac || 1.0;
    return { iac_beam: iac, iac_diff: iac, fr: factors.fr, is_indoor };
}

export function calculateSolarGainsForMonth(windows: Window[], month: string, allData: AllData, forceDisableShading = false): { total: number } {
    const solarGainsClearSky = Array(24).fill(0);
    const monthDataNSRDB = allData.nsrdb[month];
    if (!monthDataNSRDB) return { total: 0 };

    windows.forEach(win => {
        const area = win.width * win.height;
        const nsrdbDirData = monthDataNSRDB[win.direction];
        if (nsrdbDirData) {
            for (let h = 0; h < 24; h++) {
                const shadingFactors = getShadingFactors(win, h, month, allData, forceDisableShading);
                const correctedSHGC = getCorrectedSHGC(win, nsrdbDirData, h);
                const Gcs_total = nsrdbDirData.Gcs[h] || 0;
                const Gcs_direct = nsrdbDirData.Gb[h] || 0;
                const rawSolarGain_beam = (Gcs_direct * correctedSHGC.shgc_direct) * area;
                const rawSolarGain_diff = ((Gcs_total - Gcs_direct) * correctedSHGC.shgc_diffuse) * area;
                solarGainsClearSky[h] += rawSolarGain_beam * shadingFactors.iac_beam + rawSolarGain_diff * shadingFactors.iac_diff;
            }
        }
    });
    return { total: solarGainsClearSky.reduce((a, b) => a + b, 0) };
}

export function calculateGainsForMonth(
    windows: Window[],
    tInt: number,
    tExtProfile: number[],
    month: string,
    allData: AllData,
    accumulation: AccumulationSettings,
    forceDisableShading = false
): CalculationResults {
    const finalGains = { global: Array(24).fill(0), clearSky: Array(24).fill(0) };
    const allComponents = {
        clearSky: { solar: Array(24).fill(0), conductionRadiant: Array(24).fill(0), conductionConvective: Array(24).fill(0) },
        global: { solar: Array(24).fill(0), conductionRadiant: Array(24).fill(0), conductionConvective: Array(24).fill(0) }
    };
    const incidentSolarPower = Array(24).fill(0);

    windows.forEach(win => {
        const area = win.width * win.height;
        const nsrdbDirData = allData.nsrdb[month]?.[win.direction];
        if (nsrdbDirData && nsrdbDirData.Gcs) {
            for (let h = 0; h < 24; h++) {
                incidentSolarPower[h] += (nsrdbDirData.Gcs[h] || 0) * area;
            }
        }
    });

    ['clearSky', 'global'].forEach(scenario => {
        const totalConvectiveGains = Array(24).fill(0);
        const solarRadiantGains = Array(24).fill(0);
        const nonSolarRadiantGains = Array(24).fill(0);

        const componentSolarGains = Array(24).fill(0);
        const componentConductionRadiant = Array(24).fill(0);
        const componentConductionConvective = Array(24).fill(0);

        windows.forEach(win => {
            const area = win.width * win.height;
            const pvgisDirData = allData.pvgis[month]?.[win.direction];
            const nsrdbDirData = allData.nsrdb[month]?.[win.direction];

            if (pvgisDirData && nsrdbDirData) {
                for (let h = 0; h < 24; h++) {
                    const tExt = tExtProfile[h];
                    const conductiveTotal = win.u * area * (tExt - tInt);
                    const radiativeFractionCond = win.shgc <= 0.55 ? 0.46 : 0.33;
                    const radiantCond = conductiveTotal * radiativeFractionCond;
                    const convectiveCond = conductiveTotal * (1 - radiativeFractionCond);

                    componentConductionRadiant[h] += radiantCond;
                    componentConductionConvective[h] += convectiveCond;
                    nonSolarRadiantGains[h] += radiantCond;
                    totalConvectiveGains[h] += convectiveCond;

                    const shadingFactors = getShadingFactors(win, h, month, allData, forceDisableShading);
                    const correctedSHGC = getCorrectedSHGC(win, nsrdbDirData, h);
                    
                    let beamIrradiance, diffuseIrradiance;
                    if (scenario === 'clearSky') {
                        beamIrradiance = nsrdbDirData.Gb[h] || 0;
                        diffuseIrradiance = (nsrdbDirData.Gcs[h] || 0) - beamIrradiance;
                    } else {
                        beamIrradiance = pvgisDirData.Gb[h] || 0;
                        diffuseIrradiance = (pvgisDirData.G[h] || 0) - beamIrradiance;
                    }

                    const rawBeamGain = (beamIrradiance * correctedSHGC.shgc_direct) * area;
                    const rawDiffuseGain = (diffuseIrradiance * correctedSHGC.shgc_diffuse) * area;

                    const attenuatedBeamGain = rawBeamGain * shadingFactors.iac_beam;
                    const attenuatedDiffuseGain = rawDiffuseGain * shadingFactors.iac_diff;
                    componentSolarGains[h] += attenuatedBeamGain + attenuatedDiffuseGain;

                    const radiantBeam = attenuatedBeamGain * shadingFactors.fr;
                    const convectiveBeam = attenuatedBeamGain * (1 - shadingFactors.fr);
                    const radiantDiffuse = attenuatedDiffuseGain * shadingFactors.fr;
                    const convectiveDiffuse = attenuatedDiffuseGain * (1 - shadingFactors.fr);
                    
                    totalConvectiveGains[h] += convectiveBeam + convectiveDiffuse;
                    
                    if (shadingFactors.is_indoor) {
                        nonSolarRadiantGains[h] += radiantBeam + radiantDiffuse;
                    } else {
                        solarRadiantGains[h] += radiantBeam;
                        nonSolarRadiantGains[h] += radiantDiffuse;
                    }
                }
            }
        });

        if (accumulation.include) {
            const solarRTSFactors = getRTSFactors(allData, accumulation.thermalMass, accumulation.floorType, accumulation.glassPercentage, 'solar');
            const nonSolarRTSFactors = getRTSFactors(allData, accumulation.thermalMass, accumulation.floorType, accumulation.glassPercentage, 'nonsolar');
            
            const solarCoolingLoad = applyRTS(solarRadiantGains, solarRTSFactors);
            const nonSolarCoolingLoad = applyRTS(nonSolarRadiantGains, nonSolarRTSFactors);

            for (let h = 0; h < 24; h++) {
                finalGains[scenario as keyof typeof finalGains][h] = totalConvectiveGains[h] + solarCoolingLoad[h] + nonSolarCoolingLoad[h];
            }
        } else {
            for (let h = 0; h < 24; h++) {
                finalGains[scenario as keyof typeof finalGains][h] = totalConvectiveGains[h] + solarRadiantGains[h] + nonSolarRadiantGains[h];
            }
        }
        allComponents[scenario as keyof typeof allComponents].solar = componentSolarGains;
        allComponents[scenario as keyof typeof allComponents].conductionRadiant = componentConductionRadiant;
        allComponents[scenario as keyof typeof allComponents].conductionConvective = componentConductionConvective;
    });

    return {
        finalGains,
        components: {
            solarGainsGlobal: allComponents.global.solar,
            solarGainsClearSky: allComponents.clearSky.solar,
            conductionGainsRadiant: allComponents.clearSky.conductionRadiant,
            conductionGainsConvective: allComponents.clearSky.conductionConvective
        },
        incidentSolarPower
    };
}