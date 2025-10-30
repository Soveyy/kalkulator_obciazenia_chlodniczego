import React from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Checkbox from './ui/Checkbox';
import { useCalculator } from '../contexts/CalculatorContext';
import { Tooltip } from '../constants';

const ControlPanel: React.FC = () => {
    const { state, dispatch, handleCalculate, isCalculating } = useCalculator();

    const isCalculateDisabled = !state.input.tInternal || !state.input.tExternal || isCalculating;

    return (
        <Card className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <div className="mb-4">
                        <label htmlFor="t_internal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            <Tooltip text="Projektowa temperatura komfortu cieplnego w pomieszczeniu, zazwyczaj 24-26°C.">
                                Temperatura wewnętrzna (°C):
                            </Tooltip>
                        </label>
                        <Input
                            type="number"
                            id="t_internal"
                            value={state.input.tInternal}
                            onChange={(e) => dispatch({ type: 'SET_INPUT', payload: { ...state.input, tInternal: e.target.value } })}
                            className={!state.input.tInternal ? 'animate-pulse' : ''}
                        />
                    </div>
                    <div>
                        <label htmlFor="t_external" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                             <Tooltip text="Projektowa temperatura zewnętrzna dla danej lokalizacji. Możesz użyć wartości z bazy temperatur lub wpisać własną.">
                                Temperatura zewnętrzna (°C):
                            </Tooltip>
                        </label>
                        <Input
                            type="number"
                            id="t_external"
                            value={state.input.tExternal}
                            onChange={(e) => dispatch({ type: 'SET_INPUT', payload: { ...state.input, tExternal: e.target.value } })}
                             className={!state.input.tExternal ? 'animate-pulse' : ''}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button onClick={() => dispatch({ type: 'SET_MODAL', payload: { isOpen: true, type: 'tempDatabase' } })}>Baza temperatur</Button>
                        <Button onClick={() => dispatch({ type: 'ADD_WINDOW' })}>Dodaj okno</Button>
                        <Button onClick={() => dispatch({ type: 'SET_MODAL', payload: { isOpen: true, type: 'bulkShading' } })}>Wszystkie osłony</Button>
                        <Button onClick={() => dispatch({ type: 'SAVE_PROJECT' })}>Zapisz projekt</Button>
                        <Button onClick={() => dispatch({ type: 'LOAD_PROJECT' })}>Wczytaj projekt</Button>
                    </div>
                </div>

                <div>
                     <div className="flex items-center">
                        <Checkbox
                            id="include_accumulation"
                            label="Uwzględniaj akumulację ciepła"
                            checked={state.accumulation.include}
                            onChange={(e) => dispatch({ type: 'SET_ACCUMULATION', payload: { ...state.accumulation, include: e.target.checked } })}
                        />
                        <Tooltip text="Włączenie tej opcji aktywuje model akumulacji ciepła (metoda RTS), który symuluje opóźnienie w oddawaniu zysków radiacyjnych do pomieszczenia."><span className="ml-1"></span></Tooltip>
                    </div>
                    {state.accumulation.include && (
                        <div className="mt-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-4">
                            <div>
                                <label htmlFor="thermal_mass" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    <Tooltip text='Wybierz typ konstrukcji budynku. "Bardzo ciężka" odpowiada typowemu polskiemu budownictwu murowano-żelbetowemu i zapewnia największą akumulację ciepła.'>
                                        Masa termiczna konstrukcji:
                                    </Tooltip>
                                </label>
                                <Select id="thermal_mass" value={state.accumulation.thermalMass} onChange={(e) => dispatch({ type: 'SET_ACCUMULATION', payload: { ...state.accumulation, thermalMass: e.target.value as any } })}>
                                    <option value="light">Lekka</option>
                                    <option value="medium">Średnia</option>
                                    <option value="heavy">Ciężka</option>
                                    <option value="very_heavy">Bardzo ciężka</option>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="floor_type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    <Tooltip text="Typ wykończenia podłogi ma wpływ na to, jak szybko zyski radiacyjne są oddawane do pomieszczenia.">
                                        Typ podłogi:
                                    </Tooltip>
                                </label>
                                <Select id="floor_type" value={state.accumulation.floorType} onChange={(e) => dispatch({ type: 'SET_ACCUMULATION', payload: { ...state.accumulation, floorType: e.target.value as any } })}>
                                    <option value="panels">Panele podłogowe</option>
                                    <option value="tiles">Płytki gresowe</option>
                                    <option value="carpet">Wykładzina dywanowa</option>
                                </Select>
                            </div>
                             <div>
                                <label htmlFor="glass_percentage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    <Tooltip text="Procentowy udział powierzchni przeszkleń w stosunku do całkowitej powierzchni podłogi. Wpływa na rozkład promieniowania wewnątrz pomieszczenia.">
                                        % Przeszklenia:
                                    </Tooltip>
                                </label>
                                <Select id="glass_percentage" value={state.accumulation.glassPercentage} onChange={(e) => dispatch({ type: 'SET_ACCUMULATION', payload: { ...state.accumulation, glassPercentage: parseInt(e.target.value, 10) as any } })}>
                                    <option value="10">10%</option>
                                    <option value="50">50%</option>
                                    <option value="90">90%</option>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <hr className="border-slate-200 dark:border-slate-700 my-4" />
            <Button variant="action" fullWidth onClick={handleCalculate} disabled={isCalculateDisabled}>
                {isCalculating ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Obliczanie...
                    </span>
                ) : 'Oblicz i znajdź najgorszy miesiąc'}
            </Button>
        </Card>
    );
};

export default ControlPanel;