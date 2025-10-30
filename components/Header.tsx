import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import { SunIcon, MoonIcon, InformationCircleIcon, ArrowsExpandIcon, ArrowsShrinkIcon } from './Icons';
import Tooltip from './ui/Tooltip';

const Header: React.FC = () => {
    const { theme, toggleTheme, dispatch } = useCalculator();
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    React.useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    Zaawansowany Kalkulator Zysków Ciepła
                </h1>
                <Tooltip text="Pokaż metodologię" position="bottom">
                     <button
                        onClick={() => dispatch({ type: 'SET_MODAL', payload: { type: 'methodology', isOpen: true } })}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        <InformationCircleIcon className="w-7 h-7" />
                    </button>
                </Tooltip>
            </div>
            <div className="flex items-center gap-2">
                 <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    title={isFullscreen ? 'Wyjdź z trybu pełnoekranowego' : 'Tryb pełnoekranowy'}
                >
                    {isFullscreen ? <ArrowsShrinkIcon className="w-5 h-5" /> : <ArrowsExpandIcon className="w-5 h-5" />}
                </button>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    title="Zmień motyw"
                >
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
};

export default Header;