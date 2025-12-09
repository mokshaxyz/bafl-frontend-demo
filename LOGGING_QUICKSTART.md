# Logging Quick Start Guide

## 🚀 Quick Start

### 1. Configuration (Optional)

Create a `.env` file in the project root:

```bash
REACT_APP_LOG_LEVEL=DEBUG
```

### 2. Run the Application

```bash
npm start
```

### 3. Open Browser Console

Press `F12` or right-click → Inspect → Console tab

## 📊 What You'll See

### Application Startup
```
[2025-11-19T10:30:45.123Z] [INFO] [Main] BAFL Web Application starting
[2025-11-19T10:30:45.124Z] [INFO] [FetchInterceptor] Installing fetch interceptor
[2025-11-19T10:30:45.125Z] [INFO] [App] Application initialized
```

### Authentication Flow
```
[2025-11-19T10:31:15.456Z] [INFO] [LoginPage] Login form submitted
[2025-11-19T10:31:15.457Z] [INFO] [AuthContext] Login attempt
[2025-11-19T10:31:15.458Z] [INFO] [AuthContext] API Request: POST https://...
[2025-11-19T10:31:16.123Z] [DEBUG] [FetchInterceptor] Intercepted fetch request: POST ...
[2025-11-19T10:31:16.789Z] [DEBUG] [FetchInterceptor] Fetch response: POST ... { status: 200 }
[2025-11-19T10:31:16.790Z] [INFO] [AuthContext] Login successful
[2025-11-19T10:31:16.791Z] [INFO] [AuthContext] Persisting authentication
[2025-11-19T10:31:16.792Z] [INFO] [LoginPage] Login successful, redirecting
```

### Navigation
```
[2025-11-19T10:31:17.123Z] [DEBUG] [ProtectedRoute] Access granted to protected route
[2025-11-19T10:31:17.124Z] [DEBUG] [Dashboard] Component [Dashboard]: mounted
[2025-11-19T10:31:20.456Z] [INFO] [Dashboard] Dashboard section changed { from: 'dashboard', to: 'physical-assessment' }
```

### User Interactions
```
[2025-11-19T10:32:00.123Z] [INFO] [PhysicalAssessment] Add Session button clicked
[2025-11-19T10:32:15.456Z] [INFO] [PhysicalAssessment] Date filter changed { date: '2025-11-15' }
```

### Errors
```
[2025-11-19T10:33:00.123Z] [ERROR] [AuthContext] Login failed Error: Invalid credentials
[2025-11-19T10:33:00.124Z] [ERROR] [LoginPage] Login failed { status: 401, isServerError: false }
```

## 🔍 Inspecting Logs in Console

### View All Logs
```javascript
logger.getLogs()
```

**Output:**
```javascript
[
  {
    timestamp: "2025-11-19T10:30:45.123Z",
    level: "INFO",
    context: "Main",
    message: "BAFL Web Application starting",
    data: { environment: "development", logLevel: "DEBUG" }
  },
  // ... more logs
]
```

### Filter Logs by Level
```javascript
// Show only errors
logger.getLogs().filter(log => log.level === 'ERROR')

// Show warnings and errors
logger.getLogs().filter(log => ['WARN', 'ERROR'].includes(log.level))
```

### Filter by Context
```javascript
// Show only auth-related logs
logger.getLogs().filter(log => log.context === 'AuthContext')

// Show multiple contexts
logger.getLogs().filter(log => 
  ['AuthContext', 'LoginPage'].includes(log.context)
)
```

### Search Log Messages
```javascript
// Find logs containing "login"
logger.getLogs().filter(log => 
  log.message.toLowerCase().includes('login')
)
```

### Recent Errors
```javascript
// Get last 10 errors
logger.getLogs()
  .filter(log => log.level === 'ERROR')
  .slice(-10)
```

## 💾 Export Logs

### View as JSON String
```javascript
logger.exportLogs()
```

### Download as File
```javascript
logger.downloadLogs()
// Downloads: bafl-logs-2025-11-19T10:30:45.123Z.json
```

## 🎯 Common Use Cases

### Debugging Login Issues
1. Open console before attempting login
2. Enter credentials and submit
3. Check for ERROR logs:
   ```javascript
   logger.getLogs().filter(log => 
     log.level === 'ERROR' && 
     log.context.includes('Auth')
   )
   ```

### Tracking User Journey
```javascript
// See all navigation events
logger.getLogs().filter(log => 
  log.message.includes('Navigation') || 
  log.message.includes('section changed')
)
```

### Network Issues
```javascript
// Find all network errors
logger.getLogs().filter(log => 
  log.context === 'FetchInterceptor' && 
  log.level === 'ERROR'
)
```

### Performance Monitoring
```javascript
// Check how long operations take by looking at timestamps
const logs = logger.getLogs();
// Compare timestamps between "Login attempt" and "Login successful"
```

## 🛠️ Development Tips

### Enable Verbose Logging
```bash
# In .env file
REACT_APP_LOG_LEVEL=DEBUG
```

### Disable Logging in Testing
```bash
# In .env file
REACT_APP_LOG_LEVEL=NONE
```

### Production Logging
```bash
# In .env.production file
REACT_APP_LOG_LEVEL=WARN
```

## 📋 Console Filters

Use browser console filters to focus on specific logs:

### Chrome DevTools
1. Click filter icon (funnel) in console
2. Filter by level: `-debug` (hide debug logs)
3. Filter by context: `AuthContext` (show only auth logs)

### Firefox DevTools
1. Use filter box at top of console
2. Type keywords: `ERROR`, `AuthContext`, etc.

## 🎨 Log Level Colors

Logs appear in different colors based on level:
- **DEBUG**: Gray/Purple (console.debug)
- **INFO**: Blue (console.info)
- **WARN**: Yellow/Orange (console.warn)
- **ERROR**: Red (console.error)

## 📝 Adding Logs to Your Code

### Import Logger
```javascript
import logger from '../utils/logger';
```

### Create Context Logger
```javascript
const myLogger = logger.createChildLogger('MyComponent');
```

### Log Events
```javascript
// Info - general events
myLogger.info('Button clicked', { buttonId: 'submit' });

// Debug - detailed info
myLogger.debug('State updated', { newState: state });

// Warn - potential issues
myLogger.warn('API rate limit approaching', { remaining: 5 });

// Error - failures
myLogger.error('Failed to save', error, { userId: 123 });
```

## 🚨 Troubleshooting

### Logs Not Appearing?

1. **Check log level**: Ensure `REACT_APP_LOG_LEVEL` is set to `DEBUG`
2. **Restart dev server**: Changes to `.env` require restart
3. **Check console filters**: Clear any active filters
4. **Verify import**: Ensure logger is imported correctly

### Too Many Logs?

1. **Increase log level**: Set to `INFO` or `WARN`
2. **Use console filters**: Filter by specific contexts
3. **Clear console**: Use clear button or `clear()` command

### Can't Find Specific Logs?

1. **Use search**: Use `logger.getLogs()` with filters
2. **Check context**: Verify the component name
3. **Check timing**: Ensure the code was executed

## 📱 Mobile/Remote Debugging

For debugging on mobile devices or remote environments:

1. Connect device to desktop
2. Open remote debugging tools
3. Use `logger.downloadLogs()` to get log file
4. Share file for analysis

## ⚡ Performance Tips

- Logs have minimal impact in production (WARN level)
- Only last 100 logs are kept in memory
- Use INFO/WARN/ERROR for important events
- Use DEBUG for development-only details

## 🔗 Related Documentation

- **Full Documentation**: See `LOGGING.md`
- **Implementation Details**: See `LOGGING_SUMMARY.md`
- **Environment Setup**: See `.env.example`

---

**Happy Debugging! 🐛🔍**
