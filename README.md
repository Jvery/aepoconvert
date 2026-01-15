# aepoconvert

A free, open-source online file converter with a focus on **privacy** and **simplicity**. All file conversions happen entirely in your browser using WebAssembly — no files are uploaded to external servers.

## Features

- **100% Private** — Files never leave your browser. All processing happens locally using WebAssembly
- **100+ Image Formats** — Convert between PNG, JPG, WebP, GIF, BMP, TIFF, ICO, RAW formats, and many more
- **15+ Audio Formats** — MP3, WAV, OGG, FLAC, AAC, M4A, and more
- **15+ Document Formats** — Markdown, HTML, PDF, DOCX, TXT, RST, and more
- **Batch Conversion** — Convert multiple files at once with ZIP download
- **Modern UI** — Clean, animated interface with dark/light mode
- **Quality Settings** — Simple presets or advanced controls for fine-tuned output
- **No Registration** — Just drag, drop, and convert

## Tech Stack

- **Framework:** Next.js 16 with App Router & TypeScript
- **UI:** React 19, TailwindCSS 4, shadcn/ui, Framer Motion
- **Conversion Engines:**
  - [ImageMagick WASM](https://github.com/nicolo-ribaudo/magick-wasm) — Image processing
  - [FFmpeg WASM](https://github.com/ffmpegwasm/ffmpeg.wasm) — Audio conversion
  - [Pandoc WASM](https://github.com/nicolo-ribaudo/pandoc-wasm) — Document conversion
- **State Management:** Zustand with Immer

## Getting Started

### Prerequisites

- Node.js 20.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/Jvery/aepoconvert.git
cd aepoconvert

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Docker

```bash
# Using Docker Compose
docker-compose up

# Or build manually
docker build -t aepoconvert .
docker run -p 3000:3000 aepoconvert
```

## Supported Formats

### Images
PNG, JPG/JPEG, WebP, GIF, BMP, TIFF, ICO, SVG, HEIC, AVIF, RAW (CR2, NEF, ARW, DNG), PSD, and 80+ more formats via ImageMagick

### Audio
MP3, WAV, OGG, FLAC, AAC, M4A, WMA, AIFF, and more via FFmpeg

### Documents
Markdown, HTML, PDF, DOCX, TXT, RST, LaTeX, EPUB, ODT, and more via Pandoc

## How It Works

1. **Drag & Drop** your files onto the page
2. **Select** the output format for each file
3. **Adjust** quality settings if needed
4. **Click Convert** — processing happens in your browser
5. **Download** individual files or all as ZIP

## Privacy

Your files are processed entirely in your browser using WebAssembly libraries. Nothing is uploaded to any server. This means:

- Your files stay on your device
- Conversion works offline (after initial page load)
- No file size limits imposed by servers
- No data collection or tracking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[AGPL-3.0](LICENSE) — This project is open source under the GNU Affero General Public License v3.0.

## Acknowledgments

- [ImageMagick](https://imagemagick.org/) for powerful image processing
- [FFmpeg](https://ffmpeg.org/) for audio/video conversion
- [Pandoc](https://pandoc.org/) for document conversion
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
