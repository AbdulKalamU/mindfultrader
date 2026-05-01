import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tradeApi, insightsApi } from '../services/api';
import { MarketHeader } from './MarketHeader';
import { MarketChart } from './MarketChart';
import { TradeForm } from './TradeForm';
import { TradeList } from './TradeList';
import { MetricsSummary } from './MetricsSummary';
import { MoodPerformanceChart } from './MoodPerformanceChart';
import { InsightsPanel } from './InsightsPanel';
import { AlertsPanel } from './AlertsPanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { LogOut, User, Wallet, ChevronDown } from 'lucide-react';
import type { Trade, Insight } from '../types';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState('BTCUSDT');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [tradeCount, setTradeCount] = useState(0);
  const [hasMinimumData, setHasMinimumData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch trades
      const tradesResponse = await tradeApi.getTrades({ limit: 50 });
      setTrades(tradesResponse.trades);

      // Fetch insights
      const insightsResponse = await insightsApi.getInsights();
      setInsights(insightsResponse.insights);
      setTradeCount(insightsResponse.tradeCount);
      setHasMinimumData(insightsResponse.hasMinimumData);
    } catch (err: any) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTradeCreated = (trade: Trade) => {
    // Add new trade to the beginning of the list
    setTrades([trade, ...trades]);
    // Refresh insights
    fetchDashboardData();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                MindfulTrader
              </h1>
              <p className="text-sm text-gray-400">AI-Powered Trading Psychology</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Wallet Link */}
              <a
                href="/wallet"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <Wallet className="w-4 h-4" />
                <span>Wallet</span>
              </a>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.email}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                    <a
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-300 hover:bg-slate-700 transition-colors rounded-t-lg"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </a>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-gray-300 hover:bg-slate-700 transition-colors rounded-b-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Market Header - Live Price */}
      <MarketHeader selectedAsset={selectedAsset} onAssetChange={setSelectedAsset} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Market Chart Section */}
        <MarketChart selectedAsset={selectedAsset} />

        {/* Divider */}
        <div className="border-t border-slate-700 my-8"></div>

        {/* User Trading Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Your Trading Activity</h2>
          <p className="text-gray-400">Track your trades and analyze your psychological patterns</p>
        </div>

        {/* Metrics Summary */}
        <MetricsSummary trades={trades} />

        {/* Alerts and Recommendations */}
        {insights.length > 0 && insights[0] && (
          <AlertsPanel
            warnings={insights[0].warnings || []}
            recommendations={insights[0].recommendations || []}
          />
        )}

        {/* Two Column Layout: Trade Form + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trade Form */}
          <TradeForm onTradeCreated={handleTradeCreated} />

          {/* Insights */}
          <InsightsPanel
            insights={insights}
            tradeCount={tradeCount}
            hasMinimumData={hasMinimumData}
          />
        </div>

        {/* Analytics Panel */}
        {insights.length > 0 && insights[0]?.analytics && (
          <AnalyticsPanel analytics={insights[0].analytics} />
        )}

        {/* Mood Performance Chart */}
        <MoodPerformanceChart trades={trades} />

        {/* Trade List */}
        <TradeList trades={trades} />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 MindfulTrader. Empowering traders through psychological awareness.
          </p>
        </div>
      </footer>
    </div>
  );
};
