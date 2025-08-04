import { BorrowRequest } from '../../domain/entities/BorrowRequest';
import { Asset } from '../../domain/entities/Asset';
import { SecurityEvent, SecurityEventEntity, SecurityEventType, SecurityEventSeverity } from '../../domain/entities/SecurityEvent';
import { OffChainWatchdogService } from '../../domain/services/OffChainWatchdogService';
import { BorrowRequestRepository } from '../../domain/repositories/BorrowRequestRepository';

export class OffChainWatchdogServiceImpl implements OffChainWatchdogService {
  private readonly SUSPICIOUS_AMOUNT_THRESHOLD = 500000; // $500K
  private readonly FLASH_LOAN_DETECTION_WINDOW = 1; // 1 minute
  private readonly PRICE_ANOMALY_THRESHOLD = 0.05; // 5% price change

  constructor(private readonly borrowRequestRepository: BorrowRequestRepository) {}

  public async analyzeBorrowBehavior(borrowRequest: BorrowRequest, asset: Asset): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];

    // Check for suspicious patterns
    const suspiciousPatterns = await this.checkForSuspiciousPatterns(borrowRequest);
    events.push(...suspiciousPatterns);

    // Detect flash loan attacks
    const flashLoanEvents = await this.detectFlashLoanAttacks(borrowRequest);
    events.push(...flashLoanEvents);

    // Monitor user activity
    const userActivityEvents = await this.monitorUserActivity(borrowRequest.userAddress);
    events.push(...userActivityEvents);

    return events;
  }

  public async detectPriceAnomalies(asset: Asset): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];

    // Check for sudden price changes
    const priceChange = Math.abs(asset.price - 1000) / 1000; // Assuming baseline price of $1000
    if (priceChange > this.PRICE_ANOMALY_THRESHOLD) {
      events.push(new SecurityEventEntity(
        `price-anomaly-${Date.now()}`,
        SecurityEventType.PRICE_MANIPULATION,
        SecurityEventSeverity.HIGH,
        `Significant price change detected for ${asset.symbol}: ${priceChange * 100}%`,
        new Date(),
        undefined,
        asset.address,
        asset.price,
      ));
    }

    return events;
  }

  public async monitorUserActivity(userAddress: string): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];

    const recentRequests = await this.borrowRequestRepository.findRecentRequests(60); // Last hour
    const userRequests = recentRequests.filter(r => r.userAddress === userAddress);

    // Check for excessive borrowing
    if (userRequests.length > 5) {
      events.push(new SecurityEventEntity(
        `excessive-borrowing-${Date.now()}`,
        SecurityEventType.EXCESSIVE_BORROWING,
        SecurityEventSeverity.MEDIUM,
        `User ${userAddress} has made ${userRequests.length} borrow requests in the last hour`,
        new Date(),
        userAddress,
        undefined,
        userRequests.reduce((sum, r) => sum + r.amount, 0),
      ));
    }

    // Check for large amounts
    const largeRequests = userRequests.filter(r => r.amount > this.SUSPICIOUS_AMOUNT_THRESHOLD);
    if (largeRequests.length > 0) {
      events.push(new SecurityEventEntity(
        `large-borrow-${Date.now()}`,
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        SecurityEventSeverity.HIGH,
        `User ${userAddress} has made ${largeRequests.length} large borrow requests`,
        new Date(),
        userAddress,
        undefined,
        largeRequests.reduce((sum, r) => sum + r.amount, 0),
      ));
    }

    return events;
  }

  public async analyzeMarketTrends(asset: Asset): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];

    // This would typically analyze market data from external sources
    // For now, we'll use a simple check
    if (asset.price < 100) { // Assuming minimum reasonable price
      events.push(new SecurityEventEntity(
        `market-trend-${Date.now()}`,
        SecurityEventType.PRICE_MANIPULATION,
        SecurityEventSeverity.MEDIUM,
        `Unusual market trend detected for ${asset.symbol}`,
        new Date(),
        undefined,
        asset.address,
        asset.price,
      ));
    }

    return events;
  }

  public async detectFlashLoanAttacks(borrowRequest: BorrowRequest): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];

    // Check for rapid successive borrows
    const recentRequests = await this.borrowRequestRepository.findRecentRequests(this.FLASH_LOAN_DETECTION_WINDOW);
    const userRequests = recentRequests.filter(r => r.userAddress === borrowRequest.userAddress);

    if (userRequests.length > 3) {
      events.push(new SecurityEventEntity(
        `flash-loan-suspected-${Date.now()}`,
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        SecurityEventSeverity.CRITICAL,
        `Potential flash loan attack detected for user ${borrowRequest.userAddress}`,
        new Date(),
        borrowRequest.userAddress,
        borrowRequest.assetAddress,
        borrowRequest.amount,
      ));
    }

    return events;
  }

  public async checkForSuspiciousPatterns(borrowRequest: BorrowRequest): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];

    // Check for round numbers (potential manipulation)
    if (borrowRequest.amount % 100000 === 0 && borrowRequest.amount > 100000) {
      events.push(new SecurityEventEntity(
        `suspicious-amount-${Date.now()}`,
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        SecurityEventSeverity.MEDIUM,
        `Suspicious round number borrow amount: ${borrowRequest.amount}`,
        new Date(),
        borrowRequest.userAddress,
        borrowRequest.assetAddress,
        borrowRequest.amount,
      ));
    }

    // Check for very large amounts
    if (borrowRequest.amount > this.SUSPICIOUS_AMOUNT_THRESHOLD) {
      events.push(new SecurityEventEntity(
        `large-amount-${Date.now()}`,
        SecurityEventType.EXCESSIVE_BORROWING,
        SecurityEventSeverity.HIGH,
        `Very large borrow amount requested: ${borrowRequest.amount}`,
        new Date(),
        borrowRequest.userAddress,
        borrowRequest.assetAddress,
        borrowRequest.amount,
      ));
    }

    return events;
  }
} 