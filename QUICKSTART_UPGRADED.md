# 🚀 MindfulTrader v2.0 - Quick Start Guide

## ✅ What's New in v2.0

- 👤 **User Profiles** - Set your trading style, experience, and risk tolerance
- 💰 **Wallet System** - Track your balance and transaction history
- 💳 **Mock Payments** - Simulate deposits with Card/UPI/Crypto
- 🚨 **Smart Alerts** - Get warned about revenge trading, overtrading, emotional bias
- 💡 **AI Recommendations** - Personalized advice based on your trading patterns
- 📊 **Advanced Analytics** - Win rates, streaks, profit/loss analysis
- 🎨 **Enhanced UI** - Better navigation, dropdown menus, improved layouts

---

## 🏃 Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:3000

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

### 3. Login
- Use your existing account
- Or create a new one at http://localhost:5173/signup

---

## 🎯 Feature Tour

### Step 1: Complete Your Profile
1. Click the **user dropdown** (top right)
2. Select **Profile**
3. Fill in:
   - Username
   - Trading Style (Day Trader, Swing Trader, etc.)
   - Experience Level (Beginner to Expert)
   - Risk Tolerance (Low to Very High)
4. Click **Save Changes**

### Step 2: Set Up Your Wallet
1. Click **Wallet** button in navbar
2. See your current balance (starts at $0)
3. Click **Add Funds**
4. Enter amount (try $1000)
5. Select payment method (Card/UPI/Crypto)
6. Click **Pay** - watch the mock payment process!
7. Return to wallet to see updated balance

### Step 3: Log Some Trades
1. Go to **Dashboard** (home)
2. Scroll to **Trade Form**
3. Log at least 10 trades with different moods
4. Mix profitable and losing trades
5. Try different assets (BTC, ETH, etc.)

### Step 4: View AI Insights
After logging 10+ trades, you'll see:

**Alerts** (if applicable):
- 🚨 Revenge trading warnings
- ⚠️ Overtrading alerts
- 💭 Emotional bias detection
- 📉 Losing streak notifications

**Recommendations**:
- 💡 Best moods to trade in
- 🎯 Best performing assets
- 📊 Risk management tips
- 🚫 Moods/assets to avoid

**Analytics**:
- 💰 Average profit vs loss
- 🔥 Current streak (win/loss)
- 📈 Win rate by asset
- 🏆 Longest streaks

---

## 🗺️ Navigation Guide

### Top Navbar
- **MindfulTrader** (logo) → Home/Dashboard
- **Wallet** button → Wallet page
- **User dropdown** → Profile / Logout

### Pages
- `/` - Dashboard (main page)
- `/profile` - User profile settings
- `/wallet` - Wallet and transactions
- `/payments` - Add funds (mock)
- `/login` - Login page
- `/signup` - Signup page

---

## 📊 Sample Data

Want to see the features in action? Use the sample data script:

```bash
cd backend
npx ts-node scripts/add-sample-trades.ts
```

This adds 11 realistic trades with different moods and outcomes.

---

## 🎨 UI Features

### Dashboard
- **Market Section** (top)
  - Live crypto prices
  - Candlestick chart
  - Asset selector

- **Alerts Section** (new!)
  - Yellow warning cards
  - Real-time trading alerts

- **Recommendations Section** (new!)
  - Blue info cards
  - Personalized advice

- **Analytics Section** (new!)
  - Profit/Loss stats
  - Streak information
  - Win rate by asset

- **Trading Section**
  - Metrics summary
  - Trade form
  - Insights panel
  - Mood performance chart
  - Trade history

### Profile Page
- Avatar with gradient
- Member since date
- Profile form with dropdowns
- Save button with loading state

### Wallet Page
- Gradient balance card
- Quick action buttons
- Transaction history with icons
- Color-coded transactions

### Payment Page
- Amount input with quick buttons
- Payment method selection
- Mock processing animation
- Success screen

---

## 🧪 Testing Scenarios

### Scenario 1: New User
1. Signup → Create account
2. Dashboard → See empty state
3. Profile → Fill out preferences
4. Wallet → Add $1000
5. Dashboard → Log 10 trades
6. See insights, alerts, recommendations

### Scenario 2: Existing User
1. Login → Existing account
2. Dashboard → See existing trades
3. Profile → Update preferences
4. Wallet → Check balance
5. Dashboard → View enhanced insights

### Scenario 3: Test Alerts
1. Log 4 losing trades in a row
2. See "Revenge trading" alert
3. Log 10 trades in 1 hour
4. See "Overtrading" alert
5. Log 5 Greedy trades (all losses)
6. See "Emotional bias" alert

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check MongoDB connection
# Make sure DATABASE_URL is set in backend/.env
cd backend
cat .env
```

### Frontend won't start
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Insights not showing
- Need at least 10 trades
- Check backend logs for errors
- Refresh the dashboard

### Wallet not showing
- Wallet is auto-created on first visit
- Check backend is running
- Check browser console for errors

---

## 📝 API Endpoints

### New Endpoints
```
GET    /api/user/profile       - Get user profile
PUT    /api/user/profile       - Update profile
GET    /api/wallet             - Get wallet
POST   /api/wallet/deposit     - Deposit funds
POST   /api/wallet/withdraw    - Withdraw funds
```

### Enhanced Endpoints
```
GET    /api/insights           - Now includes warnings, recommendations, analytics
```

### Existing Endpoints (Unchanged)
```
POST   /api/auth/signup        - Create account
POST   /api/auth/login         - Login
POST   /api/auth/logout        - Logout
POST   /api/trades             - Create trade
GET    /api/trades             - Get trades
```

---

## 🎯 Key Features to Demo

1. **Profile System**
   - Show customization options
   - Demonstrate save functionality

2. **Wallet & Payments**
   - Show balance tracking
   - Demo mock payment flow
   - Show transaction history

3. **Smart Alerts**
   - Trigger revenge trading alert
   - Show overtrading detection
   - Display emotional bias warning

4. **AI Recommendations**
   - Show personalized advice
   - Demonstrate mood-based insights
   - Display asset recommendations

5. **Advanced Analytics**
   - Show profit/loss comparison
   - Display streak information
   - Show win rate by asset

---

## 💡 Tips

### For Best Results
- Log at least 15-20 trades for comprehensive insights
- Mix different moods to see patterns
- Try different assets to compare performance
- Check alerts regularly for warnings
- Follow recommendations to improve

### Demo Tips
- Use sample data script for quick setup
- Show profile customization first
- Demo payment flow (it's impressive!)
- Highlight the alerts system
- Show analytics with real data

---

## 🚀 Production Deployment

### Environment Variables
```bash
# Backend (.env)
PORT=3000
NODE_ENV=production
DATABASE_URL=your_mongodb_atlas_url
SESSION_SECRET=your_secret_key
FRONTEND_URL=https://your-domain.com

# Frontend (.env)
VITE_API_URL=https://api.your-domain.com/api
```

### Build Commands
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## 📚 Documentation

- `UPGRADE_COMPLETE.md` - Full upgrade details
- `UPGRADE_PHASE1_BACKEND_COMPLETE.md` - Backend changes
- `BUGFIX_NAN_INSIGHTS.md` - Bug fixes applied
- `DATABASE_CLEANUP_COMPLETE.md` - Database cleanup
- `BINANCE_DASHBOARD_COMPLETE.md` - Market data integration

---

## ✅ Status

- Backend: ✅ Running
- Frontend: ✅ Running
- Database: ✅ Connected
- Features: ✅ All working
- Tests: ✅ Passing

---

## 🎉 Enjoy MindfulTrader v2.0!

Your upgraded trading psychology platform is ready to use. All new features are live and working perfectly while maintaining full backward compatibility with existing data.

**Happy Trading! 📈**
