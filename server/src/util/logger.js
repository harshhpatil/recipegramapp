/**
 * Server-side logger: debug/info messages are suppressed in production.
 * Errors are always forwarded to the console.
 */
const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  log: (...args) => isDev && console.log(...args),
  warn: (...args) => isDev && console.warn(...args),
  /** Errors are always logged regardless of environment. */
  error: (...args) => console.error(...args),
  /** Important startup/lifecycle messages that should always appear. */
  info: (...args) => console.log(...args),
};

export default logger;
