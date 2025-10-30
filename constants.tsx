import React from 'react';

export const MONTH_NAMES = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

export const RECORD_TEMPERATURES: { [key: number]: number } = { 1: 18.9, 2: 22.1, 3: 25.6, 4: 32.5, 5: 35.7, 6: 38.3, 7: 39.5, 8: 39.0, 9: 36.8, 10: 28.9, 11: 26.2, 12: 20.1 };
export const AVG_MAX_TEMPERATURES: { [key: number]: number } = { 1: 1.0, 2: 2.7, 3: 7.5, 4: 14.3, 5: 19.5, 6: 22.8, 7: 25.2, 8: 24.6, 9: 19.1, 10: 12.8, 11: 7.3, 12: 2.5 };

export const WINDOW_AZIMUTHS: { [key: string]: number } = { "N": 0, "NNE": 22.5, "NE": 45, "ENE": 67.5, "E": 90, "ESE": 112.5, "SE": 135, "SSE": 157.5, "S": 180, "SSW": 202.5, "SW": 225, "WSW": 247.5, "W": 270, "WNW": 292.5, "NW": 315, "NNW": 337.5 };

export const WINDOW_DIRECTIONS = [
    { value: "S", label: "S (180°) - Południe" },
    { value: "SSW", label: "SSW (202.5°) - Połud.-połud.-zachód" },
    { value: "SW", label: "SW (225°) - Południowy-zachód" },
    { value: "WSW", label: "WSW (247.5°) - Zach.-połud.-zachód" },
    { value: "W", label: "W (270°) - Zachód" },
    { value: "WNW", label: "WNW (292.5°) - Zach.-północny-zachód" },
    { value: "NW", label: "NW (315°) - Północny-zachód" },
    { value: "NNW", label: "NNW (337.5°) - Północny-północny-zachód" },
    { value: "N", label: "N (0°) - Północ" },
    { value: "NNE", label: "NNE (22.5°) - Północny-północny-wschód" },
    { value: "NE", label: "NE (45°) - Północny-wschód" },
    { value: "ENE", label: "ENE (67.5°) - Wsch.-północny-wschód" },
    { value: "E", label: "E (90°) - Wschód" },
    { value: "ESE", label: "ESE (112.5°) - Wsch.-południowy-wschód" },
    { value: "SE", label: "SE (135°) - Południowy-wschód" },
    { value: "SSE", label: "SSE (157.5°) - Połud.-południowy-wschód" },
];

export const WINDOW_PRESETS: { [key: string]: { u: number | string, shgc: number | string } } = {
    'custom': { u: '', shgc: '' },
    'modern': { u: 0.9, shgc: 0.5 },
    'standard': { u: 1.3, shgc: 0.6 },
    'older_double': { u: 2.2, shgc: 0.7 },
    'historic': { u: 5.0, shgc: 0.8 }
};

export const WINDOW_TYPE_LABELS: { [key: string]: string } = {
    'custom': 'Własne...',
    'modern': 'Nowoczesne (3-szybowe)',
    'standard': 'Standardowe (2-szybowe)',
    'older_double': 'Starsze (2-szybowe)',
    'historic': 'Historyczne (1-szybowe)'
};

export const SHADING_TYPE_LABELS: { [key: string]: string } = {
    'louvers': 'Żaluzje (poziome)',
    'draperies': 'Zasłony materiałowe',
    'roller_shades': 'Rolety',
    'insect_screens': 'Moskitiera'
};

export const SHADING_LOCATION_LABELS: { [key: string]: string } = {
    'indoor': 'Wewnętrzna',
    'outdoor': 'Zewnętrzna'
};

export const LOUVERS_LOCATION_LABELS: { [key: string]: string } = {
    'indoor': 'Wewnętrzna',
    'outdoor': 'Zewnętrzna (fasadowa)'
};


export const LOUVERS_COLOR_LABELS: { [key: string]: string } = {
    'light': 'Jasne',
    'medium': 'Średnie',
    'dark': 'Ciemne'
};

export const LOUVERS_SETTING_LABELS: { [key: string]: string } = {
    'open_0': 'Otwarte (0°)',
    'tilted_45': 'Uchylone (45°)',
    'closed': 'Zamknięte'
};

export const DRAPERY_MATERIAL_LABELS: { [key: string]: string } = {
    'open': 'Splot otwarty',
    'semiopen': 'Splot półotwarty',
    'closed': 'Splot zamknięty',
    'sheer': 'Firanka'
};

export const ROLLER_SHADE_SETTING_LABELS: { [key: string]: string } = {
    'light_translucent': 'Jasna przezroczysta',
    'light_gray_translucent': 'Jasnoszara przezroczysta',
    'dark_gray_translucent': 'Ciemnoszara przezroczysta',
    'reflective_white_translucent': 'Biała refleksyjna - przezroczysta',
    'white_opaque': 'Biała nieprzezroczysta',
    'dark_opaque': 'Ciemna nieprzezroczysta',
    'reflective_white_opaque': 'Biała refleksyjna - nieprzezroczysta'
};


export const WINDOW_DESCRIPTIONS: { [key: string]: string } = {
    'custom': 'Wprowadź własne wartości dla współczynników U oraz SHGC.',
    'modern': 'Okna stosowane najczęściej po 2015 roku. Obecne warunki techniczne (WT2021) dla nowych budynków spełnia tylko ten typ (wymagane U ≤ 0,9 W/m²K). Charakteryzują się zrównoważonym współczynnikiem g (SHGC) w zakresie 0,40-0,55. Zbudowane z 3 szyb z 1-2 powłokami niskoemisyjnymi, z przestrzeniami wypełnionymi gazem szlachetnym (najczęściej argonem).',
    'standard': 'Najpopularniejszy typ okien montowany od końca lat 90. do ok. 2015 roku. Spełniały starsze normy (np. WT2014, U ≤ 1,3 W/m²K). Posiadają dwie szyby, z czego jedna pokryta jest powłoką niskoemisyjną (Low-E), a przestrzeń jest wypełniona gazem szlachetnym. Mają wyższy współczynnik SHGC (ok. 0,55-0,65) niż okna 3-szybowe.',
    'older_double': 'Okna zespolone z lat 80. i 90., sprzed ery powszechnego stosowania powłok niskoemisyjnych. Zbudowane z dwóch szyb, ale przestrzeń między nimi często wypełniona jest zwykłym powietrzem. Ich izolacyjność znacznie gorsza (U > 2,0 W/m²K) oraz przepuszczają więcej energii słonecznej (SHGC > 0,70).',
    'historic': 'Okna spotykane w budynkach zabytkowych lub bardzo starych. Zbudowane z pojedynczej tafli szkła. Zapewniają minimalną izolację termiczną (U > 5,0 W/m²K) i przepuszczają niemal całą energię słoneczną (SHGC > 0,80).'
};

export const LOUVERS_COLOR_DESCRIPTIONS: { [key: string]: string } = {
    'light': '(Refleksyjność ~0.8): np. białe lub polerowane aluminium. Odbijają najwięcej promieniowania.',
    'medium': '(Refleksyjność ~0.5): np. matowe, malowane lamele lub jasne drewno. Zrównoważone odbicie i absorpcja.',
    'dark': '(Refleksyjność ~0.15): np. ciemne drewno, antracyt. Pochłaniają najwięcej promieniowania, nagrzewając się.'
};

export const DRAPERIES_TYPE_DESCRIPTIONS: { [key: string]: string } = {
    'open': 'Wskazówka: Lekka tkanina, przepuszczająca dużo światła i zapewniająca widok.',
    'semiopen': 'Wskazówka: Tkanina pośrednia, częściowo przepuszczająca światło.',
    'closed': 'Wskazówka: Ciężka tkanina, nieprzezroczysta, blokująca światło.',
    'sheer': 'Wskazówka: Bardzo lekka, transparentna tkanina.'
};

export const SHGC_DIFFUSE_MULTIPLIERS: { [key: string]: number } = { 'modern': 0.86, 'standard': 0.88, 'older_double': 0.86, 'historic': 0.90, 'custom': 1.0 };

export const SHGC_DIRECT_CORRECTION_CURVES: { [key: string]: { [key: number]: number } } = {
    'modern': { 0: 1.00, 10: 1.00, 20: 1.00, 30: 0.99, 40: 0.97, 50: 0.92, 60: 0.82, 70: 0.62, 80: 0.30, 90: 0.00 },
    'standard': { 0: 1.00, 10: 1.00, 20: 1.00, 30: 0.99, 40: 0.97, 50: 0.93, 60: 0.85, 70: 0.68, 80: 0.37, 90: 0.00 },
    'older_double': { 0: 1.00, 10: 1.00, 20: 1.00, 30: 0.99, 40: 0.97, 50: 0.92, 60: 0.83, 70: 0.65, 80: 0.34, 90: 0.00 },
    'historic': { 0: 1.00, 10: 1.00, 20: 1.00, 30: 0.99, 40: 0.98, 50: 0.95, 60: 0.90, 70: 0.77, 80: 0.48, 90: 0.00 },
    'custom': { 0: 1.00, 10: 1.00, 20: 1.00, 30: 0.99, 40: 0.98, 50: 0.95, 60: 0.90, 70: 0.77, 80: 0.48, 90: 0.00 }
};

export const Tooltip: React.FC<{ text: React.ReactNode; children: React.ReactNode }> = ({ text, children }) => {
    return (
        <span className="relative group flex items-center gap-1.5 cursor-help">
            {children}
            <span className="font-bold text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-full w-4 h-4 inline-flex justify-center items-center text-[11px] flex-shrink-0">
                ?
            </span>
            <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity w-80 bg-slate-800 dark:bg-slate-900 text-white text-left text-sm font-normal rounded-lg py-2 px-3 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 shadow-lg before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-slate-800 dark:before:border-t-slate-900">
                {text}
            </span>
        </span>
    );
};

export const CompassArrow: React.FC<{ rotation: number }> = ({ rotation }) => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="absolute top-2.5 right-2.5 w-12 h-12 transition-transform duration-500 ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}>
        <path d="M12 2 L18.5 21 L12 17 L5.5 21 Z" stroke="#e74c3c" strokeWidth="1.5" strokeLinejoin="miter" strokeMiterlimit="10" />
        <path d="M12 2 L18.5 21 L12 17 Z" fill="#e74c3c" />
    </svg>
);

export const CompassRose: React.FC<{rotation: number}> = ({rotation}) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-auto max-w-sm transition-transform duration-500 ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1"/>
        <path d="M50 0 L45 15 L50 10 L55 15 Z" fill="currentColor"/>
        <text x="48" y="25" fontSize="8" fill="currentColor">N</text>
        <path d="M50 100 L45 85 L50 90 L55 85 Z" fill="currentColor"/>
        <text x="48" y="80" fontSize="8" fill="currentColor">S</text>
        <path d="M0 50 L15 45 L10 50 L15 55 Z" fill="currentColor"/>
        <text x="20" y="53" fontSize="8" fill="currentColor">W</text>
        <path d="M100 50 L85 45 L90 50 L85 55 Z" fill="currentColor"/>
        <text x="75" y="53" fontSize="8" fill="currentColor">E</text>
        <line x1="50" y1="15" x2="50" y2="35" stroke="currentColor" strokeWidth="0.5"/>
        <line x1="50" y1="85" x2="50" y2="65" stroke="currentColor" strokeWidth="0.5"/>
        <line x1="15" y1="50" x2="35" y2="50" stroke="currentColor" strokeWidth="0.5"/>
        <line x1="85" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="0.5"/>
        
        <g transform="rotate(45 50 50)">
            <path d="M50 2 L48 12 L50 8 L52 12 Z" fill="currentColor" opacity="0.6"/>
            <path d="M50 98 L48 88 L50 92 L52 88 Z" fill="currentColor" opacity="0.6"/>
            <path d="M2 50 L12 48 L8 50 L12 52 Z" fill="currentColor" opacity="0.6"/>
            <path d="M98 50 L88 48 L92 50 L88 52 Z" fill="currentColor" opacity="0.6"/>
        </g>
    </svg>
);