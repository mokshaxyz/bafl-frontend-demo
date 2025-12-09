# BAFL Web Application - Logging Documentation

## Overview

A comprehensive logging system has been added to the BAFL Web Application. The logging utility provides structured, environment-aware logging with multiple log levels and centralized log management.

## Features

- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR, NONE
- **Environment-Aware**: Automatically adjusts verbosity based on environment (development vs production)
- **Centralized Management**: Single source of truth for all application logs
- **Context-Based Logging**: Each module can create its own logger with specific context
- **Memory Storage**: Logs are stored in memory for debugging and can be exported
- **Structured Output**: Consistent timestamp and context formatting

## Log Levels

### DEBUG (Level 0)
- Most verbose level
- Detailed information for debugging
- Shows component lifecycle, state changes, etc.
- **Default in development mode**

### INFO (Level 1)
- General informational messages
- User actions, navigation, successful operations
- Important state transitions

### WARN (Level 2)
- Warning messages for potentially harmful situations
- Non-critical issues that don't prevent functionality
- **Default in production mode**

### ERROR (Level 3)
- Error messages and exceptions
- Failed operations, network errors, auth failures
- Includes error stack traces

### NONE (Level 4)
- Disables all logging

## Configuration

### Environment Variables

Add to your `.env` file to configure logging:

```bash
# Set log level (DEBUG, INFO, WARN, ERROR, NONE)
REACT_APP_LOG_LEVEL=DEBUG
```

If not specified:
- **Development**: Defaults to DEBUG (show everything)
- **Production**: Defaults to WARN (only warnings and errors)

## Usage

### Basic Usage

```javascript
import logger from '../utils/logger';

// Create a logger for your component/module
const myLogger = logger.createChildLogger('MyComponent');

// Log at different levels
myLogger.debug('Detailed debug information', { data: someData });
myLogger.info('User clicked button', { buttonId: 'submit' });
myLogger.warn('API rate limit approaching', { remaining: 5 });
myLogger.error('Failed to fetch data', error, { userId: 123 });
```

### Specialized Logging Methods

```javascript
// Log API requests
myLogger.logRequest('POST', 'https://api.example.com/login', { username: 'user' });

// Log API responses
myLogger.logResponse('POST', 'https://api.example.com/login', 200, { token: '...' });

// Log navigation
myLogger.logNavigation('/login', '/dashboard', 'Successful authentication');

// Log authentication events
myLogger.logAuth('Login attempt', { username: 'user' });

// Log component lifecycle
myLogger.logComponentLifecycle('MyComponent', 'mounted', { props: {} });
```

## Viewing Logs

### Console Output

All logs are written to the browser console using appropriate console methods:
- `console.debug()` for DEBUG
- `console.info()` for INFO
- `console.warn()` for WARN
- `console.error()` for ERROR

### Stored Logs

Logs are stored in memory (last 100 entries by default):

```javascript
// Get all stored logs
const logs = logger.getLogs();

// Export logs as JSON
const jsonLogs = logger.exportLogs();

// Download logs as a file
logger.downloadLogs(); // Downloads bafl-logs-[timestamp].json
```

## Implementation Details

### Components with Logging

The following components now include comprehensive logging:

1. **AuthContext** (`src/context/AuthContext.js`)
   - Login/logout events
   - Token persistence
   - API authentication calls

2. **LoginPage** (`src/components/LoginPage.js`)
   - Form submissions
   - Login success/failure
   - Navigation redirects

3. **Dashboard** (`src/components/Dashboard.js`)
   - Component lifecycle
   - Section navigation
   - Screen size changes

4. **PhysicalAssessment** (`src/components/PhysicalAssessment/PhysicalAssessment.jsx`)
   - Session management actions
   - Date filter changes

5. **ProtectedRoute** (`src/components/ProtectedRoute.js`)
   - Access control decisions
   - Unauthorized access attempts

6. **GlobalErrorHandler** (`src/components/GlobalErrorHandler.jsx`)
   - Global error events
   - Error page navigation

7. **FetchInterceptor** (`src/utils/setupFetchInterceptor.js`)
   - All HTTP requests
   - Network timeouts
   - Request/response details

### Log Format

Logs follow this format:
```
[2025-11-19T10:30:45.123Z] [LEVEL] [Context] Message
```

Example:
```
[2025-11-19T10:30:45.123Z] [INFO] [AuthContext] Login attempt { username: 'user123' }
```

## Best Practices

1. **Use Appropriate Log Levels**
   - DEBUG: Development-time detailed information
   - INFO: User actions and important state changes
   - WARN: Recoverable issues or concerning situations
   - ERROR: Failures and exceptions

2. **Include Context**
   - Always create child loggers with meaningful context names
   - Pass relevant data objects to provide debugging context

3. **Don't Log Sensitive Data**
   - Never log passwords, tokens in full, or PII
   - Redact sensitive information before logging

4. **Use Structured Data**
   - Pass objects as the second parameter instead of string concatenation
   - This makes logs easier to search and analyze

5. **Log State Transitions**
   - Log before and after important operations
   - Include relevant identifiers (IDs, usernames, etc.)

## Example Usage in New Components

```javascript
import React, { useEffect, useState } from 'react';
import logger from '../utils/logger';

const componentLogger = logger.createChildLogger('NewComponent');

function NewComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    componentLogger.logComponentLifecycle('NewComponent', 'mounted');
    
    fetchData()
      .then(result => {
        componentLogger.info('Data fetched successfully', { count: result.length });
        setData(result);
      })
      .catch(error => {
        componentLogger.error('Failed to fetch data', error);
      });

    return () => {
      componentLogger.logComponentLifecycle('NewComponent', 'unmounted');
    };
  }, []);

  const handleClick = () => {
    componentLogger.info('Button clicked', { action: 'submit' });
    // Handle click logic
  };

  return (
    <div>
      <button onClick={handleClick}>Submit</button>
    </div>
  );
}
```

## Debugging with Logs

### During Development

1. Open browser DevTools (F12)
2. Go to Console tab
3. Filter by log level using DevTools filters
4. Search for specific context names (e.g., "AuthContext")

### For Bug Reports

1. Reproduce the issue
2. Run `logger.downloadLogs()` in console
3. Attach the downloaded JSON file to bug report

### Analyzing Issues

```javascript
// In browser console:

// View all logs
logger.getLogs()

// Filter logs by level
logger.getLogs().filter(log => log.level === 'ERROR')

// Find logs from specific context
logger.getLogs().filter(log => log.context === 'AuthContext')

// Download for offline analysis
logger.downloadLogs()
```

## Performance Considerations

- Logs are stored in memory (last 100 entries)
- Older logs are automatically purged to prevent memory issues
- In production (WARN level), minimal logging overhead
- DEBUG level may impact performance with high-frequency events

## Future Enhancements

Potential improvements to consider:

1. **Remote Logging**: Send logs to backend/monitoring service
2. **User Session Context**: Include session ID in all logs
3. **Performance Metrics**: Log performance timing data
4. **Log Filtering**: Advanced filtering in UI
5. **Log Persistence**: Store logs in localStorage between sessions

## Troubleshooting

### Logs Not Appearing

1. Check log level configuration
2. Verify logger is imported correctly
3. Check browser console filters
4. Ensure `REACT_APP_LOG_LEVEL` is set correctly

### Too Many Logs

1. Increase log level (INFO or WARN)
2. Use console filters to focus on specific contexts
3. In production, set `REACT_APP_LOG_LEVEL=WARN`

### Missing Context

1. Ensure you're using `createChildLogger()` with a meaningful name
2. Check that logger is initialized before use

## Support

For questions or issues with the logging system, please contact the development team or open an issue in the project repository.
