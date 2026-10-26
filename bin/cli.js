#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launchBrowser, captureSessionFromPage } from '../browser-client.js';
import { saveSessionData, getSessionData, clearSession, GLOBAL_SESSION_FILE } from '../auth-manager.js';
import { checkAuthStatus } from '../api-client.js';
import { installMcpConfig } from '../config-installer.js';
import { extractBrowserSession } from '../browser-extractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Helper to ensure the user is authenticated (checks session -> browser extract -> login window)
 */
async function ensureAuthenticated(options = { forcePrompt: false }) {
  if (!options.forcePrompt) {
    // 1. Check existing session
    const currentAuth = await checkAuthStatus();
    if (currentAuth.authenticated && currentAuth.user) {
      return { success: true, user: currentAuth.user, source: 'existing_session' };
    }

    // 2. Try auto browser extraction
    console.log('🔍 Checking for active Hooshang login in your local browsers...');
    const extracted = await extractBrowserSession();
    if (extracted.success && extracted.user) {
      console.log(`🎉 Auto-detected active session in ${extracted.source}!`);
      return { success: true, user: extracted.user, source: extracted.source };
    }
  }

  // 3. Open interactive login window
  console.log('\n🚀 Opening Hooshang AI login window...');
  console.log('👉 Please enter your Phone Number (SMS code) or sign in with Google in the opened window.');
  console.log('⏳ Waiting for authentication...\n');

  let browser;
  try {
    browser = await launchBrowser({ headless: false });
  } catch (err) {
    console.error('❌ Could not launch browser:', err.message);
    console.log('💡 Tip: You can set your session token manually with:');
    console.log('   npx github:Hesvm/HooshangMCP token <your-token>\n');
    return { success: false, error: err.message };
  }

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());
  await page.goto('https://hooshang.ai', { waitUntil: 'domcontentloaded', timeout: 60000 });

  return new Promise((resolve) => {
    let isDone = false;
    const interval = setInterval(async () => {
      try {
        const cookies = await page.cookies();
        const sessionCookie = cookies.find(c => c.name === '__Secure-authjs.session-token');

        if (sessionCookie && sessionCookie.value && !isDone) {
          isDone = true;
          clearInterval(interval);

          await captureSessionFromPage(page);
          const auth = await checkAuthStatus();

          setTimeout(async () => {
            try { await browser.close(); } catch (e) {}
          }, 1000);

          if (auth.authenticated && auth.user) {
            resolve({ success: true, user: auth.user, source: 'browser_login' });
          } else {
            resolve({ success: false, error: 'Session cookie captured but verification failed' });
          }
        }
      } catch (e) {}
    }, 2000);

    setTimeout(() => {
      if (!isDone) {
        clearInterval(interval);
        try { browser.close(); } catch (e) {}
        resolve({ success: false, error: 'Login timed out after 5 minutes' });
      }
    }, 300000);
  });
}

async function runCli() {
  const args = process.argv.slice(2);
  const command = args[0] ? args[0].toLowerCase() : '';

  // 1. ALL-IN-ONE 1-CLICK SETUP
  if (command === 'setup' || command === '--setup') {
    console.log('\n============================================================');
    console.log('🚀 Hooshang AI MCP - All-in-One 1-Click Setup');
    console.log('============================================================\n');

    // Step 1: Authenticate
    console.log('--- Step 1/2: Authenticating with Hooshang AI ---');
    const authResult = await ensureAuthenticated();

    if (!authResult.success) {
      console.error('\n❌ Authentication failed:', authResult.error);
      process.exit(1);
    }

    console.log(`✅ Authenticated as: ${authResult.user.name || 'User'} (${authResult.user.phoneNumber || 'N/A'})\n`);

    // Step 2: Inject Configurations
    console.log('--- Step 2/2: Auto-Configuring AI Clients ---');
    const results = await installMcpConfig();
    let installedCount = 0;

    for (const r of results) {
      if (r.installed) {
        installedCount++;
        console.log(`✅ ${r.name}: Configured successfully!`);
        console.log(`   📁 ${r.path}`);
      } else {
        console.log(`⚪ ${r.name}: Skipped (${r.reason || 'not detected'})`);
      }
    }

    console.log('\n============================================================');
    console.log('🎉 Setup Completed Successfully!');
    console.log(`👤 Account:  ${authResult.user.name || 'User'} (${authResult.user.phoneNumber || 'N/A'})`);
    console.log(`⚡ Installed: ${installedCount} AI Client(s) configured`);
    console.log('👉 Action needed: Restart Claude Desktop or Cursor to start using Hooshang!');
    console.log('============================================================\n');
    process.exit(0);
  }

  // 2. Auto-Config Installer into AI clients
  if (command === 'install' || command === '--install') {
    console.log('\n============================================================');
    console.log('⚡ Hooshang AI MCP - Automatic Client Installer');
    console.log('============================================================');
    console.log('Detecting installed AI clients (Claude Desktop, Cursor, Antigravity, Cline)...\n');

    const results = await installMcpConfig();
    let installedCount = 0;

    for (const r of results) {
      if (r.installed) {
        installedCount++;
        console.log(`✅ ${r.name}: Configured successfully!`);
        console.log(`   📁 File: ${r.path}\n`);
      } else {
        console.log(`⚪ ${r.name}: Skipped (${r.reason || r.error || 'not detected'})`);
      }
    }

    if (installedCount > 0) {
      console.log('============================================================');
      console.log(`🎉 Done! Successfully configured ${installedCount} AI client(s).`);
      console.log('👉 Please restart your AI client (Claude Desktop / Cursor) to start using Hooshang.');
      console.log('============================================================\n');
    } else {
      console.log('\n⚠️ No active AI client directories detected.');
      console.log('💡 You can manually copy the JSON configuration from the README.\n');
    }
    process.exit(0);
  }

  // 3. Direct Browser Cookie Extraction
  if (command === 'extract' || command === '--extract') {
    console.log('\n============================================================');
    console.log('🔍 Hooshang AI - Auto Browser Cookie Extraction');
    console.log('============================================================');
    console.log('Scanning local browser profiles for active Hooshang session...\n');

    const res = await extractBrowserSession();
    if (res.success) {
      console.log(`🎉 Found active session in ${res.source}!`);
      console.log(`✅ Authenticated User: ${res.user.name || 'User'} (${res.user.phoneNumber || 'N/A'})`);
      console.log(`📁 Stored in: ${GLOBAL_SESSION_FILE}`);
      console.log('============================================================\n');
      console.log('🎉 You are ready to go! Run "hooshang-mcp install" to inject the config into Claude.');
      process.exit(0);
    } else {
      console.log(`⚠️ ${res.message}`);
      console.log('👉 Please run "hooshang-mcp login" to open a login browser window.\n');
      process.exit(1);
    }
  }

  // 4. Interactive browser login
  if (command === 'login' || command === '--login') {
    console.log('\n============================================================');
    console.log('🔑 Hooshang AI - Smart Login');
    console.log('============================================================');

    const auth = await ensureAuthenticated({ forcePrompt: false });
    if (auth.success) {
      console.log(`✅ Welcome, ${auth.user.name || 'User'} (${auth.user.phoneNumber || 'N/A'})!`);
      console.log(`📁 Session saved to: ${GLOBAL_SESSION_FILE}`);
      console.log('\n💡 Tip: Run "hooshang-mcp install" to auto-configure Claude Desktop.\n');
      process.exit(0);
    } else {
      console.error('❌ Login failed:', auth.error);
      process.exit(1);
    }
  }

  // 5. Direct token setter
  if (command === 'token' || command === '--token') {
    const token = args[1];
    if (!token) {
      console.error('Error: Please provide your session token.\nExample: hooshang-mcp token "eyJ..."');
      process.exit(1);
    }
    saveSessionData({ token });
    console.log('✅ Token saved to:', GLOBAL_SESSION_FILE);
    const auth = await checkAuthStatus();
    console.log('Status:', JSON.stringify(auth, null, 2));
    process.exit(0);
  }

  // 6. Status check
  if (command === 'status' || command === '--status') {
    console.log('🔍 Checking Hooshang AI authentication status...');
    const session = getSessionData();
    console.log(`Session source: ${session.source}`);
    if (session.path) console.log(`Config path: ${session.path}`);

    const auth = await checkAuthStatus();
    console.log('\nResult:');
    console.log(JSON.stringify(auth, null, 2));
    process.exit(0);
  }

  // 7. Logout / Clear session
  if (command === 'logout' || command === '--logout') {
    clearSession();
    console.log('✅ Hooshang AI credentials removed successfully.');
    process.exit(0);
  }

  // 8. Help
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`
Hooshang AI MCP Server

Usage:
  hooshang-mcp setup          All-in-one setup: authenticate and auto-configure Claude/Cursor
  hooshang-mcp install        Auto-inject configuration into Claude Desktop, Cursor, Antigravity
  hooshang-mcp extract        Auto-extract active session from local browser cookies
  hooshang-mcp login          Smart login (auto-detects local login, or opens browser window)
  hooshang-mcp status         Check authentication and connection status
  hooshang-mcp token <token>  Manually set your session token
  hooshang-mcp logout         Remove saved credentials
  hooshang-mcp help           Show this help message

Options:
  HOOSHANG_SESSION_TOKEN      Pass session token via environment variable
  HOOSHANG_COOKIE             Pass full cookie string via environment variable
    `);
    process.exit(0);
  }

  // Default: Start the MCP Server
  await import('../index.js');
}

runCli().catch(err => {
  console.error('Fatal CLI error:', err);
  process.exit(1);
});
