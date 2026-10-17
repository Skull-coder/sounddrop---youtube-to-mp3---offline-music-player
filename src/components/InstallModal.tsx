import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const easCommand = 'npx eas-cli build -p android --profile preview';

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(easCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleDownloadExpoZip = () => {
    setIsExporting(true);
    const a = document.createElement('a');
    a.href = '/api/export-expo';
    a.download = 'sounddrop-expo-apk-project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Install on Android Phone</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600">
          {/* Method 1: Instant PWA Install */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Method 1: Direct Install (Instant)
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Installs directly onto your Android device home screen. Runs in full-screen standalone mode and keeps your music offline.
            </p>

            {isInstalled ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>SoundDrop is already installed on your home screen!</span>
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={install}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-sm shadow-blue-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Install App to Home Screen</span>
              </button>
            ) : isIOS ? (
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-slate-700">
                <p className="font-bold text-slate-900">To install on iPhone / iPad:</p>
                <p>1. Tap the <strong>Share</strong> button in Safari toolbar.</p>
                <p>2. Tap <strong>Add to Home Screen</strong>.</p>
              </div>
            ) : (
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-slate-700">
                <p className="font-bold text-slate-900">Install via Chrome / Android:</p>
                <p>Tap your browser&apos;s menu (<strong className="text-slate-900">⋮</strong>) and select <strong className="text-blue-600">Install app</strong> or <strong className="text-blue-600">Add to Home screen</strong>.</p>
              </div>
            )}
          </div>

          {/* Method 2: Standalone Expo APK Package */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Method 2: Standalone .APK Build Source
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Expo EAS</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Download the complete pre-configured Expo TypeScript project bundle. Run one command to compile a standalone <code className="text-blue-700 font-mono">.apk</code> binary via Expo cloud.
            </p>

            <button
              type="button"
              onClick={handleDownloadExpoZip}
              disabled={isExporting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
            >
              <Package className="w-4 h-4" />
              <span>{isExporting ? 'Downloading Zip...' : 'Download Expo APK Project (.zip)'}</span>
            </button>

            {/* Build Command Box */}
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>EAS Build Command:</span>
                <button
                  type="button"
                  onClick={handleCopyCommand}
                  className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <code className="block p-1.5 bg-slate-100 rounded font-mono text-[11px] text-slate-800 break-all select-all">
                {easCommand}
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
