# Railway 502 Error - Complete Troubleshooting Guide

## Changes Made

### 1. Improved Error Handling
- Added uncaught exception handlers
- Added unhandled rejection handlers
- Added server error event handler
- Better logging throughout startup process

### 2. Fixed CORS Configuration
- Changed from throwing error to returning false (prevents crashes)
- More lenient origin matching with `startsWith()`

### 3. Added Multiple Health Check Endpoints
- `/` - Root endpoint (JSON response)
- `/ping` - Simple text response (no database)
- `/health` - Detailed health with database status

### 4. Session Middleware Fix
- Using `require()` to load session after database connects
- Prevents import-time initialization issues

### 5. Added Procfile
- Explicit web process definition for Railway

---

## Debugging Steps

### Step 1: Check Railway Deploy Logs

In Railway dashboard, click on "Deploy Logs" tab and look for:

**✅ Success indicators:**
```
Starting MindfulTrader API server...
Connecting to database...
Database connection successful
Initializing session store...
Session store initialized
✅ Server started successfully on port 8000
✅ Server is ready to accept connections
```

**❌ Error indicators:**
```
Failed to start server:
Error: DATABASE_URL environment variable is not defined
MongooseError: ...
EADDRINUSE: ...
```

### Step 2: Test Endpoints

Try these URLs in order:

1. **Simple ping** (no database required):
   ```
   https://mindfultrader-production.up.railway.app/ping
   ```
   Expected: `pong`

2. **Root endpoint**:
   ```
   https://mindfultrader-production.up.railway.app/
   ```
   Expected: JSON with API info

3. **Health check**:
   ```
   https://mindfultrader-production.up.railway.app/health
   ```
   Expected: JSON with database status

### Step 3: Check Environment Variables

In Railway dashboard, verify these are set:

```
✅ DATABASE_URL (MongoDB connection string)
✅ SESSION_SECRET (random string)
✅ NODE_ENV=production
✅ FRONTEND_URL (your frontend URL)
```

**Note**: Railway sets `PORT` automatically - don't set it manually!

---

## Common Issues & Solutions

### Issue 1: Database Connection Timeout

**Symptoms**: Logs show "Connecting to database..." but never "Database connection successful"

**Solutions**:
1. Check DATABASE_URL is correct
2. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Check MongoDB Atlas cluster is running
4. Try connecting to MongoDB from your local machine with the same URL

**Fix MongoDB Atlas Network Access**:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
3. Save and wait 2-3 minutes

### Issue 2: Session Store Error

**Symptoms**: Logs show "Initializing session store..." but crashes after

**Solutions**:
1. Verify DATABASE_URL is accessible
2. Check MongoDB user has read/write permissions
3. Try a simpler session configuration (see below)

**Temporary Fix** - Disable session store:
```typescript
// In src/config/session.ts, comment out MongoStore:
store: undefined, // MongoStore.create({ ... }),
```

### Issue 3: Port Binding Error

**Symptoms**: `EADDRINUSE` error in logs

**Solutions**:
1. Railway should handle this automatically
2. Make sure you're not setting PORT environment variable manually
3. Restart the deployment

### Issue 4: Module Not Found

**Symptoms**: `Cannot find module` errors

**Solutions**:
1. Check `npm run build` completes successfully locally
2. Verify all dependencies are in `dependencies` (not `devDependencies`)
3. Clear Railway build cache and redeploy

### Issue 5: CORS Errors (After 502 is fixed)

**Symptoms**: Frontend can't connect, CORS errors in browser console

**Solutions**:
1. Set FRONTEND_URL in Railway to your actual frontend URL
2. Make sure frontend sends `credentials: 'include'` in fetch requests
3. Check frontend URL doesn't have trailing slash

---

## Emergency Fallback: Minimal Server

If nothing works, try this minimal server to isolate the issue:

Create `backend/src/server-minimal.ts`:
```typescript
import express from 'express';
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.get('/', (req, res) => {
  res.send('Minimal server works!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server on port ${PORT}`);
});
```

Update `package.json`:
```json
"start": "node dist/server-minimal.js"
```

If this works, the issue is in your main server code.

---

## Railway Configuration Checklist

- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Node version: 22.2.2 (or latest LTS)
- [ ] Region: us-west2 (or closest to your MongoDB)
- [ ] Environment variables set (DATABASE_URL, SESSION_SECRET, NODE_ENV, FRONTEND_URL)
- [ ] MongoDB Atlas allows connections from 0.0.0.0/0
- [ ] Latest code pushed to GitHub
- [ ] Build logs show successful compilation
- [ ] Deploy logs show server starting

---

## Next Steps

1. **Push these changes**:
   ```bash
   git add .
   git commit -m "Fix Railway 502 - improved error handling and health checks"
   git push
   ```

2. **Watch Railway Deploy Logs**:
   - Look for the ✅ success messages
   - Look for any error messages
   - Note where it fails (database? session? server start?)

3. **Test endpoints**:
   - Try `/ping` first (simplest)
   - Then `/` (root)
   - Then `/health` (with database)

4. **Share the logs**:
   - If still failing, copy the Deploy Logs
   - Share the exact error message
   - We'll debug from there

---

## Files Modified

1. ✅ `backend/src/server.ts` - Complete rewrite with better error handling
2. ✅ `backend/Procfile` - Added for Railway
3. ✅ Build successful

---

**Status**: Ready for deployment
**Next**: Push and watch Railway logs carefully
