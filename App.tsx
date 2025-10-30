
import React from 'react';
import { CalculatorProvider } from './contexts/CalculatorContext';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import WindowConfigurator from './components/WindowConfigurator';
import ResultsArea from './components/ResultsArea';
import MethodologyModal from './components/modals/MethodologyModal';
import TempDatabaseModal from './components/modals/TempDatabaseModal';
import WindowEditModal from './components/modals/WindowEditModal';
import BulkShadingModal from './components/modals/BulkShadingModal';
import ToastContainer from './components/ToastContainer';

const App: React.FC = () => {
  return (
    <CalculatorProvider>
      <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-screen-2xl">
          <Header />
          <main>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col gap-6">
                <ControlPanel />
              </div>
              <WindowConfigurator />
            </div>
            <ResultsArea />
          </main>
        </div>
      </div>
      
      {/* Modals */}
      <MethodologyModal />
      <TempDatabaseModal />
      <WindowEditModal />
      <BulkShadingModal />

      <ToastContainer />

    </CalculatorProvider>
  );
};

export default App;
