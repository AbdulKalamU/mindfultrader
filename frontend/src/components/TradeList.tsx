import React, { useState } from 'react';
import type { Trade, Mood } from '../types';

interface TradeListProps {
  trades: Trade[];
  onFilterChange?: (filter: { mood?: Mood; asset?: string }) => void;
}

const MOODS: Mood[] = ['Calm', 'Anxious', 'Greedy', 'Disciplined', 'Fearful'];

export const TradeList: React.FC<TradeListProps> = ({ trades, onFilterChange }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | ''>('');
  const [selectedAsset, setSelectedAsset] = useState('');

  // Get unique assets from trades
  const uniqueAssets = Array.from(new Set(trades.map((t) => t.asset)));

  const handleMoodChange = (mood: Mood | '') => {
    setSelectedMood(mood);
    onFilterChange?.({
      mood: mood || undefined,
      asset: selectedAsset || undefined,
    });
  };

  const handleAssetChange = (asset: string) => {
    setSelectedAsset(asset);
    onFilterChange?.({
      mood: selectedMood || undefined,
      asset: asset || undefined,
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Trades</h2>
        <span className="text-sm text-gray-500">{trades.length} trades</span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="moodFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Mood
          </label>
          <select
            id="moodFilter"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
            value={selectedMood}
            onChange={(e) => handleMoodChange(e.target.value as Mood | '')}
          >
            <option value="">All Moods</option>
            {MOODS.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assetFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Asset
          </label>
          <select
            id="assetFilter"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
            value={selectedAsset}
            onChange={(e) => handleAssetChange(e.target.value)}
          >
            <option value="">All Assets</option>
            {uniqueAssets.map((asset) => (
              <option key={asset} value={asset}>
                {asset}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trade List */}
      {trades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No trades found. Log your first trade above!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P/L
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mood
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {trade.asset}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.tradeType === 'long'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {trade.tradeType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {trade.entryPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {trade.exitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                    <span
                      className={
                        trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {trade.profitLoss >= 0 ? '+' : ''}
                      {trade.profitLoss.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {trade.mood}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(trade.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
