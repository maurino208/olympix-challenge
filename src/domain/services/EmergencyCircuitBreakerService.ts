import { SecurityEvent } from '../entities/SecurityEvent';

export interface EmergencyCircuitBreakerService {
  triggerPause(securityEvent: SecurityEvent): Promise<void>;
  resumeProtocol(): Promise<void>;
  isProtocolPaused(): Promise<boolean>;
  getPauseReason(): Promise<string | null>;
  validateEmergencyAction(securityEvent: SecurityEvent): Promise<boolean>;
  getEmergencyStatus(): Promise<{
    isPaused: boolean;
    pauseReason: string | null;
    pausedAt: Date | null;
    pausedBy: string | null;
  }>;
} 