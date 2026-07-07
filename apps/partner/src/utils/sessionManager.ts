import { toast } from 'react-hot-toast';

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  onTimeout: () => void;
  onWarning?: () => void;
}

class SessionManager {
  private timeoutId: number | null = null;
  private warningId: number | null = null;
  private config: SessionConfig;
  private lastActivity: number = Date.now();
  private isActive: boolean = false;

  constructor(config: SessionConfig) {
    this.config = config;
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.lastActivity = Date.now();
    this.resetTimers();
    this.addEventListeners();
    
    console.log('Session manager started');
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.clearTimers();
    this.removeEventListeners();
    
    console.log('Session manager stopped');
  }

  resetSession() {
    if (!this.isActive) return;
    
    this.lastActivity = Date.now();
    this.resetTimers();
  }

  private resetTimers() {
    this.clearTimers();
    
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    const warningMs = (this.config.timeoutMinutes - this.config.warningMinutes) * 60 * 1000;

    // Set warning timer
    if (this.config.onWarning && this.config.warningMinutes > 0) {
      this.warningId = window.setTimeout(() => {
        if (this.isActive) {
          this.config.onWarning?.();
          this.showWarningToast();
        }
      }, warningMs);
    }

    // Set timeout timer
    this.timeoutId = window.setTimeout(() => {
      if (this.isActive) {
        this.handleTimeout();
      }
    }, timeoutMs);
  }

  private clearTimers() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningId) {
      window.clearTimeout(this.warningId);
      this.warningId = null;
    }
  }

  private handleTimeout() {
    this.stop();
    toast.error('Session expired. Please login again.');
    this.config.onTimeout();
  }

  private showWarningToast() {
    toast(
      `Your session will expire in ${this.config.warningMinutes} minutes. Click anywhere to stay logged in.`,
      {
        duration: 10000,
        position: 'top-center',
        icon: '⚠️',
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fbbf24'
        }
      }
    );
  }

  private handleActivity = () => {
    if (!this.isActive) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    
    // Only reset if enough time has passed (prevent excessive resets)
    if (timeSinceLastActivity > 30000) { // 30 seconds
      this.resetSession();
    }
  };

  private addEventListeners() {
    // Mouse and keyboard events
    document.addEventListener('mousedown', this.handleActivity);
    document.addEventListener('mousemove', this.handleActivity);
    document.addEventListener('keypress', this.handleActivity);
    document.addEventListener('scroll', this.handleActivity);
    document.addEventListener('touchstart', this.handleActivity);
    document.addEventListener('click', this.handleActivity);

    // Page visibility change
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Window focus events
    window.addEventListener('focus', this.handleActivity);
  }

  private removeEventListeners() {
    document.removeEventListener('mousedown', this.handleActivity);
    document.removeEventListener('mousemove', this.handleActivity);
    document.removeEventListener('keypress', this.handleActivity);
    document.removeEventListener('scroll', this.handleActivity);
    document.removeEventListener('touchstart', this.handleActivity);
    document.removeEventListener('click', this.handleActivity);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleActivity);
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Check if session should have expired while page was hidden
      const now = Date.now();
      const timeAway = now - this.lastActivity;
      const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
      
      if (timeAway >= timeoutMs) {
        this.handleTimeout();
      } else {
        this.resetSession();
      }
    }
  };

  getTimeRemaining(): number {
    if (!this.isActive) return 0;
    
    const now = Date.now();
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    const elapsed = now - this.lastActivity;
    const remaining = Math.max(0, timeoutMs - elapsed);
    
    return Math.floor(remaining / 1000); // Return seconds
  }

  isSessionActive(): boolean {
    return this.isActive;
  }
}

// Create a singleton instance
let sessionManager: SessionManager | null = null;

export const createSessionManager = (config: SessionConfig): SessionManager => {
  if (sessionManager) {
    sessionManager.stop();
  }
  sessionManager = new SessionManager(config);
  return sessionManager;
};

export const getSessionManager = (): SessionManager | null => {
  return sessionManager;
};

export const destroySessionManager = () => {
  if (sessionManager) {
    sessionManager.stop();
    sessionManager = null;
  }
};

// Default configuration
export const DEFAULT_SESSION_CONFIG: Omit<SessionConfig, 'onTimeout'> = {
  timeoutMinutes: 30, // 30 minutes timeout
  warningMinutes: 5,  // Show warning 5 minutes before timeout
};

export default SessionManager;
