import React from 'react';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import type { Analytics } from '../types';

interface AnalyticsPanelProps {
  analytics: Analytics;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ analytics }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Profit/Loss Stats */}
      {(analytics.avgProfit !== undefined || analytics.avgLoss !== undefined) && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Profit/Loss Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.avgProfit !== undefined && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Avg Profit</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(analytics.avgProfit)}
                </p>
              </div>
            )}
            {analytics.avgLoss !== undefined && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Avg Loss</span>
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(analytics.avgLoss)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Streak Information */}
      {(analytics.currentStreak || analytics.longestWinStreak !== undefined || analytics.longestLossStreak !== undefined) && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Streaks
          </h3>
          <div className="space-y-4">
            {analytics.currentStreak && (
              <div className={`p-4 rounded-lg border ${
                analytics.currentStreak.type === 'win'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Current Streak</p>
                    <p className={`text-xl font-bold ${
                      analytics.currentStreak.type === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {analytics.currentStreak.count} {analytics.currentStreak.type === 'win' ? 'Wins' : 'Losses'}
                    </p>
                  </div>
                  {analytics.currentStreak.type === 'win' ? (
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {analytics.longestWinStreak !== undefined && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Longest Win Streak</p>
                  <p className="text-lg font-bold text-green-400">{analytics.longestWinStreak}</p>
                </div>
              )}
              {analytics.longestLossStreak !== undefined && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Longest Loss Streak</p>
                  <p className="text-lg font-bold text-red-400">{analytics.longestLossStreak}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Win Rate by Asset */}
      {analytics.winRateByAsset && analytics.winRateByAsset.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Win Rate by Asset
          </h3>
          <div className="space-y-3">
            {analytics.winRateByAsset.map((asset, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{asset.asset}</span>
                  <span className={`text-sm font-bold ${
                    asset.winRate >= 60 ? 'text-green-400' :
                    asset.winRate >= 40 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {asset.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      asset.winRate >= 60 ? 'bg-green-400' :
                      asset.winRate >= 40 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${asset.winRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{asset.tradeCount} trades</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
