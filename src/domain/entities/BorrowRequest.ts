export interface BorrowRequest {
  readonly id: string;
  readonly userAddress: string;
  readonly assetAddress: string;
  readonly amount: number;
  readonly requestedAt: Date;
  readonly collateralValue: number;
  readonly borrowLimit: number;
  isWithinBorrowLimit(): boolean;
  getBorrowUtilization(): number;
  getCollateralRatio(): number;
  isHealthyCollateralRatio(minRatio: number): boolean;
}

export class BorrowRequestEntity implements BorrowRequest {
  constructor(
    public readonly id: string,
    public readonly userAddress: string,
    public readonly assetAddress: string,
    public readonly amount: number,
    public readonly requestedAt: Date,
    public readonly collateralValue: number,
    public readonly borrowLimit: number,
  ) {
    this.validateBorrowRequest();
  }

  private validateBorrowRequest(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Borrow request ID cannot be empty');
    }
    if (!this.userAddress || this.userAddress.trim().length === 0) {
      throw new Error('User address cannot be empty');
    }
    if (!this.assetAddress || this.assetAddress.trim().length === 0) {
      throw new Error('Asset address cannot be empty');
    }
    if (this.amount <= 0) {
      throw new Error('Borrow amount must be positive');
    }
    if (this.collateralValue < 0) {
      throw new Error('Collateral value cannot be negative');
    }
    if (this.borrowLimit <= 0) {
      throw new Error('Borrow limit must be positive');
    }
  }

  public isWithinBorrowLimit(): boolean {
    return this.amount <= this.borrowLimit;
  }

  public getBorrowUtilization(): number {
    return (this.amount / this.borrowLimit) * 100;
  }

  public getCollateralRatio(): number {
    if (this.amount === 0) return 0;
    return (this.collateralValue / this.amount) * 100;
  }

  public isHealthyCollateralRatio(minRatio: number): boolean {
    return this.getCollateralRatio() >= minRatio;
  }
} 