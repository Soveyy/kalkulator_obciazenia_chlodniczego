import React from 'react';
import { CalculatorProvider, useCalculator } from './contexts/CalculatorContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Tabs from './components/ui/Tabs';
import InternalGainsPage from './components/pages/InternalGainsPage';
import WindowsPage from './components/pages/WindowsPage';
import SummaryPage from './components/pages/SummaryPage';
import MethodologyModal from './components/modals/MethodologyModal';
import TempDatabaseModal from './components/modals/TempDatabaseModal';
import WindowEditModal from './components/modals/WindowEditModal';
import BulkShadingModal from './components/modals/BulkShadingModal';
import ToastContainer from './components/ToastContainer';
import CompassHelper from './components/CompassHelper';

const AppContent: React.FC = () => {
    const { state } = useCalculator();
  
    const renderActiveTab = () => {
      switch (state.activeTab) {
        case 'internal':
          return <InternalGainsPage />;
        case 'windows':
          return <WindowsPage />;
        case 'summary':
          return <SummaryPage />;
        default:
          return null;
      }
    }

    return (
      <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Header />
            <Tabs />
            {renderActiveTab()}
          </main>
        </div>
        <CompassHelper />
      </div>
    );
};

const App: React.FC = () => {
  return (
    <CalculatorProvider>
      <AppContent />
      <MethodologyModal />
      <TempDatabaseModal />
      <WindowEditModal />
      <BulkShadingModal />
      <ToastContainer />
    </CalculatorProvider>
  );
};

export default App;
