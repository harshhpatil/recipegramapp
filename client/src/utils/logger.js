/**
 * Dev-only logger: debug/info messages are suppressed in production builds.
 * Errors are always forwarded to the console.
 */
const isDev = import.meta.env.DEV;

const logger = {
  log: (...args) => isDev && console.log(...args),
  warn: (...args) => isDev && console.warn(...args),
  /** Errors are always logged regardless of environment. */
  error: (...args) => console.error(...args),
};

export default logger;
