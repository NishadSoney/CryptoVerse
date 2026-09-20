import React, { useState } from 'react';
import { X, Database, Table, Check, Copy, FileText, CheckCircle2 } from 'lucide-react';
import { INITIAL_LESSONS, INITIAL_MARKETS, INITIAL_ACHIEVEMENTS } from '../data/db';

interface DatabaseViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseViewerModal: React.FC<DatabaseViewerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'sql' | 'seeds'>('tables');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tables = [
    { name: 'users', count: '1 registered (Demo Student)', desc: 'Credentials, hashed password, student experience tier' },
    { name: 'user_profiles', count: '1 profile', desc: 'XP points, level tracking, streak days, preferences' },
    { name: 'wallets', count: '1 wallet ($100,000.00)', desc: 'Virtual paper trading balance, simulation-only' },
    { name: 'wallet_assets', count: '0 holdings (ready)', desc: 'Simulated holdings per asset symbol with average buy price' },
    { name: 'trades', count: '0 ledger entries', desc: 'Atomic BUY/SELL paper execution ledger records' },
    { name: 'courses', count: '1 master course', desc: 'Root curriculum metadata and badges' },
    { name: 'modules', count: '5 modules', desc: 'Foundations, Markets, Analysis, Risk, and Advanced DeFi' },
    { name: 'lessons', count: `${INITIAL_LESSONS.length} seeded lessons`, desc: 'Step-by-step curriculum with analogies & technical details' },
    { name: 'quizzes', count: '5 module quizzes', desc: 'Scenario assessments with XP awards' },
    { name: 'quiz_questions', count: '15 questions', desc: 'Multiple-choice and true/false questions' },
    { name: 'glossary_terms', count: '6 initial terms', desc: 'Searchable plain-English crypto dictionary' },
    { name: 'achievements', count: `${INITIAL_ACHIEVEMENTS.length} badges`, desc: 'Gamification badge criteria and XP milestones' }
  ];

  const handleCopySqlPath = () => {
    navigator.clipboard.writeText('mysql -u root -p < database/schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#0F141F] shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">MySQL Database Architecture (Phase 2)</h3>
              <p className="text-[11px] text-slate-400">Database: <code className="text-emerald-400 font-mono">cryptoverse</code> | Charset: utf8mb4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 bg-black/30 px-6">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'tables' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Database Tables (12)</span>
          </button>
          <button
            onClick={() => setActiveTab('seeds')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'seeds' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Curriculum Seed Data</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'sql' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>WAMP Execution Command</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'tables' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tables.map((t) => (
                <div key={t.name} className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5 hover:border-emerald-500/30 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-400">{t.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">{t.count}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'seeds' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-300">
                The database schema automatically loads all required educational lessons into the <code className="text-emerald-400">lessons</code> table:
              </div>
              <div className="space-y-2">
                {INITIAL_LESSONS.map((l) => (
                  <div key={l.id} className="rounded-lg border border-white/10 bg-black/40 p-3 flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
                      {l.sort_order}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{l.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{l.summary}</div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                        <span>XP: +{l.xp_reward}</span>
                        <span>Est: {l.estimated_minutes} mins</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-black/50 p-4 font-mono text-xs text-slate-300">
                <div className="text-slate-500 mb-2">// In Windows Command Prompt with WAMP running:</div>
                <div className="text-emerald-400 select-all font-bold">
                  cd C:\wamp64\www\cryptoverse<br />
                  mysql -u root -p &lt; database/schema.sql
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>File Location: <strong>/database/schema.sql</strong> (292 lines of complete DDL & Seed records)</span>
                </div>
                <button
                  onClick={handleCopySqlPath}
                  className="flex items-center gap-1 rounded bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied' : 'Copy Import Command'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-black/40 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-md bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
