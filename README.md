# MindfulTrader - AI-Powered Psychological Trading Journal

MindfulTrader is a full-stack web application that helps traders track their trades alongside their emotional and psychological state, analyzing how mindset impacts trading performance through AI-driven insights.

## Features

- **User Authentication**: Secure signup/login with session management
- **Trade Logging**: Log trades with emotional context (mood, notes)
- **Analytics Dashboard**: View recent trades, filter by mood/asset, see performance metrics
- **AI Insights**: Pattern recognition correlating mood states with profitability
- **Data Visualization**: Charts showing performance by mood and over time
- **Responsive UI**: Clean, minimal interface working across devices

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API calls
- Vite for build tooling

### Backend
- Node.js 18+ with TypeScript
- Express 4.x web framework
- MongoDB with Mongoose ODM
- Bcrypt for password hashing
- Express-session for session management
- Joi for input validation

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ (local or MongoDB Atlas)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mindfultrader
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/mindfultrader
SESSION_SECRET=your-secret-key-change-this-in-production
SESSION_EXPIRY=604800000
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Start MongoDB

If running MongoDB locally:

```bash
mongod
```

Or use MongoDB Atlas and update the `DATABASE_URL` in backend `.env`.

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Running Tests

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
```

### Frontend Tests
```bash
cd frontend
npm test                # Run all tests
npm run test:ui         # Run tests with UI
```

## Project Structure

```
mindfultrader/
├── backend/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic services
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration files
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and create session
- `POST /api/auth/logout` - Logout and terminate session

### Trades
- `POST /api/trades` - Create a new trade
- `GET /api/trades` - Get user's trades (with optional filters)

### Insights
- `GET /api/insights` - Get AI-generated insights

## Environment Variables

### Backend
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - MongoDB connection string
- `SESSION_SECRET` - Secret key for session encryption
- `SESSION_EXPIRY` - Session expiration time in milliseconds
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend
- `VITE_API_URL` - Backend API base URL

## Development Workflow

1. Create a new branch for your feature
2. Make changes and write tests
3. Run tests to ensure they pass
4. Run linter: `npm run lint`
5. Format code: `npm run format`
6. Commit changes with descriptive message
7. Create pull request

## Deployment

### Backend Deployment (Example: Heroku)

```bash
cd backend
heroku create mindfultrader-api
heroku addons:create mongolab
heroku config:set SESSION_SECRET=your-production-secret
git push heroku main
```

### Frontend Deployment (Example: Vercel)

```bash
cd frontend
vercel --prod
```

Update `VITE_API_URL` in frontend environment to point to production backend.

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## Support

For issues and questions, please open an issue on GitHub.
