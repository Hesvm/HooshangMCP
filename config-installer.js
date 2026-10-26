import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HOOSHANG_MCP_SERVER_CONFIG = {
  command: 'npx',
  args: ['-y', 'github:Hesvm/HooshangMCP']
};

/**
 * Get known MCP client configuration file paths for current OS
 */
export function getKnownClientConfigs() {
  const platform = os.platform();
  const homedir = os.homedir();
  const configs = [];

  // 1. Claude Desktop
  let claudePath = null;
  if (platform === 'win32') {
    claudePath = path.join(process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'darwin') {
    claudePath = path.join(homedir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else {
    claudePath = path.join(homedir, '.config', 'Claude', 'claude_desktop_config.json');
  }
  configs.push({ name: 'Claude Desktop', path: claudePath });

  // 2. Antigravity IDE
  const antigravityPath = path.join(homedir, '.gemini', 'config', 'mcp_config.json');
  configs.push({ name: 'Antigravity IDE', path: antigravityPath });

  // 3. Cursor IDE
  const cursorGlobalPath = path.join(homedir, '.cursor', 'mcp.json');
  configs.push({ name: 'Cursor (Global)', path: cursorGlobalPath });

  // 4. VS Code / Cline
  let clinePath = null;
  if (platform === 'win32') {
    clinePath = path.join(process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming'), 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
  } else if (platform === 'darwin') {
    clinePath = path.join(homedir, 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
  } else {
    clinePath = path.join(homedir, '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
  }
  configs.push({ name: 'VS Code Cline Extension', path: clinePath });

  return configs;
}

/**
 * Automatically install/inject Hooshang MCP configuration into all detected clients
 */
export async function installMcpConfig(options = {}) {
  const configs = getKnownClientConfigs();
  const results = [];

  for (const client of configs) {
    try {
      const configDir = path.dirname(client.path);
      // Check if client directory exists (e.g. user actually has Claude or Antigravity installed)
      if (!fs.existsSync(configDir) && !options.forceAll) {
        results.push({ name: client.name, path: client.path, installed: false, reason: 'Application directory not found' });
        continue;
      }

      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      let json = { mcpServers: {} };
      if (fs.existsSync(client.path)) {
        try {
          const content = fs.readFileSync(client.path, 'utf-8').trim();
          if (content) json = JSON.parse(content);
        } catch (e) {
          json = { mcpServers: {} };
        }
      }

      if (!json.mcpServers || typeof json.mcpServers !== 'object') {
        json.mcpServers = {};
      }

      // Inject / update hooshang
      json.mcpServers.hooshang = {
        ...HOOSHANG_MCP_SERVER_CONFIG
      };

      fs.writeFileSync(client.path, JSON.stringify(json, null, 2), 'utf-8');
      results.push({ name: client.name, path: client.path, installed: true });
    } catch (err) {
      results.push({ name: client.name, path: client.path, installed: false, error: err.message });
    }
  }

  return results;
}
