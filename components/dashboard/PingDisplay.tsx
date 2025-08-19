'use client';

import { PingMetrics } from './definitions';

interface PingDisplayProps {
  ping?: PingMetrics;
  showLabel?: boolean;
  compact?: boolean;
}

/**
 * PingDisplay - Shows connection latency with color-coded status
 */
export default function PingDisplay({
  ping,
  showLabel = true,
  compact = false,
}: PingDisplayProps) {
  if (!ping) {
    return (
      <div className={`flex items-center gap-1 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="w-2 h-2 rounded-full bg-gray-400" />
        {showLabel && (
          <span className="text-gray-500 font-mono">
            --ms
          </span>
        )}
      </div>
    );
  }

  const getStatusColor = (status: PingMetrics['status']) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-orange-500';
      case 'timeout':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: PingMetrics['status']) => {
    switch (status) {
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      case 'timeout':
        return 'Timeout';
      default:
        return 'Unknown';
    }
  };

  const latencyText = ping.latency < 0 ? 'timeout' : `${ping.latency}ms`;

  return (
    <div
      className={`flex items-center gap-1 ${compact ? 'text-xs' : 'text-sm'}`}
      title={`Ping: ${latencyText} - ${getStatusText(ping.status)}\nLast ping: ${ping.lastPing.toLocaleTimeString()}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${getStatusColor(ping.status)} ${
          ping.status === 'good' ? 'animate-pulse' : ''
        }`}
      />
      {showLabel && (
        <span className="text-gray-100 font-mono" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {latencyText}
        </span>
      )}
    </div>
  );
}