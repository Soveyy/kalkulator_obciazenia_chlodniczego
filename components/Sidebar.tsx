import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Checkbox from './ui/Checkbox';
import Button from './ui/Button';
import Tooltip from './ui/Tooltip';

const Sidebar: React.FC = () => {
    const { state, dispatch } = useCalculator();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'SET_INPUT', payload: { ...state.input, [e.target.name]: e.target.value } });
    };

    const handleAccumulationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const isCheckbox = type === 'checkbox';
        dispatch({ type: 'SET_ACCUMULATION', payload: { ...state.accumulation, [name]: isCheckbox ? checked : value } });
    };
    
    return (
        <aside className="w-80 bg-slate-50 dark:bg-slate-900 p-4 space-y-6 hidden lg:flex lg:flex-col">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Parametry Główne</h2>

            {/* Project Management */}
            <Card>
                <h3 className="font-semibold mb-3">Projekt</h3>
                 <div className="flex gap-2">
                    <Button fullWidth onClick={() => dispatch({ type: 'SAVE_PROJECT' })}>Zapisz</Button>
                    <Button fullWidth variant="secondary" onClick={() => dispatch({ type: 'LOAD_PROJECT' })}>Wczytaj</Button>
                 </div>
            </Card>

            {/* Input Data */}
            <Card>
                <h3 className="font-semibold mb-3">Dane Wejściowe</h3>
                <div className="space-y-3">
                    <div>
                        <label className="label-style flex items-center">
                            Temperatura wewnętrzna (°C):
                            <Tooltip text="Projektowana temperatura powietrza wewnątrz pomieszczenia."/>
                        </label>
                        <Input name="tInternal" type="number" value={state.input.tInternal} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className="label-style flex items-center">
                            Temperatura zewn. (°C):
                            <Tooltip text="Maksymalna projektowana dobowa temperatura zewnętrzna." />
                        </label>
                         <div className="flex gap-2 items-center">
                            <Input name="tExternal" type="number" value={state.input.tExternal} onChange={handleInputChange} />
                            <Button variant="secondary" className="px-2 py-1" onClick={() => dispatch({ type: 'SET_MODAL', payload: { isOpen: true, type: 'tempDatabase' } })}>Baza</Button>
                         </div>
                    </div>
                     <div>
                        <label className="label-style flex items-center">
                            Powierzchnia pomieszczenia (m²):
                            <Tooltip text="Powierzchnia jest wykorzystywana do obliczania zysków od oświetlenia oraz urządzeń." />
                        </label>
                        <Input name="roomArea" type="number" value={state.input.roomArea} onChange={handleInputChange} />
                    </div>
                </div>
            </Card>

            {/* Accumulation Settings */}
            <Card>
                 <h3 className="font-semibold mb-3 flex items-center">
                    Akumulacja Ciepła (RTS)
                    <Tooltip text="Ustawienia dotyczące zdolności budynku do magazynowania i opóźniania oddawania ciepła." />
                </h3>
                <div className="space-y-3">
                    <Checkbox
                        id="accumulation_enabled"
                        label="Uwzględnij akumulację ciepła"
                        name="include"
                        checked={state.accumulation.include}
                        onChange={handleAccumulationChange}
                    />
                    {state.accumulation.include && (
                        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-3 mt-3">
                            <div>
                                <label className="label-style flex items-center">
                                    Masa termiczna budynku:
                                    <Tooltip text="Określa zdolność budynku do magazynowania ciepła. Konstrukcja ciężka wolniej reaguje na zmiany temperatury." />
                                </label>
                                <Select name="thermalMass" value={state.accumulation.thermalMass} onChange={handleAccumulationChange}>
                                    <option value="light">Lekka</option>
                                    <option value="medium">Średnia</option>
                                    <option value="heavy">Ciężka</option>
                                    <option value="very_heavy">Bardzo ciężka</option>
                                </Select>
                            </div>
                             <div>
                                <label className="label-style flex items-center">
                                    Typ podłogi:
                                    <Tooltip text="Typ wykończenia podłogi wpływa na sposób pochłaniania i oddawania ciepła." />
                                </label>
                                <Select name="floorType" value={state.accumulation.floorType} onChange={handleAccumulationChange}>
                                    <option value="panels">Panele / Drewno</option>
                                    <option value="tiles">Płytki / Kamień</option>
                                    <option value="carpet">Wykładzina</option>
                                </Select>
                            </div>
                            <div>
                                <label className="label-style flex items-center">
                                    Procent przeszklenia fasady:
                                    <Tooltip text="Szacowany stosunek powierzchni okien do całkowitej powierzchni fasady. Wpływa na charakterystykę akumulacji ciepła." />
                                </label>
                                <Select name="glassPercentage" value={state.accumulation.glassPercentage} onChange={handleAccumulationChange}>
                                    <option value={10}>10%</option>
                                    <option value={50}>50%</option>
                                    <option value={90}>90%</option>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            <div className="mt-auto text-center text-xs text-slate-400">
                Wersja 1.0.1
            </div>
            <style>{`.label-style { display: block; text-sm font-medium mb-1 text-slate-700 dark:text-slate-300; }`}</style>
        </aside>
    );
};

export default Sidebar;