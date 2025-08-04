import { SecurityEvent } from '../../domain/entities/SecurityEvent';
import { SecurityEventRepository } from '../../domain/repositories/SecurityEventRepository';

export class InMemorySecurityEventRepository implements SecurityEventRepository {
  private securityEvents: Map<string, SecurityEvent> = new Map();

  public async findById(id: string): Promise<SecurityEvent | null> {
    return this.securityEvents.get(id) || null;
  }

  public async findByType(type: any): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).filter(
      event => event.type === type,
    );
  }

  public async findBySeverity(severity: any): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).filter(
      event => event.severity === severity,
    );
  }

  public async findByUserAddress(userAddress: string): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).filter(
      event => event.userAddress && event.userAddress.toLowerCase() === userAddress.toLowerCase(),
    );
  }

  public async save(securityEvent: SecurityEvent): Promise<void> {
    this.securityEvents.set(securityEvent.id, securityEvent);
  }

  public async findRecentEvents(minutes: number): Promise<SecurityEvent[]> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return Array.from(this.securityEvents.values()).filter(
      event => event.timestamp >= cutoffTime,
    );
  }

  public async findCriticalEvents(): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).filter(
      event => event.isCritical(),
    );
  }

  public async findUnresolvedEvents(): Promise<SecurityEvent[]> {
    // For demo purposes, consider events older than 1 hour as resolved
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000);
    return Array.from(this.securityEvents.values()).filter(
      event => event.timestamp >= cutoffTime,
    );
  }
} 