# MongoDB Setup Guide

You have two options for running MongoDB:

## Option 1: MongoDB Atlas (Cloud - Recommended for Quick Start) ⭐

This is the easiest option - no local installation needed!

### Steps:

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register

2. **Create a free account** (no credit card required)

3. **Create a free cluster**:
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select a cloud provider and region close to you
   - Click "Create Cluster"

4. **Create a database user**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `mindfultrader`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

5. **Whitelist your IP address**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

6. **Get your connection string**:
   - Go back to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://...`)

7. **Update your `.env` file**:
   ```bash
   cd backend
   ```
   
   Edit `backend/.env` and replace the DATABASE_URL line:
   ```
   DATABASE_URL=mongodb+srv://mindfultrader:<password>@cluster0.xxxxx.mongodb.net/mindfultrader?retryWrites=true&w=majority
   ```
   
   Replace:
   - `<password>` with your database user password
   - `cluster0.xxxxx` with your actual cluster address

8. **Start your backend**:
   ```bash
   npm run dev
   ```

✅ You should see: "Database connected successfully"

---

## Option 2: Local MongoDB Installation

### macOS Installation:

```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify it's running
brew services list
```

### Linux (Ubuntu/Debian) Installation:

```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### Windows Installation:

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer (.msi file)
3. Choose "Complete" installation
4. Install MongoDB as a Service (check the box)
5. Install MongoDB Compass (optional GUI tool)
6. MongoDB will start automatically

### Verify Local Installation:

```bash
# Check if MongoDB is running
mongosh

# You should see MongoDB shell
# Type 'exit' to quit
```

### Update `.env` for Local MongoDB:

The `.env` file is already configured for local MongoDB:
```
DATABASE_URL=mongodb://localhost:27017/mindfultrader
```

### Start your backend:

```bash
cd backend
npm run dev
```

✅ You should see: "Database connected successfully"

---

## Troubleshooting

### "command not found: mongod"
- MongoDB is not installed or not in your PATH
- Use **Option 1 (MongoDB Atlas)** for quickest setup

### "MongoServerError: Authentication failed"
- Check your username and password in the connection string
- Make sure you created a database user in Atlas

### "MongoNetworkError: connection refused"
- Local MongoDB: Make sure MongoDB service is running
- Atlas: Check your IP whitelist settings

### "Cannot init client. Please provide correct options"
- Make sure `.env` file exists in `backend/` directory
- Check that `DATABASE_URL` is set correctly
- Restart the server after changing `.env`

---

## Recommended: Use MongoDB Atlas (Option 1)

For this tutorial, I recommend **MongoDB Atlas** because:
- ✅ No local installation needed
- ✅ Free tier available
- ✅ Works on all operating systems
- ✅ Automatic backups
- ✅ Easy to share with team members
- ✅ Production-ready

---

## Next Steps

Once MongoDB is connected:

1. Test the backend:
   ```bash
   curl http://localhost:3000/health
   ```
   
   You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "database": "connected"
   }
   ```

2. Continue with frontend development!
