import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global user directory: ~/.hooshang-mcp/session.json
export const USER_CONFIG_DIR = path.join(os.homedir(), '.hooshang-mcp');
export const GLOBAL_SESSION_FILE = path.join(USER_CONFIG_DIR, 'session.json');
export const LOCAL_SESSION_FILE = path.join(__dirname, 'session.json');

/**
 * Resolve session file path based on existence
 */
export function getSessionFilePath() {
  if (fs.existsSync(GLOBAL_SESSION_FILE)) {
    return GLOBAL_SESSION_FILE;
  }
  if (fs.existsSync(LOCAL_SESSION_FILE)) {
    return LOCAL_SESSION_FILE;
  }
  return GLOBAL_SESSION_FILE;
}

/**
 * Get active session credentials
 */
export function getSessionData() {
  // 1. Environment variables (Highest priority)
  if (process.env.HOOSHANG_SESSION_TOKEN || process.env.HOOSHANG_COOKIE) {
    const token = process.env.HOOSHANG_SESSION_TOKEN || process.env.HOOSHANG_TOKEN || '';
    const cookie = process.env.HOOSHANG_COOKIE || (token ? `__Secure-authjs.session-token=${token}` : '');
    return {
      cookie,
      token,
      source: 'environment',
      userAgent: process.env.HOOSHANG_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
  }

  // 2. User home directory ~/.hooshang-mcp/session.json
  if (fs.existsSync(GLOBAL_SESSION_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(GLOBAL_SESSION_FILE, 'utf-8'));
      return { ...data, source: 'global_config', path: GLOBAL_SESSION_FILE };
    } catch (e) {
      console.error('[Hooshang Auth] Failed to parse global session.json:', e.message);
    }
  }

  // 3. Local fallback ./session.json
  if (fs.existsSync(LOCAL_SESSION_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(LOCAL_SESSION_FILE, 'utf-8'));
      return { ...data, source: 'local_config', path: LOCAL_SESSION_FILE };
    } catch (e) {
      console.error('[Hooshang Auth] Failed to parse local session.json:', e.message);
    }
  }

  return {
    cookie: '',
    token: '',
    source: 'none',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  };
}

/**
 * Save session credentials securely to ~/.hooshang-mcp/session.json
 */
export function saveSessionData(data) {
  if (!fs.existsSync(USER_CONFIG_DIR)) {
    fs.mkdirSync(USER_CONFIG_DIR, { recursive: true, mode: 0o700 });
  }

  const current = getSessionData();
  const merged = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString()
  };

  // If only token was provided, format cookie automatically
  if (merged.token && !merged.cookie) {
    merged.cookie = `__Secure-authjs.session-token=${merged.token}`;
  }

  fs.writeFileSync(GLOBAL_SESSION_FILE, JSON.stringify(merged, null, 2), { encoding: 'utf-8', mode: 0o600 });
  return merged;
}

/**
 * Clear stored session credentials
 */
export function clearSession() {
  if (fs.existsSync(GLOBAL_SESSION_FILE)) {
    fs.unlinkSync(GLOBAL_SESSION_FILE);
  }
  if (fs.existsSync(LOCAL_SESSION_FILE)) {
    fs.unlinkSync(LOCAL_SESSION_FILE);
  }
}

/**
 * Check if a session token exists
 */
export function hasValidSession() {
  const session = getSessionData();
  return Boolean(session.cookie || session.token);
}
