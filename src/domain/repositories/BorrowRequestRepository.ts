import { BorrowRequest } from '../entities/BorrowRequest';

export interface BorrowRequestRepository {
  findById(id: string): Promise<BorrowRequest | null>;
  findByUserAddress(userAddress: string): Promise<BorrowRequest[]>;
  findByAssetAddress(assetAddress: string): Promise<BorrowRequest[]>;
  save(borrowRequest: BorrowRequest): Promise<void>;
  findRecentRequests(minutes: number): Promise<BorrowRequest[]>;
  findLargeRequests(threshold: number): Promise<BorrowRequest[]>;
  getTotalBorrowedAmount(userAddress: string): Promise<number>;
} 