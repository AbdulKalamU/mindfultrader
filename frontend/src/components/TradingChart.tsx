import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { fetchKlines, PriceSubscription, TRADING_PAIRS } from '../services/marketData';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const TradingChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const priceSubscriptionRef = useRef<PriceSubscription | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2e39' },
        horzLines: { color: '#2a2e39' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2a2e39',
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
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

  // Load chart data
  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      try {
        const klines = await fetchKlines(selectedSymbol, '1m', 100);
        
        if (candlestickSeriesRef.current && klines.length > 0) {
          const chartData: CandlestickData[] = klines.map((kline) => ({
            time: kline.time as any,
            open: kline.open,
            high: kline.high,
            low: kline.low,
            close: kline.close,
          }));

          candlestickSeriesRef.current.setData(chartData);

          // Calculate price change
          const firstPrice = klines[0].open;
          const lastPrice = klines[klines.length - 1].close;
          const change = ((lastPrice - firstPrice) / firstPrice) * 100;
          setPriceChange(change);
          setCurrentPrice(lastPrice);
        }
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [selectedSymbol]);

  // Subscribe to price updates
  useEffect(() => {
    // Clean up previous subscription
    if (priceSubscriptionRef.current) {
      priceSubscriptionRef.current.stop();
    }

    // Create new subscription
    const subscription = new PriceSubscription(
      selectedSymbol,
      (price) => {
        setCurrentPrice(price);
        
        // Update last candle
        if (candlestickSeriesRef.current) {
          const now = Math.floor(Date.now() / 1000);
          candlestickSeriesRef.current.update({
            time: now as any,
            open: price,
            high: price,
            low: price,
            close: price,
          });
        }
      },
      3000 // Update every 3 seconds
    );

    subscription.start();
    priceSubscriptionRef.current = subscription;

    return () => {
      subscription.stop();
    };
  }, [selectedSymbol]);

  const formatPrice = (price: number | null) => {
    if (price === null) return '---';
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-dark-card rounded-lg border border-dark-border p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        {/* Symbol Selector */}
        <div className="flex items-center space-x-4">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-gray-600 transition-colors"
          >
            {TRADING_PAIRS.map((pair) => (
              <option key={pair.symbol} value={pair.symbol}>
                {pair.label}
              </option>
            ))}
          </select>

          {loading && (
            <div className="flex items-center space-x-2 text-gray-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>

        {/* Current Price */}
        <div className="flex items-center space-x-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Price</p>
            <div className="flex items-center space-x-3">
              <p className="text-2xl font-bold text-gray-100">
                ${formatPrice(currentPrice)}
              </p>
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded ${
                  priceChange >= 0
                    ? 'bg-trading-green/20 text-trading-green'
                    : 'bg-trading-red/20 text-trading-red'
                }`}
              >
                {priceChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {priceChange >= 0 ? '+' : ''}
                  {priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
