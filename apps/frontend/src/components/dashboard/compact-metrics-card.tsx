/**
 * Compact Metrics Card Component
 * Optimized for information density with modern icons
 */

import { Card, CardContent, CardHeader, CardTitle } from '@tuberise/ui';
import {
  Eye,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { MetricCard as MetricCardType } from '@tuberise/shared';
import { getMetricTrend } from '@tuberise/shared';
import { MiniTrendChart } from './mini-trend-chart';

interface CompactMetricsCardProps {
  metric: MetricCardType;
  showProgress?: boolean;
  progressValue?: number;
}

export function CompactMetricsCard({
  metric,
  showProgress = false,
  progressValue = 0,
}: CompactMetricsCardProps) {
  const getChangeIcon = () => {
    switch (metric.changeType) {
      case 'increase':
        return <TrendingUp className="w-3 h-3" />;
      case 'decrease':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getChangeColor = () => {
    switch (metric.changeType) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getMetricIcon = () => {
    switch (metric.title.toLowerCase()) {
      case 'total views':
        return <Eye className="w-4 h-4" />;
      case 'subscribers':
        return <Users className="w-4 h-4" />;
      case 'watch time':
        return <Clock className="w-4 h-4" />;
      case 'revenue':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const formatValue = (value: string | number, format: string) => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'duration':
        return formatDuration(value);
      default:
        return value.toLocaleString();
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Get trend data for this metric
  const trendData = getMetricTrend(metric.title);

  // Get metric-specific theme using professional Coolors palette
  const getMetricTheme = () => {
    switch (metric.title.toLowerCase()) {
      case 'total views':
        return {
          bgGradient: 'from-white to-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          accentColor: 'text-gray-700',
          chartBg: 'bg-gray-50/30',
          layout: 'standard',
          cardStyle: 'rounded-xl',
          primaryColor: '#000000', // Black from Coolors palette
          secondaryColor: '#66666e', // Dark gray
        };
      case 'subscribers':
        return {
          bgGradient: 'from-white to-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          accentColor: 'text-gray-700',
          chartBg: 'bg-gray-50/30',
          layout: 'compact',
          cardStyle: 'rounded-lg',
          primaryColor: '#66666e', // Dark gray
          secondaryColor: '#9999a1', // Medium gray
        };
      case 'watch time':
        return {
          bgGradient: 'from-white to-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          accentColor: 'text-gray-700',
          chartBg: 'bg-gray-50/30',
          layout: 'spacious',
          cardStyle: 'rounded-2xl',
          primaryColor: '#9999a1', // Medium gray
          secondaryColor: '#e6e6e9', // Light gray
        };
      case 'revenue':
        return {
          bgGradient: 'from-white to-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          accentColor: 'text-gray-700',
          chartBg: 'bg-gray-50/30',
          layout: 'standard',
          cardStyle: 'rounded-lg',
          primaryColor: '#000000', // Black
          secondaryColor: '#66666e', // Dark gray
        };
      default:
        return {
          bgGradient: 'from-white to-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          accentColor: 'text-gray-700',
          chartBg: 'bg-gray-50/30',
          layout: 'standard',
          cardStyle: 'rounded-lg',
          primaryColor: '#66666e',
          secondaryColor: '#9999a1',
        };
    }
  };

  const theme = getMetricTheme();

  return (
    <div className="yt-metric-card yt-fade-in yt-scale-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`${theme.layout === 'compact' ? 'p-1' : 'p-1.5'} rounded-md ${theme.iconBg} mr-2`}
          >
            {getMetricIcon()}
          </div>
          {metric.title}
        </div>
        {/* Change Indicator - Top Right */}
        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChangeColor()}`}
        >
          {getChangeIcon()}
          <span className="ml-1">{Math.abs(metric.change)}%</span>
        </div>
      </div>

      {/* Hero Chart Section */}
      {trendData && (
        <div
          className={`${theme.layout === 'compact' ? 'mb-3' : theme.layout === 'spacious' ? 'mb-5' : 'mb-4'} relative overflow-hidden`}
        >
          <div
            className={`${theme.layout === 'compact' ? 'h-16' : theme.layout === 'spacious' ? 'h-24' : 'h-20'} w-full ${theme.chartBg} rounded-lg p-2 border ${theme.borderColor} overflow-hidden`}
          >
            <div className="w-full h-full overflow-hidden">
              <MiniTrendChart
                data={trendData.data}
                type={trendData.chartType}
                color={trendData.color}
                height={
                  theme.layout === 'compact'
                    ? 48
                    : theme.layout === 'spacious'
                      ? 80
                      : 64
                }
              />
            </div>
          </div>
          {/* Chart overlay indicator */}
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 rounded-full bg-red-600"></div>
          </div>
        </div>
      )}

      {/* Main Value - Prominent Display */}
      <div className="text-center">
        <div className="text-3xl font-bold text-black mb-1">
          {formatValue(metric.value, metric.format)}
        </div>
        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
          {metric.title}
        </div>
      </div>

      {/* Progress Bar (if enabled) - Compact */}
      {showProgress && (
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-gray-600 to-black h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressValue, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Last Updated - Compact */}
      <div className="text-xs text-gray-400 text-center mt-3">Updated now</div>
    </div>
  );
}
