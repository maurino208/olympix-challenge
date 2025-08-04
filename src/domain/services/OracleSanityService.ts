import { Asset } from '../entities/Asset';

export interface OracleSanityService {
  validatePrice(asset: Asset, maxAgeMinutes: number): Promise<boolean>;
  checkPriceDeviation(asset: Asset, threshold: number): Promise<boolean>;
  validatePriceSource(asset: Asset): Promise<boolean>;
  getPriceFreshness(asset: Asset): Promise<number>; // Returns age in minutes
  isPriceManipulated(asset: Asset, historicalPrices: Asset[]): Promise<boolean>;
} 