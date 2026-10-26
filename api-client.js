import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import { getSessionData } from './auth-manager.js';

const BASE_URL = process.env.HOOSHANG_BASE_URL || 'https://hooshang.ai';

export function getClient() {
  const session = getSessionData();
  const headers = {
    'User-Agent': session.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'fa,en-US;q=0.9,en;q=0.8',
    'Origin': BASE_URL,
    'Referer': `${BASE_URL}/`
  };

  if (session.cookie) {
    headers['Cookie'] = session.cookie;
  }
  if (session.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  return axios.create({
    baseURL: BASE_URL,
    headers,
    timeout: 60000,
    validateStatus: () => true
  });
}

/**
 * Check if current session credentials are valid
 */
export async function checkAuthStatus() {
  const client = getClient();
  try {
    const res = await client.get('/api/auth/session');
    if (res.status === 200 && res.data && res.data.user) {
      return {
        authenticated: true,
        user: res.data.user,
        expires: res.data.expires,
        status: 200
      };
    }
    return {
      authenticated: false,
      status: res.status,
      message: 'Session is not authenticated or expired.'
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error.message
    };
  }
}

/**
 * Fetch detailed credit balance and plan status
 */
export async function getAccountBalance() {
  const auth = await checkAuthStatus();
  if (!auth.authenticated) {
    throw new Error('Not authenticated. Please run "hooshang-mcp login" first.');
  }

  const client = getClient();
  const userId = auth.user.id;
  const payload = JSON.stringify({
    t: {
      t: 10,
      i: 0,
      p: {
        k: ["data"],
        v: [{ t: 1, s: userId }]
      },
      o: 0
    },
    f: 127,
    m: []
  });

  const url = `/_serverFn/5341c6074497e62efd5585f395cf3794bb0f08cf00996e8bae0c880f2dc26a59?payload=${encodeURIComponent(payload)}`;
  try {
    const res = await client.get(url);
    if (res.status === 200 && res.data && res.data.p && res.data.p.v && res.data.p.v[0]) {
      const vals = res.data.p.v[0].p.v;
      const balance = vals[0]?.s;
      const initialBalance = vals[1]?.s;
      const remainingPercentage = vals[2]?.s;
      return {
        balance: typeof balance === 'number' ? balance : null,
        initialBalance: typeof initialBalance === 'number' ? initialBalance : null,
        remainingPercentage: typeof remainingPercentage === 'number' ? Number(remainingPercentage.toFixed(1)) : null,
        user: auth.user
      };
    }
    return {
      user: auth.user,
      raw: res.data
    };
  } catch (err) {
    return {
      user: auth.user,
      error: err.message
    };
  }
}

/**
 * Download a media file (video/image/audio) to destination path
 */
export async function downloadMediaFile(fileUrl, outputPath) {
  const client = getClient();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const response = await client({
    url: fileUrl,
    method: 'GET',
    responseType: 'stream'
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    writer.on('finish', () => resolve(outputPath));
    writer.on('error', reject);
  });
}

/**
 * Dispatch music soundtrack generation
 */
export async function requestMusicGeneration(prompt, options = {}) {
  const client = getClient();
  const payload = {
    prompt,
    duration: options.duration || 30,
    style: options.style || 'cinematic'
  };

  try {
    const res = await client.post('/api/imagine/music/agent', payload);
    return {
      status: res.status,
      data: res.data
    };
  } catch (err) {
    throw new Error(`Music generation request failed: ${err.message}`);
  }
}
