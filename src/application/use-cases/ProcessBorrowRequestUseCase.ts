import { BorrowRequest, BorrowRequestEntity } from '../../domain/entities/BorrowRequest';
import { Asset } from '../../domain/entities/Asset';
import { SecurityEvent, SecurityEventEntity } from '../../domain/entities/SecurityEvent';
import { AssetRepository } from '../../domain/repositories/AssetRepository';
import { BorrowRequestRepository } from '../../domain/repositories/BorrowRequestRepository';
import { SecurityEventRepository } from '../../domain/repositories/SecurityEventRepository';
import { OracleSanityService } from '../../domain/services/OracleSanityService';
import { OnChainMonitorService } from '../../domain/services/OnChainMonitorService';
import { OffChainWatchdogService } from '../../domain/services/OffChainWatchdogService';
import { EmergencyCircuitBreakerService } from '../../domain/services/EmergencyCircuitBreakerService';

export interface ProcessBorrowRequestRequest {
  userAddress: string;
  assetAddress: string;
  amount: number;
  collateralValue: number;
  borrowLimit: number;
}

export interface ProcessBorrowRequestResponse {
  success: boolean;
  borrowRequestId?: string;
  errorMessage?: string;
  securityEvents: SecurityEvent[];
  isProtocolPaused: boolean;
}

export class ProcessBorrowRequestUseCase {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly borrowRequestRepository: BorrowRequestRepository,
    private readonly securityEventRepository: SecurityEventRepository,
    private readonly oracleSanityService: OracleSanityService,
    private readonly onChainMonitorService: OnChainMonitorService,
    private readonly offChainWatchdogService: OffChainWatchdogService,
    private readonly emergencyCircuitBreakerService: EmergencyCircuitBreakerService,
  ) {}

  public async execute(request: ProcessBorrowRequestRequest): Promise<ProcessBorrowRequestResponse> {
    try {
      // Step 1: Check if protocol is paused
      const isProtocolPaused = await this.emergencyCircuitBreakerService.isProtocolPaused();
      if (isProtocolPaused) {
        return {
          success: false,
          errorMessage: 'Protocol is currently paused due to security concerns',
          securityEvents: [],
          isProtocolPaused: true,
        };
      }

      // Step 2: Fetch asset price from Oracle Sanity Layer
      const asset = await this.assetRepository.findByAddress(request.assetAddress);
      if (!asset) {
        return {
          success: false,
          errorMessage: 'Asset not found',
          securityEvents: [],
          isProtocolPaused: false,
        };
      }

      // Step 3: Validate price freshness and validity
      const isPriceValid = await this.oracleSanityService.validatePrice(asset, 5); // 5 minutes max age
      if (!isPriceValid) {
        const securityEvent = new SecurityEventEntity(
          `price-invalid-${Date.now()}`,
          'ORACLE_FAILURE' as any,
          'HIGH' as any,
          `Invalid price for asset ${asset.symbol}`,
          new Date(),
          request.userAddress,
          request.assetAddress,
          request.amount,
        );
        await this.securityEventRepository.save(securityEvent);
        
        return {
          success: false,
          errorMessage: 'Invalid or stale price data',
          securityEvents: [securityEvent],
          isProtocolPaused: false,
        };
      }

      // Step 4: Create borrow request entity
      const borrowRequest = new BorrowRequestEntity(
        `borrow-${Date.now()}-${request.userAddress}`,
        request.userAddress,
        request.assetAddress,
        request.amount,
        new Date(),
        request.collateralValue,
        request.borrowLimit,
      );

      // Step 5: On-Chain Monitor validates borrow limits
      const isBorrowValid = await this.onChainMonitorService.validateBorrowRequest(borrowRequest, asset);
      if (!isBorrowValid) {
        const securityEvent = new SecurityEventEntity(
          `borrow-limit-exceeded-${Date.now()}`,
          'EXCESSIVE_BORROWING' as any,
          'MEDIUM' as any,
          `Borrow request exceeds limits for user ${request.userAddress}`,
          new Date(),
          request.userAddress,
          request.assetAddress,
          request.amount,
        );
        await this.securityEventRepository.save(securityEvent);
        
        return {
          success: false,
          errorMessage: 'Borrow request exceeds allowed limits',
          securityEvents: [securityEvent],
          isProtocolPaused: false,
        };
      }

      // Step 6: Save borrow request
      await this.borrowRequestRepository.save(borrowRequest);

      // Step 7: Off-Chain Watchdog analyzes behavior
      const securityEvents = await this.offChainWatchdogService.analyzeBorrowBehavior(borrowRequest, asset);
      
      // Step 8: Save any security events
      for (const event of securityEvents) {
        await this.securityEventRepository.save(event);
      }

      // Step 9: Check for critical events that require circuit breaker
      const criticalEvents = securityEvents.filter(event => event.isCritical());
      if (criticalEvents.length > 0 && criticalEvents[0]) {
        await this.emergencyCircuitBreakerService.triggerPause(criticalEvents[0]);
        return {
          success: false,
          errorMessage: 'Protocol paused due to critical security event',
          securityEvents,
          isProtocolPaused: true,
        };
      }

      return {
        success: true,
        borrowRequestId: borrowRequest.id,
        securityEvents,
        isProtocolPaused: false,
      };

    } catch (error) {
      const securityEvent = new SecurityEventEntity(
        `system-error-${Date.now()}`,
        'SUSPICIOUS_ACTIVITY' as any,
        'HIGH' as any,
        `System error during borrow request processing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        new Date(),
        request.userAddress,
        request.assetAddress,
        request.amount,
      );
      await this.securityEventRepository.save(securityEvent);

      return {
        success: false,
        errorMessage: 'System error occurred during processing',
        securityEvents: [securityEvent],
        isProtocolPaused: false,
      };
    }
  }
} 