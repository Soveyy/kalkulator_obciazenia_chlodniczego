import { ChartType } from 'chart.js';

export type AppTab = 'internal' | 'windows' | 'summary';

export interface Shading {
  enabled: boolean;
  type: 'louvers' | 'draperies' | 'roller_shades' | 'insect_screens';
  location: 'indoor' | 'outdoor';
  color: 'light' | 'medium' | 'dark';
  setting: string; // Specific to type, e.g., 'open_0', 'tilted_45', 'light_translucent'
  material: 'open' | 'semiopen' | 'closed' | 'sheer';
}

export interface Window {
  id: number;
  type: 'custom' | 'modern' | 'standard' | 'older_double' | 'historic';
  direction: string;
  u: number;
  shgc: number;
  width: number;
  height: number;
  shading: Shading;
}

export interface AccumulationSettings {
    include: boolean;
    thermalMass: 'light' | 'medium' | 'heavy' | 'very_heavy';
    floorType: 'panels' | 'tiles' | 'carpet';
    glassPercentage: 10 | 50 | 90;
}

export interface PeopleGains {
    enabled: boolean;
    count: number;
    activityLevel: 'seated_very_light' | 'standing_light' | 'walking_moderate' | 'heavy_sport';
    startHour: number;
    endHour: number;
}

export interface LightingGains {
    enabled: boolean;
    type: string;
    powerDensity: number;
    startHour: number;
    endHour: number;
}

export interface EquipmentGains {
    id: number;
    name: string;
    power: number;
    quantity: number;
    startHour: number;
    endHour: number;
}

export interface InternalGains {
    people: PeopleGains;
    lighting: LightingGains;
    equipment: EquipmentGains[];
}
export interface InputState {
    tInternal: string;
    tExternal: string;
    roomArea: string;
}

export interface CalculationResultData {
    sensible: number[];
    latent: number[];
    total: number[];
}

export interface CalculationComponents {
    solarGainsGlobal: number[];
    solarGainsClearSky: number[];
    conductionGainsRadiant: number[];
    conductionGainsConvective: number[];
    internalGainsSensibleRadiant: number[];
    internalGainsSensibleConvective: number[];
    internalGainsLatent: number[];
}

export interface WindowCalculationResult {
    global: CalculationResultData;
    clearSky: CalculationResultData;
    incidentSolarPower: number[];
}

export interface CalculationLoadComponents {
    solar: number[];
    conduction: number[];
    internalSensible: number[];
}

export interface CalculationResults {
    finalGains: {
        global: CalculationResultData;
        clearSky: CalculationResultData;
    };
    internalGainsLoad: CalculationResultData;
    windowGainsLoad: {
        global: CalculationResultData;
        clearSky: CalculationResultData;
    },
    components: CalculationComponents;
    loadComponents: CalculationLoadComponents;
    incidentSolarPower: number[];
}

export interface AllData {
    pvgis: any;
    nsrdb: any;
    rts: any;
    shading: any;
}

export type ToastType = 'info' | 'success' | 'danger';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export type ChartViewType = ChartType;