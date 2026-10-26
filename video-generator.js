import { launchBrowser } from './browser-client.js';
import fs from 'node:fs';
import path from 'node:path';
import { getSessionData } from './auth-manager.js';

export async function generateVideoViaBrowser(prompt, options = {}) {
  const session = getSessionData();
  if (!session.token && !session.cookie) {
    throw new Error('Not authenticated with Hooshang AI. Please run "hooshang-mcp login" first.');
  }

  const model = options.model || 'v6'; // default to fast/economical PixVerse V6 or Veo
  const downloadDir = options.downloadDir || process.cwd();

  const browser = await launchBrowser({ headless: true });
  const page = await browser.newPage();

  const cookies = [];
  if (session.token) {
    cookies.push({
      url: 'https://hooshang.ai',
      name: '__Secure-authjs.session-token',
      value: session.token,
      secure: true,
      httpOnly: true
    });
  } else if (session.cookie) {
    session.cookie.split(';').forEach(c => {
      const [k, ...v] = c.trim().split('=');
      if (k && v.length) {
        cookies.push({
          url: 'https://hooshang.ai',
          name: k.trim(),
          value: v.join('=').trim()
        });
      }
    });
  }

  if (cookies.length > 0) {
    await page.setCookie(...cookies);
  }

  const url = `https://hooshang.ai/imagine/video-generation?prompt=${encodeURIComponent(prompt)}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Select video model if specified
  if (model && model !== 'auto') {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const modelBtn = buttons.find(b => b.innerText && (b.innerText.includes('انتخاب هوشمند') || b.innerText.includes('مدل')));
      if (modelBtn) modelBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.evaluate((targetModel) => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const el = allElements.find(e => e.children.length === 0 && e.innerText && e.innerText.trim().toLowerCase().includes(targetModel.toLowerCase()));
      if (el) {
        el.click();
        const parent = el.closest('button, [role="button"], [role="option"], div');
        if (parent) parent.click();
      }
    }, model);
    await new Promise(r => setTimeout(r, 800));
  }

  // Click Generate
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const genBtn = buttons.find(b => b.innerText && b.innerText.includes('تولید'));
    if (genBtn) genBtn.click();
  });

  let finalVideoUrl = null;
  // Video generation typically takes 30-90 seconds
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const domVideos = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll('video, a[href*=".mp4"]')).map(v => v.src || v.href);
      return videos.filter(src => src && (src.includes('.mp4') || src.includes('storage.hooshang.ai')));
    });
    if (domVideos.length > 0) {
      finalVideoUrl = domVideos[0];
      break;
    }
  }

  let localSavedPath = null;
  if (finalVideoUrl) {
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
    const filename = `hooshang_video_${Date.now()}.mp4`;
    localSavedPath = path.join(downloadDir, filename);
    const view = await page.goto(finalVideoUrl);
    fs.writeFileSync(localSavedPath, await view.buffer());
  }

  await browser.close();

  return {
    videoUrl: finalVideoUrl,
    localPath: localSavedPath,
    prompt,
    model
  };
}
