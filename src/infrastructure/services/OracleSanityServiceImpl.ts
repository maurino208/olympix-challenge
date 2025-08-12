import { Asset } from '../../domain/entities/Asset';
import { OracleSanityService } from '../../domain/services/OracleSanityService';

export class OracleSanityServiceImpl implements OracleSanityService {
  private readonly MAX_PRICE_DEVIATION = 0.1; // 10% deviation threshold
  private readonly MIN_PRICE_AGE_MINUTES = 1; // Minimum 1 minute old
  private readonly MAX_PRICE_AGE_MINUTES = 5; // Maximum 5 minutes old

  public async validatePrice(asset: Asset, maxAgeMinutes: number): Promise<boolean> {
    const ageInMinutes = await this.getPriceFreshness(asset);
    return ageInMinutes <= maxAgeMinutes && ageInMinutes >= this.MIN_PRICE_AGE_MINUTES;
  }

  public async checkPriceDeviation(asset: Asset, threshold: number): Promise<boolean> {
    // This would typically compare against historical prices
    // For now, we'll use a simple threshold check
    return asset.price > 0 && asset.price <= threshold;
  }

  public async validatePriceSource(asset: Asset): Promise<boolean> {
    const validSources = ['chainlink', 'pyth', 'band', 'tellor'] as any;
    return validSources.includes(asset.priceSource.toLowerCase());
  }

  public async getPriceFreshness(asset: Asset): Promise<number> {
    const now = new Date();
    const ageInMinutes = (now.getTime() - asset.lastUpdated.getTime()) / (1000 * 60);
    return ageInMinutes;
  }

  public async isPriceManipulated(asset: Asset, historicalPrices: Asset[]): Promise<boolean> {
    if (historicalPrices.length < 3) {
      return false; // Need at least 3 data points for analysis
    }

    const recentPrices = historicalPrices
      .filter(p => p.symbol === asset.symbol)
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, 10); // Last 10 prices

    if (recentPrices.length < 3) {
      return false;
    }

    const currentPrice = asset.price;
    const averagePrice = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;
    const deviation = Math.abs(currentPrice - averagePrice) / averagePrice;

    return deviation > this.MAX_PRICE_DEVIATION;
  }
} 
