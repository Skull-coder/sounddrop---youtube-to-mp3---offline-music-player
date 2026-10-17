import React from 'react';
import { Smartphone, Loader2 } from 'lucide-react';

interface TopBarProps {
  onOpenInstallModal: () => void;
  trackCount: number;
  activeQueueCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenInstallModal,
  activeQueueCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
            <span className="text-white font-black text-sm tracking-tighter">SD</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
              Sound<span className="text-blue-600">Drop</span>
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">YouTube to MP3</span>
          </div>
        </div>

        {/* Action Zone: Live Queue Indicator + Install APK */}
        <div className="flex items-center gap-2">
          {activeQueueCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[11px] font-bold">
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              <span>{activeQueueCount} Downloading</span>
            </div>
          )}

          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/90 rounded-xl text-xs font-semibold transition active:scale-95"
            title="Install as Android App or get APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Install / APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};
