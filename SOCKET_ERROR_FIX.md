# Socket Initialization & Error Boundary Implementation

## Problem
The application was experiencing a **ReferenceError** when initializing the WebSocket connection because the code was attempting to use `process.env` (a Node.js global) in a browser context where it's undefined.

### Root Cause
- **Vite** (modern ESM bundler) no longer automatically injects Node.js polyfills like Webpack did
- `process.env.REACT_APP_API_URL` was being referenced in `client/src/utils/socket.js`
- This caused an unhandled exception during the AuthInitializer mount effect
- The exception crashed the entire component tree

## Solution Implemented

### 1. **Fixed Socket Initialization** (`client/src/utils/socket.js`)

#### Changed:
```javascript
const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
```

#### To:
```javascript
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
```

**Why**: 
- `import.meta.env` is Vite's standard way to access environment variables
- Requires env vars to use `VITE_` prefix (matching `.env` configuration)
- Compile-time resolution means no runtime errors

#### Added Error Handling:
```javascript
try {
  // ... socket initialization code ...
  return socket;
} catch (error) {
  console.error("Failed to initialize socket:", error);
  // Return mock socket with no-op methods
  return {
    on: () => {},
    off: () => {},
    emit: () => {},
    disconnect: () => {}
  };
}
```

**Why**: 
- Prevents socket initialization errors from crashing the app
- Returns a mock socket that gracefully accepts method calls
- App remains functional even if WebSocket connection fails

### 2. **Created Error Boundary Component** (`client/src/components/common/ErrorBoundary.jsx`)

A React class component that catches and gracefully handles errors in child components:

```jsx
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    // ... log error info ...
  }

  render() {
    if (this.state.hasError) {
      return <ErrorUI />; // Fallback UI
    }
    return this.props.children;
  }
}
```

**Features**:
- Catches all errors in child component tree
- Displays user-friendly error message
- Shows detailed error info in development mode
- Provides "Return to Home" recovery button

### 3. **Wrapped App with Error Boundary** (`client/src/main.jsx`)

```jsx
<StrictMode>
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
</StrictMode>
```

**Why**: 
- Prevents entire app from unmounting on uncaught errors
- Provides graceful degradation when something fails

### 4. **Enhanced AuthInitializer** (`client/src/components/common/AuthInitializer.jsx`)

Added error handling for async operations:
```javascript
getCurrentUser().catch((error) => {
  console.error('Failed to fetch current user:', error);
});
```

And socket disconnection:
```javascript
try {
  getDisconnectSocket();
} catch (error) {
  console.warn('Error disconnecting socket:', error);
}
```

### 5. **Fortified useSocket Hook** (`client/src/hooks/useSocket.js`)

Wrapped each socket event handler in try-catch:
```javascript
socket.on("receive_message", (data) => {
  try {
    dispatch(addReceivedMessage(data));
    dispatch(incrementUnreadCount());
  } catch (error) {
    console.error("Error handling receive_message:", error);
  }
});
```

Plus outer try-catch for initialization:
```javascript
useEffect(() => {
  try {
    const socket = initializeSocket(token);
    // ... setup event handlers ...
  } catch (error) {
    console.error("Error initializing socket:", error);
    return () => {};
  }
}, [token, dispatch]);
```

## Environment Variables Reference

### Current Configuration (`.env`)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=10000
VITE_APP_NAME=RecipeGram
VITE_APP_DESCRIPTION=Share and discover amazing recipes
```

### Vite Variable Requirements
- **Prefix**: All variables must start with `VITE_`
- **Access**: Use `import.meta.env.VITE_*`
- **Build-time**: All variables are resolved at build time
- **Type**: All values are strings

## Testing the Fix

### Browser Console Should Show:
1. ✅ No "ReferenceError" for `process`
2. ✅ Socket connection log: `"Socket connected: [socket.id]"`
3. ✅ Proper env variable loading: `"Socket URL: http://localhost:5000"`

### Error Scenarios Now Handled:
1. ✅ Socket initialization fails → Mock socket prevents app crash
2. ✅ Message handler error → Logged, other handlers continue
3. ✅ Any child component error → Error Boundary catches it
4. ✅ User sees fallback UI instead of white screen

## Files Modified

| File | Changes |
|------|---------|
| `client/src/utils/socket.js` | Replaced `process.env` with `import.meta.env`, added try-catch |
| `client/src/components/common/ErrorBoundary.jsx` | **New** - Global error catcher component |
| `client/src/main.jsx` | Wrapped App with ErrorBoundary |
| `client/src/components/common/AuthInitializer.jsx` | Added error handling for async operations |
| `client/src/hooks/useSocket.js` | Added try-catch around socket initialization and event handlers |

## Build Status

✅ **Build Successful**
```
✓ 174 modules transformed
✓ built in 1.53s
```

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Environment Access** | ❌ Crashes on `process.env` | ✅ Safe with `import.meta.env` |
| **Socket Failures** | ❌ App unmounts | ✅ Mock socket + graceful fallback |
| **Event Errors** | ❌ Whole hook crashes | ✅ Individual handlers wrapped |
| **Parent Errors** | ❌ White screen of death | ✅ Error Boundary UI |
| **Debug Info** | ❌ Hidden in prod | ✅ Stack traces in dev mode |

## Migration Notes

### For Developers
- Always use `import.meta.env.VITE_*` for browser-side environment variables
- Use `process.env.*` only in Node.js server code
- Wrap async operations in try-catch
- Test error scenarios to ensure graceful degradation

### For Deployment
- Ensure `.env` file has `VITE_` prefixed variables
- Vite builds include environment values at build time
- No runtime environment variable changes possible
- All vars must be set before build

## Future Improvements

1. **Persistent Error Logging**: Send errors to logging service
2. **Offline Support**: Detect no socket and disable messaging features
3. **Reconnection UI**: Show reconnection attempts to user
4. **Custom Error Pages**: Different UIs for different error types
5. **Telemetry**: Track error frequency and types

## References

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Socket.io Connection State](https://socket.io/docs/v4/client-api/#socket-connect)
