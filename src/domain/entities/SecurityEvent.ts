export enum SecurityEventType {
  PRICE_MANIPULATION = 'PRICE_MANIPULATION',
  EXCESSIVE_BORROWING = 'EXCESSIVE_BORROWING',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ORACLE_FAILURE = 'ORACLE_FAILURE',
  CIRCUIT_BREAKER_TRIGGERED = 'CIRCUIT_BREAKER_TRIGGERED',
}

export enum SecurityEventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface SecurityEvent {
  readonly id: string;
  readonly type: SecurityEventType;
  readonly severity: SecurityEventSeverity;
  readonly description: string;
  readonly timestamp: Date;
  readonly userAddress: string | undefined;
  readonly assetAddress: string | undefined;
  readonly amount: number | undefined;
  readonly metadata: Record<string, unknown>;
  isCritical(): boolean;
  isHighPriority(): boolean;
  getAgeInMinutes(): number;
  requiresImmediateAction(): boolean;
}

export class SecurityEventEntity implements SecurityEvent {
  constructor(
    public readonly id: string,
    public readonly type: SecurityEventType,
    public readonly severity: SecurityEventSeverity,
    public readonly description: string,
    public readonly timestamp: Date,
    public readonly userAddress: string | undefined,
    public readonly assetAddress: string | undefined,
    public readonly amount: number | undefined,
    public readonly metadata: Record<string, unknown> = {},
  ) {
    this.validateSecurityEvent();
  }

  private validateSecurityEvent(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Security event ID cannot be empty');
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Security event description cannot be empty');
    }
    if (this.amount !== undefined && this.amount < 0) {
      throw new Error('Security event amount cannot be negative');
    }
  }

  public isCritical(): boolean {
    return this.severity === SecurityEventSeverity.CRITICAL;
  }

  public isHighPriority(): boolean {
    return this.severity === SecurityEventSeverity.HIGH || this.severity === SecurityEventSeverity.CRITICAL;
  }

  public getAgeInMinutes(): number {
    const now = new Date();
    return (now.getTime() - this.timestamp.getTime()) / (1000 * 60);
  }

  public requiresImmediateAction(): boolean {
    return this.isCritical() || (this.isHighPriority() && this.getAgeInMinutes() < 5);
  }
} 