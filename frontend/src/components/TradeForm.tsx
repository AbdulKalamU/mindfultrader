import React, { useState } from 'react';
import { tradeApi } from '../services/api';
import type { Mood, TradeType, Trade } from '../types';

interface TradeFormProps {
  onTradeCreated: (trade: Trade) => void;
}

const MOODS: Mood[] = ['Calm', 'Anxious', 'Greedy', 'Disciplined', 'Fearful'];

export const TradeForm: React.FC<TradeFormProps> = ({ onTradeCreated }) => {
  const [asset, setAsset] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [tradeType, setTradeType] = useState<TradeType>('long');
  const [mood, setMood] = useState<Mood>('Calm');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateProfitLoss = (): number | null => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);

    if (isNaN(entry) || isNaN(exit)) return null;

    if (tradeType === 'long') {
      return exit - entry;
    } else {
      return entry - exit;
    }
  };

  const profitLoss = calculateProfitLoss();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await tradeApi.createTrade({
        asset,
        entryPrice: parseFloat(entryPrice),
        exitPrice: parseFloat(exitPrice),
        tradeType,
        mood,
        notes: notes.trim() || undefined,
      });

      onTradeCreated(response.trade);

      // Reset form
      setAsset('');
      setEntryPrice('');
      setExitPrice('');
      setTradeType('long');
      setMood('Calm');
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Log New Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="asset" className="block text-sm font-medium text-gray-700">
              Asset *
            </label>
            <input
              type="text"
              id="asset"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
              placeholder="e.g., EUR/USD, BTC, AAPL"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="tradeType" className="block text-sm font-medium text-gray-700">
              Trade Type *
            </label>
            <select
              id="tradeType"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value as TradeType)}
            >
              <option value="long">Long (Buy)</option>
              <option value="short">Short (Sell)</option>
            </select>
          </div>

          <div>
            <label htmlFor="entryPrice" className="block text-sm font-medium text-gray-700">
              Entry Price *
            </label>
            <input
              type="number"
              id="entryPrice"
              required
              step="0.01"
              min="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
              placeholder="0.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="exitPrice" className="block text-sm font-medium text-gray-700">
              Exit Price *
            </label>
            <input
              type="number"
              id="exitPrice"
              required
              step="0.01"
              min="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
              placeholder="0.00"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
              Mood *
            </label>
            <select
              id="mood"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
              value={mood}
              onChange={(e) => setMood(e.target.value as Mood)}
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {profitLoss !== null && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profit/Loss Preview
              </label>
              <div
                className={`mt-1 block w-full rounded-md px-3 py-2 border text-sm font-semibold ${
                  profitLoss >= 0
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {profitLoss >= 0 ? '+' : ''}
                {profitLoss.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            maxLength={500}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
            placeholder="Add any notes about this trade..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">{notes.length}/500 characters</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging Trade...' : 'Log Trade'}
        </button>
      </form>
    </div>
  );
};
