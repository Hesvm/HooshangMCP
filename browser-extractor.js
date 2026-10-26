import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { saveSessionData } from './auth-manager.js';
import { checkAuthStatus } from './api-client.js';

/**
 * Locate Firefox cookies.sqlite database across OS profiles
 */
export function findFirefoxCookieDatabases() {
  const platform = os.platform();
  const homedir = os.homedir();
  let baseDir = null;

  if (platform === 'win32') {
    baseDir = path.join(process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming'), 'Mozilla', 'Firefox', 'Profiles');
  } else if (platform === 'darwin') {
    baseDir = path.join(homedir, 'Library', 'Application Support', 'Firefox', 'Profiles');
  } else {
    baseDir = path.join(homedir, '.mozilla', 'firefox');
  }

  if (!baseDir || !fs.existsSync(baseDir)) {
    return [];
  }

  const results = [];
  try {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const cookieFile = path.join(baseDir, entry.name, 'cookies.sqlite');
        if (fs.existsSync(cookieFile)) {
          results.push(cookieFile);
        }
      }
    }
  } catch (err) {
    // Permission or reading error
  }

  return results;
}

/**
 * Extract Hooshang AI session cookies from local browser profiles
 */
export async function extractBrowserSession() {
  const databases = findFirefoxCookieDatabases();
  if (databases.length === 0) {
    return {
      success: false,
      message: 'No Firefox browser profiles found on this system.'
    };
  }

  for (const dbPath of databases) {
    let tmpPath = null;
    try {
      tmpPath = path.join(os.tmpdir(), `hooshang_cookie_${Date.now()}.sqlite`);
      fs.copyFileSync(dbPath, tmpPath);

      const db = new DatabaseSync(tmpPath, { readOnly: true });
      const query = db.prepare('SELECT name, value, host FROM moz_cookies WHERE host LIKE ?');
      const rows = query.all('%hooshang.ai%');
      db.close();

      const sessionCookie = rows.find(r => r.name === '__Secure-authjs.session-token');
      if (sessionCookie && sessionCookie.value) {
        const cookieString = rows.map(r => `${r.name}=${r.value}`).join('; ');
        
        saveSessionData({
          cookie: cookieString,
          token: sessionCookie.value
        });

        // Verify with Hooshang server
        const auth = await checkAuthStatus();
        if (auth.authenticated) {
          return {
            success: true,
            source: 'Firefox',
            dbPath,
            user: auth.user,
            expires: auth.expires
          };
        }
      }
    } catch (err) {
      // Try next database
    } finally {
      if (tmpPath && fs.existsSync(tmpPath)) {
        try { fs.unlinkSync(tmpPath); } catch (e) {}
      }
    }
  }

  return {
    success: false,
    message: 'No active Hooshang AI session found in local browser cookies.'
  };
}
