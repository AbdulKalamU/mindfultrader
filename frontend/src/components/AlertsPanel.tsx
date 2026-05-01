import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface AlertsPanelProps {
  warnings: string[];
  recommendations: string[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ warnings, recommendations }) => {
  if (warnings.length === 0 && recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            Alerts
          </h3>
          <div className="space-y-3">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-200">{warning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-400" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
              >
                <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-200">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
