import React from 'react';
import WindowConfigurator from '../WindowConfigurator';
import WindowGainsChart from '../WindowGainsChart';
import { useCalculator } from '../../contexts/CalculatorContext';
import { MONTH_NAMES } from '../../constants';
import Card from '../ui/Card';

const WindowsPage: React.FC = () => {
    const { state } = useCalculator();

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6">
                {state.results && (
                     <Card>
                        <p className="text-sm">
                            Miesiąc analizy: <strong className="font-semibold text-blue-600 dark:text-blue-400">{MONTH_NAMES[parseInt(state.currentMonth) - 1]}</strong>
                        </p>
                    </Card>
                )}
                <WindowConfigurator />
            </div>
            <WindowGainsChart />
        </div>
    );
};

export default WindowsPage;
