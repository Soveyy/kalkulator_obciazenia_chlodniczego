
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useCalculator } from '../contexts/CalculatorContext';

const HeatGainChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const { state, theme } = useCalculator();

    useEffect(() => {
        if (!chartRef.current || !state.results || !state.activeResults) return;

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const isSummerTime = (parseInt(state.currentMonth, 10) >= 4 && parseInt(state.currentMonth, 10) <= 10);
        const offset = isSummerTime ? 2 : 1;
        const timeZoneNotice = isSummerTime ? 'UTC+2' : 'UTC+1';
        const xAxisLabel = `Godzina (Czas lokalny, ${timeZoneNotice})`;
        const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
        const isDarkMode = theme === 'dark';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#ecf0f1' : '#333';

        const { finalGains, incidentSolarPower } = state.activeResults;
        const { tExtProfile } = state;
        
        const localData = { global: [] as number[], clearSky: [] as number[], incidentSolar: [] as number[], temp: [] as number[] };

        for (let h_local = 0; h_local < 24; h_local++) {
            let h_utc = (h_local - offset + 24) % 24;
            localData.global[h_local] = finalGains.global[h_utc];
            localData.clearSky[h_local] = finalGains.clearSky[h_utc];
            localData.incidentSolar[h_local] = incidentSolarPower[h_utc];
            localData.temp[h_local] = tExtProfile[h_utc];
        }

        const maxClearSkyGain = Math.max(...localData.clearSky);
        const peakHourIndex = localData.clearSky.indexOf(maxClearSkyGain);
        const pointRadiusesCS = new Array(24).fill(3);
        if (peakHourIndex !== -1) pointRadiusesCS[peakHourIndex] = 7;

        const chartConfig: any = {
            type: state.chartType,
            data: {
                labels,
                datasets: state.chartType === 'line' ? [
                    { label: 'Projektowe obciążenie chłodnicze (Clear Sky)', data: localData.clearSky, borderColor: 'darkorange', fill: true, backgroundColor: 'rgba(255, 140, 0, 0.2)', pointRadius: pointRadiusesCS, pointHoverRadius: 8, borderWidth: 2.5, yAxisID: 'yGains', order: 1 },
                    { label: 'Typowe obciążenie chłodnicze (Global)', data: localData.global, borderColor: '#3498db', fill: true, backgroundColor: 'rgba(52, 152, 219, 0.2)', pointRadius: new Array(24).fill(3), pointHoverRadius: 6, borderWidth: 2, yAxisID: 'yGains', order: 2 },
                    { label: 'Całkowita moc słoneczna (padająca)', data: localData.incidentSolar, borderColor: '#8e44ad', fill: false, borderDash: [5, 5], pointRadius: new Array(24).fill(2), borderWidth: 2, yAxisID: 'yGains', hidden: true, order: 0 },
                    { label: 'Temperatura zewnętrzna', data: localData.temp, borderColor: '#e74c3c', fill: false, pointRadius: new Array(24).fill(2), borderWidth: 1.5, borderDash: [5, 5], yAxisID: 'yTemp', hidden: false, order: 3 }
                ] : [
                    { label: 'Projektowe obciążenie chłodnicze', data: localData.clearSky, backgroundColor: 'rgba(255, 140, 0, 0.8)' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: xAxisLabel, color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
                    yGains: { type: 'linear', position: 'left', title: { display: true, text: 'Obciążenie chłodnicze / Moc (W)', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor }, display: true },
                    yTemp: { type: 'linear', position: 'right', title: { display: true, text: 'Temperatura (°C)', color: textColor }, ticks: { color: textColor }, grid: { drawOnChartArea: false }, display: state.chartType === 'line' }
                },
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { labels: { color: textColor } },
                    tooltip: { backgroundColor: 'rgba(51, 51, 51, 0.85)', itemSort: (a:any, b:any) => a.datasetIndex - b.datasetIndex, callbacks: { label: (ctx:any) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(ctx.dataset.yAxisID === 'yTemp' ? 1 : 0)} ${ctx.dataset.yAxisID === 'yTemp' ? '°C' : 'W'}` } }
                }
            }
        };

        chartInstanceRef.current = new Chart(ctx, chartConfig);

    }, [state.activeResults, state.chartType, state.currentMonth, state.tExtProfile, theme]);

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md h-96 md:h-[500px]">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default HeatGainChart;
