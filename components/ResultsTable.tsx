import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import Card from './ui/Card';

const ResultsTable: React.FC = () => {
    const { state } = useCalculator();

    if (!state.activeResults) return null;

    const { finalGains } = state.activeResults;
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <Card>
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Wyniki Godzinowe (Clear Sky)</h3>
            <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
                        <tr>
                            <th scope="col" className="px-2 py-2">Godz. (UTC)</th>
                            <th scope="col" className="px-2 py-2 text-right">Jawne [W]</th>
                            <th scope="col" className="px-2 py-2 text-right">Utajone [W]</th>
                            <th scope="col" className="px-2 py-2 text-right">Całkowite [W]</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hours.map(hour => (
                            <tr key={hour} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700">
                                <th scope="row" className="px-2 py-1 font-medium text-slate-900 dark:text-white">{`${String(hour).padStart(2, '0')}:00`}</th>
                                <td className="px-2 py-1 text-right">{finalGains.clearSky.sensible[hour].toFixed(0)}</td>
                                <td className="px-2 py-1 text-right">{finalGains.clearSky.latent[hour].toFixed(0)}</td>
                                <td className="px-2 py-1 text-right font-semibold">{finalGains.clearSky.total[hour].toFixed(0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ResultsTable;
