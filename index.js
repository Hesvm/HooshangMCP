import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs';
import { saveSessionData, getSessionData } from './auth-manager.js';
import {
  checkAuthStatus,
  requestVideoGeneration,
  requestImageGeneration,
  requestMusicGeneration,
  downloadMediaFile
} from './api-client.js';

const server = new McpServer({
  name: 'hooshang-mcp-server',
  version: '1.0.0'
});

// Tool 1: Check Authentication & Wallet Status
server.tool(
  'hooshang_auth_status',
  'Check the current Hooshang AI authentication status, session validity, and available credits.',
  {},
  async () => {
    try {
      const status = await checkAuthStatus();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(status, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Failed to check auth status: ${err.message}`
          }
        ]
      };
    }
  }
);

// Tool 2: Update Session Cookie / Token
server.tool(
  'hooshang_update_session',
  'Update Hooshang AI session cookies or Bearer token directly to authenticate the MCP server.',
  {
    cookie: z.string().optional().describe('The full cookie string from browser session (document.cookie)'),
    token: z.string().optional().describe('Bearer token if available')
  },
  async ({ cookie, token }) => {
    try {
      if (!cookie && !token) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'Error: Either cookie or token must be provided.' }]
        };
      }
      const update = {};
      if (cookie) update.cookie = cookie;
      if (token) update.token = token;

      saveSessionData(update);
      const status = await checkAuthStatus();
      return {
        content: [
          {
            type: 'text',
            text: `Session successfully updated!\nVerification:\n${JSON.stringify(status, null, 2)}`
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to update session: ${err.message}` }]
      };
    }
  }
);

import { generateVideoViaBrowser } from './video-generator.js';

// Tool 3: Generate Video (B-Rolls, Shots, Veo, Kling, PixVerse)
server.tool(
  'hooshang_generate_video',
  'Generate an AI video scene/B-roll using Hooshang AI video models (Veo 3.1, Kling, PixVerse, Wan 3.0, etc.) for video production and filmmaking.',
  {
    prompt: z.string().describe('Detailed visual prompt describing the scene, camera movement, lighting, and action'),
    aspect_ratio: z.enum(['16:9', '9:16', '1:1', '4:3']).default('16:9').describe('Aspect ratio: 16:9 for YouTube/Cinema, 9:16 for Reels/Shorts/TikTok'),
    model: z.string().default('v6').describe('Video model name (e.g. veo-3.1-fast, kling, v6, wan, minimax, seedance)'),
    download_dir: z.string().optional().describe('Optional directory path to automatically download the generated MP4 file')
  },
  async ({ prompt, aspect_ratio, model, download_dir }) => {
    try {
      const res = await generateVideoViaBrowser(prompt, {
        aspectRatio: aspect_ratio,
        model,
        downloadDir: download_dir
      });

      return {
        content: [
          {
            type: 'text',
            text: `🎥 ویدیو با موفقیت توسط هوشنگ ساخته شد!\n- مدل: ${res.model}\n- آدرس ابری: ${res.videoUrl}\n- مسیر فایل در کامپیوتر: ${res.localPath}`
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to generate video: ${err.message}` }]
      };
    }
  }
);

import { generateImageViaBrowser } from './image-generator.js';

// Tool 4: Generate Storyboard & Concept Images
server.tool(
  'hooshang_generate_image',
  'Generate storyboard frames, concept art, visual reference shots, or thumbnail elements using Hooshang AI.',
  {
    prompt: z.string().describe('Visual prompt describing the image, composition, style, and camera angle'),
    aspect_ratio: z.enum(['16:9', '9:16', '1:1', '4:5']).default('16:9').describe('Image aspect ratio'),
    model: z.string().default('kamal').describe('Image model (e.g. kamal, nano-banana, gpt-image, flux)'),
    download_dir: z.string().optional().describe('Optional directory to save the image')
  },
  async ({ prompt, aspect_ratio, model, download_dir }) => {
    try {
      const res = await generateImageViaBrowser(prompt, {
        aspectRatio: aspect_ratio,
        model,
        downloadDir: download_dir
      });

      return {
        content: [
          {
            type: 'text',
            text: `🖼️ تصویر با موفقیت توسط هوشنگ ساخته شد!\n- مدل: ${res.model}\n- آدرس ابری: ${res.imageUrl}\n- مسیر فایل در کامپیوتر: ${res.localPath}`
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to generate image: ${err.message}` }]
      };
    }
  }
);

// Tool 5: Generate Music & Soundtracks
server.tool(
  'hooshang_generate_music',
  'Generate background music, atmospheres, and soundtracks for videos via Hooshang Music Studio.',
  {
    prompt: z.string().describe('Description of the music mood, instruments, rhythm, and genre'),
    duration: z.number().default(30).describe('Duration in seconds'),
    style: z.string().default('cinematic').describe('Style/genre (cinematic, ambient, electronic, etc.)')
  },
  async ({ prompt, duration, style }) => {
    try {
      const res = await requestMusicGeneration(prompt, { duration, style });
      return {
        content: [
          {
            type: 'text',
            text: `🎵 Music Generation Dispatched Successfully!\n- Prompt: ${prompt}\n- Style: ${style}\n- Response: ${JSON.stringify(res.data, null, 2)}`
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to generate music: ${err.message}` }]
      };
    }
  }
);

// Tool 6: Download Asset
server.tool(
  'hooshang_download_asset',
  'Download any generated media file from Hooshang AI directly to your local video project folder.',
  {
    url: z.string().describe('Media URL to download'),
    output_path: z.string().describe('Full destination file path on your local computer')
  },
  async ({ url, output_path }) => {
    try {
      const savedPath = await downloadMediaFile(url, output_path);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Asset downloaded successfully to: ${savedPath}`
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to download asset: ${err.message}` }]
      };
    }
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[hooshang-mcp] Server running on stdio');
}

run().catch((err) => {
  console.error('[hooshang-mcp] Fatal error:', err);
  process.exit(1);
});
