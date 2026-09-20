import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_MARKETS } from '../data/db';
import { TradeType } from '../types';
import { 
  Wallet, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Sliders,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export const PracticeView: React.FC<{ preselectedAsset?: string }> = ({ preselectedAsset }) => {
  const { user, wallet, updateVirtualCash, resetWallet, addXp } = useAuth();
  
  const [selectedSymbol, setSelectedSymbol] = useState(preselectedAsset || 'BTC');
  const [tradeType, setTradeType] = useState<TradeType>('BUY');
  const [amount, setAmount] = useState<string>('0.1');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // User simulated holdings in localStorage
  const [holdings, setHoldings] = useState<{ [symbol: string]: { quantity: number; avgPrice: number } }>({});
  const [trades, setTrades] = useState<any[]>([]);

  // Risk scenario simulation state
  const [shockScenario, setShockScenario] = useState<string>('none');

  const selectedAsset = INITIAL_MARKETS.find(m => m.symbol === selectedSymbol) || INITIAL_MARKETS[0];
  const cash = wallet?.virtual_cash ?? 100000.00;

  useEffect(() => {
    if (!user) return;
    const rawHoldings = localStorage.getItem(`cryptoverse_holdings_${user.id}`);
    if (rawHoldings) {
      setHoldings(JSON.parse(rawHoldings));
    }
    const rawTrades = localStorage.getItem(`cryptoverse_trades_${user.id}`);
    if (rawTrades) {
      setTrades(JSON.parse(rawTrades));
    }
  }, [user]);

  const saveHoldings = (newHoldings: any, newTrades: any) => {
    if (!user) return;
    setHoldings(newHoldings);
    setTrades(newTrades);
    localStorage.setItem(`cryptoverse_holdings_${user.id}`, JSON.stringify(newHoldings));
    localStorage.setItem(`cryptoverse_trades_${user.id}`, JSON.stringify(newTrades));
  };

  const parsedQty = parseFloat(amount) || 0;
  const totalCost = parsedQty * selectedAsset.price;

  const handleQuickPercent = (pct: number) => {
    if (tradeType === 'BUY') {
      const budget = cash * pct;
      const calcQty = budget / selectedAsset.price;
      setAmount(calcQty.toFixed(4));
    } else {
      const owned = holdings[selectedSymbol]?.quantity || 0;
      setAmount((owned * pct).toFixed(4));
    }
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (parsedQty <= 0) {
      setFeedback({ type: 'error', message: 'Please specify a valid quantity greater than zero.' });
      return;
    }

    if (tradeType === 'BUY') {
      if (totalCost > cash) {
        setFeedback({ 
          type: 'error', 
          message: `Insufficient virtual cash. Needed: $${totalCost.toFixed(2)}, Available: $${cash.toFixed(2)}` 
        });
        return;
      }

      // Execute buy
      const newCash = cash - totalCost;
      updateVirtualCash(newCash);

      const currentPosition = holdings[selectedSymbol] || { quantity: 0, avgPrice: 0 };
      const newQuantity = currentPosition.quantity + parsedQty;
      const newAvg = ((currentPosition.quantity * currentPosition.avgPrice) + totalCost) / newQuantity;

      const newHoldings = {
        ...holdings,
        [selectedSymbol]: { quantity: newQuantity, avgPrice: newAvg }
      };

      const newTrade = {
        id: Date.now(),
        symbol: selectedSymbol,
        type: 'BUY',
        quantity: parsedQty,
        price: selectedAsset.price,
        total: totalCost,
        date: new Date().toLocaleTimeString()
      };

      saveHoldings(newHoldings, [newTrade, ...trades]);
      addXp(30);
      setFeedback({ 
        type: 'success', 
        message: `Successfully bought ${parsedQty} ${selectedSymbol} for $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} virtual cash! +30 XP` 
      });

    } else {
      const currentPosition = holdings[selectedSymbol] || { quantity: 0, avgPrice: 0 };
      if (parsedQty > currentPosition.quantity) {
        setFeedback({ 
          type: 'error', 
          message: `Insufficient ${selectedSymbol} balance. You hold ${currentPosition.quantity.toFixed(4)}, tried to sell ${parsedQty}.` 
        });
        return;
      }

      // Execute sell
      const revenue = parsedQty * selectedAsset.price;
      const newCash = cash + revenue;
      updateVirtualCash(newCash);

      const remainingQty = currentPosition.quantity - parsedQty;
      const newHoldings = { ...holdings };
      if (remainingQty <= 0.0000001) {
        delete newHoldings[selectedSymbol];
      } else {
        newHoldings[selectedSymbol] = { quantity: remainingQty, avgPrice: currentPosition.avgPrice };
      }

      const newTrade = {
        id: Date.now(),
        symbol: selectedSymbol,
        type: 'SELL',
        quantity: parsedQty,
        price: selectedAsset.price,
        total: revenue,
        date: new Date().toLocaleTimeString()
      };

      saveHoldings(newHoldings, [newTrade, ...trades]);
      addXp(30);
      setFeedback({ 
        type: 'success', 
        message: `Successfully sold ${parsedQty} ${selectedSymbol} for $${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} virtual cash! +30 XP` 
      });
    }
  };

  // Calculate total portfolio value
  let totalInvestedValue = 0;
  Object.keys(holdings).forEach(sym => {
    const asset = INITIAL_MARKETS.find(m => m.symbol === sym);
    const price = asset ? asset.price : 0;
    totalInvestedValue += (holdings[sym].quantity * price);
  });
  const totalPortfolioValue = cash + totalInvestedValue;

  return (
    <div className="space-y-8 pb-16">
      {/* Simulation Banner */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">PAPER TRADING SIMULATOR ACTIVE</h4>
            <p className="text-[11px] text-slate-300">
              Zero risk. All transactions use simulated virtual capital. Practice position sizing and emotional discipline freely.
            </p>
          </div>
        </div>
        <button
          onClick={resetWallet}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition"
          title="Reset paper wallet to initial $100,000"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset $100k</span>
        </button>
      </div>

      {/* Portfolio Value Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#121722] p-5">
          <span className="text-[10px] uppercase font-mono text-slate-400">Total Portfolio Value</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">Cash + Live Asset Valuation</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121722] p-5">
          <span className="text-[10px] uppercase font-mono text-slate-400">Available Virtual Cash</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">Uncommitted Capital</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121722] p-5">
          <span className="text-[10px] uppercase font-mono text-slate-400">Invested Holdings</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            ${totalInvestedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">{Object.keys(holdings).length} Positions Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trade Ticket (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#121722] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Order Execution Ticket</h3>
            <span className="text-[10px] font-mono text-slate-400">MARKET ORDER</span>
          </div>

          {/* Action Selector: BUY / SELL */}
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/40 p-1">
            <button
              type="button"
              onClick={() => { setTradeType('BUY'); setFeedback(null); }}
              className={`rounded-md py-2 text-xs font-bold transition ${
                tradeType === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BUY (Long)
            </button>
            <button
              type="button"
              onClick={() => { setTradeType('SELL'); setFeedback(null); }}
              className={`rounded-md py-2 text-xs font-bold transition ${
                tradeType === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SELL
            </button>
          </div>

          {/* Asset Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Asset</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {INITIAL_MARKETS.map((m) => (
                <option key={m.symbol} value={m.symbol}>
                  {m.name} ({m.symbol}) — ${m.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">Amount ({selectedSymbol})</span>
              <span className="font-mono text-slate-500">
                Holding: {(holdings[selectedSymbol]?.quantity || 0).toFixed(4)}
              </span>
            </div>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 py-2 px-3 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Quick Slider Percentages */}
          <div className="grid grid-cols-4 gap-2">
            {[0.25, 0.50, 0.75, 1.0].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="rounded border border-white/10 bg-white/5 py-1 text-[11px] font-mono font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                {pct * 100}%
              </button>
            ))}
          </div>

          {/* Total & Feedback */}
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Unit Spot Price:</span>
              <span>${selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-200 font-bold border-t border-white/5 pt-1">
              <span>Estimated Total Value:</span>
              <span className={tradeType === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {feedback && (
            <div className={`rounded-lg border px-3 py-2 text-xs ${
              feedback.type === 'success' 
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}>
              {feedback.message}
            </div>
          )}

          <button
            type="button"
            onClick={handleExecuteTrade}
            className={`w-full rounded-lg py-3 text-xs font-bold text-white shadow-lg transition ${
              tradeType === 'BUY' 
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' 
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
            }`}
          >
            Execute Virtual {tradeType} ({selectedSymbol})
          </button>
        </div>

        {/* Right Column: Holdings & Risk Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Holdings Table */}
          <div className="rounded-xl border border-white/10 bg-[#121722] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Active Paper Holdings</h3>
              <span className="text-xs font-mono text-slate-400">{Object.keys(holdings).length} Assets Held</span>
            </div>

            {Object.keys(holdings).length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">
                No active asset positions yet. Execute your first virtual paper trade using the ticket on the left!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-white/10 text-[10px] uppercase text-slate-400">
                    <tr>
                      <th className="pb-2">Asset</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">Avg Buy</th>
                      <th className="pb-2">Current Value</th>
                      <th className="pb-2 text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {Object.keys(holdings).map((sym) => {
                      const pos = holdings[sym];
                      const asset = INITIAL_MARKETS.find(m => m.symbol === sym);
                      const curPrice = asset ? asset.price : pos.avgPrice;
                      const curVal = pos.quantity * curPrice;
                      const costBasis = pos.quantity * pos.avgPrice;
                      const pnlDollar = curVal - costBasis;
                      const pnlPct = costBasis > 0 ? (pnlDollar / costBasis) * 100 : 0;

                      return (
                        <tr key={sym}>
                          <td className="py-3 font-bold text-white font-sans">{sym}</td>
                          <td className="py-3 text-slate-300">{pos.quantity.toFixed(4)}</td>
                          <td className="py-3 text-slate-400">${pos.avgPrice.toFixed(2)}</td>
                          <td className="py-3 font-bold text-white">${curVal.toFixed(2)}</td>
                          <td className={`py-3 text-right font-bold ${pnlDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {pnlDollar >= 0 ? '+' : ''}${pnlDollar.toFixed(2)} ({pnlPct.toFixed(1)}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* EDUCATIONAL RISK SIMULATOR SECTION */}
          <div className="rounded-xl border border-white/10 bg-[#121722] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Educational Risk Simulator (Stress-Test)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Test how your virtual portfolio would react if market shocks occur overnight.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShockScenario('btc-down-10')}
                className={`rounded-lg border p-2 text-left text-xs transition ${
                  shockScenario === 'btc-down-10' 
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300' 
                    : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold">BTC Drops -10%</div>
                <div className="text-[10px] text-slate-500">Standard dip</div>
              </button>

              <button
                type="button"
                onClick={() => setShockScenario('market-crash-25')}
                className={`rounded-lg border p-2 text-left text-xs transition ${
                  shockScenario === 'market-crash-25' 
                    ? 'border-rose-500 bg-rose-500/10 text-rose-300' 
                    : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold">Market Flash -25%</div>
                <div className="text-[10px] text-slate-500">Broad sell-off</div>
              </button>

              <button
                type="button"
                onClick={() => setShockScenario('recovery-15')}
                className={`rounded-lg border p-2 text-left text-xs transition ${
                  shockScenario === 'recovery-15' 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' 
                    : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold">Surge +15%</div>
                <div className="text-[10px] text-slate-500">Bullish expansion</div>
              </button>
            </div>

            {shockScenario !== 'none' && (
              <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-2 text-xs">
                <div className="font-bold text-white">Scenario Simulation Outcome:</div>
                <p className="text-slate-300">
                  Because you keep <strong className="text-emerald-400 font-mono">${cash.toFixed(2)}</strong> in cash, your uninvested funds remain 100% protected.
                  {shockScenario === 'market-crash-25' && (
                    <span className="block mt-1 text-rose-300">
                      Your invested positions would decrease by approximately ${(totalInvestedValue * 0.25).toFixed(2)}, lowering your overall portfolio value by {((totalInvestedValue * 0.25) / totalPortfolioValue * 100).toFixed(1)}%.
                    </span>
                  )}
                  {shockScenario === 'btc-down-10' && (
                    <span className="block mt-1 text-amber-300">
                      A 10% Bitcoin correction demonstrates why position sizing prevents catastrophic account drawdowns.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
