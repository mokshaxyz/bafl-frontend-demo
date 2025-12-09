/**
 * Centralized logging utility for the BAFL Web Application
 * Provides structured logging with multiple log levels and environment-aware output
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

class Logger {
  constructor() {
    // Set log level based on environment
    // In production, default to WARN (only warnings and errors)
    // In development, default to DEBUG (show everything)
    const isDevelopment = process.env.NODE_ENV === 'development';
    const envLevel = process.env.REACT_APP_LOG_LEVEL;
    
    if (envLevel && LOG_LEVELS[envLevel.toUpperCase()] !== undefined) {
      this.level = LOG_LEVELS[envLevel.toUpperCase()];
    } else {
      this.level = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
    }

    this.context = 'APP';
    this.logs = []; // Store logs in memory for debugging
    this.maxStoredLogs = 100;
  }

  /**
   * Set the logging context (e.g., component name, module name)
   */
  setContext(context) {
    this.context = context;
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = null) {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context;
    return `[${timestamp}] [${level}] [${ctx}]`;
  }

  /**
   * Store log in memory (useful for debugging or sending to backend)
   */
  storeLog(level, message, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data,
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxStoredLogs) {
      this.logs.shift();
    }
  }

  /**
   * Get all stored logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Clear stored logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * DEBUG level logging - detailed information for debugging
   */
  debug(message, data = null) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      const prefix = this.formatMessage('DEBUG', message);
      console.debug(prefix, message, data || '');
      this.storeLog('DEBUG', message, data);
    }
  }

  /**
   * INFO level logging - general informational messages
   */
  info(message, data = null) {
    if (this.level <= LOG_LEVELS.INFO) {
      const prefix = this.formatMessage('INFO', message);
      console.info(prefix, message, data || '');
      this.storeLog('INFO', message, data);
    }
  }

  /**
   * WARN level logging - warning messages for potentially harmful situations
   */
  warn(message, data = null) {
    if (this.level <= LOG_LEVELS.WARN) {
      const prefix = this.formatMessage('WARN', message);
      console.warn(prefix, message, data || '');
      this.storeLog('WARN', message, data);
    }
  }

  /**
   * ERROR level logging - error messages
   */
  error(message, error = null, data = null) {
    if (this.level <= LOG_LEVELS.ERROR) {
      const prefix = this.formatMessage('ERROR', message);
      console.error(prefix, message, error || '', data || '');
      this.storeLog('ERROR', message, { error: error?.toString(), stack: error?.stack, ...data });
    }
  }

  /**
   * Log API requests
   */
  logRequest(method, url, data = null) {
    this.info(`API Request: ${method} ${url}`, data);
  }

  /**
   * Log API responses
   */
  logResponse(method, url, status, data = null) {
    if (status >= 400) {
      this.error(`API Response Error: ${method} ${url} - Status ${status}`, null, data);
    } else {
      this.debug(`API Response: ${method} ${url} - Status ${status}`, data);
    }
  }

  /**
   * Log navigation events
   */
  logNavigation(from, to, reason = null) {
    this.info(`Navigation: ${from} -> ${to}`, { reason });
  }

  /**
   * Log authentication events
   */
  logAuth(event, data = null) {
    this.info(`Auth: ${event}`, data);
  }

  /**
   * Log component lifecycle events
   */
  logComponentLifecycle(component, event, data = null) {
    this.debug(`Component [${component}]: ${event}`, data);
  }

  /**
   * Create a child logger with a specific context
   */
  createChildLogger(context) {
    const childLogger = new Logger();
    childLogger.level = this.level;
    childLogger.context = context;
    childLogger.logs = this.logs; // Share the same log storage
    return childLogger;
  }

  /**
   * Export logs as JSON (useful for sending to backend or downloading)
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Download logs as a file
   */
  downloadLogs() {
    const dataStr = this.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bafl-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const logger = new Logger();

// Make logger available globally in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.logger = logger;
  console.info('[Logger] Logger is available globally via window.logger for debugging');
}

export default logger;
export { LOG_LEVELS };
