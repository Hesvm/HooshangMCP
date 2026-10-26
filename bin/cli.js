#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launchBrowser, captureSessionFromPage } from '../browser-client.js';
import { saveSessionData, getSessionData, clearSession, GLOBAL_SESSION_FILE } from '../auth-manager.js';
import { checkAuthStatus } from '../api-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCli() {
  const args = process.argv.slice(2);
  const command = args[0] ? args[0].toLowerCase() : '';

  // 1. Interactive browser login
  if (command === 'login' || command === '--login') {
    console.log('\n============================================================');
    console.log('🔑 Hooshang AI - Interactive CLI Login');
    console.log('============================================================');
    console.log('🚀 Launching browser window to https://hooshang.ai...');
    console.log('👉 Please log in with your Phone Number (SMS) or Google account.');
    console.log('⏳ Listening for authenticated session in the background...\n');

    let browser;
    try {
      browser = await launchBrowser({ headless: false });
    } catch (err) {
      console.error('❌ Could not launch browser:', err.message);
      console.log('💡 Tip: You can set your session token manually with:');
      console.log('   npx hooshang-mcp token <your-token>\n');
      process.exit(1);
    }

    const pages = await browser.pages();
    const page = pages[0] || (await browser.newPage());

    await page.goto('https://hooshang.ai', { waitUntil: 'domcontentloaded', timeout: 60000 });

    let isCaptured = false;
    const checkInterval = setInterval(async () => {
      try {
        const cookies = await page.cookies();
        const sessionCookie = cookies.find(c => c.name === '__Secure-authjs.session-token');

        if (sessionCookie && sessionCookie.value && !isCaptured) {
          isCaptured = true;
          clearInterval(checkInterval);

          console.log('🎉 Detected active session token!');
          await captureSessionFromPage(page);

          console.log('🔍 Verifying session with Hooshang AI server...');
          const auth = await checkAuthStatus();

          if (auth.authenticated && auth.user) {
            console.log('\n============================================================');
            console.log('✅ Authentication Successful!');
            console.log(`👤 User: ${auth.user.name || 'Hooshang User'} (${auth.user.phoneNumber || 'N/A'})`);
            console.log(`🆔 ID:   ${auth.user.id}`);
            console.log(`📁 Saved to: ${GLOBAL_SESSION_FILE}`);
            console.log('============================================================\n');
            console.log('🎉 You are all set! You can now use the Hooshang MCP server in Claude Desktop, Cursor, or Antigravity.');
          } else {
            console.log('⚠️ Session cookie saved, but server verification returned:', auth.status);
          }

          setTimeout(async () => {
            try {
              await browser.close();
            } catch (e) {}
            process.exit(0);
          }, 1500);
        }
      } catch (err) {
        // Page might be navigating, ignore
      }
    }, 2000);

    // Stop after 5 minutes if no login
    setTimeout(() => {
      if (!isCaptured) {
        clearInterval(checkInterval);
        console.log('\n⏱️ Login timed out after 5 minutes. Please try again.');
        try { browser.close(); } catch (e) {}
        process.exit(1);
      }
    }, 300000);

    return;
  }

  // 2. Direct token setter
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

  // 3. Status check
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

  // 4. Logout / Clear session
  if (command === 'logout' || command === '--logout') {
    clearSession();
    console.log('✅ Hooshang AI credentials removed successfully.');
    process.exit(0);
  }

  // 5. Help
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`
Hooshang AI MCP Server

Usage:
  hooshang-mcp                Start the MCP server (Stdio mode for Claude/Cursor/Antigravity)
  hooshang-mcp login          Interactive browser login (Phone/SMS or Google)
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
