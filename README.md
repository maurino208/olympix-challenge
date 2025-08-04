# DeFi Security Solution

A comprehensive Node.js/TypeScript solution to prevent DeFi exploits like the Radiant Capital incident ($4.5M, January 3, 2024).

## 🛡️ Security Features

This solution implements a multi-layered security architecture:

### 1. Oracle Sanity Layer
- Validates price freshness and authenticity
- Prevents stale or manipulated oracle data
- Supports multiple oracle sources (Chainlink, Pyth, Band, Tellor)

### 2. On-Chain Monitoring
- Real-time validation of borrow limits
- Collateral ratio verification
- User borrow history analysis
- Asset availability checks

### 3. Off-Chain Watchdog
- Anomaly detection for suspicious patterns
- Flash loan attack detection
- Price manipulation monitoring
- User activity analysis

### 4. Emergency Circuit Breaker
- Automatic protocol pause on critical events
- Real-time alerting system
- Governance dashboard integration

## 🏗️ Architecture

The solution follows Clean Architecture principles:

```
src/
├── domain/           # Business logic and entities
│   ├── entities/     # Core business objects
│   ├── repositories/ # Data access interfaces
│   └── services/     # Business service interfaces
├── application/      # Use cases and application logic
│   └── use-cases/    # Main application use cases
├── infrastructure/   # External concerns implementation
│   ├── repositories/ # Data access implementations
│   └── services/     # Service implementations
└── presentation/     # API and user interface
    ├── controllers/  # HTTP request handlers
    └── routes/       # API route definitions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the development server
npm run dev

# Or start production server
npm start
```

### API Endpoints

#### Health Check
```bash
GET /health
```

#### Borrow Request
```bash
POST /api/borrow/request
Content-Type: application/json

{
  "userAddress": "0x1234567890123456789012345678901234567890",
  "assetAddress": "0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C",
  "amount": 10000,
  "collateralValue": 15000,
  "borrowLimit": 50000
}
```

#### Emergency Status
```bash
GET /api/borrow/emergency-status
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📊 Demo Assets

The system comes with pre-configured demo assets:
- USDC (Chainlink Oracle)
- ETH (Chainlink Oracle) 
- WBTC (Pyth Oracle)
- DAI (Chainlink Oracle)

## 🛡️ Security Measures

### Price Validation
- Maximum age: 5 minutes
- Minimum age: 1 minute
- Deviation threshold: 10%

### Borrow Limits
- Maximum utilization: 80%
- Minimum collateral ratio: 150%
- Maximum single borrow: $1M

### Anomaly Detection
- Suspicious amount threshold: $500K
- Flash loan detection window: 1 minute
- Price anomaly threshold: 5%

## 🔄 Flow Chart Implementation

The solution follows the exact flow from your diagrams:

1. **User Requests Borrow** → API endpoint receives request
2. **Fetch Asset Price from Oracle Sanity Layer** → Price validation service
3. **Is Price Valid and Fresh?** → Oracle sanity checks
4. **On-Chain Monitor Validates Borrow Limits** → Borrow validation service
5. **Is Borrow Within Allowed Limits?** → Limit checking
6. **Lending Protocol Transfers Borrowed Assets** → Success response
7. **Emit Borrow Event on Blockchain** → Event logging
8. **Off-Chain Watchdog Listens to Borrow Event** → Anomaly detection
9. **Analyze Borrow Behavior & Price Trends** → Pattern analysis
10. **Anomaly Detected?** → Security event creation
11. **Trigger Emergency Circuit Breaker** → Protocol pause
12. **Send Alert to Governance Dashboard** → Alert system

## 🚨 Emergency Response

When critical security events are detected:

1. **Automatic Protocol Pause** - All borrow requests are rejected
2. **Real-time Alerts** - Governance team is immediately notified
3. **Event Logging** - All security events are recorded with full context
4. **Manual Review** - Human oversight for critical decisions

## 🔍 Monitoring

The system provides comprehensive monitoring:

- **Real-time Security Events** - All detected anomalies
- **Emergency Status** - Current protocol state
- **User Activity** - Borrow patterns and history
- **Asset Monitoring** - Price trends and oracle health

## 🛠️ Development

### Code Quality
- ESLint with TypeScript support
- Clean Architecture principles
- SOLID design patterns
- Comprehensive error handling

### Testing Strategy
- Unit tests for domain logic
- Integration tests for use cases
- API tests for endpoints

## 📈 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Real blockchain integration
- Advanced ML-based anomaly detection
- WebSocket real-time updates
- Grafana dashboards
- Multi-chain support
