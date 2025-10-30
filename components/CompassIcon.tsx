import React from 'react';
import { WINDOW_DIRECTIONS } from '../constants';

interface CompassIconProps {
  className?: string;
  selectedDirection?: string | null;
  hoveredDirection?: string | null;
}

const DIRECTIONS_META = {
    'N':   { angle: 0,    size: 180, type: 'cardinal' },
    'NNE': { angle: 22.5,  size: 140, type: 'secondary' },
    'NE':  { angle: 45,    size: 160, type: 'intercardinal' },
    'ENE': { angle: 67.5,  size: 140, type: 'secondary' },
    'E':   { angle: 90,    size: 180, type: 'cardinal' },
    'ESE': { angle: 112.5, size: 140, type: 'secondary' },
    'SE':  { angle: 135,   size: 160, type: 'intercardinal' },
    'SSE': { angle: 157.5, size: 140, type: 'secondary' },
    'S':   { angle: 180,   size: 180, type: 'cardinal' },
    'SSW': { angle: 202.5, size: 140, type: 'secondary' },
    'SW':  { angle: 225,   size: 160, type: 'intercardinal' },
    'WSW': { angle: 247.5, size: 140, type: 'secondary' },
    'W':   { angle: 270,   size: 180, type: 'cardinal' },
    'WNW': { angle: 292.5, size: 140, type: 'secondary' },
    'NW':  { angle: 315,   size: 160, type: 'intercardinal' },
    'NNW': { angle: 337.5, size: 140, type: 'secondary' },
};

const LABEL_POSITIONS: { [key: string]: { x: number, y: number, dx?: number, dy?: number, fs: number, fsw: number, fss: number } } = {
    'N':   { x: 200, y: 28,  dy: 18, fs: 28, fsw: 28, fss: 12 },
    'NNE': { x: 268, y: 52,  dy: 14, fs: 14, fsw: 14, fss: 10 },
    'NE':  { x: 318, y: 80,  dy: 16, fs: 20, fsw: 20, fss: 10 },
    'ENE': { x: 345, y: 132, dy: 14, fs: 14, fsw: 14, fss: 10 },
    'E':   { x: 375, y: 206, dy: 18, fs: 28, fsw: 28, fss: 12 },
    'ESE': { x: 345, y: 268, dy: 14, fs: 14, fsw: 14, fss: 10 },
    'SE':  { x: 318, y: 318, dy: 16, fs: 20, fsw: 20, fss: 10 },
    'SSE': { x: 268, y: 348, dy: 14, fs: 14, fsw: 14, fss: 10 },
    'S':   { x: 200, y: 382, dy: 18, fs: 28, fsw: 28, fss: 12 },
    'SSW': { x: 132, y: 348, dy: 14, fs: 14, fsw: 14, fss: 10 },
    'SW':  { x: 82,  y: 318, dy: 16, fs: 20, fsw: 20, fss: 10 },
    'WSW': { x: 55,  y: 268, dy: 14, fs: 14, fsw: 14, fss: 10 },
    'W':   { x: 25,  y: 206, dy: 18, fs: 28, fsw: 28, fss: 12 },
    'WNW': { x: 55,  y: 132, dy: 14, fs: 14, fsw: 14, fss: 10 },
    'NW':  { x: 82,  y: 80,  dy: 16, fs: 20, fsw: 20, fss: 10 },
    'NNW': { x: 132, y: 52,  dy: 14, fs: 14, fsw: 14, fss: 10 },
};


const CompassIcon: React.FC<CompassIconProps> = ({ className, selectedDirection, hoveredDirection }) => {
    
    const getStyle = (dir: string) => {
        const isSelected = selectedDirection === dir;
        const isHovered = hoveredDirection === dir;
        
        const style: React.SVGProps<SVGLineElement> = {};

        if (isHovered) {
            style.stroke = '#3b82f6'; // blue-500
            style.strokeWidth = '10';
        } else if (isSelected) {
            style.stroke = '#2563eb'; // blue-600
            style.strokeWidth = '8';
        } else {
            const meta = DIRECTIONS_META[dir as keyof typeof DIRECTIONS_META];
            switch (meta.type) {
                case 'cardinal':
                    style.stroke = dir === 'N' ? '#ef4444' : '#334155';
                    style.strokeWidth = '6';
                    break;
                case 'intercardinal':
                    style.stroke = '#94a3b8';
                    style.strokeWidth = '4';
                    break;
                case 'secondary':
                    style.stroke = '#cbd5e1';
                    style.strokeWidth = '2';
                    break;
            }
        }
        return style;
    };
    
    const getTextStyle = (dir: string) => {
        const isSelected = selectedDirection === dir;
        const isHovered = hoveredDirection === dir;
        
        const style: React.SVGProps<SVGTextElement> = {};

        if (isHovered) {
             style.fill = '#3b82f6';
             style.fontWeight = 'bold';
        } else if (isSelected) {
            style.fill = '#2563eb';
            style.fontWeight = 'bold';
        } else {
             const meta = DIRECTIONS_META[dir as keyof typeof DIRECTIONS_META];
             switch (meta.type) {
                case 'cardinal':
                    style.fill = '#0f172a';
                    style.fontWeight = 'bold';
                    break;
                case 'intercardinal':
                    style.fill = '#1e293b';
                    style.fontWeight = 'semibold';
                    break;
                case 'secondary':
                    style.fill = '#475569';
                    break;
            }
        }
        return style;
    }

    return (
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className={className}>
             <defs>
                 <filter id="label-bg" x="-0.1" y="-0.1" width="1.2" height="1.2">
                    <feFlood floodColor="white" floodOpacity="0.75" result="bg" />
                    <feMerge>
                        <feMergeNode in="bg"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <g transform="translate(200 200)">
                <g strokeLinecap="round">
                    {Object.entries(DIRECTIONS_META).map(([key, { angle, size }]) => (
                        <line 
                            key={key}
                            x1="0" y1="0" x2="0" y2={-size} 
                            transform={`rotate(${angle})`}
                            {...getStyle(key)}
                            style={{ transition: 'all 0.2s ease-in-out' }}
                        />
                    ))}
                </g>
            </g>
            
            <circle cx="200" cy="200" r="10" fill="#334155" />
            
            <g fontFamily="Arial, sans-serif" textAnchor="middle" filter="url(#label-bg)">
                {WINDOW_DIRECTIONS.map(({ value, label }) => {
                    const pos = LABEL_POSITIONS[value];
                    const angle = parseFloat(label.match(/\((.*?)\°\)/)?.[1] || '0');
                     return (
                        <g key={value} {...getTextStyle(value)} style={{ transition: 'all 0.2s ease-in-out' }}>
                            <text x={pos.x} y={pos.y} fontSize={pos.fsw}>{value}</text>
                            <text x={pos.x} y={pos.y + pos.dy} fontSize={pos.fss}>({angle.toFixed(1)}°)</text>
                        </g>
                    )
                })}
            </g>
        </svg>
    );
};

export default CompassIcon;