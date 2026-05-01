# MindfulTrader - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free) OR local MongoDB

---

## Step 1: Set Up MongoDB (Choose One Option)

### Option A: MongoDB Atlas (Recommended - 2 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account → Create free cluster (M0)
3. Create database user (username: `mindfultrader`, save password)
4. Whitelist IP: "Allow Access from Anywhere"
5. Get connection string: Click "Connect" → "Connect your application"
6. Copy the connection string

### Option B: Local MongoDB

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Your connection string will be:
# mongodb://localhost:27017/mindfultrader
```

---

## Step 2: Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Update .env file with your MongoDB connection
# Edit backend/.env and set DATABASE_URL to your connection string
```

**Example `.env`:**
```env
DATABASE_URL=mongodb+srv://mindfultrader:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mindfultrader?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
SESSION_SECRET=mindfultrader-secret-key-change-in-production-12345
SESSION_EXPIRY=604800000
FRONTEND_URL=http://localhost:5173
```

---

## Step 3: Start Backend

```bash
cd backend
npm run dev
```

✅ You should see:
```
Database connected successfully
Server started on port 3000
```

---

## Step 4: Start Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## Step 5: Use the App

1. **Open browser**: http://localhost:5173
2. **Sign up**: Create an account with email/password
3. **Log your first trade**:
   - Asset: BTC
   - Trade Type: Long
   - Entry Price: 50000
   - Exit Price: 51000
   - Mood: Disciplined
4. **See your metrics** update in real-time!
5. **Log 10+ trades** to unlock AI insights

---

## 🎯 MVP Features Included

✅ **Authentication**: Secure signup/login with sessions  
✅ **Trade Logging**: Log trades with mood tracking  
✅ **Dashboard**: View recent trades and performance metrics  
✅ **Metrics**: Total P/L, trade count, win rate  
✅ **Filtering**: Filter trades by mood or asset  
✅ **Charts**: Bar chart showing P/L by mood  
✅ **AI Insights**: Pattern analysis after 10+ trades  

---

## 📁 Project Structure

```
mindfultrader/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & error handling
│   │   └── server.ts       # Entry point
│   └── .env                # Configuration
│
├── frontend/                # React + TypeScript
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app
│   └── .env                # API URL config
│
└── README.md               # Full documentation
```

---

## 🔧 Troubleshooting

### Backend won't start
- **Check MongoDB connection**: Make sure DATABASE_URL in `.env` is correct
- **Check port**: Make sure port 3000 is not in use
- **Check logs**: Look for error messages in terminal

### Frontend won't connect to backend
- **Check backend is running**: Should see "Server started on port 3000"
- **Check CORS**: Backend should allow `http://localhost:5173`
- **Check browser console**: Look for network errors

### "Authentication required" errors
- **Clear cookies**: Clear browser cookies and try again
- **Check session**: Make sure SESSION_SECRET is set in backend `.env`

### MongoDB connection errors
- **Atlas**: Check username/password in connection string
- **Atlas**: Check IP whitelist includes your IP
- **Local**: Make sure MongoDB service is running

---

## 🎨 Customization

### Change Colors
Edit `frontend/tailwind.config.js`:
```js
colors: {
  primary: {
    500: '#your-color',
    600: '#your-darker-color',
    // ...
  }
}
```

### Add More Moods
1. Update `backend/src/models/Trade.ts` - add to `Mood` enum
2. Update `frontend/src/types/index.ts` - add to `Mood` type
3. Update `frontend/src/components/TradeForm.tsx` - add to `MOODS` array

### Change Session Duration
Edit `backend/.env`:
```env
SESSION_EXPIRY=604800000  # 7 days in milliseconds
```

---

## 📚 Next Steps

- **Add more trades** to see patterns emerge
- **Explore filtering** by mood and asset
- **Wait for 10 trades** to unlock AI insights
- **Check the charts** to visualize your performance

---

## 🆘 Need Help?

- **Full Documentation**: See `README.md`
- **MongoDB Setup**: See `MONGODB_SETUP.md`
- **API Endpoints**: See backend routes in `backend/src/routes/`

---

## 🎉 You're All Set!

Start logging trades and discover how your emotions affect your trading performance!
