import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Checkbox from '../ui/Checkbox';
import { useCalculator } from '../../contexts/CalculatorContext';
import { Window, Shading } from '../../types';
// FIX: Import SHADING_LOCATION_LABELS to fix reference and type errors.
import { 
    WINDOW_DIRECTIONS, WINDOW_PRESETS, WINDOW_DESCRIPTIONS, LOUVERS_COLOR_DESCRIPTIONS, 
    WINDOW_TYPE_LABELS, SHADING_TYPE_LABELS, LOUVERS_LOCATION_LABELS, LOUVERS_COLOR_LABELS, LOUVERS_SETTING_LABELS,
    DRAPERY_MATERIAL_LABELS, ROLLER_SHADE_SETTING_LABELS, Tooltip, SHADING_LOCATION_LABELS
} from '../../constants';

const WindowEditModal: React.FC = () => {
    const { state, dispatch } = useCalculator();
    const { isOpen, type, data: windowId } = state.modal;
    const isModalOpen = isOpen && type === 'editWindow';

    const windowData = state.windows.find(w => w.id === windowId);
    const [localWindow, setLocalWindow] = useState<Window | null>(null);

    useEffect(() => {
        if (windowData) {
            setLocalWindow(JSON.parse(JSON.stringify(windowData)));
        }
    }, [windowData]);

    const handleClose = () => dispatch({ type: 'SET_MODAL', payload: { isOpen: false } });

    const handleSave = () => {
        if (localWindow) {
            dispatch({ type: 'UPDATE_WINDOW', payload: localWindow });
            handleClose();
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'type' && value !== 'custom') {
            const preset = WINDOW_PRESETS[value];
            setLocalWindow(prev => prev ? ({ ...prev, type: value as any, u: Number(preset.u), shgc: Number(preset.shgc) }) : null);
        } else {
            setLocalWindow(prev => prev ? ({ ...prev, [name]: type === 'checkbox' ? checked : value }) : null);
        }
    };

    const handleShadingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const isCheckbox = type === 'checkbox';

        setLocalWindow(prev => {
            if (!prev) return null;
            let newShading: Shading = { ...prev.shading, [name]: isCheckbox ? checked : value };
            
            if (name === 'type') {
                newShading.setting = '';
                newShading.color = 'light';
                newShading.material = 'open';
                if (value === 'louvers') newShading.setting = 'tilted_45';
                if (value === 'roller_shades') newShading.setting = 'light_translucent';
            }
             if (name === 'location' && newShading.type === 'louvers') {
                newShading.setting = 'tilted_45';
             }
            
            if (newShading.type === 'draperies') {
                const material = (name === 'material' ? value : newShading.material) as Shading['material'];
                const color = (name === 'color' ? value : newShading.color) as Shading['color'];
                if (material === 'sheer') {
                    newShading.setting = 'sheer';
                } else {
                    newShading.setting = `${material}_${color}`;
                }
                 newShading.material = material;
                 newShading.color = color;
            }


            return { ...prev, shading: newShading };
        });
    };

    if (!isModalOpen || !localWindow) return null;
    
    const windowTypeKey = localWindow.type === 'custom' ? 'standard' : localWindow.type;
    const shadingDb = state.allData?.shading[windowTypeKey] || {};

    return (
        <Modal 
            isOpen={isModalOpen} 
            onClose={handleClose} 
            title={`Edytuj Okno ${localWindow.id}`}
            maxWidth={localWindow.shading.enabled ? "max-w-4xl" : "max-w-md"}
            footer={<>
                <Button variant="secondary" onClick={handleClose}>Anuluj</Button>
                <Button onClick={handleSave}>Zapisz zmiany</Button>
            </>}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="label-style"><Tooltip text="Wybierz predefiniowany typ okna lub 'Własny', aby ręcznie wprowadzić parametry U i SHGC.">Typ okna:</Tooltip></label>
                        <Select name="type" value={localWindow.type} onChange={handleChange}>
                           {Object.entries(WINDOW_TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </Select>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{WINDOW_DESCRIPTIONS[localWindow.type]}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-style"><Tooltip text="Współczynnik przenikania ciepła, wyrażony w W/(m²K). Określa, ile ciepła przedostaje się przez okno z powodu różnicy temperatur. Im niższa wartość, tym lepsza izolacja termiczna – mniejsze straty ciepła zimą i mniejsze zyski ciepła od nagrzanego powietrza zewnętrznego latem.">Współczynnik U:</Tooltip></label>
                            <Input name="u" type="number" step="0.1" value={localWindow.u} onChange={handleChange} disabled={localWindow.type !== 'custom'} />
                        </div>
                        <div>
                            <label className="label-style"><Tooltip text="Współczynnik całkowitej przepuszczalności energii słonecznej (w Polsce oznaczany jako 'g'). Określa, jaka część promieniowania słonecznego przedostaje się przez szybę. Wysoka wartość to duże zyski ciepła od słońca zimą, ale ryzyko przegrzewania latem. Optymalna wartość dla odpowiedniego balansu między latem a zimą dla Polski to ok. 0,5.">Współczynnik SHGC:</Tooltip></label>
                            <Input name="shgc" type="number" step="0.01" value={localWindow.shgc} onChange={handleChange} disabled={localWindow.type !== 'custom'} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="label-style">Szerokość okna (m):</label>
                            <Input name="width" type="number" step="0.1" value={localWindow.width} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label-style">Wysokość okna (m):</label>
                            <Input name="height" type="number" step="0.1" value={localWindow.height} onChange={handleChange} />
                        </div>
                    </div>
                     <div>
                        <label className="label-style">Kierunek świata:</label>
                        <Select name="direction" value={localWindow.direction} onChange={handleChange}>
                            {WINDOW_DIRECTIONS.map(dir => <option key={dir.value} value={dir.value}>{dir.label}</option>)}
                        </Select>
                    </div>
                     <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                        <Checkbox id="shading_enabled" label="Uwzględnij osłonę przeciwsłoneczną" name="enabled" checked={localWindow.shading.enabled} onChange={handleShadingChange} />
                    </div>
                </div>

                {localWindow.shading.enabled && (
                    <div className="space-y-4 md:border-l md:pl-6 border-slate-200 dark:border-slate-700">
                        <div>
                            <label className="label-style">Typ osłony:</label>
                            <Select name="type" value={localWindow.shading.type} onChange={handleShadingChange}>
                                {Object.entries(SHADING_TYPE_LABELS).map(([key, label]) => 
                                    shadingDb[key] && <option key={key} value={key}>{label}</option>
                                )}
                            </Select>
                        </div>

                        {localWindow.shading.type === 'louvers' && shadingDb.louvers &&
                         <>
                             <div>
                                <label className="label-style">Lokalizacja:</label>
                                <Select name="location" value={localWindow.shading.location} onChange={handleShadingChange}>
                                    {Object.entries(LOUVERS_LOCATION_LABELS).map(([key, label]) => 
                                      shadingDb.louvers[key] && <option key={key} value={key}>{label}</option>
                                    )}
                                </Select>
                             </div>
                             <div>
                                <label className="label-style">Kolor / Typ lameli:</label>
                                <Select name="color" value={localWindow.shading.color} onChange={handleShadingChange}>
                                    {Object.entries(LOUVERS_COLOR_LABELS).map(([key, label]) => 
                                       shadingDb.louvers[localWindow.shading.location]?.[key] && <option key={key} value={key}>{label}</option>
                                    )}
                                </Select>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{LOUVERS_COLOR_DESCRIPTIONS[localWindow.shading.color]}</p>
                             </div>
                             <div>
                                <label className="label-style">Ustawienie lameli:</label>
                                <Select name="setting" value={localWindow.shading.setting} onChange={handleShadingChange}>
                                    {Object.entries(LOUVERS_SETTING_LABELS).map(([key, label]) => 
                                        shadingDb.louvers[localWindow.shading.location]?.[localWindow.shading.color]?.[key] && <option key={key} value={key}>{label}</option>
                                    )}
                                </Select>
                             </div>
                         </>
                        }

                        {localWindow.shading.type === 'draperies' && shadingDb.draperies &&
                            <>
                                <div>
                                    <label className="label-style">Typ materiału:</label>
                                    <Select name="material" value={localWindow.shading.material} onChange={handleShadingChange}>
                                        {Object.entries(DRAPERY_MATERIAL_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                    </Select>
                                </div>
                                {localWindow.shading.material !== 'sheer' && <div>
                                    <label className="label-style">Kolor zasłon:</label>
                                    <Select name="color" value={localWindow.shading.color} onChange={handleShadingChange}>
                                        <option value="light">Jasny</option>
                                        <option value="medium">Średni</option>
                                        <option value="dark">Ciemny</option>
                                    </Select>
                                </div>}
                            </>
                        }
                        
                        {localWindow.shading.type === 'roller_shades' && shadingDb.roller_shades &&
                            <div>
                                <label className="label-style">Rodzaj rolety:</label>
                                <Select name="setting" value={localWindow.shading.setting} onChange={handleShadingChange}>
                                     {Object.entries(ROLLER_SHADE_SETTING_LABELS).map(([key, label]) => 
                                       shadingDb.roller_shades[key] && <option key={key} value={key}>{label}</option>
                                    )}
                                </Select>
                            </div>
                        }

                        {localWindow.shading.type === 'insect_screens' && shadingDb.insect_screens &&
                             <div>
                                <label className="label-style">Umiejscowienie:</label>
                                <Select name="location" value={localWindow.shading.location} onChange={handleShadingChange}>
                                     {Object.entries(SHADING_LOCATION_LABELS).map(([key, label]) => 
                                        shadingDb.insect_screens[key] && <option key={key} value={key}>{label}</option>
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