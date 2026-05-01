import mongoose from 'mongoose';
import { Trade } from '../src/models/Trade';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cleanup script to remove trades with invalid profitLoss values
 */
async function cleanupInvalidTrades() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/mindfultrader');
    console.log('Connected successfully');

    // Find all trades
    const allTrades = await Trade.find().lean();
    console.log(`\nTotal trades in database: ${allTrades.length}`);

    // Identify invalid trades
    const invalidTrades = allTrades.filter(trade => {
      const pl = Number(trade.profitLoss);
      return isNaN(pl) || !isFinite(pl);
    });

    console.log(`Invalid trades found: ${invalidTrades.length}`);

    if (invalidTrades.length === 0) {
      console.log('✅ No invalid trades found. Database is clean!');
      await mongoose.disconnect();
      return;
    }

    // Show sample of invalid trades
    console.log('\nSample invalid trades:');
    invalidTrades.slice(0, 3).forEach(trade => {
      console.log(`  - ID: ${trade._id}, Asset: ${trade.asset}, P/L: ${trade.profitLoss}`);
    });

    // Delete invalid trades
    console.log(`\n🗑️  Deleting ${invalidTrades.length} invalid trades...`);
    const result = await Trade.deleteMany({
      _id: { $in: invalidTrades.map(t => t._id) }
    });

    console.log(`✅ Deleted ${result.deletedCount} invalid trades`);

    // Show remaining trades
    const remainingTrades = await Trade.countDocuments();
    console.log(`\n📊 Remaining trades: ${remainingTrades}`);

    await mongoose.disconnect();
    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupInvalidTrades();
