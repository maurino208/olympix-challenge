import { BorrowRequest } from '../../domain/entities/BorrowRequest';
import { Asset } from '../../domain/entities/Asset';
import { OnChainMonitorService } from '../../domain/services/OnChainMonitorService';
import { BorrowRequestRepository } from '../../domain/repositories/BorrowRequestRepository';

export class OnChainMonitorServiceImpl implements OnChainMonitorService {
  private readonly MAX_BORROW_UTILIZATION = 0.8; // 80% of limit
  private readonly MIN_COLLATERAL_RATIO = 1.5; // 150% collateral ratio
  private readonly MAX_SINGLE_BORROW_AMOUNT = 1000000; // $1M max single borrow

  constructor(private readonly borrowRequestRepository: BorrowRequestRepository) {}

  public async validateBorrowRequest(borrowRequest: BorrowRequest, asset: Asset): Promise<boolean> {
    // Check if within borrow limits
    const isWithinLimits = await this.checkBorrowLimits(borrowRequest.userAddress, borrowRequest.amount);
    if (!isWithinLimits) {
      return false;
    }

    // Check collateral ratio
    const hasValidCollateral = await this.validateCollateralRatio(borrowRequest, asset);
    if (!hasValidCollateral) {
      return false;
    }

    // Check user borrow history
    const hasGoodHistory = await this.checkUserBorrowHistory(borrowRequest.userAddress);
    if (!hasGoodHistory) {
      return false;
    }

    // Check asset availability
    const assetAvailable = await this.validateAssetAvailability(borrowRequest.assetAddress, borrowRequest.amount);
    if (!assetAvailable) {
      return false;
    }

    return true;
  }

  public async checkBorrowLimits(userAddress: string, amount: number): Promise<boolean> {
    const totalBorrowed = await this.borrowRequestRepository.getTotalBorrowedAmount(userAddress);
    const currentUtilization = (totalBorrowed + amount) / this.MAX_SINGLE_BORROW_AMOUNT;
    
    return currentUtilization <= this.MAX_BORROW_UTILIZATION;
  }

  public async validateCollateralRatio(borrowRequest: BorrowRequest, asset: Asset): Promise<boolean> {
    const collateralRatio = borrowRequest.getCollateralRatio();
    return collateralRatio >= this.MIN_COLLATERAL_RATIO;
  }

  public async checkUserBorrowHistory(userAddress: string): Promise<boolean> {
    const recentRequests = await this.borrowRequestRepository.findRecentRequests(60); // Last hour
    const userRequests = recentRequests.filter(r => r.userAddress === userAddress);
    
    // Check for suspicious patterns
    if (userRequests.length > 10) {
      return false; // Too many requests in short time
    }

    const totalAmount = userRequests.reduce((sum, r) => sum + r.amount, 0);
    if (totalAmount > this.MAX_SINGLE_BORROW_AMOUNT) {
      return false; // Total borrowed amount too high
    }

    return true;
  }

  public async validateAssetAvailability(assetAddress: string, amount: number): Promise<boolean> {
    // This would typically check the protocol's liquidity
    // For now, we'll assume availability if amount is reasonable
    return amount > 0 && amount <= this.MAX_SINGLE_BORROW_AMOUNT;
  }
} 