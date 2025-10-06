/**
 * Mini Trend Chart Component
 * Metric-specific sparkline charts optimized for each data type
 */

'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';

export type ChartType = 'line' | 'area' | 'stepped' | 'bar' | 'candlestick';

interface MiniTrendChartProps {
  data: number[];
  type: ChartType;
  color?: string;
  height?: number;
}

export function MiniTrendChart({
  data,
  type,
  color = '#3B82F6',
  height = 32,
}: MiniTrendChartProps) {
  // Convert array of numbers to chart data format
  interface ChartDataPoint {
    index: number;
    value: number;
    high?: number;
    low?: number;
    open?: number;
    close?: number;
  }

  const chartData: ChartDataPoint[] = data.map((value, index) => ({
    index,
    value,
    // For candlestick: generate high/low/open/close
    high: value * (1 + Math.random() * 0.1),
    low: value * (1 - Math.random() * 0.1),
    open: index > 0 ? data[index - 1] : value,
    close: value,
  }));

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 2, right: 2, left: 2, bottom: 2 },
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient
                id={`gradient-${color}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#gradient-${color})`}
            />
          </AreaChart>
        );

      case 'stepped':
        return (
          <LineChart {...commonProps}>
            <Line
              type="step"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <Bar dataKey="value" fill={color} radius={[1, 1, 0, 0]} />
          </BarChart>
        );

      case 'candlestick':
        return (
          <BarChart {...commonProps}>
            <Bar dataKey="value" fill={color} radius={[1, 1, 0, 0]} />
          </BarChart>
        );

      default: // 'line'
        return (
          <LineChart {...commonProps}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="w-full overflow-hidden" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
