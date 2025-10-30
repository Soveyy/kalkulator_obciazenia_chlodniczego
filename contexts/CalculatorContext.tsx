import React, { createContext, useReducer, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import { Window, AccumulationSettings, CalculationResults, AllData, Shading } from '../types';
import { calculateSolarGainsForMonth, calculateGainsForMonth, generateTemperatureProfile } from '../services/calculationService';
import { loadAllData } from '../services/dataService';
import { MONTH_NAMES } from '../constants';

interface State {
    windows: Window[];
    input: { tInternal: string; tExternal: string };
    accumulation: AccumulationSettings;
    allData: AllData | null;
    results: { withShading: CalculationResults, withoutShading: CalculationResults } | null;
    activeResults: CalculationResults | null;
    isShadingViewActive: boolean;
    currentMonth: string;
    resultMessage: string;
    tExtProfile: number[];
    chartType: 'line' | 'bar';
    // FIX: Made `type` optional to align with the `SET_MODAL` action's payload,
    // which doesn't always provide a `type` (e.g., when closing a modal).
    // This resolves the type error on line 147.
    modal: { isOpen: boolean; type?: string | null; data?: any };
    theme: 'light' | 'dark';
    toasts: { id: number; message: string; type: 'info' | 'success' | 'danger' }[];
}

type Action = 
    | { type: 'SET_ALL_DATA'; payload: AllData }
    | { type: 'SET_INPUT'; payload: { tInternal: string; tExternal: string } }
    | { type: 'ADD_WINDOW' }
    | { type: 'UPDATE_WINDOW'; payload: Window }
    | { type: 'DELETE_WINDOW'; payload: number }
    | { type: 'DUPLICATE_WINDOW'; payload: number }
    | { type: 'UPDATE_ALL_SHADING'; payload: Partial<Shading> & { enabled: boolean } }
    | { type: 'SET_ACCUMULATION'; payload: AccumulationSettings }
    | { type: 'SET_RESULTS'; payload: { results: { withShading: CalculationResults, withoutShading: CalculationResults }; month: string; tExtProfile: number[], message: string } }
    | { type: 'SET_ACTIVE_RESULTS'; payload: CalculationResults }
    | { type: 'SET_SHADING_VIEW'; payload: boolean }
    | { type: 'RECALCULATE_VIEW'; payload: string }
    | { type: 'TOGGLE_CHART_TYPE' }
    | { type: 'SET_MODAL'; payload: { isOpen: boolean; type?: string | null; data?: any } }
    | { type: 'ADD_TOAST'; payload: { message: string; type: 'info' | 'success' | 'danger' } }
    | { type: 'REMOVE_TOAST'; payload: number }
    | { type: 'SAVE_PROJECT' }
    | { type: 'LOAD_PROJECT' }
    | { type: 'SET_STATE'; payload: Partial<State> };


const initialState: State = {
    windows: [],
    input: { tInternal: '24', tExternal: '32' },
    accumulation: {
        include: true,
        thermalMass: 'very_heavy',
        floorType: 'panels',
        glassPercentage: 50
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
                type: 'modern', direction: 'S', u: 0.9, shgc: 0.5, width: 1.5, height: 1.5,
                shading: { enabled: false, type: 'louvers', location: 'indoor', color: 'light', setting: 'tilted_45', material: 'open' }
            };
            return { ...state, windows: [...state.windows, newWindow] };
        }
        case 'UPDATE_WINDOW':
            return { ...state, windows: state.windows.map(w => w.id === action.payload.id ? action.payload : w) };
        case 'DELETE_WINDOW':
            return { ...state, windows: state.windows.filter(w => w.id !== action.payload) };
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
            const resultsWithShading = calculateGainsForMonth(state.windows, parseFloat(state.input.tInternal), tExtProfile, newMonth, state.allData, state.accumulation, false);
            const resultsWithoutShading = calculateGainsForMonth(state.windows, parseFloat(state.input.tInternal), tExtProfile, newMonth, state.allData, state.accumulation, true);

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
            return { ...state, modal: action.payload };
        case 'ADD_TOAST':
            return { ...state, toasts: [...state.toasts, { ...action.payload, id: toastId++ }] };
        case 'REMOVE_TOAST':
            return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
        case 'SET_STATE':
            return { ...state, ...action.payload };
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
        dispatch({ type: 'SET_STATE', payload: { theme: newTheme }});
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };
    
    const handleCalculate = useCallback(async () => {
        if (!state.allData) {
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Dane aplikacji nie zostały jeszcze załadowane.', type: 'danger' } });
            return;
        }
        if (state.windows.length === 0) {
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Dodaj przynajmniej jedno okno, aby wykonać obliczenia.', type: 'info' } });
            return;
        }
        setIsCalculating(true);
        try {
            let worstMonth = '7';
            let maxTotalGain = 0;
            for (let month = 1; month <= 12; month++) {
                const { total } = calculateSolarGainsForMonth(state.windows, String(month), state.allData, true);
                if (total > maxTotalGain) {
                    maxTotalGain = total;
                    worstMonth = String(month);
                }
            }
            
            const tExtProfile = generateTemperatureProfile(parseFloat(state.input.tExternal), worstMonth, state.allData);
            
            const resultsWithShading = calculateGainsForMonth(state.windows, parseFloat(state.input.tInternal), tExtProfile, worstMonth, state.allData, state.accumulation, false);
            const resultsWithoutShading = calculateGainsForMonth(state.windows, parseFloat(state.input.tInternal), tExtProfile, worstMonth, state.allData, state.accumulation, true);

            const message = `Automatycznie wybrano <strong>${MONTH_NAMES[parseInt(worstMonth,10)-1]}</strong> jako miesiąc z największym potencjalnym zyskiem od słońca.`;

            dispatch({ type: 'SET_RESULTS', payload: { 
                results: { withShading: resultsWithShading, withoutShading: resultsWithoutShading },
                month: worstMonth,
                tExtProfile,
                message
            }});
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Obliczenia zakończone!', type: 'success' } });
        } catch(error) {
            console.error("Calculation failed:", error);
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Wystąpił błąd podczas obliczeń.', type: 'danger' } });
        } finally {
            setIsCalculating(false);
        }
    }, [state.allData, state.windows, state.input, state.accumulation]);
    
    const enhancedDispatch = useCallback((action: Action) => {
        if (action.type === 'SAVE_PROJECT') {
            const projectData = {
                windows: state.windows,
                input: state.input,
                accumulation: state.accumulation,
            };
            localStorage.setItem('heatGainProject', JSON.stringify(projectData));
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Projekt zapisany!', type: 'success' } });
        } else if (action.type === 'LOAD_PROJECT') {
            const savedProject = localStorage.getItem('heatGainProject');
            if (savedProject) {
                const projectData = JSON.parse(savedProject);
                dispatch({ type: 'SET_STATE', payload: projectData });
                dispatch({ type: 'ADD_TOAST', payload: { message: 'Projekt wczytany!', type: 'success' } });
            } else {
                dispatch({ type: 'ADD_TOAST', payload: { message: 'Nie znaleziono zapisanego projektu.', type: 'info' } });
            }
        } else {
            dispatch(action);
        }
    }, [state]);

    const value = { state, dispatch: enhancedDispatch, theme: state.theme, toggleTheme, handleCalculate, isCalculating, toasts: state.toasts };

    return (
        <CalculatorContext.Provider value={value}>
            {children}
        </CalculatorContext.Provider>
    );
};

export const useCalculator = () => useContext(CalculatorContext);