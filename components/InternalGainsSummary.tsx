import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import { PEOPLE_ACTIVITY_LEVELS } from '../constants';
import Card from './ui/Card';

const InternalGainsSummary: React.FC = () => {
    const { state } = useCalculator();
    const { people, lighting, equipment } = state.internalGains;

    const peopleSensible = people.enabled ? people.count * (PEOPLE_ACTIVITY_LEVELS[people.activityLevel]?.sensible || 0) : 0;
    const peopleLatent = people.enabled ? people.count * (PEOPLE_ACTIVITY_LEVELS[people.activityLevel]?.latent || 0) : 0;

    const lightingPower = lighting.enabled ? (parseFloat(state.input.roomArea) || 0) * lighting.powerDensity : 0;

    const equipmentPower = equipment.reduce((acc, item) => acc + (item.power * item.quantity), 0);

    const totalSensible = peopleSensible + lightingPower + equipmentPower;
    const totalLatent = peopleLatent;
    const total = totalSensible + totalLatent;

    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Podsumowanie Zysków Wewnętrznych</h3>

            {!people.enabled && !lighting.enabled && equipment.length === 0 ? (
                <p className="text-slate-500">Brak włączonych zysków wewnętrznych.</p>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Ludzie:</span>
                        <span className="font-bold text-lg text-slate-800 dark:text-white">{peopleSensible.toFixed(0)} W (jawne) + {peopleLatent.toFixed(0)} W (utajone)</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Oświetlenie:</span>
                        <span className="font-bold text-lg text-slate-800 dark:text-white">{lightingPower.toFixed(0)} W</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Urządzenia:</span>
                        <span className="font-bold text-lg text-slate-800 dark:text-white">{equipmentPower.toFixed(0)} W</span>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-baseline mb-2">
                             <span className="font-semibold text-orange-500">Suma zysków jawnych:</span>
                             <span className="font-bold text-xl text-orange-500">{totalSensible.toFixed(0)} W</span>
                        </div>
                         <div className="flex justify-between items-baseline mb-2">
                             <span className="font-semibold text-blue-500">Suma zysków utajonych:</span>
                             <span className="font-bold text-xl text-blue-500">{totalLatent.toFixed(0)} W</span>
                        </div>
                        <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                             <span className="font-semibold text-red-500 text-lg">Całkowite zyski wewnętrzne:</span>
                             <span className="font-bold text-2xl text-red-500">{total.toFixed(0)} W</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Powyższe wartości reprezentują maksymalne, chwilowe zyski ciepła. Obciążenie chłodnicze (widoczne na wykresie) będzie inne ze względu na akumulację ciepła w masie termicznej budynku (efekt opóźnienia).</p>
                </div>
            )}
        </Card>
    );
};

export default InternalGainsSummary;