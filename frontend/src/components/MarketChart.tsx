import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { BarChart3 } from 'lucide-react';

interface MarketChartProps {
  selectedAsset: string;
}

interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const MarketChart: React.FC<MarketChartProps> = ({ selectedAsset }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 450,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#334155',
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      crosshair: {
        mode: 1,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch kline data
  const fetchKlines = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${selectedAsset}&interval=1m&limit=100`
      );

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      // Convert Binance kline format to chart format
      const klines: KlineData[] = data.map((kline: any[]) => ({
        time: Math.floor(kline[0] / 1000), // Convert ms to seconds
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
      }));

      if (candlestickSeriesRef.current && klines.length > 0) {
        const chartData: CandlestickData[] = klines.map((kline) => ({
          time: kline.time as any,
          open: kline.open,
          high: kline.high,
          low: kline.low,
          close: kline.close,
        }));

        candlestickSeriesRef.current.setData(chartData);
        
        // Fit content to view
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching klines:', err);
      setError(true);
      setLoading(false);

      // Fallback to simulated data
      const simulatedData = generateSimulatedKlines(selectedAsset);
      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(simulatedData);
      }
    }
  };

  // Generate simulated klines for fallback
  const generateSimulatedKlines = (symbol: string): CandlestickData[] => {
    const basePrices: Record<string, number> = {
      BTCUSDT: 45000,
      ETHUSDT: 2500,
      BNBUSDT: 350,
      SOLUSDT: 100,
    };

    const basePrice = basePrices[symbol] || 1000;
    const now = Date.now();
    const candles: CandlestickData[] = [];

    for (let i = 99; i >= 0; i--) {
      const time = Math.floor((now - i * 60000) / 1000); // 1 minute intervals
      const open = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
      const close = open + (Math.random() - 0.5) * basePrice * 0.01;
      const high = Math.max(open, close) + Math.random() * basePrice * 0.005;
      const low = Math.min(open, close) - Math.random() * basePrice * 0.005;

      candles.push({
        time: time as any,
        open,
        high,
        low,
        close,
      });
    }

    return candles;
  };

  // Load chart data when asset changes
  useEffect(() => {
    fetchKlines();

    // Refresh chart data every 60 seconds
    const interval = setInterval(fetchKlines, 60000);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 shadow-xl">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-100">Market Chart</h3>
          <span className="text-sm text-gray-400">1m Interval</span>
        </div>

        {error && (
          <div className="text-sm text-yellow-500">
            Using simulated data
          </div>
        )}

        {loading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Loading chart...</span>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />

      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">Bullish</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-400">Bearish</span>
        </div>
      </div>
    </div>
  );
};
