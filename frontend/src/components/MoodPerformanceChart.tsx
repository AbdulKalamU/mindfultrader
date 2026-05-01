import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Trade, Mood } from '../types';

interface MoodPerformanceChartProps {
  trades: Trade[];
}

const MOOD_COLORS: Record<Mood, string> = {
  Calm: '#10b981',
  Disciplined: '#3b82f6',
  Anxious: '#f59e0b',
  Greedy: '#ef4444',
  Fearful: '#8b5cf6',
};

export const MoodPerformanceChart: React.FC<MoodPerformanceChartProps> = ({ trades }) => {
  const aggregateByMood = () => {
    const moodData: Record<Mood, number> = {
      Calm: 0,
      Anxious: 0,
      Greedy: 0,
      Disciplined: 0,
      Fearful: 0,
    };

    trades.forEach((trade) => {
      moodData[trade.mood] += trade.profitLoss;
    });

    return Object.entries(moodData).map(([mood, profitLoss]) => ({
      mood,
      profitLoss: parseFloat(profitLoss.toFixed(2)),
      fill: MOOD_COLORS[mood as Mood],
    }));
  };

  const chartData = aggregateByMood();

  if (trades.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Mood</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No trade data available. Log some trades to see your mood performance!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Mood</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mood" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value.toFixed(2)}`, 'P/L']}
          />
          <Legend />
          <Bar dataKey="profitLoss" name="Profit/Loss" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
