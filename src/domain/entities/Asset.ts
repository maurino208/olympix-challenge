export interface Asset {
  readonly symbol: string;
  readonly address: string;
  readonly decimals: number;
  readonly price: number;
  readonly lastUpdated: Date;
  readonly priceSource: string;
}

export class AssetEntity implements Asset {
  constructor(
    public readonly symbol: string,
    public readonly address: string,
    public readonly decimals: number,
    public readonly price: number,
    public readonly lastUpdated: Date,
    public readonly priceSource: string,
  ) {
    this.validateAsset();
  }

  private validateAsset(): void {
    if (!this.symbol || this.symbol.trim().length === 0) {
      throw new Error('Asset symbol cannot be empty');
    }
    if (!this.address || this.address.trim().length === 0) {
      throw new Error('Asset address cannot be empty');
    }
    if (this.decimals < 0 || this.decimals > 18) {
      throw new Error('Asset decimals must be between 0 and 18');
    }
    if (this.price <= 0) {
      throw new Error('Asset price must be positive');
    }
    if (!this.priceSource || this.priceSource.trim().length === 0) {
      throw new Error('Asset price source cannot be empty');
    }
  }

  public isPriceFresh(maxAgeMinutes: number): boolean {
    const now = new Date();
    const ageInMinutes = (now.getTime() - this.lastUpdated.getTime()) / (1000 * 60);
    return ageInMinutes <= maxAgeMinutes;
  }

  public getPriceInUSD(): number {
    return this.price;
  }
} 