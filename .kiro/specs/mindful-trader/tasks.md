# Implementation Plan: MindfulTrader

## Overview

This implementation plan breaks down the MindfulTrader application into discrete, actionable coding tasks. The application is a full-stack web application with a React frontend, Node.js/Express backend, and MongoDB/Supabase database. The implementation follows a bottom-up approach, building core services first, then API layer, then frontend components, and finally integration.

**Technology Stack:**
- **Frontend**: React 18+, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js 18+, Express 4.x, TypeScript
- **Database**: MongoDB (recommended) or Supabase
- **Testing**: Jest, React Testing Library, Supertest, Playwright

**Implementation Strategy:**
- Build backend services and API first (enables frontend development)
- Implement authentication early (required for all protected features)
- Develop frontend components incrementally
- Add testing as sub-tasks under implementation tasks
- Include checkpoints for validation and user feedback

## Tasks

- [x] 1. Project setup and configuration
  - Initialize project structure with separate frontend and backend directories
  - Set up TypeScript configuration for both frontend and backend
  - Configure ESLint and Prettier for code quality
  - Create package.json files with all required dependencies
  - Set up environment variable configuration (.env files)
  - Create README.md with setup instructions
  - _Requirements: 9.2, 9.5_

- [x] 2. Database setup and data models
  - [x] 2.1 Set up database connection
    - Configure MongoDB or Supabase connection
    - Implement connection pooling
    - Add connection error handling
    - _Requirements: 6.1, 6.7_
  
  - [x] 2.2 Create User data model
    - Define User schema/interface with id, email, passwordHash, timestamps
    - Add email uniqueness constraint
    - Implement model validation
    - _Requirements: 1.1, 6.2_
  
  - [x] 2.3 Create Trade data model
    - Define Trade schema/interface with all required fields
    - Add userId foreign key relationship
    - Implement field validation (positive prices, mood enum, notes length)
    - Add indexes on userId and timestamp
    - _Requirements: 2.1, 2.5, 2.6, 6.1_
  
  - [x] 2.4 Create Session data model
    - Define Session schema/interface
    - Add userId foreign key relationship
    - Add index on expiresAt for cleanup queries
    - _Requirements: 1.7, 6.1_
  
  - [x] 2.5 Create Insight data model
    - Define Insight schema/interface
    - Define MoodCorrelation interface
    - Add userId foreign key relationship
    - _Requirements: 4.6, 6.1_
  
  - [ ]* 2.6 Write unit tests for data models
    - Test User model validation (email format, required fields)
    - Test Trade model validation (positive prices, mood enum, notes length)
    - Test Session model validation
    - Test Insight model validation
    - _Requirements: 6.1, 6.2_

- [x] 3. Checkpoint - Verify database setup
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Authentication Service implementation
  - [x] 4.1 Implement password hashing utilities
    - Create hashPassword function using bcrypt (10 rounds)
    - Create verifyPassword function for password comparison
    - _Requirements: 1.1, 6.2_
  
  - [x] 4.2 Implement signup functionality
    - Create signup method accepting email and password
    - Validate email format and password requirements
    - Hash password before storing
    - Create new user in database
    - Handle duplicate email errors
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 4.3 Implement login functionality
    - Create login method accepting email and password
    - Verify credentials against database
    - Create session on successful authentication
    - Return session ID and user data
    - Handle invalid credentials
    - _Requirements: 1.4, 1.5, 1.6_
  
  - [x] 4.4 Implement session management
    - Create session creation method
    - Create session validation method
    - Create logout method to terminate sessions
    - Implement session expiration (7 days)
    - _Requirements: 1.7, 1.8_
  
  - [ ]* 4.5 Write unit tests for Authentication Service
    - Test hashPassword produces valid bcrypt hash
    - Test verifyPassword with matching and non-matching passwords
    - Test signup with valid and invalid inputs
    - Test login with valid and invalid credentials
    - Test session creation and validation
    - Test logout terminates session
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 5. Trade Service implementation
  - [x] 5.1 Implement profit/loss calculation
    - Create calculateProfitLoss function
    - Handle long trades: exitPrice - entryPrice
    - Handle short trades: entryPrice - exitPrice
    - _Requirements: 2.4_
  
  - [x] 5.2 Implement trade input validation
    - Create validateTradeInput function
    - Validate all required fields present
    - Validate prices are positive numbers
    - Validate mood is one of five allowed values
    - Validate notes length (max 500 characters)
    - Return descriptive validation errors
    - _Requirements: 2.1, 2.3, 2.5, 2.6, 2.8_
  
  - [x] 5.3 Implement createTrade method
    - Accept userId and trade data
    - Validate input using validateTradeInput
    - Calculate profit/loss automatically
    - Add timestamp
    - Store trade in database
    - Associate trade with authenticated user
    - Return created trade
    - _Requirements: 2.1, 2.2, 2.4, 2.7, 6.3_
  
  - [x] 5.4 Implement getTrades method
    - Accept userId and optional filters (mood, asset, limit)
    - Query database for user's trades
    - Apply mood filter if provided
    - Apply asset filter if provided
    - Apply limit (default 10)
    - Sort by timestamp descending
    - Return trades array
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 6.6_
  
  - [ ]* 5.5 Write unit tests for Trade Service
    - Test calculateProfitLoss with long trades (positive and negative)
    - Test calculateProfitLoss with short trades (positive and negative)
    - Test validateTradeInput with valid data
    - Test validateTradeInput with missing fields
    - Test validateTradeInput with negative prices
    - Test validateTradeInput with invalid mood
    - Test validateTradeInput with notes exceeding 500 chars
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.8_

- [x] 6. AI Insights Engine implementation
  - [x] 6.1 Implement mood correlation analysis
    - Create analyzeMoodCorrelation function
    - Group trades by mood
    - Calculate total P/L per mood
    - Calculate average P/L per mood
    - Count trades per mood
    - Rank moods by profitability
    - Return MoodCorrelation array
    - _Requirements: 4.1, 4.4, 4.5_
  
  - [x] 6.2 Implement pattern identification
    - Create identifyPatterns function
    - Identify best performing mood (highest avg P/L)
    - Identify worst performing mood (lowest avg P/L)
    - Return pattern insights
    - _Requirements: 4.4, 4.5_
  
  - [x] 6.3 Implement insight text generation
    - Create formatInsightText function
    - Generate natural language descriptions
    - Format mood correlation data into readable insights
    - _Requirements: 4.6_
  
  - [x] 6.4 Implement generateInsights method
    - Accept userId
    - Fetch all user's trades from database
    - Check if user has at least 10 trades
    - Return empty array if insufficient data
    - Call analyzeMoodCorrelation if sufficient data
    - Call identifyPatterns to find key patterns
    - Call formatInsightText to generate descriptions
    - Store insights in database
    - Return insights array
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.8_
  
  - [ ]* 6.5 Write unit tests for AI Insights Engine
    - Test analyzeMoodCorrelation with 10+ trades across all moods
    - Test analyzeMoodCorrelation with trades in only 2-3 moods
    - Test identifyPatterns identifies best performing mood
    - Test identifyPatterns identifies worst performing mood
    - Test formatInsightText generates readable text
    - Test generateInsights returns empty when < 10 trades
    - Test generateInsights generates insights when ≥ 10 trades
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 7. Checkpoint - Verify backend services
  - Ensure all tests pass, ask the user if questions arise.

- [-] 8. Express API setup and middleware
  - [x] 8.1 Set up Express server
    - Initialize Express application
    - Configure JSON body parser
    - Configure CORS for frontend
    - Set up error handling middleware
    - Configure session middleware
    - Add security headers (Helmet.js)
    - _Requirements: 8.1, 9.5_
  
  - [x] 8.2 Create authentication middleware
    - Implement requireAuth middleware
    - Validate session from cookie
    - Attach user to request object
    - Return 401 for invalid/missing session
    - _Requirements: 8.8, 8.9_
  
  - [ ] 8.3 Create error handling middleware
    - Implement global error handler
    - Format error responses consistently
    - Log errors with context
    - Return appropriate HTTP status codes
    - _Requirements: 8.10, 9.7_

- [x] 9. Authentication API endpoints
  - [x] 9.1 Implement POST /api/auth/signup
    - Create route handler
    - Extract email and password from request body
    - Call AuthService.signup
    - Handle validation errors (400)
    - Handle duplicate email errors (409)
    - Return user data and success message (201)
    - _Requirements: 1.1, 1.2, 1.3, 8.2_
  
  - [x] 9.2 Implement POST /api/auth/login
    - Create route handler
    - Extract email and password from request body
    - Call AuthService.login
    - Set session cookie
    - Handle invalid credentials (401)
    - Return user data and session ID (200)
    - _Requirements: 1.4, 1.5, 1.6, 8.3_
  
  - [x] 9.3 Implement POST /api/auth/logout
    - Create route handler
    - Extract session ID from cookie
    - Call AuthService.logout
    - Clear session cookie
    - Return success message (200)
    - _Requirements: 1.8, 8.4_
  
  - [ ]* 9.4 Write integration tests for auth endpoints
    - Test POST /api/auth/signup creates user with valid data
    - Test POST /api/auth/signup returns 409 for duplicate email
    - Test POST /api/auth/signup returns 400 for invalid email
    - Test POST /api/auth/login returns session for valid credentials
    - Test POST /api/auth/login returns 401 for invalid credentials
    - Test POST /api/auth/logout terminates session
    - Test session persists across requests
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8_

- [x] 10. Trade API endpoints
  - [x] 10.1 Implement POST /api/trades
    - Create route handler with requireAuth middleware
    - Extract trade data from request body
    - Get userId from authenticated user
    - Call TradeService.createTrade
    - Trigger InsightsEngine.generateInsights asynchronously
    - Handle validation errors (400)
    - Return created trade and success message (201)
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.8, 4.8, 8.5, 8.8_
  
  - [x] 10.2 Implement GET /api/trades
    - Create route handler with requireAuth middleware
    - Get userId from authenticated user
    - Extract query parameters (mood, asset, limit)
    - Call TradeService.getTrades with filters
    - Return trades array and count (200)
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 8.6, 8.8_
  
  - [ ]* 10.3 Write integration tests for trade endpoints
    - Test POST /api/trades creates trade with valid data
    - Test POST /api/trades returns 401 without authentication
    - Test POST /api/trades returns 400 for missing required fields
    - Test POST /api/trades calculates P/L correctly
    - Test GET /api/trades returns user's trades only
    - Test GET /api/trades filters by mood parameter
    - Test GET /api/trades filters by asset parameter
    - Test GET /api/trades limits results to 10 by default
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.3, 3.4, 3.5, 3.6, 8.5, 8.6, 8.8_

- [x] 11. Insights API endpoint
  - [x] 11.1 Implement GET /api/insights
    - Create route handler with requireAuth middleware
    - Get userId from authenticated user
    - Call InsightsEngine.generateInsights
    - Get trade count for user
    - Return insights, trade count, and hasMinimumData flag (200)
    - _Requirements: 4.1, 4.2, 4.3, 4.7, 8.7, 8.8_
  
  - [ ]* 11.2 Write integration tests for insights endpoint
    - Test GET /api/insights returns empty with < 10 trades
    - Test GET /api/insights generates insights with ≥ 10 trades
    - Test GET /api/insights returns 401 without authentication
    - Test insights update after new trade is created
    - _Requirements: 4.1, 4.2, 4.3, 4.7, 4.8, 8.7, 8.8_

- [x] 12. Checkpoint - Verify backend API
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Frontend project setup
  - Initialize React application with TypeScript
  - Configure Tailwind CSS
  - Install Recharts for data visualization
  - Install Axios for API calls
  - Set up React Router for navigation
  - Create basic app structure and routing
  - Configure API base URL from environment variables
  - _Requirements: 7.1, 9.5_

- [x] 14. Authentication components
  - [x] 14.1 Create LoginForm component
    - Create component with email and password inputs
    - Implement form state management
    - Implement handleSubmit to call POST /api/auth/login
    - Display loading indicator during submission
    - Display error messages for invalid credentials
    - Call onLoginSuccess callback on success
    - _Requirements: 1.4, 1.5, 1.6, 7.5, 7.6, 7.7_
  
  - [x] 14.2 Create SignupForm component
    - Create component with email, password, and confirm password inputs
    - Implement form state management
    - Implement password validation (minimum 8 characters)
    - Implement handleSubmit to call POST /api/auth/signup
    - Display loading indicator during submission
    - Display error messages for validation errors
    - Call onSignupSuccess callback on success
    - _Requirements: 1.1, 1.2, 1.3, 7.5, 7.6, 7.7_
  
  - [x] 14.3 Create authentication context
    - Create AuthContext for global auth state
    - Implement login, logout, and session validation
    - Store authenticated user data
    - Provide authentication status to components
    - _Requirements: 1.7_
  
  - [ ]* 14.4 Write component tests for authentication
    - Test LoginForm validates required fields
    - Test LoginForm displays error for invalid credentials
    - Test SignupForm validates password requirements
    - Test SignupForm displays validation errors
    - Test AuthContext maintains session state
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 15. Trade management components
  - [x] 15.1 Create TradeForm component
    - Create form with fields: asset, entryPrice, exitPrice, tradeType, mood, notes
    - Implement form state management
    - Implement calculateProfitLoss for preview display
    - Implement validatePrices for positive number validation
    - Implement handleSubmit to call POST /api/trades
    - Display loading indicator during submission
    - Display validation errors inline
    - Call onTradeCreated callback on success
    - Clear form after successful submission
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.8, 7.5, 7.6, 7.7_
  
  - [x] 15.2 Create TradeList component
    - Accept trades array as prop
    - Implement mood filter dropdown
    - Implement asset filter dropdown
    - Implement applyFilters method
    - Implement renderTrade to display individual trades
    - Display trade details: asset, prices, type, mood, P/L, timestamp
    - Update when onFilterChange callback is called
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [ ]* 15.3 Write component tests for trade management
    - Test TradeForm validates required fields before submission
    - Test TradeForm displays P/L preview as user types
    - Test TradeForm shows error messages for invalid input
    - Test TradeList filters trades by selected mood
    - Test TradeList filters trades by selected asset
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 3.3, 3.4, 3.5, 3.6_

- [x] 16. Dashboard components
  - [x] 16.1 Create MetricsSummary component
    - Accept trades array as prop
    - Calculate totalProfitLoss from all trades
    - Calculate tradeCount
    - Calculate winRate (percentage of profitable trades)
    - Display metrics in formatted layout
    - _Requirements: 3.2_
  
  - [x] 16.2 Create Dashboard component
    - Implement component state for trades, insights, loading, error
    - Implement fetchDashboardData to call GET /api/trades and GET /api/insights
    - Implement handleTradeCreated to refresh data
    - Display MetricsSummary with trades data
    - Display TradeList with trades data
    - Display InsightsPanel with insights data
    - Display charts with trades data
    - Display loading state while fetching
    - Display error messages on failure
    - Update immediately when new trade is logged
    - _Requirements: 3.1, 3.2, 3.7, 3.8, 4.7, 6.6_
  
  - [ ]* 16.3 Write component tests for dashboard
    - Test MetricsSummary calculates total P/L correctly
    - Test MetricsSummary calculates win rate correctly
    - Test Dashboard fetches data on mount
    - Test Dashboard updates after new trade
    - Test Dashboard displays loading state
    - Test Dashboard displays error messages
    - _Requirements: 3.1, 3.2, 3.7, 3.8_

- [-] 17. Data visualization components
  - [x] 17.1 Create MoodPerformanceChart component
    - Accept trades array as prop
    - Implement aggregateByMood to group trades and sum P/L
    - Implement formatChartData for Recharts
    - Create bar chart showing P/L by mood
    - Use distinct colors for each mood category
    - Display empty state message when no trades
    - Update when trades prop changes
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.7, 5.8_
  
  - [ ] 17.2 Create PerformanceTrendChart component
    - Accept trades array as prop
    - Implement calculateCumulativePL for running total
    - Implement formatTimeSeriesData for Recharts
    - Create line chart with date on x-axis and cumulative P/L on y-axis
    - Display empty state message when no trades
    - Update when trades prop changes
    - _Requirements: 5.2, 5.3, 5.4, 5.6, 5.7_
  
  - [ ]* 17.3 Write component tests for visualizations
    - Test MoodPerformanceChart aggregates P/L by mood correctly
    - Test MoodPerformanceChart displays empty state with no trades
    - Test PerformanceTrendChart calculates cumulative P/L correctly
    - Test PerformanceTrendChart displays empty state with no trades
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_

- [x] 18. Insights display component
  - [x] 18.1 Create InsightsPanel component
    - Accept insights array and tradeCount as props
    - Implement renderInsight to format insight text
    - Implement renderInsufficientDataMessage for < 10 trades
    - Display insights when hasMinimumData is true
    - Display insufficient data message when < 10 trades
    - Update when insights prop changes
    - _Requirements: 4.2, 4.3, 4.6, 4.7_
  
  - [ ]* 18.2 Write component tests for insights
    - Test InsightsPanel shows insufficient data message when < 10 trades
    - Test InsightsPanel displays insights when ≥ 10 trades
    - Test InsightsPanel formats insight text correctly
    - _Requirements: 4.2, 4.3, 4.6, 4.7_

- [ ] 19. Responsive design implementation
  - [ ] 19.1 Implement responsive layouts
    - Apply Tailwind responsive classes to all components
    - Test layouts at 320px, 768px, 1024px, 1920px widths
    - Ensure forms are usable on mobile devices
    - Ensure charts render correctly on mobile
    - Ensure navigation works on mobile
    - _Requirements: 7.2, 7.3, 7.4, 7.8_
  
  - [ ] 19.2 Apply consistent styling
    - Create shared Tailwind utility classes
    - Apply consistent color scheme across all pages
    - Style buttons with hover and active states
    - Style form inputs with focus states
    - Style error messages in visually distinct manner
    - _Requirements: 7.4, 7.5, 7.7, 7.8_

- [ ] 20. Checkpoint - Verify frontend components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Integration and wiring
  - [ ] 21.1 Connect frontend to backend API
    - Configure Axios with base URL
    - Implement API interceptors for authentication
    - Implement API error handling
    - Test all API calls end-to-end
    - _Requirements: 8.1, 8.8, 8.9_
  
  - [ ] 21.2 Implement routing and navigation
    - Set up React Router routes for login, signup, dashboard
    - Implement protected routes requiring authentication
    - Implement navigation between pages
    - Redirect to login on session expiration
    - _Requirements: 1.7, 7.4_
  
  - [ ] 21.3 Wire dashboard data flow
    - Connect Dashboard to TradeForm for trade creation
    - Connect Dashboard to TradeList for trade display
    - Connect Dashboard to charts for visualization
    - Connect Dashboard to InsightsPanel for insights display
    - Ensure real-time updates after trade creation
    - _Requirements: 3.7, 3.8, 4.7, 4.8, 5.7_

- [ ] 22. End-to-end testing
  - [ ]* 22.1 Write E2E test for new user signup and first trade
    - Test user navigates to signup page
    - Test user enters email and password
    - Test user is redirected to dashboard after signup
    - Test dashboard shows empty state
    - Test user clicks "Log Trade" button
    - Test user fills trade form with all fields
    - Test user submits trade
    - Test dashboard updates with new trade
    - Test insufficient data message shown for insights
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.8, 4.3_
  
  - [ ]* 22.2 Write E2E test for returning user login and trade logging
    - Test user navigates to login page
    - Test user enters credentials
    - Test user is redirected to dashboard
    - Test dashboard shows previous trades
    - Test user logs multiple trades
    - Test dashboard updates in real-time
    - _Requirements: 1.4, 1.5, 2.1, 2.2, 3.1, 3.8_
  
  - [ ]* 22.3 Write E2E test for dashboard filtering and visualization
    - Test user selects mood filter
    - Test trade list updates to show only selected mood
    - Test user selects asset filter
    - Test trade list updates to show only selected asset
    - Test charts display correctly
    - Test charts update when filters change
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 5.1, 5.2, 5.7_
  
  - [ ]* 22.4 Write E2E test for AI insights generation
    - Test user logs 10th trade
    - Test insights panel updates automatically
    - Test insights display mood correlations
    - Test insights identify best/worst moods
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 4.8_
  
  - [ ]* 22.5 Write E2E test for responsive design
    - Test application loads on mobile viewport (375px)
    - Test forms are usable on mobile
    - Test charts render correctly on mobile
    - Test navigation works on mobile
    - _Requirements: 7.2, 7.3_
  
  - [ ]* 22.6 Write E2E test for error handling
    - Test invalid login shows error message
    - Test form validation prevents invalid submission
    - Test network errors display user-friendly messages
    - Test session expiration redirects to login
    - _Requirements: 1.3, 1.6, 2.3, 6.7, 7.7_

- [ ] 23. Documentation and deployment preparation
  - [ ] 23.1 Create comprehensive README
    - Document project overview and features
    - Document technology stack
    - Document setup instructions (dependencies, environment variables)
    - Document how to run development servers
    - Document how to run tests
    - Document deployment instructions
    - _Requirements: 9.4_
  
  - [ ] 23.2 Set up environment configuration
    - Create .env.example files for frontend and backend
    - Document all required environment variables
    - Document database connection strings
    - Document session secret configuration
    - Document API URL configuration
    - _Requirements: 9.5_
  
  - [ ] 23.3 Add code comments and documentation
    - Add JSDoc comments to all public functions
    - Add inline comments for complex logic
    - Document API endpoint contracts
    - Document component props and interfaces
    - _Requirements: 9.4_

- [ ] 24. Final checkpoint - Complete system verification
  - Run all unit tests and verify they pass
  - Run all integration tests and verify they pass
  - Run all E2E tests and verify they pass
  - Test complete user workflows manually
  - Verify responsive design on multiple devices
  - Verify error handling for all edge cases
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- **Tasks marked with `*` are optional** and can be skipped for faster MVP delivery
- **Each task references specific requirements** for traceability back to requirements document
- **Checkpoints ensure incremental validation** at key milestones
- **Testing tasks are sub-tasks** under implementation tasks for better organization
- **TypeScript is used throughout** for type safety on both frontend and backend
- **Property-based testing is NOT included** as the design document explicitly states it's not applicable for this UI-focused application
- **Implementation follows bottom-up approach**: backend services → API → frontend components → integration
- **All context documents** (requirements, design) are available during implementation

## Implementation Guidance

**For the implementation agent:**
1. Follow tasks in sequential order for optimal dependency management
2. Each task builds on previous tasks - ensure prior tasks are complete before proceeding
3. Reference the design document for detailed interface specifications and algorithms
4. Reference the requirements document for acceptance criteria and validation rules
5. Run tests after each implementation task to catch errors early
6. Use checkpoints to validate progress and ask user for feedback
7. Optional tasks (marked with `*`) can be skipped if time is constrained, but are recommended for production quality

**Technology choices:**
- Use MongoDB for simpler setup, or Supabase if you prefer managed PostgreSQL with built-in auth
- Use Recharts for declarative React-friendly charts
- Use Jest + React Testing Library for frontend tests
- Use Jest + Supertest for backend API tests
- Use Playwright for E2E tests (or Cypress as alternative)

**Security reminders:**
- Always hash passwords with bcrypt before storing
- Use HTTP-only cookies for session storage
- Validate all inputs on both client and server
- Use parameterized queries to prevent injection attacks
- Apply rate limiting on authentication endpoints in production
