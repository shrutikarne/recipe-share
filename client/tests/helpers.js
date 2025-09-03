// Shared Playwright helpers for common app flows
// Usage: import { registerAndLogin, setToken } from './helpers';

import { expect } from '@playwright/test';

export function uniqueEmail(prefix = 'user') {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}.${rand}@example.com`;
}

// Registers (best-effort) and logs in via backend API, returns { token }
// Expects CRA proxy to point to http://localhost:5000 or pass baseApiUrl explicitly
export async function registerAndLogin(request, {
  name = 'Test User',
  email = uniqueEmail('testuser'),
  password = 'testpassword123',
  baseApiUrl = 'http://localhost:5000/api',
} = {}) {
  try {
    await request.post(`${baseApiUrl}/auth/register`, {
      data: { name, email, password },
    });
  } catch {
    // Ignore if already exists
  }
  const loginResp = await request.post(`${baseApiUrl}/auth/login`, {
    data: { email, password },
  });
  const json = await loginResp.json();
  if (!json?.token) {
    throw new Error('Login did not return a token');
  }
  return { token: json.token, email, password };
}

// Stores a value in localStorage before navigation (kept for backwards-compat)
export async function setToken(page, token, storageKey = 'token') {
  await page.addInitScript((args) => {
    const { storageKey, token } = args;
    try { window.localStorage.setItem(storageKey, token); } catch {}
  }, { storageKey, token });
}

// Mark user as authenticated via sessionStorage (app uses HTTP-only cookie semantics)
export async function setSessionAuthenticated(page, { userId = 'user-123', expiresInMinutes = 30 } = {}) {
  const expiry = Date.now() + expiresInMinutes * 60 * 1000;
  await page.addInitScript((args) => {
    const { userId, expiry } = args;
    try {
      window.sessionStorage.setItem('isAuthenticated', 'true');
      window.sessionStorage.setItem('userId', userId);
      window.sessionStorage.setItem('tokenExpiry', String(expiry));
    } catch {}
  }, { userId, expiry });
}

// Convenience: full auth bootstrap for routes that require auth
export async function bootstrapAuth(page, _request, options = {}) {
  // For this app, sessionStorage flags gate PrivateRoute.
  await setSessionAuthenticated(page, { userId: options.userId || 'e2e-user' });
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
}
