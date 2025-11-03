import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import Card from './ui/Card';
import Checkbox from './ui/Checkbox';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { PEOPLE_ACTIVITY_LEVELS, LIGHTING_TYPES, EQUIPMENT_PRESETS } from '../constants';
import { TrashIcon, PlusIcon } from './Icons';

const InternalGainsPanel: React.FC = () => {
    const { state, dispatch } = useCalculator();

    const handlePeopleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        const currentPeopleGains = state.internalGains.people;
        let newPeopleGains = { ...currentPeopleGains };

        if (type === 'checkbox') {
            (newPeopleGains as any)[name] = checked;
        } else if (name === 'count') {
            if (value === '') {
                newPeopleGains.count = '';
            } else {
                const num = parseInt(value, 10);
                if (!isNaN(num) && num >= 0) {
                    newPeopleGains.count = Math.floor(num);
                }
            }
        } else { // activityLevel, startHour, endHour
             const numValue = parseInt(value, 10);
            (newPeopleGains as any)[name] = isNaN(numValue) ? value : numValue;
        }
    
        dispatch({ type: 'SET_INTERNAL_GAINS', payload: { ...state.internalGains, people: newPeopleGains } });
    };

    const handleLightingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        let val: any;
        if (type === 'checkbox') {
            val = checked;
        } else if (name === 'powerDensity') {
             if (value === '') {
                val = '';
            } else {
                const num = parseFloat(value);
                if (!isNaN(num) && num >= 0) {
                    val = Math.floor(num);
                } else {
                    return; 
                }
            }
        } else if (['startHour', 'endHour'].includes(name)) {
            val = parseInt(value, 10);
        } else {
            val = value;
        }

        const newLightingGains = { ...state.internalGains.lighting, [name]: val };
        
        if (name === 'type' && value !== state.internalGains.lighting.type) {
            newLightingGains.powerDensity = LIGHTING_TYPES[value]?.powerDensity || 0;
        }

        dispatch({ type: 'SET_INTERNAL_GAINS', payload: { ...state.internalGains, lighting: newLightingGains } });
    };

    const handleEquipmentChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedEquipment = state.internalGains.equipment.map(item => {
            if (item.id !== id) return item;

            if (name === 'name') {
                return { ...item, name: value };
            }
            
            if (value === '') {
                return { ...item, [name]: '' };
            }
            
            const num = parseInt(value, 10);
            if (!isNaN(num) && num >= 0) {
                return { ...item, [name]: Math.floor(num) };
            }
            return item;
        });
        dispatch({ type: 'SET_INTERNAL_GAINS', payload: { ...state.internalGains, equipment: updatedEquipment } });
    };
    
    const handleEquipmentHoursChange = (id: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
         const updatedEquipment = state.internalGains.equipment.map(item => 
            item.id === id ? { ...item, [name]: parseInt(value) || 0 } : item
        );
        dispatch({ type: 'SET_INTERNAL_GAINS', payload: { ...state.internalGains, equipment: updatedEquipment } });
    }

    const addEquipment = (presetKey?: string) => {
        const preset = presetKey ? EQUIPMENT_PRESETS[presetKey] : null;
        dispatch({ type: 'ADD_EQUIPMENT_ITEM', payload: preset ? { name: preset.label, power: preset.power } : undefined });
    };
    
    const removeEquipment = (id: number) => {
        dispatch({ type: 'DELETE_EQUIPMENT_ITEM', payload: id });
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* People */}
            <Card>
                <h3 className="font-semibold mb-3">Ludzie</h3>
                <div className="space-y-4">
                    <Checkbox id="people_enabled" label="Uwzględnij zyski od ludzi" name="enabled" checked={state.internalGains.people.enabled} onChange={handlePeopleChange} />
                    {state.internalGains.people.enabled && (
                        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-4 mt-4">
                            <div>
                                <label className="label-style">Liczba osób:</label>
                                <Input type="number" name="count" value={state.internalGains.people.count} onChange={handlePeopleChange} min="0" />
                            </div>
                            <div>
                                <label className="label-style">Poziom aktywności:</label>
                                <Select name="activityLevel" value={state.internalGains.people.activityLevel} onChange={handlePeopleChange}>
                                    {Object.entries(PEOPLE_ACTIVITY_LEVELS).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-style">Od godz.:</label>
                                    <Select name="startHour" value={state.internalGains.people.startHour} onChange={handlePeopleChange}>
                                        {Array.from({length: 24}, (_, i) => <option key={i} value={i}>{`${i}:00`}</option>)}
                                    </Select>
                                </div>
                                <div>
                                    <label className="label-style">Do godz.:</label>
                                    <Select name="endHour" value={state.internalGains.people.endHour} onChange={handlePeopleChange}>
                                         {Array.from({length: 24}, (_, i) => <option key={i+1} value={i+1}>{`${i+1}:00`}</option>)}
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Lighting */}
            <Card>
                 <h3 className="font-semibold mb-3">Oświetlenie</h3>
                 <div className="space-y-4">
                    <Checkbox id="lighting_enabled" label="Uwzględnij zyski od oświetlenia" name="enabled" checked={state.internalGains.lighting.enabled} onChange={handleLightingChange} />
                    {state.internalGains.lighting.enabled && (
                        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-4 mt-4">
                            <div>
                                <label className="label-style">Rodzaj oświetlenia:</label>
                                <Select name="type" value={state.internalGains.lighting.type} onChange={handleLightingChange}>
                                   {Object.entries(LIGHTING_TYPES).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </Select>
                            </div>
                             <div>
                                <label className="label-style">Gęstość mocy (W/m²):</label>
                                <Input type="number" name="powerDensity" value={state.internalGains.lighting.powerDensity} onChange={handleLightingChange} step="1" min="0" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-style">Od godz.:</label>
                                    <Select name="startHour" value={state.internalGains.lighting.startHour} onChange={handleLightingChange}>
                                        {Array.from({length: 24}, (_, i) => <option key={i} value={i}>{`${i}:00`}</option>)}
                                    </Select>
                                </div>
                                <div>
                                    <label className="label-style">Do godz.:</label>
                                    <Select name="endHour" value={state.internalGains.lighting.endHour} onChange={handleLightingChange}>
                                         {Array.from({length: 24}, (_, i) => <option key={i} value={i+1}>{`${i+1}:00`}</option>)}
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            
            {/* Equipment */}
            <Card className="flex flex-col">
                <h3 className="font-semibold mb-3">Urządzenia</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 lg:flex lg:flex-wrap">
                    {Object.entries(EQUIPMENT_PRESETS).map(([key, preset]) => (
                        <Button key={key} variant="secondary" className="text-xs py-1" onClick={() => addEquipment(key)}>+ {preset.label}</Button>
                    ))}
                    <Button className="text-xs py-1" onClick={() => addEquipment()}><PlusIcon className="w-4 h-4 inline-block mr-1" />Dodaj własne</Button>
                </div>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2 max-h-72">
                    {state.internalGains.equipment.length > 0 && (
                         <div className="grid grid-cols-[1fr,80px,50px,140px,auto] gap-2 items-center text-xs font-semibold text-slate-600 dark:text-slate-400 px-1 sticky top-0 bg-white dark:bg-slate-800 py-1">
                            <span>Nazwa</span>
                            <span className="text-center">Moc [W]</span>
                            <span className="text-center">Ilość</span>
                            <span className="text-center">Godziny pracy</span>
                            <span></span>
                        </div>
                    )}
                    {state.internalGains.equipment.map(item => (
                        <div key={item.id} className="grid grid-cols-[1fr,80px,50px,140px,auto] gap-2 items-center">
                            <Input name="name" value={item.name} onChange={(e) => handleEquipmentChange(item.id, e)} className="text-xs" />
                            <Input name="power" type="number" value={item.power} onChange={(e) => handleEquipmentChange(item.id, e)} className="text-xs text-center" min="0" />
                            <Input name="quantity" type="number" value={item.quantity} onChange={(e) => handleEquipmentChange(item.id, e)} className="text-xs text-center" min="0" />
                            <div className="flex items-center gap-1 text-xs">
                                <Select name="startHour" value={item.startHour} onChange={(e) => handleEquipmentHoursChange(item.id, e)} className="text-xs py-1.5">
                                    {Array.from({length: 24}, (_, i) => <option key={i} value={i}>{`${i}:00`}</option>)}
                                </Select>
                                <Select name="endHour" value={item.endHour} onChange={(e) => handleEquipmentHoursChange(item.id, e)} className="text-xs py-1.5">
                                    {Array.from({length: 24}, (_, i) => <option key={i+1} value={i+1}>{`${i+1}:00`}</option>)}
                                </Select>
                            </div>
                            <Button variant="danger" onClick={() => removeEquipment(item.id)} className="px-2 py-1"><TrashIcon className="w-4 h-4"/></Button>
                        </div>
                    ))}
                </div>
            </Card>
            <style>{`.label-style { display: block; margin-bottom: 0.25rem; font-medium; color: #475569; } .dark .label-style { color: #cbd5e1; }`}</style>
        </div>
    );
};

export default InternalGainsPanel;