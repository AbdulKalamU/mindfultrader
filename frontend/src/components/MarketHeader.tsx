import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketHeaderProps {
  selectedAsset: string;
  onAssetChange: (asset: string) => void;
}

const TRADING_PAIRS = [
  { symbol: 'BTCUSDT', label: 'BTC/USDT' },
  { symbol: 'ETHUSDT', label: 'ETH/USDT' },
  { symbol: 'BNBUSDT', label: 'BNB/USDT' },
  { symbol: 'SOLUSDT', label: 'SOL/USDT' },
];

export const MarketHeader: React.FC<MarketHeaderProps> = ({ selectedAsset, onAssetChange }) => {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch live price
  const fetchPrice = async () => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${selectedAsset}`
      );
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const newPrice = parseFloat(data.price);

      // Calculate price change
      if (livePrice !== null) {
        setPreviousPrice(livePrice);
        const change = ((newPrice - livePrice) / livePrice) * 100;
        setPriceChange(change);
      }

      setLivePrice(newPrice);
      setLoading(false);
      setError(false);
    } catch (err) {
      console.error('Error fetching price:', err);
      setError(true);
      setLoading(false);
      
      // Fallback to simulated data
      if (livePrice === null) {
        const simulatedPrice = getSimulatedPrice(selectedAsset);
        setLivePrice(simulatedPrice);
      }
    }
  };

  // Get simulated price for fallback
  const getSimulatedPrice = (symbol: string): number => {
    const basePrices: Record<string, number> = {
      BTCUSDT: 45000,
      ETHUSDT: 2500,
      BNBUSDT: 350,
      SOLUSDT: 100,
    };
    return basePrices[symbol] || 1000;
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Reset price change when asset changes
  useEffect(() => {
    setPriceChange(0);
    setPreviousPrice(null);
    setLoading(true);
  }, [selectedAsset]);

  const formatPrice = (price: number | null) => {
    if (price === null) return '---';
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getPriceDirection = () => {
    if (previousPrice === null || livePrice === null) return 'neutral';
    return livePrice > previousPrice ? 'up' : livePrice < previousPrice ? 'down' : 'neutral';
  };

  const direction = getPriceDirection();

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Asset Selector */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedAsset}
              onChange={(e) => onAssetChange(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-500 transition-all cursor-pointer"
            >
              {TRADING_PAIRS.map((pair) => (
                <option key={pair.symbol} value={pair.symbol}>
                  {pair.label}
                </option>
              ))}
            </select>

            {error && (
              <div className="flex items-center space-x-2 text-yellow-500 text-sm">
                <Activity className="w-4 h-4" />
                <span>Using fallback data</span>
              </div>
            )}
          </div>

          {/* Live Price Display */}
          <div className="flex items-center space-x-6">
            {loading && livePrice === null ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-gray-400">Loading price...</span>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Live Price</p>
                  <div className="flex items-center space-x-3">
                    <p
                      className={`text-3xl md:text-4xl font-bold transition-colors ${
                        direction === 'up'
                          ? 'text-green-400'
                          : direction === 'down'
                          ? 'text-red-400'
                          : 'text-gray-100'
                      }`}
                    >
                      ${formatPrice(livePrice)}
                    </p>

                    {/* Price Change Indicator */}
                    {priceChange !== 0 && (
                      <div
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold ${
                          priceChange >= 0
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {priceChange >= 0 ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                        <span className="text-sm">
                          {priceChange >= 0 ? '+' : ''}
                          {priceChange.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm text-gray-400">LIVE</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
