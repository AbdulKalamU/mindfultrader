import mongoose from 'mongoose';
import { Trade, Mood, TradeType } from '../src/models/Trade';
import { User } from '../src/models/User';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to add sample trades for testing
 */
async function addSampleTrades() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/mindfultrader');
    console.log('Connected successfully');

    // Find the first user
    const user = await User.findOne();
    if (!user) {
      console.error('❌ No user found. Please create a user first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n👤 Found user: ${user.email}`);

    // Sample trades with different moods
    const sampleTrades = [
      // Disciplined trades (mostly profitable)
      { asset: 'BTC/USDT', entryPrice: 45000, exitPrice: 46000, tradeType: TradeType.LONG, mood: Mood.DISCIPLINED, notes: 'Followed my strategy perfectly' },
      { asset: 'ETH/USDT', entryPrice: 2500, exitPrice: 2600, tradeType: TradeType.LONG, mood: Mood.DISCIPLINED, notes: 'Waited for confirmation' },
      { asset: 'BTC/USDT', entryPrice: 46500, exitPrice: 47200, tradeType: TradeType.LONG, mood: Mood.DISCIPLINED, notes: 'Stuck to my plan' },
      
      // Calm trades (mixed results)
      { asset: 'ETH/USDT', entryPrice: 2600, exitPrice: 2550, tradeType: TradeType.LONG, mood: Mood.CALM, notes: 'Felt relaxed' },
      { asset: 'BNB/USDT', entryPrice: 350, exitPrice: 360, tradeType: TradeType.LONG, mood: Mood.CALM, notes: 'Clear headed' },
      
      // Anxious trades (mostly losses)
      { asset: 'BTC/USDT', entryPrice: 47000, exitPrice: 46200, tradeType: TradeType.LONG, mood: Mood.ANXIOUS, notes: 'Worried about market' },
      { asset: 'SOL/USDT', entryPrice: 100, exitPrice: 95, tradeType: TradeType.LONG, mood: Mood.ANXIOUS, notes: 'Nervous about position' },
      
      // Greedy trades (big losses)
      { asset: 'BTC/USDT', entryPrice: 48000, exitPrice: 46500, tradeType: TradeType.LONG, mood: Mood.GREEDY, notes: 'Wanted more profit' },
      { asset: 'ETH/USDT', entryPrice: 2700, exitPrice: 2500, tradeType: TradeType.LONG, mood: Mood.GREEDY, notes: 'Chased the pump' },
      
      // Fearful trades (panic sells)
      { asset: 'BTC/USDT', entryPrice: 46000, exitPrice: 45500, tradeType: TradeType.LONG, mood: Mood.FEARFUL, notes: 'Panic sold' },
      { asset: 'ETH/USDT', entryPrice: 2550, exitPrice: 2500, tradeType: TradeType.LONG, mood: Mood.FEARFUL, notes: 'Got scared' },
    ];

    console.log(`\n📝 Creating ${sampleTrades.length} sample trades...`);

    for (const tradeData of sampleTrades) {
      // Calculate profit/loss
      const profitLoss = tradeData.tradeType === TradeType.LONG
        ? tradeData.exitPrice - tradeData.entryPrice
        : tradeData.entryPrice - tradeData.exitPrice;

      const trade = new Trade({
        userId: user._id,
        asset: tradeData.asset,
        entryPrice: tradeData.entryPrice,
        exitPrice: tradeData.exitPrice,
        tradeType: tradeData.tradeType,
        mood: tradeData.mood,
        notes: tradeData.notes,
        profitLoss,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      });

      await trade.save();
      console.log(`  ✅ ${tradeData.asset} - ${tradeData.mood} - P/L: ${profitLoss > 0 ? '+' : ''}${profitLoss}`);
    }

    const totalTrades = await Trade.countDocuments({ userId: user._id });
    console.log(`\n✅ Sample trades created successfully!`);
    console.log(`📊 Total trades for user: ${totalTrades}`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error adding sample trades:', error);
    process.exit(1);
  }
}

addSampleTrades();
