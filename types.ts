
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

export interface CalculationResultData {
    global: number[];
    clearSky: number[];
}

export interface CalculationComponents {
    solarGainsGlobal: number[];
    solarGainsClearSky: number[];
    conductionGainsRadiant: number[];
    conductionGainsConvective: number[];
}

export interface CalculationResults {
    finalGains: CalculationResultData;
    components: CalculationComponents;
    incidentSolarPower: number[];
}

export interface AllData {
    pvgis: any;
    nsrdb: any;
    rts: any;
    shading: any;
}
