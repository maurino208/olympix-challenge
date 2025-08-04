import { Router } from 'express';
import { BorrowController } from '../controllers/BorrowController';
import { AssetRepository } from '../../domain/repositories/AssetRepository';
import { BorrowRequestRepository } from '../../domain/repositories/BorrowRequestRepository';
import { SecurityEventRepository } from '../../domain/repositories/SecurityEventRepository';
import { OracleSanityService } from '../../domain/services/OracleSanityService';
import { OnChainMonitorService } from '../../domain/services/OnChainMonitorService';
import { OffChainWatchdogService } from '../../domain/services/OffChainWatchdogService';
import { EmergencyCircuitBreakerService } from '../../domain/services/EmergencyCircuitBreakerService';

export function createBorrowRoutes(
  assetRepository: AssetRepository,
  borrowRequestRepository: BorrowRequestRepository,
  securityEventRepository: SecurityEventRepository,
  oracleSanityService: OracleSanityService,
  onChainMonitorService: OnChainMonitorService,
  offChainWatchdogService: OffChainWatchdogService,
  emergencyCircuitBreakerService: EmergencyCircuitBreakerService,
): Router {
  const router = Router();
  const borrowController = new BorrowController(
    assetRepository,
    borrowRequestRepository,
    securityEventRepository,
    oracleSanityService,
    onChainMonitorService,
    offChainWatchdogService,
    emergencyCircuitBreakerService,
  );

  // POST /api/borrow/request
  router.post('/request', (req, res) => borrowController.requestBorrow(req, res));

  // GET /api/borrow/emergency-status
  router.get('/emergency-status', (req, res) => borrowController.getEmergencyStatus(req, res));

  return router;
} 