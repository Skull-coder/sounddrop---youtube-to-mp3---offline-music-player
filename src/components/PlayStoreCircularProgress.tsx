import React from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

interface PlayStoreCircularProgressProps {
  percent: number;
  status: 'waiting' | 'downloading' | 'converting' | 'saving' | 'completed' | 'error';
  size?: number;
  strokeWidth?: number;
  onCancel?: () => void;
}

export const PlayStoreCircularProgress: React.FC<PlayStoreCircularProgressProps> = ({
  percent,
  status,
  size = 48,
  strokeWidth = 3.5,
  onCancel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center shrink-0 group select-none"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
      >
        {/* Track Circle (Light Grey) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />

        {/* Progress Stroke (Google Play Store Blue / Emerald when done) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={
            status === 'completed'
              ? '#10B981'
              : status === 'error'
              ? '#EF4444'
              : '#2563EB'
          }
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {status === 'completed' ? (
          <Check className="w-5 h-5 text-emerald-600 animate-in zoom-in-75 duration-200 stroke-[2.5]" />
        ) : status === 'error' ? (
          <AlertCircle className="w-5 h-5 text-rose-500 animate-in zoom-in-75 duration-200" />
        ) : status === 'waiting' ? (
          <span className="text-[10px] font-bold text-slate-400 font-mono">WAIT</span>
        ) : (
          <div className="flex items-center justify-center">
            {/* Show percentage, or on hover show Cancel X if onCancel is provided */}
            <span className="text-[11px] font-extrabold text-slate-800 font-mono tabular-nums leading-none">
              {Math.round(clampedPercent)}%
            </span>
          </div>
        )}
      </div>

      {/* Optional Cancel Overlay Button on active downloads */}
      {onCancel && (status === 'downloading' || status === 'waiting') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[9px] transition opacity-0 group-hover:opacity-100"
          title="Cancel download"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
};
