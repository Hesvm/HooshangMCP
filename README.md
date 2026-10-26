# 🎬 Hooshang AI MCP Server (سرور ام‌سی‌پی هوشنگ)

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

با این افزونه، هوش مصنوعی می‌تواند به عنوان دستیار کارگردانی، فیلم‌سازی و تولید محتوا برای شما ویدیوهای B-Roll، شات‌های استوری‌بورد و ساندترک‌های سینمایی بسازد و مستقیماً روی کامپیوترتان ذخیره کند.

---

### ⚡ راه‌اندازی فقط با یک دستور (۱۰۰٪ خودکار)

کاربران **هیچ نیازی به تنظیمات دستی یا کپی‌پیست کد ندارند**. فقط ترمینال سیستم (PowerShell یا Terminal) را باز کرده و این یک خط دستور را اجرا کنید:

```bash
npx github:Hesvm/HooshangMCP setup
```

#### این دستور دقیقاً چه می‌کند؟
1. **احراز هویت هوشمند:** اگر در مرورگر سیستم‌تان در هوشنگ لاگین باشید، سشن را در کمتر از ۱ ثانیه به صورت خودکار شناسایی و ذخیره می‌کند. در غیر این صورت، پنجره ورود با پیامک باز می‌شود.
2. **تزریق خودکار کانفیگ:** برنامه‌های **Claude Desktop**، **Antigravity** و **Cursor** را در سیستم شناسایی کرده و کانفیگ MCP هوشنگ را بدون دست زدن به سایر افزونه‌های شما به آن‌ها اضافه می‌کند.
3. **تمام!** فقط کافیست Claude Desktop یا Cursor را یک‌بار ببندید و باز کنید.

> **بررسی وضعیت اتصال:**
> ```bash
> npx github:Hesvm/HooshangMCP status
> ```

---

### ✨ قابلیت‌ها

- **دسترسی به ۱۵+ مدل ویدیویی هوشنگ:**
  تولید ویدیوهای سینمایی با مدل‌های **Veo 3.1**، **Kling 2.5 / 3 / 4**، **PixVerse V6**، **Wan 3.0**، **MiniMax** و **SeeDance**.
- **تولید تصویر و فریم استوری‌بورد:**
  ساخت سریع فریم‌های استوری‌بورد با مدل لوکال **کمال (Kamal)**، **GPT Image** و **Nano Banana**.
- **ساخت موسیقی و ساندترک:**
  تولید موزیک سینمایی متناسب با سناریو و حس صحنه.
- **کراس‌پلتفرم کامل:**
  پشتیبانی از ویندوز، مک و لینوکس با تشخیص خودکار مرورگر.

---

### 🛠️ ابزارهای در دسترس (MCP Tools)

| نام ابزار | کارکرد |
| :--- | :--- |
| `hooshang_auth_status` | بررسی وضعیت اتصال و اعتبار نشست کاربر |
| `hooshang_generate_video` | تولید ویدیوهای سینمایی B-Roll (با نسبت‌های ۱۶:۹، ۹:۱۶ و...) |
| `hooshang_generate_image` | ساخت استوری‌بورد و تصاویر با مدل کمال (Kamal) |
| `hooshang_generate_music` | ساخت ساندترک و موزیک فیلم |
| `hooshang_download_asset` | دانلود مستقیم فایل‌های ویدیو و صوت روی کامپیوتر |
| `hooshang_update_session` | بروزرسانی دستی کوکی یا توکن |

---

### 💻 کانفیگ دستی (اختیاری)

اگر ترجیح می‌دهید تنظیمات را دستی وارد کنید:

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

<div id="english"></div>

## English

A model-agnostic **Model Context Protocol (MCP)** server providing programmatic access to **Hooshang AI** (Iran's premier generative AI video, image, and music engine).

Empowers AI creative and coding assistants (Claude Desktop, Cursor, Antigravity, Cline) to generate cinematic video B-rolls, storyboard frames, and musical soundtracks on demand.

### ⚡ 1-Click All-in-One Setup

No manual file editing, no cookie hunting. Just run:

```bash
npx github:Hesvm/HooshangMCP setup
```

This single command:
1. Auto-detects your active Hooshang login from local browsers (or prompts for phone OTP).
2. Automatically detects and injects MCP configuration into Claude Desktop, Cursor, and Antigravity.
3. Restarts your AI app and starts generating!

### CLI Commands Reference

```bash
hooshang-mcp setup          # 1-click all-in-one setup (authenticate + configure)
hooshang-mcp install        # Auto-configure Claude Desktop, Cursor & Antigravity
hooshang-mcp extract        # Extract active session from local browser profiles
hooshang-mcp login          # Interactive OTP browser login
hooshang-mcp status         # Verify active session and user profile
hooshang-mcp token <token>  # Manually set session token
hooshang-mcp logout         # Clear saved credentials
```

### License
Released under the [MIT License](LICENSE). Developed with ❤️ by [Hesam Mousavi (Hesvm)](https://github.com/Hesvm).
