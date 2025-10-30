import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useCalculator } from '../contexts/CalculatorContext';
import Card from './ui/Card';

const InternalGainsChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const { state, theme } = useCalculator();

    useEffect(() => {
        if (!chartRef.current || !state.activeResults) {
             if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
            return;
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
        const isDarkMode = theme === 'dark';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#ecf0f1' : '#333';

        const { internalGainsLoad } = state.activeResults;

        const chartConfig: any = {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Obciążenie jawne', data: internalGainsLoad.sensible, backgroundColor: 'rgba(231, 76, 60, 0.7)', stack: 'a' },
                    { label: 'Obciążenie utajone', data: internalGainsLoad.latent, backgroundColor: 'rgba(52, 152, 219, 0.7)', stack: 'a' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: "Godzina (UTC)", color: textColor }, ticks: { color: textColor }, grid: { color: gridColor }, stacked: true },
                    y: { title: { display: true, text: 'Obciążenie chłodnicze (W)', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor }, stacked: true, beginAtZero: true }
                },
                plugins: {
                    title: { display: true, text: 'Godzinowe obciążenie chłodnicze od zysków wewnętrznych', color: textColor, font: { size: 16 } },
                    legend: { labels: { color: textColor } },
                    tooltip: { 
                        mode: 'index',
                        callbacks: {
                            footer: (tooltipItems: any[]) => {
                                let sum = 0;
                                tooltipItems.forEach(tooltipItem => {
                                    sum += tooltipItem.parsed.y;
                                });
                                return 'Suma: ' + sum.toFixed(0) + ' W';
                            },
                        },
                     }
                }
            }
        };

        chartInstanceRef.current = new Chart(ctx, chartConfig);
    }, [state.activeResults, theme]);
    
    if (!state.results) {
        return (
            <Card className="flex items-center justify-center h-full min-h-[400px]">
                <p className="text-slate-500 text-center px-4">Przejdź do zakładki "Podsumowanie" i uruchom obliczenia, aby zobaczyć wykres obciążenia chłodniczego.</p>
            </Card>
        );
    }

    return (
        <Card className="h-full min-h-[400px]">
            <canvas ref={chartRef}></canvas>
        </Card>
    );
};

export default InternalGainsChart;