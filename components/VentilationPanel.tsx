import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import Card from './ui/Card';
import Checkbox from './ui/Checkbox';
import Input from './ui/Input';
import Select from './ui/Select';
import { VENTILATION_EXCHANGER_TYPES } from '../constants';
import Tooltip from './ui/Tooltip';

const VentilationPanel: React.FC = () => {
    const { state, dispatch } = useCalculator();
    const { ventilation } = state.internalGains;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        let val: string | number | boolean;
        if (type === 'checkbox') {
            val = checked;
        } else if (name === 'airflow') {
            val = parseInt(value, 10);
            if (isNaN(val)) val = 0;
        } else {
            val = value;
        }

        dispatch({ type: 'SET_VENTILATION_GAINS', payload: { ...ventilation, [name]: val } });
    };

    return (
        <Card>
            <h3 className="font-semibold mb-3">Wentylacja Mechaniczna</h3>
            <div className="space-y-4">
                <Checkbox id="ventilation_enabled" label="Uwzględnij zyski od wentylacji" name="enabled" checked={ventilation.enabled} onChange={handleChange} />
                {ventilation.enabled && (
                    <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-4 mt-4">
                        <div>
                            <label className="label-style">Strumień powietrza wentylacyjnego (m³/h):</label>
                            <Input type="number" name="airflow" value={ventilation.airflow} onChange={handleChange} min="0" />
                        </div>
                        <div>
                            <label className="label-style">Typ wymiennika odzysku ciepła:</label>
                            <Select name="exchangerType" value={ventilation.exchangerType} onChange={handleChange}>
                                {Object.entries(VENTILATION_EXCHANGER_TYPES).map(([key, value]) => (
                                    <option key={key} value={key}>{value.label}</option>
                                ))}
                            </Select>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {VENTILATION_EXCHANGER_TYPES[ventilation.exchangerType]?.description}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <style>{`.label-style { display: block; text-sm font-medium mb-1 text-slate-700 dark:text-slate-300; }`}</style>
        </Card>
    );
};

export default VentilationPanel;
