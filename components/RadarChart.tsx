
import React, { useMemo } from 'react';

interface RadarData {
  label: string;
  value: number; // 0 to 10
}

interface RadarChartProps {
  data: RadarData[];
  size?: number;
  color?: string;
  showBenchmark?: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size = 450, color = '#6366f1', showBenchmark = true }) => {
  const levels = 5;
  const padding = 80;
  const center = size / 2;
  const radius = (size / 2) - padding;
  const angleStep = (Math.PI * 2) / data.length;

  // Data Points Calculation
  const points = useMemo(() => data.map((d, i) => {
    const r = (d.value / 10) * radius;
    const x = center + r * Math.cos(angleStep * i - Math.PI / 2);
    const y = center + r * Math.sin(angleStep * i - Math.PI / 2);
    return `${x},${y}`;
  }).join(' '), [data, radius, center, angleStep]);

  // Benchmark Points Calculation
  const benchmarkPoints = useMemo(() => data.map((_, i) => {
    const r = 0.8 * radius;
    const x = center + r * Math.cos(angleStep * i - Math.PI / 2);
    const y = center + r * Math.sin(angleStep * i - Math.PI / 2);
    return `${x},${y}`;
  }).join(' '), [data, radius, center, angleStep]);

  return (
    <div className="relative w-full flex items-center justify-center p-2 overflow-visible select-none">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${size} ${size}`} 
        className="max-w-full h-auto drop-shadow-[0_0_30px_rgba(99,102,241,0.1)] overflow-visible"
      >
        <defs>
          <filter id="hyperGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
          </linearGradient>
          <pattern id="hexGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 20 5 L 20 15 L 10 20 L 0 15 L 0 5 Z" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Outer Circular Bounds */}
        <circle cx={center} cy={center} r={radius + 10} fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5 5" />

        {/* Radar Tactical Rings */}
        {[...Array(levels)].map((_, l) => {
          const r = ((l + 1) / levels) * radius;
          const gridPoints = data.map((_, i) => {
            const x = center + r * Math.cos(angleStep * i - Math.PI / 2);
            const y = center + r * Math.sin(angleStep * i - Math.PI / 2);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={l}
              points={gridPoints}
              fill="none"
              stroke={l === levels - 1 ? "#cbd5e1" : "#f1f5f9"}
              strokeWidth={l === levels - 1 ? "1.5" : "1"}
            />
          );
        })}

        {/* Axis Spanners */}
        {data.map((d, i) => {
          const x = center + radius * Math.cos(angleStep * i - Math.PI / 2);
          const y = center + radius * Math.sin(angleStep * i - Math.PI / 2);
          const lx = center + (radius + 45) * Math.cos(angleStep * i - Math.PI / 2);
          const ly = center + (radius + 45) * Math.sin(angleStep * i - Math.PI / 2);

          return (
            <g key={i}>
              <line 
                x1={center} y1={center} x2={x} y2={y} 
                stroke="#e2e8f0" strokeWidth="1" 
              />
              <text
                x={lx} y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-black uppercase tracking-[0.3em] fill-slate-400 font-display"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Target Benchmark (Ghost) */}
        {showBenchmark && (
          <polygon
            points={benchmarkPoints}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-30"
          />
        )}

        {/* Animated Performance Area */}
        <polygon
          points={points}
          fill="url(#areaGradient)"
          stroke={color}
          strokeWidth="3"
          strokeLinejoin="round"
          filter="url(#hyperGlow)"
          className="transition-all duration-1000 ease-in-out"
        >
          <animate attributeName="stroke-opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </polygon>

        {/* Vertex Glow Pips */}
        {data.map((d, i) => {
          const r = (d.value / 10) * radius;
          const x = center + r * Math.cos(angleStep * i - Math.PI / 2);
          const y = center + r * Math.sin(angleStep * i - Math.PI / 2);
          return (
            <g key={i} className="group cursor-help">
              <circle cx={x} cy={y} r="14" fill={color} fillOpacity="0" className="group-hover:fill-opacity-10 transition-all" />
              <circle cx={x} cy={y} r="4.5" fill="white" stroke={color} strokeWidth="3" className="group-hover:scale-150 transition-transform" />
              <rect x={x-15} y={y-30} width="30" height="16" rx="4" fill="#0f172a" className="opacity-0 group-hover:opacity-100 transition-opacity" />
              <text x={x} y={y-19} textAnchor="middle" className="text-[9px] font-bold fill-white opacity-0 group-hover:opacity-100 pointer-events-none">{d.value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;
