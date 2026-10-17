import React from 'react';
import { ArrowDownCircle, Music } from 'lucide-react';

interface SegmentedTabsProps {
  activeTab: 'convert' | 'library';
  onChangeTab: (tab: 'convert' | 'library') => void;
  trackCount: number;
  activeQueueCount: number;
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  activeTab,
  onChangeTab,
  trackCount,
  activeQueueCount,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 mt-3">
      <div className="grid grid-cols-2 p-1 bg-slate-200/70 border border-slate-200 rounded-2xl">
        <button
          onClick={() => onChangeTab('convert')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'convert'
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>Convert Video</span>
          {activeQueueCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => onChangeTab('library')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'library'
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>My Music</span>
          {trackCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                activeTab === 'library'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-300/80 text-slate-700'
              }`}
            >
              {trackCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
