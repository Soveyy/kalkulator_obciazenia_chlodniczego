
import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import { MONTH_NAMES } from '../constants';
import Card from './ui/Card';

const PeakSummary: React.FC = () => {
    const { state, dispatch } = useCalculator();
    if (!state.activeResults) return null;

    const { finalGains, components } = state.activeResults;
    const month = parseInt(state.currentMonth, 10);
    const isSummerTime = (month >= 4 && month <= 10);
    const offset = isSummerTime ? 2 : 1;
    const timeZoneNotice = isSummerTime ? 'UTC+2' : 'UTC+1';
    
    const maxCS = Math.max(...finalGains.clearSky);
    const hourCS_UTC = finalGains.clearSky.indexOf(maxCS);
    const hourCS_Local = (hourCS_UTC + offset) % 24;

    const maxG = Math.max(...finalGains.global);
    const hourG_UTC = finalGains.global.indexOf(maxG);
    const hourG_Local = (hourG_UTC + offset) % 24;
    
    const solarPeakCS = components.solarGainsClearSky[hourCS_UTC] || 0;
    const conductionPeakCS = (components.conductionGainsRadiant[hourCS_UTC] || 0) + (components.conductionGainsConvective[hourCS_UTC] || 0);

    const totalKWhG = finalGains.global.reduce((a, b) => a + b, 0) / 1000;
    const totalKWhCS = finalGains.clearSky.reduce((a, b) => a + b, 0) / 1000;
    const percentage = maxCS > 0 ? (maxG / maxCS * 100).toFixed(0) : 0;
    
    const anyShadingEnabled = state.windows.some(win => win.shading && win.shading.enabled);

    return (
        <Card>
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Podsumowanie dla: {MONTH_NAMES[month-1]}</h3>
            <p className="text-center font-semibold text-orange-500">Maksymalne <strong>projektowe</strong> obciążenie chłodnicze</p>
            <div className="text-4xl font-bold text-center text-orange-500 my-2">{maxCS.toFixed(0)} W</div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-2">(o godz. {String(hourCS_Local).padStart(2, '0')}:00 {timeZoneNotice})</p>
            <div className="text-sm text-slate-500 dark:text-slate-400 pl-4">
                <p>→ od nasłonecznienia: {solarPeakCS.toFixed(0)} W</p>
                <p>→ od przewodzenia: {conductionPeakCS.toFixed(0)} W</p>
            </div>
            <hr className="my-4 border-slate-200 dark:border-slate-700"/>
            <ul>
                <li className="text-sm">
                    <span className="text-blue-500 font-semibold">Maksymalne <strong>typowe</strong> obciążenie: <strong>{maxG.toFixed(0)} W</strong></span> (o godz. {String(hourG_Local).padStart(2, '0')}:00 {timeZoneNotice})
                </li>
            </ul>
            <p className="text-sm italic mt-2">Obciążenie typowe stanowi {percentage}% obciążenia projektowego.</p>
            <p className="font-semibold mt-3">Suma dobowa:</p>
            <ul className="text-sm">
                <li>Energia (projektowa): <strong className="text-orange-500">{totalKWhCS.toFixed(1)} kWh</strong></li>
                <li>Energia (typowa): <strong className="text-blue-500">{totalKWhG.toFixed(1)} kWh</strong></li>
            </ul>
             {anyShadingEnabled && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span>Wyniki z osłonami:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={state.isShadingViewActive} onChange={(e) => dispatch({type: 'SET_SHADING_VIEW', payload: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                </div>
            )}
        </Card>
    );
};

export default PeakSummary;
