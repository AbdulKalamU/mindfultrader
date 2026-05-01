import axios from 'axios';

const BINANCE_API = 'https://api.binance.com/api/v3';

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TickerPrice {
  symbol: string;
  price: string;
}

export const TRADING_PAIRS = [
  { symbol: 'BTCUSDT', label: 'BTC/USDT' },
  { symbol: 'ETHUSDT', label: 'ETH/USDT' },
  { symbol: 'BNBUSDT', label: 'BNB/USDT' },
  { symbol: 'SOLUSDT', label: 'SOL/USDT' },
];

/**
 * Fetch current price for a symbol
 */
export const fetchPrice = async (symbol: string): Promise<number> => {
  try {
    const response = await axios.get<TickerPrice>(`${BINANCE_API}/ticker/price`, {
      params: { symbol },
    });
    return parseFloat(response.data.price);
  } catch (error) {
    console.error('Error fetching price:', error);
    // Return simulated data as fallback
    return generateSimulatedPrice(symbol);
  }
};

/**
 * Fetch candlestick data for a symbol
 */
export const fetchKlines = async (
  symbol: string,
  interval: string = '1m',
  limit: number = 100
): Promise<CandleData[]> => {
  try {
    const response = await axios.get(`${BINANCE_API}/klines`, {
      params: { symbol, interval, limit },
    });

    return response.data.map((kline: any[]) => ({
      time: kline[0] / 1000, // Convert to seconds
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));
  } catch (error) {
    console.error('Error fetching klines:', error);
    // Return simulated data as fallback
    return generateSimulatedKlines(symbol, limit);
  }
};

/**
 * Generate simulated price for fallback
 */
const generateSimulatedPrice = (symbol: string): number => {
  const basePrices: Record<string, number> = {
    BTCUSDT: 45000,
    ETHUSDT: 2500,
    BNBUSDT: 350,
    SOLUSDT: 100,
  };

  const basePrice = basePrices[symbol] || 1000;
  const variation = basePrice * 0.02; // 2% variation
  return basePrice + (Math.random() - 0.5) * variation;
};

/**
 * Generate simulated candlestick data for fallback
 */
const generateSimulatedKlines = (symbol: string, limit: number): CandleData[] => {
  const now = Date.now();
  const basePrice = generateSimulatedPrice(symbol);
  const candles: CandleData[] = [];

  for (let i = limit - 1; i >= 0; i--) {
    const time = Math.floor((now - i * 60000) / 1000); // 1 minute intervals
    const open = basePrice + (Math.random() - 0.5) * basePrice * 0.01;
    const close = open + (Math.random() - 0.5) * basePrice * 0.005;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.003;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.003;
    const volume = Math.random() * 100;

    candles.push({ time, open, high, low, close, volume });
  }

  return candles;
};

/**
 * Subscribe to price updates (polling-based)
 */
export class PriceSubscription {
  private symbol: string;
  private interval: number;
  private callback: (price: number) => void;
  private intervalId: number | null = null;

  constructor(symbol: string, callback: (price: number) => void, interval: number = 3000) {
    this.symbol = symbol;
    this.callback = callback;
    this.interval = interval;
  }

  start() {
    // Fetch immediately
    this.fetchAndNotify();

    // Then poll at interval
    this.intervalId = setInterval(() => {
      this.fetchAndNotify();
    }, this.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async fetchAndNotify() {
    try {
      const price = await fetchPrice(this.symbol);
      this.callback(price);
    } catch (error) {
      console.error('Price subscription error:', error);
    }
  }
}
