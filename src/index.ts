import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Import repositories (in-memory implementations for demo)
import { AssetRepository } from './domain/repositories/AssetRepository';
import { BorrowRequestRepository } from './domain/repositories/BorrowRequestRepository';
import { SecurityEventRepository } from './domain/repositories/SecurityEventRepository';

// Import services
import { OracleSanityService } from './domain/services/OracleSanityService';
import { OnChainMonitorService } from './domain/services/OnChainMonitorService';
import { OffChainWatchdogService } from './domain/services/OffChainWatchdogService';
import { EmergencyCircuitBreakerService } from './domain/services/EmergencyCircuitBreakerService';

// Import implementations
import { OracleSanityServiceImpl } from './infrastructure/services/OracleSanityServiceImpl';
import { OnChainMonitorServiceImpl } from './infrastructure/services/OnChainMonitorServiceImpl';
import { OffChainWatchdogServiceImpl } from './infrastructure/services/OffChainWatchdogServiceImpl';
import { EmergencyCircuitBreakerServiceImpl } from './infrastructure/services/EmergencyCircuitBreakerServiceImpl';

// Import routes
import { createBorrowRoutes } from './presentation/routes/borrowRoutes';

// Import in-memory repositories
import { InMemoryAssetRepository } from './infrastructure/repositories/InMemoryAssetRepository';
import { InMemoryBorrowRequestRepository } from './infrastructure/repositories/InMemoryBorrowRequestRepository';
import { InMemorySecurityEventRepository } from './infrastructure/repositories/InMemorySecurityEventRepository';

// Load environment variables
dotenv.config();

class DeFiSecurityApplication {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.setupMiddleware();
    this.setupDependencies();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupDependencies(): void {
    // Initialize repositories
    const assetRepository: AssetRepository = new InMemoryAssetRepository();
    const borrowRequestRepository: BorrowRequestRepository = new InMemoryBorrowRequestRepository();
    const securityEventRepository: SecurityEventRepository = new InMemorySecurityEventRepository();

    // Initialize services
    const oracleSanityService: OracleSanityService = new OracleSanityServiceImpl();
    const onChainMonitorService: OnChainMonitorService = new OnChainMonitorServiceImpl(borrowRequestRepository);
    const offChainWatchdogService: OffChainWatchdogService = new OffChainWatchdogServiceImpl(borrowRequestRepository);
    const emergencyCircuitBreakerService: EmergencyCircuitBreakerService = new EmergencyCircuitBreakerServiceImpl();

    // Store dependencies in app for route access
    this.app.set('assetRepository', assetRepository);
    this.app.set('borrowRequestRepository', borrowRequestRepository);
    this.app.set('securityEventRepository', securityEventRepository);
    this.app.set('oracleSanityService', oracleSanityService);
    this.app.set('onChainMonitorService', onChainMonitorService);
    this.app.set('offChainWatchdogService', offChainWatchdogService);
    this.app.set('emergencyCircuitBreakerService', emergencyCircuitBreakerService);
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'DeFi Security Solution',
        version: '1.0.0',
      });
    });

    // API routes
    const borrowRoutes = createBorrowRoutes(
      this.app.get('assetRepository'),
      this.app.get('borrowRequestRepository'),
      this.app.get('securityEventRepository'),
      this.app.get('oracleSanityService'),
      this.app.get('onChainMonitorService'),
      this.app.get('offChainWatchdogService'),
      this.app.get('emergencyCircuitBreakerService'),
    );

    this.app.use('/api/borrow', borrowRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
      });
    });

    // Error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 DeFi Security Solution started on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`🔐 API endpoints: http://localhost:${this.port}/api/borrow`);
      console.log(`🛡️  Emergency status: http://localhost:${this.port}/api/borrow/emergency-status`);
    });
  }
}

// Start the application
const app = new DeFiSecurityApplication();
app.start(); 