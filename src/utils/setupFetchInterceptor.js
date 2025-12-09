/*
  Global fetch interceptor to:
  - Add a default timeout to detect unresponsive servers
  - Redirect to the 500 error page on network/timeout failures

  Usage: import { setupFetchInterceptor } from './utils/setupFetchInterceptor'; setupFetchInterceptor();
*/

import logger from './logger';

const interceptorLogger = logger.createChildLogger('FetchInterceptor');

let installed = false;

function triggerNavigate500(message) {
  interceptorLogger.error('Triggering navigation to /500', null, { message });
  try {
    sessionStorage.setItem('lastServerError', message || 'Network error');
  } catch (err) {
    interceptorLogger.warn('Failed to save error to sessionStorage', err);
  }
  if (typeof window !== 'undefined') {
    if (window.location?.pathname === '/500') return;
    try {
      const evt = new CustomEvent('app:navigate-500', { detail: { message } });
      window.dispatchEvent(evt);
    } catch (e) {
      interceptorLogger.error('Failed to dispatch navigate-500 event', e);
      // Fallback: hard navigate
      try { window.location.assign('/500'); } catch (_) { /* noop */ }
    }
  }
}

export function setupFetchInterceptor(defaultTimeoutMs = 15000) {
  if (installed) {
    interceptorLogger.debug('Fetch interceptor already installed');
    return;
  }
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
    interceptorLogger.warn('Cannot install fetch interceptor: window.fetch not available');
    return;
  }

  interceptorLogger.info('Installing fetch interceptor', { defaultTimeoutMs });

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function patchedFetch(input, init) {
    // Extract URL for logging
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method || 'GET';
    
    // Extract timeout from init if provided, else use default
    const timeoutMs = (init && typeof init.timeout === 'number' && init.timeout > 0)
      ? init.timeout
      : defaultTimeoutMs;
    
    interceptorLogger.debug(`Intercepted fetch request: ${method} ${url}`, { timeout: timeoutMs });

    // Setup AbortController to enforce timeout while respecting caller's signal
    const controller = new AbortController();
    let userSignal;
    let requestInit = init || {};

    // Handle Request object input (clone with our signal)
    if (typeof Request !== 'undefined' && input instanceof Request) {
      userSignal = input.signal || requestInit.signal;
      // Rebuild Request to be able to override the signal
      input = new Request(input, { signal: controller.signal });
      // Keep init for headers/method override if provided
      if (requestInit.signal) delete requestInit.signal;
    } else {
      userSignal = requestInit.signal;
      requestInit = { ...requestInit, signal: controller.signal };
    }

    if (requestInit && 'timeout' in requestInit) {
      // eslint-disable-next-line no-unused-vars
      const { timeout, ...rest } = requestInit;
      requestInit = rest;
    }

    // Bridge aborts: if caller aborts, abort ours too
    if (userSignal) {
      if (userSignal.aborted) controller.abort();
      try {
        userSignal.addEventListener('abort', () => controller.abort(), { once: true });
      } catch (_) {
        // ignore
      }
    }

    // Start timeout timer
    let timedOut = false;
    const timer = timeoutMs ? setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs) : null;

    try {
      const res = await originalFetch(input, requestInit);
      interceptorLogger.debug(`Fetch response: ${method} ${url}`, { status: res.status });
      // NOTE: We intentionally do NOT redirect on 5xx here to keep behavior explicit per call.
      return res;
    } catch (err) {
      // Ignore expected AbortError if the caller intentionally aborted
      const isAbort = err && (err.name === 'AbortError' || err.code === 'ERR_CANCELED');
      if (timedOut) {
        interceptorLogger.error(`Fetch timeout: ${method} ${url}`, err, { timeoutMs });
        triggerNavigate500('Request timed out. The server may be unavailable.');
      } else if (!isAbort) {
        const message = err?.message || 'Network error';
        interceptorLogger.error(`Fetch error: ${method} ${url}`, err, { message });
        triggerNavigate500(message);
      } else {
        interceptorLogger.debug(`Fetch aborted: ${method} ${url}`);
      }
      throw err;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  installed = true;
}
