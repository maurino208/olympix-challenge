import { BorrowRequest } from '../entities/BorrowRequest';
import { Asset } from '../entities/Asset';

export interface OnChainMonitorService {
  validateBorrowRequest(borrowRequest: BorrowRequest, asset: Asset): Promise<boolean>;
  checkBorrowLimits(userAddress: string, amount: number): Promise<boolean>;
  validateCollateralRatio(borrowRequest: BorrowRequest, asset: Asset): Promise<boolean>;
  checkUserBorrowHistory(userAddress: string): Promise<boolean>;
  validateAssetAvailability(assetAddress: string, amount: number): Promise<boolean>;
} 