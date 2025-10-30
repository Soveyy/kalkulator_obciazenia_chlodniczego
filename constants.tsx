import React from 'react';

export const MONTH_NAMES = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export const WINDOW_DIRECTIONS = [
    { value: 'N', label: 'N (0°) - Północ' },
    { value: 'NNE', label: 'NNE (22.5°) - Północno-północno-wschód' },
    { value: 'NE', label: 'NE (45°) - Północny-wschód' },
    { value: 'ENE', label: 'ENE (67.5°) - Wschodnio-północny-wschód' },
    { value: 'E', label: 'E (90°) - Wschód' },
    { value: 'ESE', label: 'ESE (112.5°) - Wschodnio-południowy-wschód' },
    { value: 'SE', label: 'SE (135°) - Południowy-wschód' },
    { value: 'SSE', label: 'SSE (157.5°) - Południowo-południowy-wschód' },
    { value: 'S', label: 'S (180°) - Południe' },
    { value: 'SSW', label: 'SSW (202.5°) - Południowo-południowy-zachód' },
    { value: 'SW', label: 'SW (225°) - Południowy-zachód' },
    { value: 'WSW', label: 'WSW (247.5°) - Zachodnio-południowy-zachód' },
    { value: 'W', label: 'W (270°) - Zachód' },
    { value: 'WNW', label: 'WNW (292.5°) - Zachodnio-północny-zachód' },
    { value: 'NW', label: 'NW (315°) - Północny-zachód' },
    { value: 'NNW', label: 'NNW (337.5°) - Północno-północny-zachód' },
];


export const WINDOW_AZIMUTHS: { [key: string]: number } = {
    'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5, 'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
    'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5, 'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
};

export const CompassArrow: React.FC<{ rotation: number }> = ({ rotation }) => (
    <div style={{ transform: `rotate(${rotation}deg)` }} className="absolute top-1 right-1 w-12 h-12 transition-transform duration-500 origin-center">
        <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 2.99.71-.71z" />
        </svg>
    </div>
);


// Dane temperatur dla Warszawy
export const AVG_MAX_TEMPERATURES: { [key: number]: number } = {
    1: -0.1, 2: 1.1, 3: 6.2, 4: 13.5, 5: 19.3, 6: 22.5,
    7: 24.5, 8: 23.9, 9: 18.5, 10: 12.5, 11: 5.9, 12: 1.3
};

export const RECORD_TEMPERATURES: { [key: number]: number } = {
    1: 13.8, 2: 17.2, 3: 22.9, 4: 30.5, 5: 32.8, 6: 36.6,
    7: 37.0, 8: 37.1, 9: 34.9, 10: 28.3, 11: 19.3, 12: 15.6
};

// Shading constants
export const SHADING_TYPE_LABELS: { [key: string]: string } = {
    louvers: 'Żaluzje / Fasadowe',
    draperies: 'Zasłony',
    roller_shades: 'Rolety',
    insect_screens: 'Moskitiery'
};

export const SHADING_LOCATION_LABELS: { [key: string]: string } = {
    indoor: 'Wewnętrzne',
    outdoor: 'Zewnętrzne'
};

export const LOUVERS_LOCATION_LABELS = SHADING_LOCATION_LABELS;

export const LOUVERS_COLOR_LABELS: { [key: string]: string } = {
    light: 'Jasne, matowe',
    medium: 'Średnie, matowe',
    dark: 'Ciemne, matowe'
};

export const LOUVERS_COLOR_DESCRIPTIONS: { [key: string]: string } = {
    light: 'Współczynnik odbicia promieniowania słonecznego > 0.6',
    medium: 'Współczynnik odbicia promieniowania słonecznego 0.3 - 0.6',
    dark: 'Współczynnik odbicia promieniowania słonecznego < 0.3'
};

export const LOUVERS_SETTING_LABELS: { [key: string]: string } = {
    open_0: 'Otwarte (0°)',
    tilted_45: 'Uchylone (45°)',
    closed_90: 'Zamknięte (90°)'
};

export const DRAPERY_MATERIAL_LABELS: { [key: string]: string } = {
    open: 'Tkanina otwarta',
    semiopen: 'Tkanina półotwarta',
    closed: 'Tkanina zamknięta',
    sheer: 'Tkanina przezroczysta'
};

export const ROLLER_SHADE_SETTING_LABELS: { [key: string]: string } = {
    light_translucent: 'Jasna, półprzezroczysta',
    light_opaque: 'Jasna, nieprzezroczysta',
    dark_opaque: 'Ciemna, nieprzezroczysta'
};

// Internal gains constants
export const PEOPLE_ACTIVITY_LEVELS: { [key: string]: { label: string, sensible: number, latent: number, radiantFraction: number } } = {
    seated_very_light: { label: 'Bardzo lekka, siedząca (115 W)', sensible: 70, latent: 45, radiantFraction: 0.60 },
    standing_light: { label: 'Lekka, stojąca (130 W)', sensible: 75, latent: 55, radiantFraction: 0.58 },
    walking_moderate: { label: 'Umiarkowana, chód (295 W)', sensible: 110, latent: 185, radiantFraction: 0.49 },
    heavy_sport: { label: 'Ciężka, sport (525 W)', sensible: 210, latent: 315, radiantFraction: 0.54 },
};


export const LIGHTING_TYPES: { [key: string]: { label: string, powerDensity: number, radiativeFraction: number, spaceFraction: number } } = {
    led_troffer: { label: 'Panele LED', powerDensity: 8.0, radiativeFraction: 0.37, spaceFraction: 1.0 },
    fluorescent_troffer: { label: 'Oprawy świetlówkowe', powerDensity: 17.0, radiativeFraction: 0.43, spaceFraction: 1.0 },
    incandescent: { label: 'Żarówki tradycyjne', powerDensity: 30.0, radiativeFraction: 0.82, spaceFraction: 1.0 },
    halogen: { label: 'Halogeny', powerDensity: 25.0, radiativeFraction: 0.70, spaceFraction: 1.0 }
};

export const EQUIPMENT_PRESETS: { [key: string]: { label: string, power: number } } = {
    pc: { label: 'Komputer PC', power: 150 },
    laptop: { label: 'Laptop', power: 60 },
    monitor: { label: 'Monitor', power: 40 },
    printer: { label: 'Drukarka laserowa', power: 100 },
    tv: { label: 'Telewizor LED', power: 80 },
    coffee: { label: 'Ekspres do kawy', power: 1200 },
};

export const WINDOW_PRESETS: { [key: string]: { u: number, shgc: number } } = {
    custom: { u: 1.1, shgc: 0.6 },
    modern: { u: 0.9, shgc: 0.5 },
    standard: { u: 1.1, shgc: 0.6 },
    older_double: { u: 1.8, shgc: 0.7 },
    historic: { u: 4.8, shgc: 0.82 }
};

export const WINDOW_TYPE_DESCRIPTIONS: { [key: string]: string } = {
    modern: 'Okna stosowane najczęściej po 2015 roku. Obecne warunki techniczne (WT2021) dla nowych budynków spełnia tylko ten typ (wymagane U ≤ 0,9 W/m²K). Charakteryzują się zrównoważonym współczynnikiem g (SHGC) w zakresie 0,40-0,55. Zbudowane z 3 szyb z 1-2 powłokami niskoemisyjnymi, z przestrzeniami wypełnionymi gazem szlachetnym (najczęściej argonem).',
    standard: 'Najpopularniejszy typ okien montowany od końca lat 90. do ok. 2015 roku. Spełniały starsze normy (np. WT2014, U ≤ 1,3 W/m²K). Posiadają dwie szyby, z czego jedna pokryta jest powłoką niskoemisyjną (Low-E), a przestrzeń jest wypełniona gazem szlachetnym. Mają wyższy współczynnik SHGC (ok. 0,55-0,65) niż okna 3-szybowe.',
    older_double: 'Okna zespolone z lat 80. i 90., sprzed ery powszechnego stosowania powłok niskoemisyjnych. Zbudowane z dwóch szyb, ale przestrzeń między nimi często wypełniona jest zwykłym powietrzem. Ich izolacyjność znacznie gorsza (U > 2,0 W/m²K) oraz przepuszczają więcej energii słonecznej (SHGC > 0,70).',
    historic: 'Okna spotykane w budynkach zabytkowych lub bardzo starych. Zbudowane z pojedynczej tafli szkła. Zapewniają minimalną izolację termiczną (U > 5,0 W/m²K) i przepuszczają niemal całą energię słoneczną (SHGC > 0,80).'
};