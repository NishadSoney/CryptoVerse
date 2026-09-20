/**
 * CryptoVerse - Cinematic 3D Landing Page & Scrollway
 * Location: src/views/LandingView.tsx
 */

import React, { useRef } from 'react';
import { ThreeCanvasStory } from '../components/ThreeCanvasStory';
import { 
  ArrowRight, 
  BookOpen, 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  Lock,
  Layers,
  HelpCircle
} from 'lucide-react';

interface LandingViewProps {
  onStartLearning: () => void;
  onExploreMarkets: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning, onExploreMarkets }) => {
  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative">
      {/* 3D WebGL Fixed Stage */}
      <ThreeCanvasStory scrollContainerRef={scrollWrapperRef} />

      {/* Scrollable Story Layers */}
      <div ref={scrollWrapperRef} className="relative z-10 space-y-32 pb-32">
        
        {/* CHAPTER 0: HERO VIEWPORT */}
        <section className="min-h-[88vh] flex flex-col items-center justify-center text-center px-4 pt-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>EDUCATIONAL CRYPTOCURRENCY PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
            Understand Crypto.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Practice Without the Risk.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto mt-6 leading-relaxed">
            Master cryptocurrency from ground-level foundations, analyze real market mechanics, and build paper trading confidence with <strong>$100,000 in virtual simulation funds</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto">
            <button
              id="btn-landing-start-learning"
              onClick={onStartLearning}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              <span>START LEARNING</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              id="btn-landing-explore-markets"
              onClick={onExploreMarkets}
              className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition backdrop-blur-sm"
            >
              EXPLORE CRYPTO
            </button>
          </div>

          <div className="flex items-center gap-6 mt-8 text-xs font-mono text-slate-400">
            <span>✓ No Real Money</span>
            <span>✓ $100k Virtual Balance</span>
            <span>✓ Interactive 3D Canvas</span>
          </div>

          <div className="mt-12 flex flex-col items-center gap-1 text-[11px] font-mono text-slate-500 animate-bounce">
            <span>Scroll down to travel through the 3D crypto universe</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </section>

        {/* STAGE 01: CRYPTO BASICS */}
        <section className="min-h-[70vh] flex items-center max-w-xl">
          <div className="rounded-2xl border border-white/10 bg-[#121722]/85 p-8 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400">STAGE 01 / 05</span>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-300">CLICK 3D COIN</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Start with the basics.</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Before charts or trading terminology, understand the foundational breakthrough of cryptocurrency: creating provable digital scarcity and self-sovereign value transfer without centralized gatekeepers.
            </p>
            <div className="pt-2 text-xs font-medium text-blue-300 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span>Click the rotating 3D cryptocurrency object to inspect its cryptographic properties.</span>
            </div>
          </div>
        </section>

        {/* STAGE 02: BLOCKCHAIN */}
        <section className="min-h-[70vh] flex items-center justify-end">
          <div className="max-w-xl rounded-2xl border border-white/10 bg-[#121722]/85 p-8 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">STAGE 02 / 05</span>
              <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300">BLOCKCHAIN NODES</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Everything starts with a blockchain.</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A blockchain is an append-only distributed ledger. Verified transactions are grouped into cryptographically secured blocks linked by cryptographic hashes. Tampering with any historical block invalidates the entire chain.
            </p>
            <div className="pt-2 text-xs font-medium text-cyan-300 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span>Click any 3D block to explore how transactions are permanently bundled into consensus blocks.</span>
            </div>
          </div>
        </section>

        {/* STAGE 03: TRANSACTION FLOW */}
        <section className="min-h-[70vh] flex items-center max-w-xl">
          <div className="rounded-2xl border border-white/10 bg-[#121722]/85 p-8 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400">STAGE 03 / 05</span>
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-300">WALLET A → WALLET B</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Peer-to-peer transaction flow.</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Wallet A initiates a transfer and signs it with a private key. The decentralized network validates the cryptographic proof, packages it into a block, and updates Wallet B's balance.
            </p>
            <div className="pt-2 text-xs font-medium text-indigo-300 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span>Scroll up and down to observe the glowing value packet move across the peer-to-peer path!</span>
            </div>
          </div>
        </section>

        {/* STAGE 04: MARKET DISCOVERY */}
        <section className="min-h-[70vh] flex items-center justify-end">
          <div className="max-w-xl rounded-2xl border border-white/10 bg-[#121722]/85 p-8 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">STAGE 04 / 05</span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">CANDLESTICK MATRIX</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Now explore the market.</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Candlesticks summarize Open, High, Low, and Close price action. Green candles denote buying pressure; red candles show selling pressure. Learn to read market trends rationally instead of gambling.
            </p>
            <div className="pt-2 text-xs font-medium text-emerald-300 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span>Click the 3D candlesticks to discover what price volatility and volume metrics truly represent.</span>
            </div>
          </div>
        </section>

        {/* STAGE 05: PAPER TRADING FINALE */}
        <section className="min-h-[70vh] flex items-center justify-center text-center">
          <div className="max-w-2xl rounded-2xl border border-amber-500/30 bg-[#121722]/90 p-8 sm:p-12 backdrop-blur-md shadow-2xl space-y-5">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              STAGE 05 / 05 — SIMULATION DESK
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Practice without risking real money.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              Every student account receives <strong className="text-emerald-400 font-mono font-bold">$100,000 in virtual paper funds</strong>. Practice order sizing, simulate market flash crashes, and build real discipline before touching real markets.
            </p>
            <button
              onClick={onStartLearning}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              <span>CLAIM $100K VIRTUAL WALLET</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* SECTION 3: WHY CRYPTOVERSE PILLARS */}
        <section className="rounded-2xl border border-white/10 bg-[#121722] p-8 space-y-8">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white">Why CryptoVerse?</h2>
            <p className="text-xs text-slate-400 mt-1">Built to teach clarity instead of casino hype.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/5 bg-black/30 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">LEARN FIRST</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every complex term is translated into plain English, real-world analogies, and technical protocol details. Take scenario quizzes to earn XP.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/30 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">EXPLORE MARKETS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track valuations without cognitive overload. Beginners view gentle price curves, while advanced learners can toggle full candlesticks and RSI.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/30 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">PRACTICE SAFELY</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive $100,000 in virtual paper capital. Execute simulated orders, track profit/loss, and test portfolio resilience with our Risk Simulator.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: SECURITY CENTER SPOTLIGHT */}
        <section className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Security Center: Learn How to Protect Yourself</h2>
              <p className="text-xs text-slate-300">The most important crypto skill is keeping your assets safe.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { title: 'Seed Phrase Theft', tip: 'Never type your 12 or 24 words on any website or share it with anyone.' },
              { title: 'Phishing URLs', tip: 'Always bookmark official exchanges and verify domain spellings.' },
              { title: 'Fake Giveaways', tip: 'No legitimate project will ever ask you to send crypto to receive double.' },
              { title: 'Malicious Approvals', tip: 'Review smart contract permissions before signing transactions on dApps.' }
            ].map((sec) => (
              <div key={sec.title} className="rounded-lg border border-white/5 bg-black/40 p-4">
                <h4 className="font-bold text-rose-300">{sec.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{sec.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-black p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to enter the CryptoVerse?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Start your guided education now. Create your student account to unlock the 15-lesson curriculum and your $100,000 virtual balance.
          </p>
          <button
            onClick={onStartLearning}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition"
          >
            <span>START LEARNING NOW</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

      </div>
    </div>
  );
};
