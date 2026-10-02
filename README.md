<a id="top"></a>

<div align="center">

# 🎬 Auto Video Gen

### 🚀 Biến URL bài báo & Repo GitHub thành Video ngắn 9:16 chuyên nghiệp

**1 câu lệnh với AI Coding· 0đ Voice (Edge TTS) · Không cần edit thủ công · Sẵn sàng đăng TikTok, Reels, Shorts**

[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/node-22%2B-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5%2B-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[**🚀 Cài đặt nhanh**](#-bắt-đầu-nhanh-3-bước)

</div>

> 💡 **Bắt đầu trong 5 phút:** làm theo mục [🚀 Bắt đầu nhanh](#-bắt-đầu-nhanh-3-bước) bên dưới — không cần API key nhờ Edge TTS miễn phí mặc định.

## ✨ Điểm nổi bật

- ⚡ **Tự động hóa toàn diện**: Từ URL bài báo hoặc file `.txt`/`.md` → Kịch bản → Giọng đọc (TTS) → HTML Motion Graphics → Ghép âm thanh & SFX → Render file MP4 1080x1920 (mặc định 30FPS) + bản nén nhẹ `video.tiktok.mp4` đăng trực tiếp.
- 🎙️ **Voice miễn phí 100% (Edge TTS)**: Tích hợp sẵn giọng đọc tiếng Việt của Microsoft Edge, **không tốn tiền, không cần API Key**. Đồng thời hỗ trợ **LucyLab** (voice cloning tiếng Việt kèm SRT), **Vbee** (chuẩn giọng tin tức Việt Nam), **VieNeu** (giọng Việt tự nhiên + cloning) và **ElevenLabs** (đa ngôn ngữ cao cấp).
- 🎨 **HTML-to-Video Engine (HyperFrames)**: Layout video được viết bằng HTML + CSS + GSAP animation. Dễ dàng can thiệp, tuỳ biến font chữ, màu sắc thương hiệu như lập trình web.
- 🤖 **Thiết kế riêng cho AI Coding Agents**: Tối ưu sẵn cho **Claude Code** (`.claude/skills`), **Codex** (`.agents/skills`), **OpenClaw** (`skills/` + `~/.openclaw/skills`) và **Hermes** (`~/.hermes-dev/skills`) qua lệnh `/create-news-video`. Bạn chỉ cần đưa URL bài báo hoặc file `.txt`, AI sẽ tự đọc hiểu, tóm tắt, chọn template đồ họa và chạy pipeline tạo video trọn gói từ A đến Z.
- 📐 **6 Template dựng sẵn linh hoạt** (đặt trong `script.json` → `scenes[].templateData.template`):

| Template | Dùng khi nào |
| :--- | :--- |
| `hook` *(bắt buộc scene đầu)* | Tin nóng, claim/số gây tò mò + ảnh nền Ken Burns |
| `stat-hero` (`value` + `label`) | Nhấn mạnh 1 con số: star, %, giá, phiên bản |
| `comparison` (`left`/`right` + `winner`) | So sánh 2 đối tượng, trước/sau, A vs B |
| `callout` (`statement` + `tag`) | Trích dẫn phát biểu, cảnh báo, kết luận chốt |
| `feature-list` (`title` + 1–4 `bullets`) | Danh sách điểm tin, tính năng, bảng xếp hạng |
| `outro` *(bắt buộc scene cuối)* | CTA + tên kênh + nguồn + TikTok follow card |

---

## 🚀 Bắt đầu nhanh (3 bước)

### 1. Yêu cầu & Cài đặt

Dự án sử dụng cơ chế **Agentic Video Generation**:
- **Công cụ bắt buộc**: **Node.js 22+** và **FFmpeg** trên máy.
- **AI Coding Agent (Khuyên dùng để tự động hoá 100%)**:
  - 🪐 **[Google Antigravity IDE](https://antigravity.google)** — AI IDE của Google DeepMind.
  - 🧠 **[Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code)** — Agentic CLI của Anthropic.
  - 🐙 **[OpenClaw](https://openclaw.ai)** — AI assistant đa kênh.
  - 🔮 **[Hermes](https://github.com/anthropics/hermes)** — Agentic CLI của Anthropic.
  - 💻 **[Codex](https://openai.com/codex)** — CLI coding agent của OpenAI.
  - Hoặc bất kỳ AI tool nào khác (Cursor, Windsurf) thông qua kịch bản JSON.

```bash
# Clone repository (thay <tài-khoản-của-bạn> bằng GitHub của bạn)
git clone https://github.com/<tài-khoản-của-bạn>/auto-video-gen.git
cd auto-video-gen

# Cài đặt dependencies
npm install
```

> **Cài đặt FFmpeg nếu máy chưa có:**
> - **Windows:** `winget install Gyan.FFmpeg`
> - **macOS:** `brew install ffmpeg`
> - **Linux:** `sudo apt install ffmpeg`

### 2. Thiết lập cấu hình

Tạo file môi trường từ file mẫu:

```bash
cp .env.example .env.local
```

> 💡 **Mặc định dự án cấu hình Edge TTS hoàn toàn miễn phí, không cần bất kỳ API key nào.** Bạn có thể tạo video ngay lập tức!
> 
> *(Nếu muốn dùng LucyLab, Vbee hoặc ElevenLabs, mở file `.env.local` và điền key tương ứng).*

### 3. Tạo video đầu tiên!

#### 🤖 Cách 1: Tự động hoàn toàn bằng AI Agent (Khuyên dùng)

##### 👉 Với Google Antigravity IDE
Mở project trong Antigravity IDE, tại khung chat gõ lệnh:
```text
/create-news-video https://github.com/multica-ai/multica
```

##### 👉 Với Anthropic Claude Code
Mở terminal tại thư mục dự án và chạy:
```bash
claude
# Trong màn hình tương tác Claude Code, gõ:
/create-news-video https://github.com/multica-ai/multica
```

##### 👉 Với OpenClaw
```bash
openclaw
# Trong chat, gõ:
/create-news-video https://github.com/multica-ai/multica
```

##### 👉 Với Hermes
```bash
hermes
# Trong chat, gõ:
/create-news-video https://github.com/multica-ai/multica
```

##### 👉 Với Codex
```bash
codex
# Trong chat, gõ:
/create-news-video https://github.com/multica-ai/multica
```

> 💡 **Quy trình AI tự động xử lý:**
> 1. Đọc nội dung từ URL (repo GitHub, bài báo) hoặc file .txt tiếng Việt.
> 2. Viết lời bình tiếng Việt chuẩn ngữ âm, chia cảnh và chọn template motion graphics.
> 3. Tự gọi pipeline: sinh voice (Edge TTS Free) + render HyperFrames + mix nhạc & SFX.
> 4. Xuất video `.mp4` cùng file `caption.txt` có sẵn hashtag đăng TikTok!

#### 🛠️ Cách 2: Render trực tiếp từ file kịch bản (Thủ công)

Nếu không dùng AI, bạn có thể render từ file mẫu hoặc file `script.json` tự viết:

```bash
npm run pipeline -- tests/fixtures/sample-script-no-image.json
```

🎉 **Kết quả**: Video thành phẩm lưu tại `output/<slug>/` gồm `video.mp4` (bản raw), `video.tiktok.mp4` (bản nén nhẹ để đăng), `voice.mp3` và `caption.txt`.

---

## 🎙️ Lựa chọn giọng đọc (TTS)

Chuyển đổi provider linh hoạt trong `.env.local` qua biến `TTS_PROVIDER`:

| Nhà cung cấp | Cấu hình | Chi phí | Đặc điểm |
| :--- | :--- | :--- | :--- |
| **Edge TTS** *(Mặc định)* | `TTS_PROVIDER=edge-tts` | **0đ (Miễn phí)** | Không cần API key, hỗ trợ giọng Nam/Nữ tiếng Việt tự nhiên |
| **LucyLab** | `TTS_PROVIDER=lucylab` | Rẻ (~25k/1M ký tự) | Giọng voice cloning tiếng Việt tự nhiên, tự động kèm SRT subtitle |
| **Vbee** | `TTS_PROVIDER=vbee` | Trả phí Vbee API | Giọng đọc truyền cảm, chuẩn phong cách phát thanh viên tin tức |
| **VieNeu** | `TTS_PROVIDER=vieneu` | Trả phí theo ký tự (có trial 7 ngày) | Giọng Việt tự nhiên + voice cloning 3–5s, code-switching Việt–Anh, trả mp3 đồng bộ |
| **VieNeu local** | `TTS_PROVIDER=vieneu-local` | **0đ (cần `pip install vieneu` + espeak)** | Chạy offline 100% trên máy, ~8s/scene, 25 preset voice + cloning |
| **ElevenLabs** | `TTS_PROVIDER=elevenlabs` | Trả phí ElevenLabs | Đa ngôn ngữ, chất lượng phòng thu điện ảnh, tuỳ biến cao |

---

## 🛠️ Các lệnh thường dùng (CLI Cheatsheet)

```bash
# Chạy toàn bộ pipeline (TTS + Render visuals + Audio Mix)
npm run pipeline -- output/<slug>/script.json

# Preview nhanh (~3x, chất lượng thấp để kiểm tra layout)
npm run pipeline -- output/<slug>/script.json --draft

# Gắn brand của bạn mà không cần sửa .env (hoặc --no-branding để ẩn hẳn)
npm run pipeline -- output/<slug>/script.json --handle @kenhcuaban --display-name "Kênh Của Bạn"

# Chỉ render lại hình ảnh (giữ nguyên voice đã tạo, tiết kiệm thời gian)
npm run rerender -- output/<slug>

# Chạy test kiểm thử toàn bộ hệ thống
npm test
```

> 💡 **Branding TikTok** (follow card + handle trong video) cấu hình trong `.env.local`: `TIKTOK_DISPLAY_NAME`, `TIKTOK_HANDLE`, `TIKTOK_FOLLOWERS`, `TIKTOK_BRANDING` (`false` = ẩn hẳn).

---

## 📂 Cấu trúc thư mục dự án

```text
auto-video-gen/
├── .claude/skills/        # Claude Code skill
├── .agents/skills/         # Codex + OpenClaw skill (generic)
├── skills/                 # OpenClaw workspace skill (highest priority)
├── src/
│   ├── config.ts          # Đọc & validate biến môi trường (.env)
│   ├── pipeline.ts        # Pipeline chính: TTS -> HyperFrames -> FFmpeg
│   ├── schema.ts          # Zod schema định nghĩa cấu trúc kịch bản video
│   ├── render/            # Template HTML/CSS/GSAP & HyperFrames composer
│   ├── tts/               # Bộ kết nối TTS (Edge, LucyLab, Vbee, VieNeu, ElevenLabs)
│   └── assets/            # Audio/video tools, image fetcher, SFX
├── tests/                 # Unit tests (Vitest)
├── output/                # Thư mục lưu video thành phẩm theo từng slug
└── README.md              # 📖 Tài liệu duy nhất của dự án
```

---

## 📜 License 

- Dự án phát hành theo giấy phép [MIT](LICENSE).
