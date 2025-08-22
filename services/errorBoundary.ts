// services/errorBoundary.ts
// Global error handling to prevent infinite loops

interface ErrorState {
  userProfileErrors: number;
  globalCounterErrors: number;
  lastErrorTime: number;
}

class ErrorBoundaryService {
  private errorState: ErrorState = {
    userProfileErrors: 0,
    globalCounterErrors: 0,
    lastErrorTime: 0
  };

  private readonly MAX_ERRORS = 5;
  private readonly RESET_TIME = 60000; // 1 minute

  // Check if we should block further user profile operations
  canExecuteUserProfileOperation(): boolean {
    const now = Date.now();
    
    // Reset error count if enough time has passed
    if (now - this.errorState.lastErrorTime > this.RESET_TIME) {
      this.errorState.userProfileErrors = 0;
    }

    return this.errorState.userProfileErrors < this.MAX_ERRORS;
  }

  // Record a user profile error
  recordUserProfileError(): void {
    this.errorState.userProfileErrors++;
    this.errorState.lastErrorTime = Date.now();
    
    if (this.errorState.userProfileErrors >= this.MAX_ERRORS) {
      console.warn('🚫 Too many user profile errors, temporarily blocking operations');
    }
  }

  // Check if we should block further global counter operations  
  canExecuteGlobalCounterOperation(): boolean {
    const now = Date.now();
    
    // Reset error count if enough time has passed
    if (now - this.errorState.lastErrorTime > this.RESET_TIME) {
      this.errorState.globalCounterErrors = 0;
    }

    return this.errorState.globalCounterErrors < this.MAX_ERRORS;
  }

  // Record a global counter error
  recordGlobalCounterError(): void {
    this.errorState.globalCounterErrors++;
    this.errorState.lastErrorTime = Date.now();
    
    if (this.errorState.globalCounterErrors >= this.MAX_ERRORS) {
      console.warn('🚫 Too many global counter errors, temporarily blocking operations');
    }
  }

  // Reset all error counts
  reset(): void {
    this.errorState = {
      userProfileErrors: 0,
      globalCounterErrors: 0,
      lastErrorTime: 0
    };
    console.log('✅ Error boundary reset');
  }

  // Get current error state for debugging
  getErrorState(): ErrorState {
    return { ...this.errorState };
  }
}

// Export singleton instance
export const errorBoundary = new ErrorBoundaryService();

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚫 Unhandled promise rejection:', event.reason);
  
  // Check if it's a database-related error
  if (event.reason?.message?.includes('user_profiles') || 
      event.reason?.code === '42501' ||
      event.reason?.code === 'PGRST204') {
    errorBoundary.recordUserProfileError();
    event.preventDefault(); // Prevent console spam
  }
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('🚫 Uncaught error:', event.error);
  
  // Check if it's a database-related error
  if (event.error?.message?.includes('user_profiles') || 
      event.error?.code === '42501' ||
      event.error?.code === 'PGRST204') {
    errorBoundary.recordUserProfileError();
  }
});