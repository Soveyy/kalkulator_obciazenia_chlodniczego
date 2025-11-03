import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Checkbox from '../ui/Checkbox';
import { useCalculator } from '../../contexts/CalculatorContext';
import { Window, Shading } from '../../types';
import { WINDOW_DIRECTIONS, WINDOW_PRESETS, WINDOW_TYPE_DESCRIPTIONS, SHADING_TYPE_LABELS, SHADING_LOCATION_LABELS, LOUVERS_LOCATION_LABELS, LOUVERS_COLOR_LABELS, LOUVERS_COLOR_DESCRIPTIONS, LOUVERS_SETTING_LABELS, DRAPERY_MATERIAL_LABELS, DRAPERY_MATERIAL_DESCRIPTIONS, ROLLER_SHADE_SETTING_LABELS } from '../../constants';
import Tooltip from '../ui/Tooltip';

const WindowEditModal: React.FC = () => {
    const { state, dispatch } = useCalculator();
    const { isOpen, type, data: windowId } = state.modal;
    const isModalOpen = isOpen && type === 'editWindow';
    
    const originalWindow = state.windows.find(w => w.id === windowId);
    
    const [window, setWindow] = useState<Window | null>(null);
    const [shading, setShading] = useState<Shading | null>(null);

    useEffect(() => {
        if (isModalOpen && originalWindow) {
            const newWindow = JSON.parse(JSON.stringify(originalWindow));
            setWindow(newWindow);
            setShading(JSON.parse(JSON.stringify(originalWindow.shading)));
            dispatch({ type: 'SET_SELECTED_DIRECTION', payload: newWindow.direction });
        } else {
            setWindow(null);
            setShading(null);
        }
    }, [isModalOpen, originalWindow]);

    useEffect(() => {
        if (window) {
            dispatch({ type: 'SET_SELECTED_DIRECTION', payload: window.direction });
        }
    }, [window, dispatch]);


    const handleClose = () => dispatch({ type: 'SET_MODAL', payload: { isOpen: false } });

    const handleSave = () => {
        if (window) {
            dispatch({ type: 'UPDATE_WINDOW', payload: { ...window, shading: shading! } });
            handleClose();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let val: any = value;
        if (type === 'number' || name === 'u' || name === 'shgc' || name === 'width' || name === 'height' ) val = parseFloat(value);

        if (name === 'type' && value !== 'custom') {
            const preset = WINDOW_PRESETS[value as keyof typeof WINDOW_PRESETS];
            if (preset) {
                setWindow(prev => prev ? { ...prev, type: value as Window['type'], u: preset.u, shgc: preset.shgc } : null);
                return;
            }
        }
        
        if ((name === 'u' || name === 'shgc') && window?.type !== 'custom') {
             setWindow(prev => prev ? { ...prev, type: 'custom', [name]: val } : null);
        } else {
            setWindow(prev => prev ? { ...prev, [name]: val } : null);
        }
    };

    const handleShadingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const isCheckbox = type === 'checkbox';
    
        setShading(prev => {
            if (!prev) return null;
            let newShading = { ...prev, [name]: isCheckbox ? checked : value };
            
            if (name === 'type') {
                // Reset to defaults for the new type to avoid keeping irrelevant old state
                newShading.location = 'indoor';
                newShading.color = 'light';
                newShading.material = 'open';
    
                switch(value) {
                    case 'louvers':
                        newShading.setting = 'tilted_45';
                        break;
                    case 'roller_shades':
                        newShading.setting = 'light_translucent';
                        break;
                    case 'draperies':
                    case 'insect_screens':
                        newShading.setting = ''; // not used
                        break;
                }
            }
            
            return newShading as Shading;
        });
    };

    if (!isModalOpen || !window || !shading) return null;
    
    const shadingDb = state.allData?.shading[window.type as keyof typeof state.allData.shading] || state.allData?.shading.standard || {};
    const description = WINDOW_TYPE_DESCRIPTIONS[window.type as keyof typeof WINDOW_TYPE_DESCRIPTIONS];

    return (
        <Modal 
            isOpen={isModalOpen} 
            onClose={handleClose} 
            title={`Edytuj Okno ${window.id}`}
            maxWidth="max-w-2xl"
            disableBackdropClick={true}
            disableEscKey={true}
            footer={<>
                <Button variant="secondary" onClick={handleClose}>Anuluj</Button>
                <Button onClick={handleSave}>Zapisz zmiany</Button>
            </>}
        >
            <div className="space-y-4">
                <div>
                    <label className="label-style flex items-center">
                        Typ okna:
                        <Tooltip text="Wybierz predefiniowany typ okna lub 'Niestandardowe', aby ręcznie wprowadzić wartości." />
                    </label>
                    <Select name="type" value={window.type} onChange={handleChange}>
                        <option value="custom">Niestandardowe</option>
                        <option value="modern">Nowoczesne (3-szybowe)</option>
                        <option value="standard">Standardowe (nowe, 2-szybowe)</option>
                        <option value="older_double">Starsze (2-szybowe)</option>
                        <option value="historic">Historyczne (1-szybowe)</option>
                    </Select>
                     {description && window.type !== 'custom' && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md">{description}</p>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="label-style flex items-center">
                            Współczynnik U:
                            <Tooltip text="Współczynnik przenikania ciepła (W/m²K). Niższa wartość oznacza lepszą izolacyjność." />
                        </label>
                        <Input type="number" name="u" value={window.u} onChange={handleChange} step="0.1" />
                    </div>
                    <div>
                        <label className="label-style flex items-center">
                            Współczynnik SHGC:
                             <Tooltip text="Współczynnik całkowitego zysku energii słonecznej (g). Niższa wartość oznacza mniejsze zyski od słońca." />
                        </label>
                        <Input type="number" name="shgc" value={window.shgc} onChange={handleChange} step="0.01" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label-style">Szerokość (m):</label>
                        <Input type="number" name="width" value={window.width} onChange={handleChange} step="0.1" />
                    </div>
                    <div>
                        <label className="label-style">Wysokość (m):</label>
                        <Input type="number" name="height" value={window.height} onChange={handleChange} step="0.1" />
                    </div>
                </div>
                 <div>
                    <label className="label-style">Kierunek świata:</label>
                    <select 
                        name="direction" 
                        value={window.direction} 
                        onChange={handleChange}
                        onMouseLeave={() => dispatch({ type: 'SET_HOVERED_DIRECTION', payload: null })}
                        className="w-full box-border px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    >
                        {WINDOW_DIRECTIONS.map(dir => (
                            <option 
                                key={dir.value} 
                                value={dir.value}
                                onMouseEnter={() => dispatch({ type: 'SET_HOVERED_DIRECTION', payload: dir.value })}
                            >
                                {dir.label}
                            </option>
                        ))}
                    </select>
                </div>

                <hr className="my-4 border-slate-200 dark:border-slate-700"/>

                 <Checkbox id={`shading_enabled_${window.id}`} label="Uwzględnij osłonę przeciwsłoneczną" name="enabled" checked={shading.enabled} onChange={handleShadingChange} />
            
                {shading.enabled && (
                    <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-4 mt-4">
                        <div>
                            <label className="label-style">Typ osłony:</label>
                            <Select name="type" value={shading.type} onChange={handleShadingChange}>
                                {Object.entries(SHADING_TYPE_LABELS).map(([key, label]) => 
                                    shadingDb[key] && <option key={key} value={key}>{label as string}</option>
                                )}
                            </Select>
                        </div>

                        {shading.type === 'louvers' && shadingDb.louvers &&
                         <>
                             <div>
                                <label className="label-style">Lokalizacja:</label>
                                <Select name="location" value={shading.location} onChange={handleShadingChange}>
                                    {Object.entries(LOUVERS_LOCATION_LABELS).map(([key, label]) => 
                                      shadingDb.louvers[key] && <option key={key} value={key}>{label as string}</option>
                                    )}
                                </Select>
                             </div>
                             <div>
                                <label className="label-style">Kolor / Typ lameli:</label>
                                <Select name="color" value={shading.color} onChange={handleShadingChange}>
                                    {Object.entries(LOUVERS_COLOR_LABELS).map(([key, label]) => 
                                       shadingDb.louvers[shading.location!]?.[key] && <option key={key} value={key}>{label as string}</option>
                                    )}
                                </Select>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{LOUVERS_COLOR_DESCRIPTIONS[shading.color!]}</p>
                             </div>
                             <div>
                                <label className="label-style">Ustawienie lameli:</label>
                                <Select name="setting" value={shading.setting} onChange={handleShadingChange}>
                                    {Object.entries(LOUVERS_SETTING_LABELS).map(([key, label]) => 
                                        shadingDb.louvers[shading.location!]?.[shading.color!]?.[key] && <option key={key} value={key}>{label as string}</option>
                                    )}
                                </Select>
                             </div>
                         </>
                        }
                        
                         {shading.type === 'draperies' && shadingDb.draperies &&
                            <>
                                <div>
                                    <label className="label-style">Typ materiału:</label>
                                    <Select name="material" value={shading.material} onChange={handleShadingChange}>
                                        {Object.entries(DRAPERY_MATERIAL_LABELS).map(([key, label]) => <option key={key} value={key}>{label as string}</option>)}
                                    </Select>
                                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{DRAPERY_MATERIAL_DESCRIPTIONS[shading.material!]}</p>
                                </div>
                                {shading.material !== 'sheer' && <div>
                                    <label className="label-style">Kolor zasłon:</label>
                                    <Select name="color" value={shading.color} onChange={handleShadingChange}>
                                        <option value="light">Jasny</option>
                                        <option value="medium">Średni</option>
                                        <option value="dark">Ciemny</option>
                                    </Select>
                                </div>}
                            </>
                        }

                        {shading.type === 'roller_shades' && shadingDb.roller_shades &&
                            <div>
                                <label className="label-style">Rodzaj rolety:</label>
                                <Select name="setting" value={shading.setting} onChange={handleShadingChange}>
                                     {Object.entries(ROLLER_SHADE_SETTING_LABELS).map(([key, label]) => 
                                       shadingDb.roller_shades[key] && <option key={key} value={key}>{label as string}</option>
                                    )}
                                </Select>
                            </div>
                        }

                        {shading.type === 'insect_screens' && shadingDb.insect_screens &&
                             <div>
                                <label className="label-style">Umiejscowienie:</label>
                                <Select name="location" value={shading.location} onChange={handleShadingChange}>
                                     {Object.entries(SHADING_LOCATION_LABELS).map(([key, label]) => 
                                        shadingDb.insect_screens[key] && <option key={key} value={key}>{label as string}</option>
                                     )}
                                </Select>
                             </div>
                        }
                    </div>
                )}
            </div>
            <style>{`.label-style { display: block; margin-bottom: 0.25rem; font-medium; color: #475569; } .dark .label-style { color: #cbd5e1; }`}</style>
        </Modal>
    );
};

export default WindowEditModal;