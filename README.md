# 🎬 Hooshang AI MCP Server (سرور ام‌سی‌پی هوشنگ)

[![npm version](https://img.shields.io/badge/npm-hooshang--mcp-cb3837.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/hooshang-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![MCP Protocol](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-8A2BE2.svg?style=flat-square)](https://modelcontextprotocol.io)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-green.svg?style=flat-square)](#)

[English](#english) | [فارسی](#راهنمای-فارسی)

---

## فارسی (Persian)

یک سرور متن‌باز و استاندارد مبتنی بر پروتکل **Model Context Protocol (MCP)** برای اتصال مدل‌های تولید ویدیو، تصویر و موزیک پلتفرم **هوشنگ (Hooshang AI)** به دستیارهای هوش مصنوعی مانند:
- **Claude Desktop**
- **Cursor IDE**
- **Antigravity IDE**
- **Claude Code CLI**
- **Cline / Roo Code**

با این افزونه، هوش مصنوعی می‌تواند به عنوان دستیار کارگردانی، فیلم‌سازی و تولید محتوا برای شما ویدیوهای B-Roll، شات‌های استوری‌بورد و ساندترک‌های سینمایی بسازد و مستقیماً روی کامپیوترتان دانلود کند.

---

### ✨ قابلیت‌های کلیدی

1. **لاگین هوشمند بدون نیاز به کد (Smart CLI Login):**
   با اجرای یک دستور ساده در ترمینال، پنجره مرورگر باز می‌شود؛ شماره موبایل و کد پیامک هوشنگ خود را وارد می‌کنید و سیستم خودکار توکن امنیتی شما را بدون نیاز به کپی‌پیست دستی ذخیره می‌کند.
2. **پشتیبانی از ۱۵+ مدل ویدیویی هوشنگ:**
   دسترسی مستقیم به **Veo 3.1**، **Kling 2.5 / 3 / 4**، **PixVerse V6**، **Wan 3.0**، **MiniMax** و **SeeDance**.
3. **تولید تصویر و فریم استوری‌بورد:**
   ساخت سریع فریم‌های سینمایی و کانسپت با مدل‌های **کمال (Kamal)**، **GPT Image** و **Nano Banana**.
4. **ساخت ساندترک و موزیک پس‌زمینه:**
   تولید موسیقی متن سینمایی از روی توصیفات متنی صحنه.
5. **کراس‌پلتفرم (Cross-Platform):**
   سازگاری کامل با سیستم‌عامل‌های **ویندوز، مک (macOS) و لینوکس**.

---

### 🚀 شروع سریع در ۲ مرحله

#### مرحله ۱: احراز هویت با یک دستور
ترمینال سیستم خود را باز کرده و این دستور را اجرا کنید:

```bash
npx hooshang-mcp login
```

پنجره مرورگر باز می‌شود. با شماره موبایل و کد پیامک وارد هوشنگ شوید. پس از لاگین، پیام تایید در ترمینال نمایش داده شده و نشست شما به صورت امن در مسیر سیستم (`~/.hooshang-mcp/session.json`) ذخیره می‌شود.

> **بررسی وضعیت اتصال:**
> ```bash
> npx hooshang-mcp status
> ```

---

#### مرحله ۲: اضافه کردن به AI Client دلخواه

##### ۱. Claude Desktop
فایل تنظیمات `claude_desktop_config.json` را باز کنید:
- **ویندوز:** `%APPDATA%\Claude\claude_desktop_config.json`
- **مک:** `~/Library/Application Support/Claude/claude_desktop_config.json`

کد زیر را درون آبجکت `mcpServers` اضافه کنید:

```json
{
  "mcpServers": {
    "hooshang": {
      "command": "npx",
      "args": ["-y", "hooshang-mcp"]
    }
  }
}
```

##### ۲. Cursor IDE
در بخش تنظیمات Cursor > Features > MCP Servers:
- **نام:** `hooshang`
- **نوع (Type):** `command`
- **دستور:** `npx -y hooshang-mcp`

##### ۳. Claude Code CLI
```bash
claude mcp add hooshang -- npx -y hooshang-mcp
```

##### ۴. Antigravity IDE
فایل `~/.gemini/config/mcp_config.json` را ویرایش کرده و اضافه کنید:

```json
{
  "mcpServers": {
    "hooshang": {
      "command": "npx",
      "args": ["-y", "hooshang-mcp"]
    }
  }
}
```

---

### 🛠️ ابزارهای در دسترس (MCP Tools)

| نام ابزار | کارکرد |
| :--- | :--- |
| `hooshang_auth_status` | بررسی اتصال و اعتبار نشست کاربر |
| `hooshang_generate_video` | تولید ویدیوهای سینمایی B-Roll (با مدل‌های Veo, Kling, PixVerse) |
| `hooshang_generate_image` | ساخت استوری‌بورد و تصاویر مفهومی با مدل کمال (Kamal) |
| `hooshang_generate_music` | ساخت ساندترک و موزیک فیلم |
| `hooshang_download_asset` | دانلود مستقیم فایل‌های ویدیو/صدا در پوشه پروژه |
| `hooshang_update_session` | بروزرسانی دستی کوکی یا توکن |

---

<div id="english"></div>

## English

A model-agnostic **Model Context Protocol (MCP)** server providing programmatic access to **Hooshang AI** (Iran's premier generative AI video, image, and music engine).

Empowers AI coding and creative assistants (Claude Desktop, Cursor, Antigravity, Cline) to generate cinematic video B-rolls, storyboard frames, and musical soundtracks on demand.

### Quickstart

#### 1. Authenticate Once
```bash
npx hooshang-mcp login
```
A browser window opens. Sign in with your phone OTP. The authenticated token is securely preserved in your user home directory (`~/.hooshang-mcp/session.json`).

Check connection:
```bash
npx hooshang-mcp status
```

#### 2. Configure Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "hooshang": {
      "command": "npx",
      "args": ["-y", "hooshang-mcp"]
    }
  }
}
```

### Environment Variable Alternative (Headless / CI)
You can also supply your session token via environment variable without running the browser login:
```json
{
  "mcpServers": {
    "hooshang": {
      "command": "npx",
      "args": ["-y", "hooshang-mcp"],
      "env": {
        "HOOSHANG_SESSION_TOKEN": "your-session-token-here"
      }
    }
  }
}
```

---

### CLI Reference

```bash
hooshang-mcp                # Start MCP Server in Stdio mode
hooshang-mcp login          # Interactive OTP browser login
hooshang-mcp status         # Verify active session and user profile
hooshang-mcp token <token>  # Manually set session token
hooshang-mcp logout         # Clear local credentials
hooshang-mcp help           # Show help documentation
```

### License
Released under the [MIT License](LICENSE). Developed with ❤️ for the AI creators and developers community.
