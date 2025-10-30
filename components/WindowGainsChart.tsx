import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useCalculator } from '../contexts/CalculatorContext';
import Card from './ui/Card';
import Checkbox from './ui/Checkbox';

const WindowGainsChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const { state, theme } = useCalculator();
    const [showIncidentRadiation, setShowIncidentRadiation] = useState(false);

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
        
        const { windowGainsLoad, incidentSolarPower } = state.activeResults;

        const datasets: any[] = [
             { 
                 label: 'Obciążenie chłodnicze - Okna (Projektowe, Clear Sky)', 
                 data: windowGainsLoad.clearSky.total, 
                 borderColor: '#e74c3c', 
                 backgroundColor: 'rgba(231, 76, 60, 0.2)',
                 fill: true, 
                 borderWidth: 2.5, 
                 yAxisID: 'yLoad',
                 tension: 0.3
            },
             { 
                 label: 'Obciążenie chłodnicze - Okna (Typowe, Global)', 
                 data: windowGainsLoad.global.total, 
                 borderColor: '#f1c40f', 
                 fill: false, 
                 borderWidth: 2, 
                 borderDash: [5, 5], 
                 yAxisID: 'yLoad',
                 tension: 0.3
            },
        ];

        if (showIncidentRadiation) {
            datasets.push({
                label: 'Padające promieniowanie słoneczne (Clear Sky)',
                data: incidentSolarPower,
                borderColor: '#95a5a6',
                borderWidth: 1.5,
                borderDash: [2, 2],
                yAxisID: 'yRadiation',
                tension: 0.3,
                fill: false
            });
        }


        const chartConfig: any = {
            type: 'line',
            data: {
                labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: "Godzina (UTC)", color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
                    yLoad: { position: 'left', title: { display: true, text: 'Obciążenie chłodnicze od okien (W)', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true },
                    yRadiation: { position: 'right', title: { display: showIncidentRadiation, text: 'Padające prom. słoneczne (W)', color: textColor }, ticks: { color: textColor }, grid: { drawOnChartArea: false }, display: showIncidentRadiation, beginAtZero: true }
                },
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    title: { display: true, text: 'Obciążenie chłodnicze od okien', color: textColor, font: { size: 16 } },
                    legend: { labels: { color: textColor } },
                    tooltip: { mode: 'index' }
                }
            }
        };

        chartInstanceRef.current = new Chart(ctx, chartConfig);
    }, [state.activeResults, theme, showIncidentRadiation]);
    
    if (!state.results) {
        return (
            <Card className="flex items-center justify-center h-full min-h-[500px]">
                <p className="text-slate-500 text-center px-4">Przejdź do zakładki "Podsumowanie" i uruchom obliczenia, aby zobaczyć wykres obciążenia od okien.</p>
            </Card>
        );
    }

    return (
        <Card className="h-full min-h-[500px] flex flex-col">
            <div className="flex-grow relative">
                <canvas ref={chartRef}></canvas>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Checkbox 
                    id="show_incident_radiation"
                    label="Pokaż całkowite promieniowanie słoneczne padające na okna"
                    checked={showIncidentRadiation}
                    onChange={(e) => setShowIncidentRadiation(e.target.checked)}
                />
            </div>
        </Card>
    );
};

export default WindowGainsChart;