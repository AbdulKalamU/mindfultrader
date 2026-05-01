import React from 'react';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import type { Trade } from '../types';

interface MetricsSummaryProps {
  trades: Trade[];
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ trades }) => {
  const totalProfitLoss = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const tradeCount = trades.length;
  const winningTrades = trades.filter((t) => t.profitLoss > 0).length;
  const winRate = tradeCount > 0 ? (winningTrades / tradeCount) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total P/L Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 p-6 shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400 mb-2">Total Profit/Loss</p>
            <p
              className={`text-3xl font-bold transition-colors ${
                totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Across all trades</p>
          </div>
          <div
            className={`p-4 rounded-xl ${
              totalProfitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
          >
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-400" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Total Trades Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 p-6 shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400 mb-2">Total Trades</p>
            <p className="text-3xl font-bold text-gray-100">{tradeCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              {winningTrades} wins, {tradeCount - winningTrades} losses
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/20">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Win Rate Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 p-6 shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400 mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-gray-100">{winRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              Success rate
            </p>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/20">
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
