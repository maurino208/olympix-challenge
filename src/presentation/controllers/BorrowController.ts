import { Request, Response } from 'express';
import { ProcessBorrowRequestUseCase } from '../../application/use-cases/ProcessBorrowRequestUseCase';
import { AssetRepository } from '../../domain/repositories/AssetRepository';
import { BorrowRequestRepository } from '../../domain/repositories/BorrowRequestRepository';
import { SecurityEventRepository } from '../../domain/repositories/SecurityEventRepository';
import { OracleSanityService } from '../../domain/services/OracleSanityService';
import { OnChainMonitorService } from '../../domain/services/OnChainMonitorService';
import { OffChainWatchdogService } from '../../domain/services/OffChainWatchdogService';
import { EmergencyCircuitBreakerService } from '../../domain/services/EmergencyCircuitBreakerService';

export class BorrowController {
  private readonly processBorrowRequestUseCase: ProcessBorrowRequestUseCase;

  constructor(
    assetRepository: AssetRepository,
    borrowRequestRepository: BorrowRequestRepository,
    securityEventRepository: SecurityEventRepository,
    oracleSanityService: OracleSanityService,
    onChainMonitorService: OnChainMonitorService,
    offChainWatchdogService: OffChainWatchdogService,
    emergencyCircuitBreakerService: EmergencyCircuitBreakerService,
  ) {
    this.processBorrowRequestUseCase = new ProcessBorrowRequestUseCase(
      assetRepository,
      borrowRequestRepository,
      securityEventRepository,
      oracleSanityService,
      onChainMonitorService,
      offChainWatchdogService,
      emergencyCircuitBreakerService,
    );
  }

  public async requestBorrow(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress, assetAddress, amount, collateralValue, borrowLimit } = req.body;

      // Validate required fields
      if (!userAddress || !assetAddress || !amount || collateralValue === undefined || borrowLimit === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userAddress, assetAddress, amount, collateralValue, borrowLimit',
        });
        return;
      }

      // Validate data types
      if (typeof amount !== 'number' || typeof collateralValue !== 'number' || typeof borrowLimit !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Invalid data types: amount, collateralValue, and borrowLimit must be numbers',
        });
        return;
      }

      // Validate positive values
      if (amount <= 0 || collateralValue < 0 || borrowLimit <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid values: amount and borrowLimit must be positive, collateralValue must be non-negative',
        });
        return;
      }

      const result = await this.processBorrowRequestUseCase.execute({
        userAddress,
        assetAddress,
        amount,
        collateralValue,
        borrowLimit,
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          borrowRequestId: result.borrowRequestId,
          message: 'Borrow request processed successfully',
          securityEvents: result.securityEvents.map(event => ({
            id: event.id,
            type: event.type,
            severity: event.severity,
            description: event.description,
            timestamp: event.timestamp,
          })),
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.errorMessage,
          securityEvents: result.securityEvents.map(event => ({
            id: event.id,
            type: event.type,
            severity: event.severity,
            description: event.description,
            timestamp: event.timestamp,
          })),
          isProtocolPaused: result.isProtocolPaused,
        });
      }
    } catch (error) {
      console.error('Error processing borrow request:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  public async getEmergencyStatus(req: Request, res: Response): Promise<void> {
    try {
      // This would typically get the status from the emergency circuit breaker service
      res.status(200).json({
        success: true,
        status: {
          isPaused: false,
          pauseReason: null,
          pausedAt: null,
          pausedBy: null,
        },
      });
    } catch (error) {
      console.error('Error getting emergency status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
} 