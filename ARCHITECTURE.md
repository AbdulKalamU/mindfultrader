# MindfulTrader - Architecture Diagrams

This document contains visual architecture diagrams using Mermaid to help understand the system design.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Frontend - Vercel CDN"
        React[React App<br/>TypeScript + Vite]
        Router[React Router]
        Context[Auth Context]
        API[Axios API Client]
    end
    
    subgraph "Backend - Railway"
        Express[Express Server<br/>Node.js + TypeScript]
        Auth[Auth Middleware]
        Routes[API Routes]
        Services[Business Logic]
        Models[Mongoose Models]
    end
    
    subgraph "Database - MongoDB Atlas"
        Users[(Users Collection)]
        Trades[(Trades Collection)]
        Insights[(Insights Collection)]
        Wallets[(Wallets Collection)]
        Sessions[(Sessions Collection)]
    end
    
    Browser --> React
    Mobile --> React
    React --> Router
    React --> Context
    React --> API
    API -->|HTTPS + Cookies| Express
    Express --> Auth
    Auth --> Routes
    Routes --> Services
    Services --> Models
    Models --> Users
    Models --> Trades
    Models --> Insights
    Models --> Wallets
    Models --> Sessions
```

---

## 2. Request Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant React
    participant Axios
    participant Express
    participant Middleware
    participant Service
    participant MongoDB
    
    User->>Browser: Clicks "Add Trade"
    Browser->>React: Trigger Form Submit
    React->>Axios: POST /api/trades
    Axios->>Express: HTTP Request + Session Cookie
    Express->>Middleware: Check Authentication
    Middleware->>MongoDB: Validate Session
    MongoDB-->>Middleware: Session Valid
    Middleware->>Service: Call TradeService.createTrade()
    Service->>MongoDB: Insert Trade Document
    MongoDB-->>Service: Trade Created
    Service->>Service: Trigger Insights Generation
    Service-->>Express: Return Trade Data
    Express-->>Axios: JSON Response
    Axios-->>React: Update State
    React-->>Browser: Re-render UI
    Browser-->>User: Show Success Message
```

---

## 3. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB
    
    rect rgb(200, 220, 240)
        Note over User,MongoDB: Signup Flow
        User->>Frontend: Enter Email & Password
        Frontend->>Backend: POST /api/auth/signup
        Backend->>Backend: Validate Input (Joi)
        Backend->>MongoDB: Check Email Exists
        MongoDB-->>Backend: Email Available
        Backend->>Backend: Hash Password (bcrypt)
        Backend->>MongoDB: Create User Document
        MongoDB-->>Backend: User Created
        Backend->>MongoDB: Create Session
        MongoDB-->>Backend: Session ID
        Backend-->>Frontend: Set Session Cookie
        Frontend->>Frontend: Store User in Context
        Frontend-->>User: Redirect to Dashboard
    end
    
    rect rgb(220, 240, 200)
        Note over User,MongoDB: Login Flow
        User->>Frontend: Enter Credentials
        Frontend->>Backend: POST /api/auth/login
        Backend->>MongoDB: Find User by Email
        MongoDB-->>Backend: User Document
        Backend->>Backend: Compare Password (bcrypt)
        Backend->>MongoDB: Create Session
        MongoDB-->>Backend: Session ID
        Backend-->>Frontend: Set Session Cookie
        Frontend->>Frontend: Store User in Context
        Frontend-->>User: Redirect to Dashboard
    end
```

---

## 4. Database Schema Relationships

```mermaid
erDiagram
    USER ||--o{ TRADE : creates
    USER ||--o{ INSIGHT : receives
    USER ||--|| WALLET : owns
    USER ||--o{ SESSION : has
    
    USER {
        ObjectId _id PK
        string email UK
        string password
        string username
        enum tradingStyle
        enum experienceLevel
        enum riskLevel
        date createdAt
        date updatedAt
    }
    
    TRADE {
        ObjectId _id PK
        ObjectId userId FK
        string asset
        number entryPrice
        number exitPrice
        enum tradeType
        enum mood
        string notes
        number profitLoss
        date timestamp
        array tags
        number rating
    }
    
    INSIGHT {
        ObjectId _id PK
        ObjectId userId FK
        string text
        array moodAnalysis
        array warnings
        array recommendations
        object analytics
        date generatedAt
    }
    
    WALLET {
        ObjectId _id PK
        ObjectId userId FK
        number balance
        string currency
        array transactions
        date createdAt
        date updatedAt
    }
    
    SESSION {
        string _id PK
        date expires
        object session
    }
```

---

## 5. Backend Architecture Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        Routes[API Routes]
        Middleware[Middleware]
    end
    
    subgraph "Business Logic Layer"
        AuthService[Auth Service]
        TradeService[Trade Service]
        InsightsEngine[Insights Engine]
    end
    
    subgraph "Data Access Layer"
        UserModel[User Model]
        TradeModel[Trade Model]
        InsightModel[Insight Model]
        WalletModel[Wallet Model]
    end
    
    subgraph "Infrastructure Layer"
        Database[Database Connection]
        Session[Session Store]
        Logger[Winston Logger]
    end
    
    Routes --> Middleware
    Middleware --> AuthService
    Middleware --> TradeService
    Middleware --> InsightsEngine
    
    AuthService --> UserModel
    TradeService --> TradeModel
    InsightsEngine --> InsightModel
    InsightsEngine --> TradeModel
    
    UserModel --> Database
    TradeModel --> Database
    InsightModel --> Database
    WalletModel --> Database
    
    Session --> Database
    
    Routes -.-> Logger
    AuthService -.-> Logger
    TradeService -.-> Logger
    InsightsEngine -.-> Logger
```

---

## 6. Frontend Component Architecture

```mermaid
graph TB
    subgraph "App Root"
        App[App.tsx]
        AuthProvider[Auth Context Provider]
    end
    
    subgraph "Routing"
        Router[React Router]
        ProtectedRoute[Protected Route]
    end
    
    subgraph "Pages"
        Login[Login Page]
        Signup[Signup Page]
        Dashboard[Dashboard Page]
        Profile[Profile Page]
        Wallet[Wallet Page]
    end
    
    subgraph "Dashboard Components"
        TradeForm[Trade Form]
        TradeList[Trade List]
        InsightsPanel[Insights Panel]
        AnalyticsPanel[Analytics Panel]
        AlertsPanel[Alerts Panel]
        MoodChart[Mood Performance Chart]
    end
    
    subgraph "Services"
        API[API Client - Axios]
        MarketData[Market Data Service]
    end
    
    App --> AuthProvider
    AuthProvider --> Router
    Router --> Login
    Router --> Signup
    Router --> ProtectedRoute
    ProtectedRoute --> Dashboard
    ProtectedRoute --> Profile
    ProtectedRoute --> Wallet
    
    Dashboard --> TradeForm
    Dashboard --> TradeList
    Dashboard --> InsightsPanel
    Dashboard --> AnalyticsPanel
    Dashboard --> AlertsPanel
    Dashboard --> MoodChart
    
    TradeForm --> API
    TradeList --> API
    InsightsPanel --> API
    Profile --> API
    Wallet --> API
    
    MoodChart --> MarketData
```

---

## 7. Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Developer]
        Git[Git Repository]
    end
    
    subgraph "CI/CD Pipeline"
        GitHub[GitHub<br/>Source Control]
        WebhookF[Vercel Webhook]
        WebhookB[Railway Webhook]
    end
    
    subgraph "Frontend Deployment - Vercel"
        VercelBuild[Build Process<br/>npm run build]
        VercelDist[Static Files<br/>dist/]
        VercelCDN[Global CDN]
    end
    
    subgraph "Backend Deployment - Railway"
        RailwayBuild[Build Process<br/>npm run build]
        RailwayDist[Compiled JS<br/>dist/]
        RailwayServer[Node.js Server<br/>Port 8000]
    end
    
    subgraph "Database - MongoDB Atlas"
        MongoCluster[MongoDB Cluster<br/>Cloud Database]
    end
    
    subgraph "Users"
        Browser[Web Browsers]
    end
    
    Dev -->|git push| Git
    Git --> GitHub
    GitHub -->|trigger| WebhookF
    GitHub -->|trigger| WebhookB
    
    WebhookF --> VercelBuild
    VercelBuild --> VercelDist
    VercelDist --> VercelCDN
    
    WebhookB --> RailwayBuild
    RailwayBuild --> RailwayDist
    RailwayDist --> RailwayServer
    
    Browser -->|HTTPS| VercelCDN
    VercelCDN -->|API Calls| RailwayServer
    RailwayServer -->|MongoDB Driver| MongoCluster
```

---

## 8. API Endpoint Structure

```mermaid
graph LR
    subgraph "Public Endpoints"
        Root[GET /]
        Ping[GET /ping]
        Health[GET /health]
        Signup[POST /api/auth/signup]
        Login[POST /api/auth/login]
    end
    
    subgraph "Protected Endpoints"
        Logout[POST /api/auth/logout]
        
        subgraph "Trades"
            GetTrades[GET /api/trades]
            CreateTrade[POST /api/trades]
        end
        
        subgraph "Insights"
            GetInsights[GET /api/insights]
        end
        
        subgraph "Profile"
            GetProfile[GET /api/user/profile]
            UpdateProfile[PUT /api/user/profile]
        end
        
        subgraph "Wallet"
            GetWallet[GET /api/wallet]
            Deposit[POST /api/wallet/deposit]
            Withdraw[POST /api/wallet/withdraw]
        end
    end
    
    Root -.->|No Auth| Response
    Ping -.->|No Auth| Response
    Health -.->|No Auth| Response
    Signup -.->|No Auth| Response
    Login -.->|No Auth| Response
    
    Logout -->|Requires Auth| Response
    GetTrades -->|Requires Auth| Response
    CreateTrade -->|Requires Auth| Response
    GetInsights -->|Requires Auth| Response
    GetProfile -->|Requires Auth| Response
    UpdateProfile -->|Requires Auth| Response
    GetWallet -->|Requires Auth| Response
    Deposit -->|Requires Auth| Response
    Withdraw -->|Requires Auth| Response
```

---

## 9. Session Management Flow

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Authenticating: POST /api/auth/login
    Authenticating --> Authenticated: Valid Credentials
    Authenticating --> Unauthenticated: Invalid Credentials
    
    Authenticated --> SessionActive: Session Created
    SessionActive --> SessionActive: API Requests
    SessionActive --> SessionExpired: TTL Exceeded (7 days)
    SessionActive --> Unauthenticated: POST /api/auth/logout
    
    SessionExpired --> Unauthenticated: Auto Cleanup
    
    note right of SessionActive
        Session stored in MongoDB
        Cookie sent with each request
        Validated by middleware
    end note
    
    note right of SessionExpired
        TTL index auto-deletes
        expired sessions
    end note
```

---

## 10. Insights Generation Algorithm

```mermaid
flowchart TD
    Start([User Creates Trade]) --> Trigger{Trigger Insights?}
    Trigger -->|Yes| FetchTrades[Fetch All User Trades]
    Trigger -->|No| End([End])
    
    FetchTrades --> CheckCount{Trades >= 5?}
    CheckCount -->|No| End
    CheckCount -->|Yes| GroupByMood[Group Trades by Mood]
    
    GroupByMood --> CalcStats[Calculate Statistics<br/>- Total P/L<br/>- Average P/L<br/>- Trade Count]
    
    CalcStats --> RankMoods[Rank Moods<br/>1 = Best<br/>5 = Worst]
    
    RankMoods --> DetectPatterns[Detect Patterns<br/>- Revenge Trading<br/>- Overtrading<br/>- Emotional Bias]
    
    DetectPatterns --> GenWarnings[Generate Warnings]
    DetectPatterns --> GenRecommendations[Generate Recommendations]
    
    GenWarnings --> CalcAnalytics[Calculate Analytics<br/>- Win Rate by Asset<br/>- Avg Profit vs Loss<br/>- Current Streak]
    GenRecommendations --> CalcAnalytics
    
    CalcAnalytics --> GenText[Generate Insight Text]
    
    GenText --> SaveInsight[Save to MongoDB]
    
    SaveInsight --> End
```

---

## 11. Error Handling Flow

```mermaid
flowchart TD
    Request[Incoming Request] --> Middleware{Middleware<br/>Validation}
    
    Middleware -->|Pass| RouteHandler[Route Handler]
    Middleware -->|Fail| ErrorResponse[Error Response]
    
    RouteHandler --> TryCatch{Try-Catch<br/>Block}
    
    TryCatch -->|Success| Response[Success Response]
    TryCatch -->|Error| ErrorType{Error Type?}
    
    ErrorType -->|Validation| ValidationError[400 Bad Request]
    ErrorType -->|Auth| AuthError[401 Unauthorized]
    ErrorType -->|Not Found| NotFoundError[404 Not Found]
    ErrorType -->|Server| ServerError[500 Internal Error]
    
    ValidationError --> LogError[Log Error<br/>Winston]
    AuthError --> LogError
    NotFoundError --> LogError
    ServerError --> LogError
    
    LogError --> ErrorResponse
    
    ErrorResponse --> Client[Client Receives Error]
    Response --> Client
    
    Client --> End([End])
```

---

## 12. Data Flow: Creating a Trade

```mermaid
sequenceDiagram
    autonumber
    participant UI as Trade Form UI
    participant API as API Client
    participant Express as Express Server
    participant Auth as Auth Middleware
    participant Service as Trade Service
    participant Insights as Insights Engine
    participant DB as MongoDB
    
    UI->>API: Submit Trade Form
    API->>Express: POST /api/trades<br/>{asset, prices, mood}
    Express->>Auth: Validate Session
    Auth->>DB: Check Session
    DB-->>Auth: Session Valid
    Auth->>Service: createTrade(userId, data)
    Service->>Service: Validate Input (Joi)
    Service->>Service: Calculate Profit/Loss
    Service->>DB: Insert Trade Document
    DB-->>Service: Trade Created
    Service->>Insights: generateInsights(userId)<br/>(async, no wait)
    Service-->>Express: Return Trade
    Express-->>API: 201 Created + Trade Data
    API-->>UI: Update State
    UI->>UI: Re-render Trade List
    
    Note over Insights,DB: Background Process
    Insights->>DB: Fetch All User Trades
    DB-->>Insights: Trades Array
    Insights->>Insights: Analyze Patterns
    Insights->>DB: Save Insight
    DB-->>Insights: Insight Saved
```

---

## 13. Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        HTTPS[HTTPS Only]
        CSP[Content Security Policy]
        XSS[XSS Protection]
    end
    
    subgraph "Transport Security"
        TLS[TLS 1.3]
        Cookies[Secure Cookies<br/>httpOnly, sameSite]
    end
    
    subgraph "Server Security"
        Helmet[Helmet.js<br/>Security Headers]
        CORS[CORS Policy<br/>Whitelist Origins]
        RateLimit[Rate Limiting]
    end
    
    subgraph "Authentication Security"
        Bcrypt[Bcrypt Hashing<br/>Salt Rounds: 10]
        Sessions[Session Store<br/>MongoDB]
        Validation[Input Validation<br/>Joi Schemas]
    end
    
    subgraph "Database Security"
        Encryption[Encryption at Rest]
        NetworkAccess[Network Access Control]
        Sanitization[Mongoose Sanitization]
    end
    
    HTTPS --> TLS
    TLS --> Helmet
    Helmet --> CORS
    CORS --> RateLimit
    RateLimit --> Bcrypt
    Bcrypt --> Sessions
    Sessions --> Validation
    Validation --> Sanitization
    Sanitization --> Encryption
    
    CSP -.-> Helmet
    XSS -.-> Helmet
    Cookies -.-> Sessions
    NetworkAccess -.-> Encryption
```

---

## 14. Scalability Architecture (Future)

```mermaid
graph TB
    subgraph "Load Balancing"
        LB[Load Balancer]
    end
    
    subgraph "Application Tier"
        App1[App Server 1]
        App2[App Server 2]
        App3[App Server 3]
    end
    
    subgraph "Caching Layer"
        Redis[Redis Cache<br/>Session Store]
    end
    
    subgraph "Database Tier"
        Primary[(MongoDB Primary)]
        Secondary1[(MongoDB Secondary 1)]
        Secondary2[(MongoDB Secondary 2)]
    end
    
    subgraph "Message Queue"
        Queue[RabbitMQ/Redis Queue]
        Worker1[Insights Worker 1]
        Worker2[Insights Worker 2]
    end
    
    LB --> App1
    LB --> App2
    LB --> App3
    
    App1 --> Redis
    App2 --> Redis
    App3 --> Redis
    
    App1 --> Primary
    App2 --> Primary
    App3 --> Primary
    
    Primary --> Secondary1
    Primary --> Secondary2
    
    App1 --> Queue
    App2 --> Queue
    App3 --> Queue
    
    Queue --> Worker1
    Queue --> Worker2
    
    Worker1 --> Primary
    Worker2 --> Primary
    
    style LB fill:#f9f,stroke:#333,stroke-width:4px
    style Redis fill:#ff9,stroke:#333,stroke-width:2px
    style Primary fill:#9f9,stroke:#333,stroke-width:2px
```

---

## How to View These Diagrams

### Option 1: GitHub (Automatic)
GitHub automatically renders Mermaid diagrams in markdown files. Just view this file on GitHub!

### Option 2: VS Code
Install the "Markdown Preview Mermaid Support" extension:
```
ext install bierner.markdown-mermaid
```

### Option 3: Online Viewer
Copy the Mermaid code and paste it into:
- https://mermaid.live/
- https://mermaid-js.github.io/mermaid-live-editor/

### Option 4: Documentation Sites
Use with documentation generators like:
- Docusaurus
- VuePress
- GitBook
- MkDocs

---

## Legend

- **Rectangles**: Processes/Components
- **Cylinders**: Databases
- **Diamonds**: Decision Points
- **Arrows**: Data Flow/Dependencies
- **Dotted Lines**: Optional/Async Operations
- **Subgraphs**: Logical Groupings

---

**Last Updated**: May 2, 2026
