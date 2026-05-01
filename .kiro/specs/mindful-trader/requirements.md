# Requirements Document

## Introduction

MindfulTrader is an AI-powered psychological trading journal that helps traders track their trades alongside their emotional and psychological state. The system analyzes how mindset impacts trading performance by correlating mood data with trade outcomes, providing AI-driven insights to improve trading discipline and profitability.

## Glossary

- **System**: The MindfulTrader web application
- **User**: A trader who uses the application to log and analyze trades
- **Trade**: A financial transaction involving buying or selling an asset
- **Mood**: The emotional or psychological state of the User at the time of a trade (Calm, Anxious, Greedy, Disciplined, Fearful)
- **Asset**: A financial instrument being traded (e.g., stocks, crypto, forex)
- **Entry_Price**: The price at which a User enters a trade
- **Exit_Price**: The price at which a User exits a trade
- **Trade_Type**: The direction of a trade (Long/Buy or Short/Sell)
- **Profit_Loss**: The financial result of a trade calculated from Entry_Price and Exit_Price
- **Dashboard**: The main interface displaying trade summaries and analytics
- **AI_Insights_Engine**: The component that analyzes trade history and generates pattern-based insights
- **Authentication_Service**: The component that manages user signup, login, and session management

## Requirements

### Requirement 1: User Authentication

**User Story:** As a trader, I want to create an account and securely log in, so that my trading data remains private and accessible only to me.

#### Acceptance Criteria

1. THE Authentication_Service SHALL provide a signup interface accepting email and password
2. WHEN a User submits valid signup credentials, THE Authentication_Service SHALL create a new user account
3. WHEN a User submits invalid signup credentials, THE Authentication_Service SHALL return a descriptive error message
4. THE Authentication_Service SHALL provide a login interface accepting email and password
5. WHEN a User submits valid login credentials, THE Authentication_Service SHALL create a secure session
6. WHEN a User submits invalid login credentials, THE Authentication_Service SHALL return an authentication error
7. THE Authentication_Service SHALL maintain user sessions across page refreshes
8. WHEN a User logs out, THE Authentication_Service SHALL terminate the user session

### Requirement 2: Trade Logging

**User Story:** As a trader, I want to log my trades with associated emotional states, so that I can track both financial and psychological aspects of my trading.

#### Acceptance Criteria

1. THE System SHALL provide a trade entry form with fields for Asset, Entry_Price, Exit_Price, Trade_Type, Mood, and optional notes
2. WHEN a User submits a trade with all required fields, THE System SHALL store the trade with a timestamp
3. WHEN a User submits a trade with missing required fields, THE System SHALL return a validation error
4. THE System SHALL calculate Profit_Loss from Entry_Price and Exit_Price automatically
5. THE System SHALL provide exactly five Mood options: Calm, Anxious, Greedy, Disciplined, Fearful
6. WHEN a User enters Entry_Price and Exit_Price, THE System SHALL validate that both are positive numbers
7. THE System SHALL associate each trade with the authenticated User
8. THE System SHALL allow optional text notes up to 500 characters per trade

### Requirement 3: Dashboard Display

**User Story:** As a trader, I want to view my recent trades and overall performance metrics, so that I can quickly assess my trading activity.

#### Acceptance Criteria

1. THE Dashboard SHALL display the 10 most recent trades for the authenticated User
2. THE Dashboard SHALL display total Profit_Loss across all trades for the authenticated User
3. THE Dashboard SHALL provide filtering by Mood
4. WHEN a User selects a Mood filter, THE Dashboard SHALL display only trades matching that Mood
5. THE Dashboard SHALL provide filtering by Asset
6. WHEN a User selects an Asset filter, THE Dashboard SHALL display only trades for that Asset
7. THE Dashboard SHALL display each trade with Asset, Entry_Price, Exit_Price, Trade_Type, Mood, Profit_Loss, and timestamp
8. THE Dashboard SHALL update immediately when a new trade is logged

### Requirement 4: AI Insights Generation

**User Story:** As a trader, I want AI-generated insights about my trading patterns, so that I can understand how my emotions affect my profitability.

#### Acceptance Criteria

1. THE AI_Insights_Engine SHALL analyze the relationship between Mood and Profit_Loss across all trades
2. WHEN a User has at least 10 trades, THE AI_Insights_Engine SHALL generate insights
3. WHEN a User has fewer than 10 trades, THE System SHALL display a message indicating insufficient data
4. THE AI_Insights_Engine SHALL identify which Mood states correlate with positive Profit_Loss
5. THE AI_Insights_Engine SHALL identify which Mood states correlate with negative Profit_Loss
6. THE AI_Insights_Engine SHALL generate natural language insights describing patterns
7. THE System SHALL display AI-generated insights on the Dashboard
8. THE AI_Insights_Engine SHALL update insights when new trades are added

### Requirement 5: Data Visualization

**User Story:** As a trader, I want to see visual charts of my performance, so that I can quickly identify trends and patterns in my trading behavior.

#### Acceptance Criteria

1. THE System SHALL display a chart showing Profit_Loss grouped by Mood
2. THE System SHALL display a chart showing performance trends over time
3. WHEN a User has no trades, THE System SHALL display an empty state message
4. THE System SHALL use a charting library (Recharts or Chart.js) for visualizations
5. THE System SHALL display aggregate Profit_Loss for each Mood category
6. THE System SHALL display a time-series chart with date on the x-axis and cumulative Profit_Loss on the y-axis
7. THE System SHALL update charts immediately when new trades are logged
8. THE System SHALL use distinct colors for each Mood category in visualizations

### Requirement 6: Data Persistence

**User Story:** As a trader, I want my trade data to be reliably stored, so that I can access my historical data at any time.

#### Acceptance Criteria

1. THE System SHALL store all trade data in a database (MongoDB or Supabase)
2. THE System SHALL store user authentication data securely with hashed passwords
3. WHEN a User logs a trade, THE System SHALL persist the trade within 2 seconds
4. THE System SHALL maintain data integrity across all user sessions
5. THE System SHALL associate each trade with the correct User account
6. THE System SHALL retrieve trade history within 1 second when loading the Dashboard
7. THE System SHALL handle database connection failures gracefully with error messages

### Requirement 7: Responsive User Interface

**User Story:** As a trader, I want a clean and simple interface that works on different devices, so that I can log trades from my desktop or mobile device.

#### Acceptance Criteria

1. THE System SHALL use React and Tailwind CSS for the user interface
2. THE System SHALL provide a responsive layout that adapts to screen sizes from 320px to 1920px width
3. THE System SHALL display all forms and charts legibly on mobile devices
4. THE System SHALL maintain consistent styling across all pages
5. THE System SHALL provide clear visual feedback for user actions (button clicks, form submissions)
6. WHEN a User submits a form, THE System SHALL display loading indicators during processing
7. THE System SHALL display error messages in a visually distinct manner
8. THE System SHALL use a clean, minimal design aesthetic

### Requirement 8: API Architecture

**User Story:** As a developer, I want a well-structured API, so that the frontend and backend communicate efficiently and the system is maintainable.

#### Acceptance Criteria

1. THE System SHALL implement a RESTful API using Node.js and Express
2. THE System SHALL provide an endpoint POST /api/auth/signup for user registration
3. THE System SHALL provide an endpoint POST /api/auth/login for user authentication
4. THE System SHALL provide an endpoint POST /api/auth/logout for session termination
5. THE System SHALL provide an endpoint POST /api/trades for creating trades
6. THE System SHALL provide an endpoint GET /api/trades for retrieving trades with optional query parameters for filtering
7. THE System SHALL provide an endpoint GET /api/insights for retrieving AI-generated insights
8. THE System SHALL require authentication for all endpoints except signup and login
9. WHEN an unauthenticated User accesses a protected endpoint, THE System SHALL return a 401 Unauthorized error
10. THE System SHALL return appropriate HTTP status codes for all responses

### Requirement 9: MVP Scope and Future Scalability

**User Story:** As a product owner, I want to deliver a working MVP quickly while ensuring the architecture supports future AI enhancements, so that we can validate the concept and iterate.

#### Acceptance Criteria

1. THE System SHALL implement all core features (authentication, trade logging, dashboard, basic insights, visualization) in the MVP
2. THE System SHALL use a modular code structure separating frontend components, backend routes, and database models
3. THE System SHALL design the AI_Insights_Engine with extensibility for future machine learning models
4. THE System SHALL document the codebase with clear comments and README files
5. THE System SHALL use environment variables for configuration (database URLs, API keys)
6. THE System SHALL provide a clear separation between business logic and presentation layers
7. THE System SHALL implement error handling and logging throughout the application

