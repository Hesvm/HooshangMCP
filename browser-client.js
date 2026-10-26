import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { saveSessionData, USER_CONFIG_DIR } from './auth-manager.js';

export const PROFILE_DIR = path.join(USER_CONFIG_DIR, 'profile');

/**
 * Automatically locate Chrome, Edge, Chromium, or Brave across Windows, macOS, and Linux
 */
export function getBrowserExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const platform = os.platform();
  const candidates = [];

  if (platform === 'win32') {
    candidates.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft\\Edge\\Application\\msedge.exe')
    );
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      '/Applications/Arc.app/Contents/MacOS/Arc',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    );
  } else {
    // Linux / WSL
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/microsoft-edge',
      '/usr/bin/brave-browser',
      '/snap/bin/chromium'
    );
  }

  for (const c of candidates) {
    if (c && fs.existsSync(c)) {
      return c;
    }
  }

  throw new Error(
    `No compatible Chrome, Edge, or Chromium browser was found on this ${platform} system.\n` +
    `Please install Google Chrome or Microsoft Edge, or set PUPPETEER_EXECUTABLE_PATH in your environment.`
  );
}

/**
 * Launch browser with persistent isolated profile
 */
export async function launchBrowser(options = { headless: true }) {
  const executablePath = getBrowserExecutable();
  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: options.headless ? 'new' : false,
    userDataDir: PROFILE_DIR,
    defaultViewport: options.headless ? { width: 1280, height: 800 } : null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1280,850'
    ]
  });

  return browser;
}

/**
 * Intercept session cookies and local storage tokens from active page
 */
export async function captureSessionFromPage(page) {
  const cookies = await page.cookies();
  const sessionTokenCookie = cookies.find(c => c.name === '__Secure-authjs.session-token');
  const token = sessionTokenCookie ? sessionTokenCookie.value : '';

  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  const userAgent = await page.evaluate(() => navigator.userAgent);

  const session = {
    cookie: cookieString,
    token: token,
    userAgent
  };

  saveSessionData(session);
  return session;
}
