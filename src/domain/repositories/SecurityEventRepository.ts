import { SecurityEvent, SecurityEventType, SecurityEventSeverity } from '../entities/SecurityEvent';

export interface SecurityEventRepository {
  findById(id: string): Promise<SecurityEvent | null>;
  findByType(type: SecurityEventType): Promise<SecurityEvent[]>;
  findBySeverity(severity: SecurityEventSeverity): Promise<SecurityEvent[]>;
  findByUserAddress(userAddress: string): Promise<SecurityEvent[]>;
  save(securityEvent: SecurityEvent): Promise<void>;
  findRecentEvents(minutes: number): Promise<SecurityEvent[]>;
  findCriticalEvents(): Promise<SecurityEvent[]>;
  findUnresolvedEvents(): Promise<SecurityEvent[]>;
} 