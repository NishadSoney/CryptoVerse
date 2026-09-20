import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExperienceLevel } from '../types';
import { User, Settings, Shield, RefreshCw, Check, AlertCircle } from 'lucide-react';

export const SettingsView: React.FC<{ onOpenDbViewer: () => void }> = ({ onOpenDbViewer }) => {
  const { user, wallet, resetWallet } = useAuth();
  const [level, setLevel] = useState<ExperienceLevel>(user?.experience_level || 'BEGINNER');
  const [saved, setSaved] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your simulated paper trading wallet back to $100,000.00 virtual cash? All simulated positions will be cleared.')) {
      resetWallet();
      setResetNotice(true);
      setTimeout(() => setResetNotice(false), 2500);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Account & Preferences</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your student profile, knowledge tier personalization, and simulation data.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-white/10 bg-[#121722] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <User className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Student Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || 'Demo Student'}
              className="w-full rounded-lg border border-white/10 bg-black/30 py-2 px-3 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Username</label>
            <input
              type="text"
              readOnly
              value={`@${user?.username || 'cryptostudent'}`}
              className="w-full rounded-lg border border-white/10 bg-black/30 py-2 px-3 text-slate-200 font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1">Email Address</label>
            <input
              type="text"
              readOnly
              value={user?.email || 'student@cryptoverse.edu'}
              className="w-full rounded-lg border border-white/10 bg-black/30 py-2 px-3 text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Curriculum Experience Tier */}
      <form onSubmit={handleSavePreferences} className="rounded-xl border border-white/10 bg-[#121722] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Settings className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Knowledge Level Customization</h3>
        </div>

        <p className="text-xs text-slate-400">
          Tailor explanations and default chart views according to your prior cryptocurrency experience:
        </p>

        <div className="grid grid-cols-3 gap-3">
          {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ExperienceLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevel(lvl)}
              className={`rounded-lg border p-3 text-center text-xs font-semibold transition ${
                level === lvl
                  ? 'border-blue-500 bg-blue-500/15 text-blue-300 shadow-sm'
                  : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold">{lvl.charAt(0) + lvl.slice(1).toLowerCase()}</div>
              <div className="text-[10px] text-slate-500 mt-1">
                {lvl === 'BEGINNER' ? 'Analogies & Simple Curves' : lvl === 'INTERMEDIATE' ? 'Price & Market Cap' : 'Full OHLC & Technicals'}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/20"
          >
            Save Preferences
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <Check className="h-4 w-4" /> Preferences Saved
            </span>
          )}
        </div>
      </form>

      {/* Simulation Reset & Database Section */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-400" />
          <h3 className="text-sm font-bold text-white">Paper Trading Simulation Management</h3>
        </div>

        <p className="text-xs text-slate-300">
          Want to start fresh? Resetting will restore your virtual cash balance to exactly <strong className="text-white font-mono">$100,000.00</strong> and clear all active paper holdings.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-600/20 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-600/30 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Virtual Balance to $100,000.00</span>
          </button>

          <button
            type="button"
            onClick={onOpenDbViewer}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
          >
            Inspect MySQL DDL & Tables
          </button>
        </div>

        {resetNotice && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            ✓ Paper trading balance successfully reset to $100,000.00 virtual cash!
          </div>
        )}
      </div>
    </div>
  );
};
