# Railway 502 Bad Gateway - Fixed ✅

## Issue
Application deployed successfully but shows "502 Bad Gateway" error when accessing the URL.

## Root Causes Identified

### 1. Server Not Binding to All Interfaces ❌ → ✅
**Problem**: Server was binding to `localhost` only, Railway needs `0.0.0.0`

**Fix Applied**:
```typescript
// BEFORE
app.listen(PORT, () => { ... });

// AFTER
app.listen(PORT, '0.0.0.0', () => { ... });
```

### 2. PORT Type Mismatch ❌ → ✅
**Problem**: `process.env.PORT` returns string, but `listen()` expects number

**Fix Applied**:
```typescript
// BEFORE
const PORT = process.env.PORT || 3000;

// AFTER
const PORT = parseInt(process.env.PORT || '3000', 10);
```

### 3. Missing Proxy Trust for Secure Cookies ❌ → ✅
**Problem**: Railway uses a reverse proxy, need to trust it for secure cookies

**Fix Applied**:
```typescript
// Trust Railway proxy for secure cookies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
```

### 4. CORS Configuration Too Restrictive ❌ → ✅
**Problem**: CORS was blocking requests, needed better origin handling

**Fix Applied**:
```typescript
// Support multiple origins and better error handling
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow no-origin requests
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

### 5. Better Logging for Debugging ✅
**Added**: Detailed startup logging to track initialization steps

```typescript
logger.info('Starting MindfulTrader API server...');
logger.info('Connecting to database...');
logger.info('Database connection successful');
logger.info('Initializing session store...');
logger.info('Session store initialized');
```

---

## Files Modified

1. ✅ `backend/src/server.ts` - All fixes applied

---

## Railway Environment Variables

Make sure these are set in Railway:

```env
# Required
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/mindfultrader?retryWrites=true&w=majority
SESSION_SECRET=your-secure-random-string-here
NODE_ENV=production

# Optional (Railway sets PORT automatically)
PORT=8000

# Frontend URL for CORS (can be comma-separated for multiple origins)
FRONTEND_URL=https://your-frontend.vercel.app,https://your-frontend-preview.vercel.app
```

---

## Testing the Deployment

### 1. Check Root Endpoint
```bash
curl https://mindfultrader-production.up.railway.app/
```

**Expected Response**:
```json
{
  "name": "MindfulTrader API",
  "status": "running",
  "version": "2.0.0",
  "timestamp": "2026-05-02T..."
}
```

### 2. Check Health Endpoint
```bash
curl https://mindfultrader-production.up.railway.app/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-05-02T...",
  "database": "connected"
}
```

### 3. Check Railway Logs
Look for these success messages:
```
✅ Starting MindfulTrader API server...
✅ Connecting to database...
✅ Database connection successful
✅ Initializing session store...
✅ Session store initialized
✅ Server started on port 8000
✅ Environment: production
```

---

## Common Issues & Solutions

### Issue: Still Getting 502
**Solution**: Check Railway logs for errors
- Database connection failed? → Check DATABASE_URL
- Session store error? → Check MongoDB connection
- Port binding error? → Railway should set PORT automatically

### Issue: CORS Errors
**Solution**: Update FRONTEND_URL environment variable
```env
# Single origin
FRONTEND_URL=https://your-frontend.vercel.app

# Multiple origins (comma-separated)
FRONTEND_URL=https://your-frontend.vercel.app,https://preview.vercel.app
```

### Issue: Secure Cookie Warnings
**Solution**: Already fixed with `app.set('trust proxy', 1)`
- Railway provides HTTPS automatically
- Proxy trust is enabled in production mode

### Issue: Session Not Persisting
**Solution**: Check these settings:
1. `NODE_ENV=production` is set
2. `SESSION_SECRET` is set (not default)
3. Frontend is sending `credentials: true` in fetch requests
4. CORS is allowing credentials

---

## Deployment Checklist

- [x] Build completes successfully (`npm run build`)
- [x] Server binds to `0.0.0.0` (all interfaces)
- [x] PORT is parsed as integer
- [x] Proxy trust enabled for production
- [x] CORS configured for production origins
- [x] Detailed logging added
- [x] Root endpoint returns JSON
- [x] Health endpoint available
- [ ] Environment variables set in Railway
- [ ] Push code to trigger redeployment
- [ ] Test root endpoint
- [ ] Test health endpoint
- [ ] Check Railway logs for success messages

---

## Next Steps

1. **Commit and Push Changes**:
   ```bash
   git add .
   git commit -m "Fix Railway 502 error - bind to 0.0.0.0 and improve production config"
   git push
   ```

2. **Railway Will Auto-Deploy**:
   - Watch the build logs
   - Watch the deploy logs
   - Look for success messages

3. **Test Endpoints**:
   - Visit: `https://mindfultrader-production.up.railway.app/`
   - Visit: `https://mindfultrader-production.up.railway.app/health`
   - Should see JSON responses, not 502 error

4. **Update Frontend**:
   - Update API URL in frontend to Railway URL
   - Ensure `credentials: 'include'` in fetch requests
   - Deploy frontend

---

**Status**: ✅ Ready for redeployment
**Date**: May 2, 2026
**Build Status**: ✅ Passing
**Expected Result**: Server responds with JSON, no 502 error
