import React from 'react';
import type { Insight } from '../types';

interface InsightsPanelProps {
  insights: Insight[];
  tradeCount: number;
  hasMinimumData: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  tradeCount,
  hasMinimumData,
}) => {
  const renderInsufficientDataMessage = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
      <svg
        className="mx-auto h-12 w-12 text-blue-400 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-lg font-medium text-blue-900 mb-2">Not Enough Data Yet</h3>
      <p className="text-sm text-blue-700">
        You have {tradeCount} trade{tradeCount !== 1 ? 's' : ''}. Log at least 10 trades to
        generate AI insights about your trading patterns.
      </p>
      <p className="text-xs text-blue-600 mt-2">
        {10 - tradeCount} more trade{10 - tradeCount !== 1 ? 's' : ''} needed
      </p>
    </div>
  );

  const renderInsight = (insight: Insight) => (
    <div key={insight.id} className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h3>
          <p className="text-gray-700 leading-relaxed">{insight.text}</p>
          
          {/* Mood Analysis Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
            {insight.moodAnalysis
              .sort((a, b) => a.rank - b.rank)
              .map((analysis) => (
                <div
                  key={analysis.mood}
                  className="bg-white rounded p-2 text-center border border-gray-200"
                >
                  <p className="text-xs font-medium text-gray-500">{analysis.mood}</p>
                  <p
                    className={`text-sm font-bold ${
                      analysis.averageProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {analysis.averageProfitLoss >= 0 ? '+' : ''}
                    {analysis.averageProfitLoss.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">{analysis.tradeCount} trades</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights</h2>
      {!hasMinimumData ? renderInsufficientDataMessage() : insights.map(renderInsight)}
    </div>
  );
};
