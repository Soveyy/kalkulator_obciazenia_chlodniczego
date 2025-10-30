
import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import Card from './ui/Card';

const ResultsTable: React.FC = () => {
    const { state } = useCalculator();
    if (!state.activeResults) return null;

    const gainsUTC = state.activeResults.finalGains;
    const month = parseInt(state.currentMonth, 10);
    const isSummerTime = (month >= 4 && month <= 10);
    const offset = isSummerTime ? 2 : 1;
    
    const maxG_UTC = Math.max(...gainsUTC.global);
    const maxCS_UTC = Math.max(...gainsUTC.clearSky);

    const rows = Array.from({ length: 24 }, (_, h_local) => {
        const h_utc = (h_local - offset + 24) % 24;
        const gainG = gainsUTC.global[h_utc];
        const gainCS = gainsUTC.clearSky[h_utc];
        
        return (
            <tr key={h_local} className="text-xs text-center border-b border-slate-200 dark:border-slate-700 even:bg-slate-50 dark:even:bg-slate-800/50">
                <td className="py-1 px-2">{String(h_local).padStart(2, '0')}:00</td>
                <td className={`py-1 px-2 ${gainG === maxG_UTC ? 'bg-blue-200 dark:bg-blue-800/50 font-bold' : ''}`}>{gainG.toFixed(0)}</td>
                <td className={`py-1 px-2 ${gainCS === maxCS_UTC ? 'bg-orange-200 dark:bg-orange-800/50 font-bold' : ''}`}>{gainCS.toFixed(0)}</td>
            </tr>
        );
    });

    return (
        <Card className="overflow-hidden p-0 flex flex-col">
            <div className="overflow-y-auto h-64 md:h-auto">
                 <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10">
                        <tr className="text-sm">
                            <th className="py-2 px-2 text-center">Godzina ({isSummerTime ? 'UTC+2' : 'UTC+1'})</th>
                            <th className="py-2 px-2 text-center">Typowy (W)</th>
                            <th className="py-2 px-2 text-center">Projektowy (W)</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        </Card>
    );
};

export default ResultsTable;
