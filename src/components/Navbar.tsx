import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  BookOpen, 
  TrendingUp, 
  Wallet, 
  Award, 
  Settings, 
  LogOut, 
  LogIn, 
  Sparkles,
  Database,
  Flame
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenDbViewer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenDbViewer
}) => {
  const { user, profile, wallet, isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'HOME', icon: Compass },
    { id: 'learn', label: 'LEARN', icon: BookOpen },
    { id: 'markets', label: 'MARKETS', icon: TrendingUp },
    { id: 'practice', label: 'PRACTICE', icon: Wallet },
    { id: 'progress', label: 'PROGRESS', icon: Award },
    { id: 'settings', label: 'SETTINGS', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0D14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">CRYPTO<span className="text-blue-400">VERSE</span></span>
            <span className="hidden ml-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-blue-300 md:inline-block">
              EDUCATION + SIMULATION
            </span>
          </div>
        </div>

        {/* 6 Core Navigation Pillars */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* DB Schema Inspector Button for Phase 2 Verification */}
          <button
            id="btn-inspect-database"
            onClick={onOpenDbViewer}
            title="Inspect MySQL Tables & Schema"
            className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <Database className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">MySQL Schema</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Virtual Cash Balance Indicator */}
              <div 
                onClick={() => onSelectTab('practice')}
                title="Your $100k Virtual Paper Trading Balance (Simulation Only)"
                className="cursor-pointer hidden lg:flex flex-col text-right border-r border-white/10 pr-3"
              >
                <span className="text-[10px] uppercase font-mono text-slate-400">Virtual Cash</span>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  ${(wallet?.virtual_cash ?? 100000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Streak Badge */}
              <div className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
                <Flame className="h-3.5 w-3.5 fill-amber-400" />
                <span>{profile?.streak_days ?? 1}d</span>
              </div>

              {/* User Pill */}
              <div 
                onClick={() => onSelectTab('settings')}
                className="flex items-center gap-2 cursor-pointer rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:border-white/20 transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-medium text-slate-200">{user?.name}</div>
                  <div className="text-[9px] uppercase font-mono text-blue-400">{user?.experience_level}</div>
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={logout}
                title="Log Out"
                className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-rose-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-nav-login"
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>
              <button
                id="btn-nav-signup"
                onClick={() => onOpenAuth('signup')}
                className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-500 transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="flex md:hidden border-t border-white/5 bg-[#0A0D14] px-2 py-1.5 overflow-x-auto justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium ${
                isActive ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
