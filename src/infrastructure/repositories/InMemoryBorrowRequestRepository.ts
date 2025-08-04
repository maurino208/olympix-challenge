import { BorrowRequest } from '../../domain/entities/BorrowRequest';
import { BorrowRequestRepository } from '../../domain/repositories/BorrowRequestRepository';

export class InMemoryBorrowRequestRepository implements BorrowRequestRepository {
  private borrowRequests: Map<string, BorrowRequest> = new Map();

  public async findById(id: string): Promise<BorrowRequest | null> {
    return this.borrowRequests.get(id) || null;
  }

  public async findByUserAddress(userAddress: string): Promise<BorrowRequest[]> {
    return Array.from(this.borrowRequests.values()).filter(
      request => request.userAddress.toLowerCase() === userAddress.toLowerCase(),
    );
  }

  public async findByAssetAddress(assetAddress: string): Promise<BorrowRequest[]> {
    return Array.from(this.borrowRequests.values()).filter(
      request => request.assetAddress.toLowerCase() === assetAddress.toLowerCase(),
    );
  }

  public async save(borrowRequest: BorrowRequest): Promise<void> {
    this.borrowRequests.set(borrowRequest.id, borrowRequest);
  }

  public async findRecentRequests(minutes: number): Promise<BorrowRequest[]> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return Array.from(this.borrowRequests.values()).filter(
      request => request.requestedAt >= cutoffTime,
    );
  }

  public async findLargeRequests(threshold: number): Promise<BorrowRequest[]> {
    return Array.from(this.borrowRequests.values()).filter(
      request => request.amount >= threshold,
    );
  }

  public async getTotalBorrowedAmount(userAddress: string): Promise<number> {
    const userRequests = await this.findByUserAddress(userAddress);
    return userRequests.reduce((total, request) => total + request.amount, 0);
  }
} 