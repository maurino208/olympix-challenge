import { Asset } from '../entities/Asset';

export interface AssetRepository {
  findByAddress(address: string): Promise<Asset | null>;
  findBySymbol(symbol: string): Promise<Asset | null>;
  save(asset: Asset): Promise<void>;
  updatePrice(address: string, price: number, timestamp: Date): Promise<void>;
  getAllAssets(): Promise<Asset[]>;
  findAssetsByPriceRange(minPrice: number, maxPrice: number): Promise<Asset[]>;
} 