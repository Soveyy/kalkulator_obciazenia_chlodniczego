import React, { createContext, useReducer, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import { Window, AccumulationSettings, CalculationResults, AllData, Shading, InternalGains, EquipmentGains, InputState, AppTab } from '../types';
import { calculateWorstMonth, calculateGainsForMonth, generateTemperatureProfile } from '../services/calculationService';
import { loadAllData } from '../services/dataService';
import { MONTH_NAMES } from '../constants';

interface State {
    windows: Window[];
    input: { tInternal: string; tExternal: string; roomArea: string };
    accumulation: AccumulationSettings;
    internalGains: InternalGains;
    allData: AllData | null;
    results: { withShading: CalculationResults, withoutShading: CalculationResults } | null;
    activeResults: CalculationResults | null;
    isShadingViewActive: boolean;
    currentMonth: string;
    resultMessage: string;
    tExtProfile: number[];
    chartType: 'line' | 'bar';
    modal: { isOpen: boolean; type?: string | null; data?: any };
    theme: 'light' | 'dark';
    toasts: { id: number; message: string; type: 'info' | 'success' | 'danger' }[];
    activeTab: AppTab;
    selectedDirection: string | null;
    hoveredDirection: string | null;
}

type Action = 
    | { type: 'SET_ALL_DATA'; payload: AllData }
    | { type: 'SET_INPUT'; payload: { tInternal: string; tExternal: string; roomArea: string } }
    | { type: 'ADD_WINDOW' }
    | { type: 'UPDATE_WINDOW'; payload: Window }
    | { type: 'DELETE_WINDOW'; payload: number }
    | { type: 'DUPLICATE_WINDOW'; payload: number }
    | { type: 'UPDATE_ALL_SHADING'; payload: Partial<Shading> & { enabled: boolean } }
    | { type: 'SET_ACCUMULATION'; payload: AccumulationSettings }
    | { type: 'SET_INTERNAL_GAINS'; payload: InternalGains }
    | { type: 'ADD_EQUIPMENT_ITEM'; payload?: { name: string; power: number } }
    | { type: 'DELETE_EQUIPMENT_ITEM'; payload: number }
    | { type: 'SET_RESULTS'; payload: { results: { withShading: CalculationResults, withoutShading: CalculationResults }; month: string; tExtProfile: number[], message: string } }
    | { type: 'CLEAR_RESULTS' }
    | { type: 'SET_ACTIVE_RESULTS'; payload: CalculationResults }
    | { type: 'SET_SHADING_VIEW'; payload: boolean }
    | { type: 'RECALCULATE_VIEW'; payload: string }
    | { type: 'TOGGLE_CHART_TYPE' }
    | { type: 'SET_MODAL'; payload: { isOpen: boolean; type?: string | null; data?: any } }
    | { type: 'ADD_TOAST'; payload: { message: string; type: 'info' | 'success' | 'danger' } }
    | { type: 'REMOVE_TOAST'; payload: number }
    | { type: 'SAVE_PROJECT' }
    | { type: 'LOAD_PROJECT' }
    | { type: 'SET_STATE'; payload: Partial<State> }
    | { type: 'SET_ACTIVE_TAB'; payload: AppTab }
    | { type: 'SET_SELECTED_DIRECTION', payload: string | null }
    | { type: 'SET_HOVERED_DIRECTION', payload: string | null };


const initialState: State = {
    windows: [],
    input: { tInternal: '24', tExternal: '35', roomArea: '25' },
    accumulation: {
        include: true,
        thermalMass: 'very_heavy',
        floorType: 'panels',
        glassPercentage: 50
    },
    internalGains: {
        people: {
            enabled: false,
            count: 1,
            activityLevel: 'seated_very_light',
            startHour: 8,
            endHour: 16,
        },
        lighting: {
            enabled: false,
            type: 'led_troffer',
            powerDensity: 8.0,
            startHour: 8,
            endHour: 16,
        },
        equipment: [],
    },
    allData: null,
    results: null,
    activeResults: null,
    isShadingViewActive: true,
    currentMonth: '7',
    resultMessage: '',
    tExtProfile: [],
    chartType: 'line',
    modal: { isOpen: false, type: null, data: null },
    theme: 'light',
    toasts: [],
    activeTab: 'internal',
    selectedDirection: null,
    hoveredDirection: null,
};

let toastId = 0;

function calculatorReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_ALL_DATA':
            return { ...state, allData: action.payload };
        case 'SET_INPUT':
            return { ...state, input: action.payload };
        case 'ADD_WINDOW': {
            const newWindow: Window = {
                id: state.windows.length > 0 ? Math.max(...state.windows.map(w => w.id)) + 1 : 1,
                type: 'modern', direction: 'S', u: 0.9, shgc: 0.5, width: 1.0, height: 2.2,
                shading: { enabled: false, type: 'louvers', location: 'indoor', color: 'light', setting: 'tilted_45', material: 'open' }
            };
            return { ...state, windows: [...state.windows, newWindow] };
        }
        case 'UPDATE_WINDOW':
            return { ...state, windows: state.windows.map(w => w.id === action.payload.id ? action.payload : w) };
        case 'DELETE_WINDOW': {
            const windowsAfterDelete = state.windows.filter(w => w.id !== action.payload);
            const renumberedWindows = windowsAfterDelete.map((w, index) => ({
                ...w,
                id: index + 1
            }));
            return { ...state, windows: renumberedWindows };
        }
        case 'DUPLICATE_WINDOW': {
            const windowToDuplicate = state.windows.find(w => w.id === action.payload);
            if (!windowToDuplicate) return state;
            const newWindow: Window = {
                ...windowToDuplicate,
                id: state.windows.length > 0 ? Math.max(...state.windows.map(w => w.id)) + 1 : 1,
            };
            return { ...state, windows: [...state.windows, newWindow] };
        }
         case 'UPDATE_ALL_SHADING': {
            return {
                ...state,
                windows: state.windows.map(win => ({
                    ...win,
                    shading: { ...win.shading, ...action.payload }
                }))
            };
        }
        case 'SET_ACCUMULATION':
            return { ...state, accumulation: action.payload };
        case 'SET_INTERNAL_GAINS':
            return { ...state, internalGains: action.payload };
        case 'ADD_EQUIPMENT_ITEM': {
            const newId = state.internalGains.equipment.length > 0 ? Math.max(...state.internalGains.equipment.map(e => e.id)) + 1 : 1;
            const newItem: EquipmentGains = {
                id: newId,
                name: action.payload?.name || 'Nowe urządzenie',
                power: action.payload?.power || 100,
                quantity: 1,
                startHour: 8,
                endHour: 17,
            };
            return {
                ...state,
                internalGains: {
                    ...state.internalGains,
                    equipment: [...state.internalGains.equipment, newItem]
                }
            };
        }
        case 'DELETE_EQUIPMENT_ITEM': {
            return {
                ...state,
                internalGains: {
                    ...state.internalGains,
                    equipment: state.internalGains.equipment.filter(item => item.id !== action.payload)
                }
            };
        }
        case 'SET_RESULTS':
            return { 
                ...state, 
                results: action.payload.results,
                currentMonth: action.payload.month,
                tExtProfile: action.payload.tExtProfile,
                resultMessage: action.payload.message,
                activeResults: state.isShadingViewActive 
                    ? action.payload.results.withShading 
                    : action.payload.results.withoutShading,
            };
        case 'CLEAR_RESULTS':
            return { ...state, results: null, activeResults: null, resultMessage: '' };
        case 'SET_SHADING_VIEW': {
            if (!state.results) return state;
            return {
                ...state,
                isShadingViewActive: action.payload,
                activeResults: action.payload ? state.results.withShading : state.results.withoutShading,
            };
        }
        case 'RECALCULATE_VIEW': {
            if (!state.allData || !state.results) return state;
            const newMonth = action.payload;
            const tExtProfile = generateTemperatureProfile(parseFloat(state.input.tExternal), newMonth, state.allData);
            const resultsWithShading = calculateGainsForMonth(state.windows, state.input, tExtProfile, newMonth, state.allData, state.accumulation, state.internalGains, false);
            const resultsWithoutShading = calculateGainsForMonth(state.windows, state.input, tExtProfile, newMonth, state.allData, state.accumulation, state.internalGains, true);

            const newResults = { withShading: resultsWithShading, withoutShading: resultsWithoutShading };
            
            return {
                ...state,
                currentMonth: newMonth,
                tExtProfile: tExtProfile,
                results: newResults,
                activeResults: state.isShadingViewActive ? newResults.withShading : newResults.withoutShading,
            };
        }
        case 'TOGGLE_CHART_TYPE':
            return { ...state, chartType: state.chartType === 'line' ? 'bar' : 'line' };
        case 'SET_MODAL':
            if (!action.payload.isOpen) {
                return { ...state, modal: action.payload, selectedDirection: null, hoveredDirection: null };
            }
            return { ...state, modal: action.payload };
        case 'ADD_TOAST':
            return { ...state, toasts: [...state.toasts, { ...action.payload, id: toastId++ }] };
        case 'REMOVE_TOAST':
            return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
        case 'SET_STATE':
            return { ...state, ...action.payload, results: null, activeResults: null };
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTab: action.payload };
        case 'SET_SELECTED_DIRECTION':
            return { ...state, selectedDirection: action.payload };
        case 'SET_HOVERED_DIRECTION':
            return { ...state, hoveredDirection: action.payload };
        default:
            return state;
    }
}


const CalculatorContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action>;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    handleCalculate: () => void;
    isCalculating: boolean;
    toasts: any[];
}>({
    state: initialState,
    dispatch: () => null,
    theme: 'light',
    toggleTheme: () => {},
    handleCalculate: () => {},
    isCalculating: false,
    toasts: [],
});

export const CalculatorProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [state, dispatch] = useReducer(calculatorReducer, initialState);
    const [isCalculating, setIsCalculating] = useState(false);
    const [initialCalculationDone, setInitialCalculationDone] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        dispatch({ type: 'SET_STATE', payload: { theme: initialTheme }});
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }, []);

    useEffect(() => {
        loadAllData().then(data => {
            dispatch({ type: 'SET_ALL_DATA', payload: data });
        }).catch(err => {
            console.error(err);
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Błąd ładowania danych aplikacji.', type: 'danger' } });
        });
    }, []);

    const toggleTheme = () => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        dispatch({ type: 'SET_STATE', payload: { theme: newTheme, results: state.results, activeResults: state.activeResults }});
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };
    
    const performCalculation = useCallback((month: string) => {
        if (!state.allData) return;

        const tExtProfile = generateTemperatureProfile(parseFloat(state.input.tExternal), month, state.allData);
            
        const resultsWithShading = calculateGainsForMonth(state.windows, state.input, tExtProfile, month, state.allData, state.accumulation, state.internalGains, false);
        const resultsWithoutShading = calculateGainsForMonth(state.windows, state.input, tExtProfile, month, state.allData, state.accumulation, state.internalGains, true);

        const message = initialCalculationDone
            ? state.resultMessage
            : `Automatycznie wybrano <strong>${MONTH_NAMES[parseInt(month, 10) - 1]}</strong> jako miesiąc z największym potencjalnym zyskiem od słońca.`;

        dispatch({ type: 'SET_RESULTS', payload: { 
            results: { withShading: resultsWithShading, withoutShading: resultsWithoutShading },
            month: month,
            tExtProfile,
            message
        }});
    }, [state.allData, state.windows, state.input, state.accumulation, state.internalGains, state.resultMessage, initialCalculationDone]);


    const handleCalculate = useCallback(async () => {
        if (!state.allData) {
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Dane aplikacji nie zostały jeszcze załadowane.', type: 'danger' } });
            return;
        }
        setIsCalculating(true);
        try {
            const worstMonth = calculateWorstMonth(state.windows, state.allData);
            performCalculation(worstMonth);
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Obliczenia zakończone!', type: 'success' } });
            setInitialCalculationDone(true);
        } catch(error) {
            console.error("Calculation failed:", error);
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Wystąpił błąd podczas obliczeń.', type: 'danger' } });
        } finally {
            setIsCalculating(false);
        }
    }, [state.allData, state.windows, performCalculation]);
    
    useEffect(() => {
        if (initialCalculationDone) {
            const handler = setTimeout(() => {
                performCalculation(state.currentMonth);
            }, 500);
            return () => clearTimeout(handler);
        }
    }, [state.windows, state.input, state.accumulation, state.internalGains, initialCalculationDone, state.currentMonth, performCalculation]);

    const enhancedDispatch = useCallback((action: Action) => {
        if (action.type === 'SAVE_PROJECT') {
            const projectData = {
                windows: state.windows,
                input: state.input,
                accumulation: state.accumulation,
                internalGains: state.internalGains,
            };
            localStorage.setItem('heatGainProject', JSON.stringify(projectData));
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Projekt zapisany!', type: 'success' } });
        } else if (action.type === 'LOAD_PROJECT') {
            const savedProject = localStorage.getItem('heatGainProject');
            if (savedProject) {
                const projectData = JSON.parse(savedProject);
                setInitialCalculationDone(false);
                dispatch({ type: 'SET_STATE', payload: projectData });
                dispatch({ type: 'ADD_TOAST', payload: { message: 'Projekt wczytany!', type: 'success' } });
            } else {
                dispatch({ type: 'ADD_TOAST', payload: { message: 'Nie znaleziono zapisanego projektu.', type: 'info' } });
            }
        } else if (['SET_INPUT', 'SET_ACCUMULATION', 'SET_INTERNAL_GAINS', 'ADD_WINDOW', 'UPDATE_WINDOW', 'DELETE_WINDOW', 'DUPLICATE_WINDOW', 'UPDATE_ALL_SHADING', 'ADD_EQUIPMENT_ITEM', 'DELETE_EQUIPMENT_ITEM'].includes(action.type)) {
             if (initialCalculationDone) {
                 dispatch(action);
             } else {
                dispatch({ ...action, type: 'CLEAR_RESULTS' });
                dispatch(action);
             }
        } else {
            dispatch(action);
        }
    }, [state, initialCalculationDone]);

    const value = { state, dispatch: enhancedDispatch, theme: state.theme, toggleTheme, handleCalculate, isCalculating, toasts: state.toasts };

    return (
        <CalculatorContext.Provider value={value}>
            {children}
        </CalculatorContext.Provider>
    );
};

export const useCalculator = () => useContext(CalculatorContext);