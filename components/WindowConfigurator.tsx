
import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import WindowCard from './WindowCard';
import { PlusIcon } from './Icons';

const WindowConfigurator: React.FC = () => {
  const { state, dispatch } = useCalculator();

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md flex flex-col h-[500px] xl:h-auto">
      <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
        Konfiguracja Okien
        {state.windows.length > 0 && <span className="text-base font-normal text-slate-500 dark:text-slate-400 ml-2">({state.windows.length})</span>}
      </h2>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {state.windows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8">
            <h3 className="text-lg font-semibold mb-2">Witaj w kalkulatorze!</h3>
            <p>Kliknij przycisk "Dodaj okno", aby rozpocząć konfigurację.</p>
            <button onClick={() => dispatch({ type: 'ADD_WINDOW' })} className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <PlusIcon className="w-5 h-5"/>
              Dodaj okno
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {state.windows.map(win => (
              <WindowCard key={win.id} window={win} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WindowConfigurator;
