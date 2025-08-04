import { BorrowRequest } from '../entities/BorrowRequest';
import { Asset } from '../entities/Asset';
import { SecurityEvent } from '../entities/SecurityEvent';

export interface OffChainWatchdogService {
  analyzeBorrowBehavior(borrowRequest: BorrowRequest, asset: Asset): Promise<SecurityEvent[]>;
  detectPriceAnomalies(asset: Asset): Promise<SecurityEvent[]>;
  monitorUserActivity(userAddress: string): Promise<SecurityEvent[]>;
  analyzeMarketTrends(asset: Asset): Promise<SecurityEvent[]>;
  detectFlashLoanAttacks(borrowRequest: BorrowRequest): Promise<SecurityEvent[]>;
  checkForSuspiciousPatterns(borrowRequest: BorrowRequest): Promise<SecurityEvent[]>;
} 