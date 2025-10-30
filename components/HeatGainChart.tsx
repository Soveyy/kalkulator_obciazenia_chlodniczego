import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useCalculator } from '../contexts/CalculatorContext';
import Card from './ui/Card';

const HeatGainChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const { state, theme } = useCalculator();

    useEffect(() => {
        if (!chartRef.current || !state.activeResults) return;

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
        const isDarkMode = theme === 'dark';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#ecf0f1' : '#333';
        
        const { finalGains, components } = state.activeResults;
        const hasTempData = state.tExtProfile && state.tExtProfile.length === 24;
        const chartType = state.chartType;

        let datasets: any[];

        if (chartType === 'line') {
            datasets = [
                { label: 'Obciążenie chłodnicze projektowe', data: finalGains.clearSky.total, borderColor: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.2)', fill: true, tension: 0.3, yAxisID: 'yLoad' },
                { label: 'Obciążenie chłodnicze typowe', data: finalGains.global.total, borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.2)', fill: true, tension: 0.3, yAxisID: 'yLoad' }
            ];
        } else { // bar chart
            datasets = [
                { label: 'Słoneczne (CS)', data: components.solarGainsClearSky, backgroundColor: 'rgba(241, 196, 15, 0.7)', stack: 'cs', yAxisID: 'yLoad' },
                { label: 'Przewodzenie (CS)', data: components.conductionGainsRadiant.map((v, i) => v + components.conductionGainsConvective[i]), backgroundColor: 'rgba(230, 126, 34, 0.7)', stack: 'cs', yAxisID: 'yLoad' },
                { label: 'Wewn. Jawne (CS)', data: components.internalGainsSensibleRadiant.map((v, i) => v + components.internalGainsSensibleConvective[i]), backgroundColor: 'rgba(231, 76, 60, 0.7)', stack: 'cs', yAxisID: 'yLoad' },
                { label: 'Wewn. Utajone (CS)', data: components.internalGainsLatent, backgroundColor: 'rgba(52, 152, 219, 0.7)', stack: 'cs', yAxisID: 'yLoad' }
            ];
        }

        if (hasTempData) {
            datasets.push({
                type: 'line',
                label: 'Temperatura zewnętrzna',
                data: state.tExtProfile,
                borderColor: isDarkMode ? '#94a3b8' : '#64748b',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                yAxisID: 'yTemp',
                tension: 0.3,
                order: -1
            });
        }

        const chartConfig: any = {
            type: chartType,
            data: {
                labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: "Godzina (UTC)", color: textColor }, ticks: { color: textColor }, grid: { color: gridColor }, stacked: chartType === 'bar' },
                    yLoad: { 
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Obciążenie chłodnicze (W)', color: textColor }, 
                        ticks: { color: textColor }, 
                        grid: { color: gridColor }, 
                        stacked: chartType === 'bar', 
                        beginAtZero: true 
                    },
                    yTemp: {
                         type: 'linear',
                         display: hasTempData,
                         position: 'right',
                         title: { display: true, text: 'Temperatura (°C)', color: textColor },
                         ticks: { color: textColor },
                         grid: { drawOnChartArea: false },
                    }
                },
                plugins: {
                    title: { display: true, text: 'Godzinowe obciążenie chłodnicze', color: textColor, font: { size: 16 } },
                    legend: { labels: { color: textColor } },
                    tooltip: { mode: 'index' }
                }
            }
        };

        chartInstanceRef.current = new Chart(ctx, chartConfig);

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [state.activeResults, state.chartType, theme, state.tExtProfile]);

    return (
        <Card className="h-[450px]">
            <canvas ref={chartRef}></canvas>
        </Card>
    );
};

export default HeatGainChart;