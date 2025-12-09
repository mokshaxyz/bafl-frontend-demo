# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## API configuration and Login

The login page is wired to your backend's authentication API.

- Default API base URL: `http://172.16.184.181:4256`
- Login endpoint path: `/api/v1/auth/login`

You can override the base URL by creating a `.env` file in the project root and setting:

```
REACT_APP_API_BASE_URL=http://127.0.0.1:4256
```

Restart the dev server after changing `.env`.

Example request the app sends on login:

```
POST {BASE_URL}/api/v1/auth/login
Content-Type: application/json
Accept: application/json

{
	"username": "raghav",
	"password": "raghav123"
}
```

On success, the app stores the returned user (and token if provided) in `localStorage` under the key `auth` for session persistence.

## Logging

This application includes a comprehensive logging system for debugging and monitoring. Logs are displayed in the browser console and can be exported for analysis.

**Key Features:**
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- Environment-aware (verbose in development, minimal in production)
- Structured logging with timestamps and context
- Export and download capabilities

**Configuration:**

Set the log level in your `.env` file:
```
REACT_APP_LOG_LEVEL=DEBUG
```

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
