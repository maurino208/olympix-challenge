import { Asset, AssetEntity } from '../../domain/entities/Asset';
import { AssetRepository } from '../../domain/repositories/AssetRepository';

export class InMemoryAssetRepository implements AssetRepository {
  private assets: Map<string, Asset> = new Map();

  constructor() {
    // Initialize with some demo assets
    this.initializeDemoAssets();
  }

  private initializeDemoAssets(): void {
    const demoAssets: Asset[] = [
      new AssetEntity('USDC', '0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C', 6, 1.00, new Date(Date.now() - 2 * 60 * 1000), 'chainlink'), // 2 minutes ago
      new AssetEntity('ETH', '0xB0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C', 18, 2500.00, new Date(Date.now() - 2 * 60 * 1000), 'chainlink'), // 2 minutes ago
      new AssetEntity('WBTC', '0xC0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C', 8, 45000.00, new Date(Date.now() - 2 * 60 * 1000), 'pyth'), // 2 minutes ago
      new AssetEntity('DAI', '0xD0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C', 18, 1.00, new Date(Date.now() - 2 * 60 * 1000), 'chainlink'), // 2 minutes ago
    ];

    demoAssets.forEach(asset => {
      this.assets.set(asset.address, asset);
    });
  }

  public async findByAddress(address: string): Promise<Asset | null> {
    return this.assets.get(address) || null;
  }

  public async findBySymbol(symbol: string): Promise<Asset | null> {
    for (const asset of this.assets.values()) {
      if (asset.symbol.toLowerCase() === symbol.toLowerCase()) {
        return asset;
      }
    }
    return null;
  }

  public async save(asset: Asset): Promise<void> {
    this.assets.set(asset.address, asset);
  }

  public async updatePrice(address: string, price: number, timestamp: Date): Promise<void> {
    const asset = this.assets.get(address);
    if (asset) {
      const updatedAsset = new AssetEntity(
        asset.symbol,
        asset.address,
        asset.decimals,
        price,
        timestamp,
        asset.priceSource,
      );
      this.assets.set(address, updatedAsset);
    }
  }

  public async getAllAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values());
  }

  public async findAssetsByPriceRange(minPrice: number, maxPrice: number): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      asset => asset.price >= minPrice && asset.price <= maxPrice,
    );
  }
} 