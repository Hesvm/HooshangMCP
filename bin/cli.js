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

async function runCli() {
  const args = process.argv.slice(2);
  const command = args[0] ? args[0].toLowerCase() : '';

  // 1. Auto-Config Installer into AI clients
  if (command === 'install' || command === 'setup' || command === '--install') {
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

  // 2. Direct Browser Cookie Extraction
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

  // 3. Interactive browser login (with automatic extraction pre-check)
  if (command === 'login' || command === '--login') {
    console.log('\n============================================================');
    console.log('🔑 Hooshang AI - Smart Login');
    console.log('============================================================');

    // First attempt quick local browser extraction
    console.log('Checking if you are already logged in to your local browser...');
    const auto = await extractBrowserSession();
    if (auto.success) {
      console.log(`🎉 Auto-detected existing login from ${auto.source}!`);
      console.log(`✅ Welcome back, ${auto.user.name || 'User'} (${auto.user.phoneNumber || 'N/A'})!`);
      console.log(`📁 Saved to: ${GLOBAL_SESSION_FILE}`);
      console.log('============================================================\n');
      console.log('💡 Tip: Run "hooshang-mcp install" to auto-configure Claude Desktop.\n');
      process.exit(0);
    }

    console.log('No local session found. Launching browser login window...');
    console.log('👉 Please log in with your Phone Number (SMS) or Google account.');
    console.log('⏳ Listening for authenticated session in background...\n');

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
            console.log('🎉 You are all set! Run "hooshang-mcp install" to configure Claude Desktop.');
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

  // 4. Direct token setter
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

  // 5. Status check
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

  // 6. Logout / Clear session
  if (command === 'logout' || command === '--logout') {
    clearSession();
    console.log('✅ Hooshang AI credentials removed successfully.');
    process.exit(0);
  }

  // 7. Help
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`
Hooshang AI MCP Server

Usage:
  hooshang-mcp                Start the MCP server (Stdio mode for Claude/Cursor/Antigravity)
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
