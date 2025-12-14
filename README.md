# BAFL Web Application

A React-based frontend application for managing attendance, invoices, and physical assessments with secure authentication.

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Logging](#logging)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bafl-frontend-demo

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── components/          # React components
│   ├── Attendance/      # Attendance marking & summary
│   ├── Invoice/         # Invoice generation
│   ├── Reports/         # Physical assessment reports
│   ├── Layout/          # App layout wrapper
│   ├── Navbar/          # Navigation bar
│   ├── Sidebar/         # Sidebar navigation
│   └── Errors/          # Error pages
├── context/             # React Context (AuthContext)
├── services/            # API client and helpers
├── utils/               # Utility functions (logger, interceptors)
├── styles/              # Global CSS and theme
└── public/              # Static assets
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
REACT_APP_API_BASE_URL=https://bafl-backend.onrender.com/api/v1

# Logging Level (DEBUG, INFO, WARN, ERROR)
REACT_APP_LOG_LEVEL=INFO

# Node environment
NODE_ENV=development
```

**Note:** Never commit `.env` files. Use `.env.example` for templates.

### Development Proxy

For local development with a backend on your network:

1. Update `package.json` proxy:
   ```json
   "proxy": "http://YOUR_API_HOST:PORT"
   ```
2. Leave `REACT_APP_API_BASE_URL` unset (app will use proxy)

## Authentication

### Login Flow

1. User submits credentials on `/login`
2. Frontend sends POST to `/auth/login`
3. Backend returns:
   ```json
   {
     "access_token": "string",
     "refresh_token": "string",
     "token_type": "bearer",
     "user": {
       "user_id": 0,
       "name": "string",
       "username": "string",
       "role": "string"
     }
   }
   ```
4. Frontend stores in `localStorage.auth`:
   ```json
   {
     "token": "<access_token>",
     "user": { ... }
   }
   ```

### Protected Routes

All routes except `/login` are protected via `<ProtectedRoute>`. Unauthorized users are redirected to login.

### Token Management

- Token automatically attached to all API requests as: `Authorization: Bearer <token>`
- Token persists across browser sessions
- Token cleared on logout

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test

# Analyze bundle size
npm run build -- --analyze
```

### Code Style

- Use ES6+ syntax
- Follow React hooks best practices
- Keep components functional and composable
- Add meaningful comments for complex logic

### Debugging

1. **Console Logs**: Browser DevTools (F12)
2. **Network Tab**: Check API requests/responses
3. **Application Storage**: Inspect `localStorage.auth`
4. **React DevTools**: Browser extension for component inspection

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

Tests are located in `__tests__` directories alongside components.

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy on push to main branch

```bash
# Local preview of production build
npm run build
npm install -g serve
serve -s build
```

### Environment Variables for Production

- `REACT_APP_API_BASE_URL`: Must be HTTPS and absolute URL
- `REACT_APP_LOG_LEVEL`: Set to `WARN` or `ERROR`
- `NODE_ENV`: Automatically set to `production`

## Logging

The application includes a structured logging system:

### Features

- **Multiple Levels**: DEBUG, INFO, WARN, ERROR
- **Structured Output**: Timestamps, context, and metadata
- **Environment-Aware**: Verbose in dev, minimal in prod
- **Module-Based**: Each module has its own logger instance

### Usage

```javascript
import logger from './utils/logger';
const myLogger = logger.createChildLogger('MyModule');
myLogger.info('Operation successful', { userId: 123 });
```

### Configuration

Set log level in `.env`:

```env
REACT_APP_LOG_LEVEL=DEBUG  # or INFO, WARN, ERROR
```

## Troubleshooting

### 401 Unauthorized Errors

- Check `localStorage.auth.token` exists
- Verify token is not expired
- Check browser console for API errors
- Ensure `REACT_APP_API_BASE_URL` is correct

### CORS Issues

- In development: Use `package.json` proxy to backend
- In production: Backend must have CORS headers for frontend domain

### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Blank Login Page

- Check browser console for errors
- Verify all CSS files are loaded
- Check if `REACT_APP_API_BASE_URL` is reachable

## Contributing

1. Create a feature branch: `git checkout -b feature/description`
2. Commit changes with clear messages
3. Push and create a Pull Request
4. Ensure tests pass before merging

## License

Private project. All rights reserved.

## Support

For issues or questions, contact the development team.

Options: `DEBUG`, `INFO`, `WARN`, `ERROR`, `NONE`

**Usage:**

View logs in browser console or export them:
```javascript
// In browser console
logger.getLogs()        // View all logs
logger.downloadLogs()   // Download as JSON file
```

For detailed documentation, see [LOGGING.md](./LOGGING.md)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
