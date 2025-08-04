import { SecurityEvent } from '../../domain/entities/SecurityEvent';
import { EmergencyCircuitBreakerService } from '../../domain/services/EmergencyCircuitBreakerService';

interface EmergencyStatus {
  isPaused: boolean;
  pauseReason: string | null;
  pausedAt: Date | null;
  pausedBy: string | null;
}

export class EmergencyCircuitBreakerServiceImpl implements EmergencyCircuitBreakerService {
  private emergencyStatus: EmergencyStatus = {
    isPaused: false,
    pauseReason: null,
    pausedAt: null,
    pausedBy: null,
  };

  public async triggerPause(securityEvent: SecurityEvent): Promise<void> {
    if (securityEvent.isCritical() || securityEvent.isHighPriority()) {
      this.emergencyStatus = {
        isPaused: true,
        pauseReason: securityEvent.description,
        pausedAt: new Date(),
        pausedBy: securityEvent.userAddress || 'system',
      };

      console.log(`🚨 EMERGENCY: Protocol paused due to ${securityEvent.type}: ${securityEvent.description}`);
    }
  }

  public async resumeProtocol(): Promise<void> {
    this.emergencyStatus = {
      isPaused: false,
      pauseReason: null,
      pausedAt: null,
      pausedBy: null,
    };

    console.log('✅ Protocol resumed successfully');
  }

  public async isProtocolPaused(): Promise<boolean> {
    return this.emergencyStatus.isPaused;
  }

  public async getPauseReason(): Promise<string | null> {
    return this.emergencyStatus.pauseReason;
  }

  public async validateEmergencyAction(securityEvent: SecurityEvent): Promise<boolean> {
    // Only allow critical or high priority events to trigger circuit breaker
    return securityEvent.isCritical() || securityEvent.isHighPriority();
  }

  public async getEmergencyStatus(): Promise<{
    isPaused: boolean;
    pauseReason: string | null;
    pausedAt: Date | null;
    pausedBy: string | null;
  }> {
    return { ...this.emergencyStatus };
  }
} 