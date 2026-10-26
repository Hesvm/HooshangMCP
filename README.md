# 🎬 Hooshang AI MCP Server (سرور ام‌سی‌پی هوشنگ)

[![npm version](https://img.shields.io/badge/npm-hooshang--mcp-cb3837.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/hooshang-mcp)
[![GitHub Stars](https://img.shields.io/github/stars/Hesvm/HooshangMCP?style=flat-square&color=yellow)](https://github.com/Hesvm/HooshangMCP)
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

### ✨ قابلیت‌های فوق‌العاده جدید (۱۰۰٪ خودکار)

1. **⚡ نصب و کانفیگ خودکار با یک دستور (`install`):**
   دیگر نیازی به باز کردن فایل‌های JSON و کپی‌پیست تنظیمات نیست! دستور `install` به صورت خودکار نرم‌افزارهای **Claude Desktop**، **Cursor**، **Antigravity** و **Cline** را در سیستم پیدا کرده و تنظیمات MCP هوشنگ را به آن‌ها تزریق می‌کند.
2. **🔍 استخراج خودکار سشن بدون نیاز به لاگین مجدد (`extract`):**
   اگر قبلاً در مرورگر سیستم خود (مانند فایرفاکس) وارد سایت هوشنگ شده باشید، این دستور نشست شما را مستقیماً از حافظه سیستم استخراج، اعتبارسنجی و ذخیره می‌کند.
3. **🔑 لاگین هوشمند با پیامک (`login`):**
   در صورت عدم وجود سشن، یک پنجره باز شده و پس از وارد کردن شماره و کد پیامک، سشن ذخیره و مرورگر خودکار بسته می‌شود.
4. **پشتیبانی از ۱۵+ مدل ویدیویی هوشنگ:**
   دسترسی مستقیم به **Veo 3.1**، **Kling 2.5 / 3 / 4**، **PixVerse V6**، **Wan 3.0**، **MiniMax** و **SeeDance**.
5. **تولید تصویر و فریم استوری‌بورد:**
   ساخت سریع فریم‌های سینمایی و کانسپت با مدل‌های **کمال (Kamal)**، **GPT Image** و **Nano Banana**.

---

### 🚀 شروع فوق‌العاده سریع در ۲ دستور (Zero-Config)

کاربران فقط با اجرای دو دستور زیر در ترمینال، بدون دست زدن به هیچ فایلی به هوشنگ متصل می‌شوند:

```bash
# مرحله ۱: استخراج خودکار نشست کاربری یا لاگین هوشمند
npx github:Hesvm/HooshangMCP login

# مرحله ۲: تزریق خودکار کانفیگ به Claude Desktop و سایر محیط‌ها
npx github:Hesvm/HooshangMCP install
```

پس از اجرای دستور دوم، برنامه Claude Desktop یا Cursor خود را ریستارت کنید؛ تمام ابزارهای هوشنگ آماده استفاده هستند!

> **بررسی وضعیت اتصال:**
> ```bash
> npx github:Hesvm/HooshangMCP status
> ```

---

### 💻 کانفیگ دستی (در صورت تمایل)

اگر می‌خواهید کانفیگ را به صورت دستی وارد کنید:

```json
{
  "mcpServers": {
    "hooshang": {
      "command": "npx",
      "args": ["-y", "github:Hesvm/HooshangMCP"]
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

### ⚡ 2-Step Zero-Touch Setup

```bash
# Step 1: Smart login (auto-extracts existing browser session or opens prompt)
npx github:Hesvm/HooshangMCP login

# Step 2: Auto-inject MCP configuration into Claude Desktop / Cursor / Antigravity
npx github:Hesvm/HooshangMCP install
```

Restart Claude Desktop or Cursor, and you're good to go!

### CLI Commands

```bash
hooshang-mcp install        # Auto-configure Claude Desktop, Cursor & Antigravity
hooshang-mcp extract        # Extract active session from local browser profiles
hooshang-mcp login          # Interactive OTP browser login
hooshang-mcp status         # Verify active session and user profile
hooshang-mcp token <token>  # Manually set session token
hooshang-mcp logout         # Clear saved credentials
```

### Manual Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hooshang": {
      "command": "npx",
      "args": ["-y", "github:Hesvm/HooshangMCP"]
    }
  }
}
```

### License
Released under the [MIT License](LICENSE). Developed with ❤️ by [Hesam Mousavi (Hesvm)](https://github.com/Hesvm).
