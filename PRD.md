# PRD: aepoconvert — Online File Converter

## Introduction

aepoconvert is a free, open-source online file converter with a focus on simplicity and privacy. Users can drag-and-drop files, instantly see available output formats, and convert without registration. Images, audio, and documents are processed locally in the browser using WebAssembly (ImageMagick, FFmpeg, Pandoc). The main differentiator is an exceptionally clean, modern UI where everything happens on a single page.

## Goals

- Provide instant file conversion without registration or uploads to external servers
- Support 100+ image formats, 15+ audio formats, and 15+ document formats
- Process all conversions locally in the browser for maximum privacy
- Deliver a modern, animated UI with gradient accents
- Enable batch conversion (multiple files at once)
- Offer both simple and advanced quality settings
- Prepare architecture for future i18n support
- Package for easy Docker deployment

## User Stories

---

### US-001: Initialize Next.js 14 project with TypeScript
**Description:** As a developer, I need a Next.js 14 project with TypeScript and App Router so I have a solid foundation.

**Acceptance Criteria:**
- [x] Create Next.js 14 project with `npx create-next-app@latest aepoconvert --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [x] TypeScript configured with strict mode in tsconfig.json
- [x] Project runs with `npm run dev` without errors
- [x] Typecheck passes (`npm run build`)

---

### US-002: Install and configure shadcn/ui
**Description:** As a developer, I need shadcn/ui components available for consistent UI.

**Acceptance Criteria:**
- [x] Run `npx shadcn@latest init` with New York style, Zinc base color
- [x] Verify `components.json` created with correct paths
- [x] Install Button component: `npx shadcn@latest add button`
- [x] Button component renders correctly in page.tsx
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-003: Add essential shadcn components
**Description:** As a developer, I need common UI components installed.

**Acceptance Criteria:**
- [x] Install components: `npx shadcn@latest add card select slider progress toast tabs dialog tooltip badge dropdown-menu`
- [x] All components importable from `@/components/ui/*` without errors
- [x] Typecheck passes

---

### US-004: Setup i18n architecture with next-intl
**Description:** As a developer, I need i18n infrastructure ready for future translations.

**Acceptance Criteria:**
- [x] Install `next-intl` package
- [x] Create `messages/en.json` with structure: { "common": {}, "upload": {}, "convert": {}, "settings": {} }
- [x] Create `src/i18n/request.ts` with getRequestConfig
- [x] Create `src/middleware.ts` for locale routing (default: en)
- [x] Update `next.config.ts` with next-intl plugin
- [x] Wrap app layout with NextIntlClientProvider
- [x] Typecheck passes

---

### US-005: Define TypeScript types for file conversion
**Description:** As a developer, I need type definitions for the conversion system.

**Acceptance Criteria:**
- [x] Create `src/types/index.ts`
- [x] Type `ConvertibleFile`: { id: string, file: File, name: string, size: number, from: string, to: string | null, status: ConversionStatus, progress: number, error: string | null, result: Blob | null }
- [x] Type `ConversionStatus`: 'pending' | 'converting' | 'complete' | 'error'
- [x] Type `FormatInfo`: { name: string, extensions: string[], mimeTypes: string[], category: 'image' | 'audio' | 'document', canConvertTo: string[] }
- [x] Type `QualitySettings`: { mode: 'simple' | 'advanced', quality: number, bitrate?: number, sampleRate?: number }
- [x] Typecheck passes

---

### US-006: Create format registry for images
**Description:** As a developer, I need a registry of supported image formats.

**Acceptance Criteria:**
- [x] Create `src/lib/formats/image-formats.ts`
- [x] Define IMAGE_FORMATS array with FormatInfo for: png, jpeg, jpg, webp, gif, bmp, tiff, tif, ico, svg, avif, heic, heif, jxl, psd, raw camera formats (nef, cr2, arw, dng, etc.)
- [x] Each format has correct extensions array and mimeTypes
- [x] Each format has canConvertTo array listing compatible output formats
- [x] Export `IMAGE_FORMATS` constant (at least 30 formats)
- [x] Typecheck passes

---

### US-007: Create format registry for audio
**Description:** As a developer, I need a registry of supported audio formats.

**Acceptance Criteria:**
- [x] Create `src/lib/formats/audio-formats.ts`
- [x] Define AUDIO_FORMATS array with FormatInfo for: mp3, wav, ogg, flac, aac, m4a, opus, wma, aiff, alac
- [x] Each format has correct extensions and mimeTypes
- [x] Each format has canConvertTo array
- [x] Export `AUDIO_FORMATS` constant
- [x] Typecheck passes

---

### US-008: Create format registry for documents
**Description:** As a developer, I need a registry of supported document formats.

**Acceptance Criteria:**
- [x] Create `src/lib/formats/document-formats.ts`
- [x] Define DOCUMENT_FORMATS array with FormatInfo for: pdf, docx, doc, md, txt, html, epub, odt, rtf, latex, rst, asciidoc
- [x] Each format has correct extensions and mimeTypes
- [x] Each format has canConvertTo array
- [x] Export `DOCUMENT_FORMATS` constant
- [x] Typecheck passes

---

### US-009: Create unified format utilities
**Description:** As a developer, I need utility functions for format detection and lookup.

**Acceptance Criteria:**
- [x] Create `src/lib/formats/index.ts`
- [x] Export `ALL_FORMATS` = [...IMAGE_FORMATS, ...AUDIO_FORMATS, ...DOCUMENT_FORMATS]
- [x] Function `detectFormat(file: File): FormatInfo | null` — detect by extension, fallback to mimeType
- [x] Function `getConvertibleFormats(from: FormatInfo): FormatInfo[]` — return valid output formats
- [x] Function `getFormatByExtension(ext: string): FormatInfo | null`
- [x] Function `getFormatsByCategory(category: string): FormatInfo[]`
- [x] Typecheck passes

---

### US-010: Create conversion store with Zustand
**Description:** As a developer, I need global state management for files and conversion.

**Acceptance Criteria:**
- [ ] Install `zustand` package
- [ ] Create `src/store/conversion-store.ts`
- [ ] State: { files: ConvertibleFile[], isConverting: boolean, globalSettings: QualitySettings }
- [ ] Actions: addFiles(files: File[]), removeFile(id: string), updateFile(id: string, updates: Partial<ConvertibleFile>), setOutputFormat(id: string, format: string), setGlobalSettings(settings: Partial<QualitySettings>), startConversion(), clearAll()
- [ ] Use immer middleware for immutable updates
- [ ] Install `immer` package
- [ ] Typecheck passes

---

### US-011: Setup ImageMagick WASM loader
**Description:** As a developer, I need ImageMagick WASM ready for image conversion.

**Acceptance Criteria:**
- [ ] Install `@imagemagick/magick-wasm` package
- [ ] Create `src/lib/converters/magick-loader.ts`
- [ ] Async function `initializeMagick(): Promise<void>` that calls `initializeImageMagick()` with wasm from CDN
- [ ] Export `let isMagickReady: boolean = false` flag updated after init
- [ ] Handle and log initialization errors
- [ ] Typecheck passes

---

### US-012: Create ImageMagick converter class
**Description:** As a developer, I need a converter class for image operations.

**Acceptance Criteria:**
- [ ] Create `src/lib/converters/image-converter.ts`
- [ ] Export async function `convertImage(file: File, toFormat: string, quality: number): Promise<Blob>`
- [ ] Use ImageMagick read() and write() methods
- [ ] Support formats: PNG, JPEG, WEBP, GIF, BMP, TIFF
- [ ] Apply quality setting for lossy formats
- [ ] Return converted Blob with correct mimeType
- [ ] Typecheck passes

---

### US-013: Extend ImageConverter for advanced formats
**Description:** As a developer, I need support for additional image formats.

**Acceptance Criteria:**
- [ ] Add ICO output support
- [ ] Add AVIF output support
- [ ] Add JXL (JPEG XL) output support
- [ ] Add HEIC/HEIF input support (read-only, convert to other formats)
- [ ] Add RAW camera format input support (NEF, CR2, ARW — read-only)
- [ ] Typecheck passes

---

### US-014: Setup FFmpeg WASM for audio
**Description:** As a developer, I need FFmpeg WASM ready for audio conversion.

**Acceptance Criteria:**
- [ ] Install `@ffmpeg/ffmpeg` and `@ffmpeg/util` packages
- [ ] Create `src/lib/converters/ffmpeg-loader.ts`
- [ ] Async function `initializeFFmpeg(): Promise<FFmpeg>`
- [ ] Load FFmpeg core from CDN (cdn.jsdelivr.net)
- [ ] Export `let isFFmpegReady: boolean = false` flag
- [ ] Check for SharedArrayBuffer support, warn if unavailable
- [ ] Typecheck passes

---

### US-015: Create Audio converter function
**Description:** As a developer, I need a converter function for audio operations.

**Acceptance Criteria:**
- [ ] Create `src/lib/converters/audio-converter.ts`
- [ ] Export async function `convertAudio(file: File, toFormat: string, settings: QualitySettings): Promise<Blob>`
- [ ] Write input file to FFmpeg virtual FS
- [ ] Build FFmpeg command with codec based on output format
- [ ] Support formats: MP3, WAV, OGG, FLAC, AAC, M4A
- [ ] Apply bitrate setting (-b:a) when provided
- [ ] Read output and return as Blob
- [ ] Typecheck passes

---

### US-016: Extend AudioConverter for all formats
**Description:** As a developer, I need full audio format support.

**Acceptance Criteria:**
- [ ] Add OPUS output support (libopus codec)
- [ ] Add WMA output support (wmav2 codec)
- [ ] Add AIFF output support (pcm_s16be codec)
- [ ] Add ALAC output support (alac codec in m4a container)
- [ ] Apply sample rate setting (-ar) when provided
- [ ] Typecheck passes

---

### US-017: Setup Pandoc WASM for documents
**Description:** As a developer, I need Pandoc WASM ready for document conversion.

**Acceptance Criteria:**
- [ ] Download pandoc.wasm to `public/pandoc.wasm` (from emscripten-forge or build)
- [ ] Create `src/lib/converters/pandoc-loader.ts`
- [ ] Async function `initializePandoc(): Promise<void>`
- [ ] Export `let isPandocReady: boolean = false` flag
- [ ] Typecheck passes

---

### US-018: Create Document converter function
**Description:** As a developer, I need a converter function for document operations.

**Acceptance Criteria:**
- [ ] Create `src/lib/converters/document-converter.ts`
- [ ] Export async function `convertDocument(file: File, toFormat: string): Promise<Blob>`
- [ ] Support conversions: MD → HTML/PDF/DOCX, HTML → MD/PDF, TXT → MD/HTML
- [ ] Use pandoc command-line syntax via WASM
- [ ] Return converted Blob with correct mimeType
- [ ] Typecheck passes

---

### US-019: Extend DocumentConverter for all formats
**Description:** As a developer, I need full document format support.

**Acceptance Criteria:**
- [ ] Add EPUB output support
- [ ] Add ODT output support
- [ ] Add RTF output support
- [ ] Add LaTeX output support
- [ ] Add RST (reStructuredText) support
- [ ] Add AsciiDoc support
- [ ] Typecheck passes

---

### US-020: Create unified Converter facade
**Description:** As a developer, I need a single entry point for all conversions.

**Acceptance Criteria:**
- [ ] Create `src/lib/converters/index.ts`
- [ ] Export async function `convert(file: ConvertibleFile, onProgress?: (progress: number) => void): Promise<Blob>`
- [ ] Detect converter type based on file.from category
- [ ] Route to appropriate converter (image/audio/document)
- [ ] Call onProgress callback during conversion
- [ ] Typecheck passes

---

### US-021: Create Web Worker for conversions
**Description:** As a developer, I need conversions to run in a Web Worker to prevent UI blocking.

**Acceptance Criteria:**
- [ ] Create `src/workers/conversion-worker.ts`
- [ ] Worker receives message: { type: 'convert', file: File, from: string, to: string, settings: QualitySettings }
- [ ] Worker posts progress updates: { type: 'progress', progress: number }
- [ ] Worker posts result: { type: 'complete', blob: Blob } or { type: 'error', error: string }
- [ ] Create `src/lib/converters/worker-client.ts` with `runConversion()` that wraps Worker communication
- [ ] Typecheck passes

---

### US-022: Create color theme and CSS variables
**Description:** As a developer, I need a cohesive color system for the UI.

**Acceptance Criteria:**
- [ ] Update `src/app/globals.css` with CSS variables
- [ ] Variables: --gradient-start, --gradient-end, --gradient-accent
- [ ] Create gradient classes: .gradient-bg, .gradient-text, .gradient-border
- [ ] Add animated gradient keyframes for background effect
- [ ] Dark mode variables via .dark class
- [ ] Typecheck passes

---

### US-023: Create app layout with Header
**Description:** As a user, I want a clean header with logo and theme toggle.

**Acceptance Criteria:**
- [ ] Create `src/components/layout/Header.tsx`
- [ ] Display "aepoconvert" as styled text logo (gradient or bold)
- [ ] Theme toggle button using sun/moon icons (lucide-react)
- [ ] Install `lucide-react` package
- [ ] Sticky header with backdrop-blur effect
- [ ] Update `src/app/layout.tsx` to include Header
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-024: Create DropZone component
**Description:** As a user, I want to drag-and-drop files to start conversion.

**Acceptance Criteria:**
- [ ] Create `src/components/upload/DropZone.tsx`
- [ ] Large rectangular drop area (min-height: 200px)
- [ ] Dashed border with rounded corners
- [ ] Icon and text: "Drop files here or click to browse"
- [ ] Accept multiple files via input[type=file]
- [ ] onDrop and onClick handlers
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-025: Add drag-over visual feedback to DropZone
**Description:** As a user, I want visual feedback when dragging files over the drop zone.

**Acceptance Criteria:**
- [ ] Border color changes to accent color on drag-over
- [ ] Background color lightens/changes on drag-over
- [ ] Scale transform subtle animation on drag-over
- [ ] Use React state to track isDragging
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-026: Add file type validation to DropZone
**Description:** As a user, I want only supported files to be accepted.

**Acceptance Criteria:**
- [ ] Filter dropped files by supported extensions using detectFormat()
- [ ] Show toast error for unsupported files using shadcn toast
- [ ] Configure Toaster in layout.tsx
- [ ] Install `sonner` for toast notifications
- [ ] Display hint text showing accepted file types
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-027: Create FileCard component
**Description:** As a user, I want to see each uploaded file with its details.

**Acceptance Criteria:**
- [ ] Create `src/components/files/FileCard.tsx`
- [ ] Props: file: ConvertibleFile, onRemove: () => void, onFormatChange: (format: string) => void
- [ ] Display: file type icon, file name (truncated if long), file size (formatted: KB/MB)
- [ ] Display detected format as Badge
- [ ] Remove button (X icon) in top-right corner
- [ ] Card uses shadcn Card component with subtle shadow
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-028: Create FormatSelector component
**Description:** As a user, I want to choose the output format for my file.

**Acceptance Criteria:**
- [ ] Create `src/components/files/FormatSelector.tsx`
- [ ] Props: currentFormat: string, availableFormats: FormatInfo[], onSelect: (format: string) => void
- [ ] Use shadcn Select component
- [ ] Group formats by category in SelectGroup
- [ ] Show format name and extension in SelectItem
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-029: Create ConversionProgress component
**Description:** As a user, I want to see conversion progress for each file.

**Acceptance Criteria:**
- [ ] Create `src/components/files/ConversionProgress.tsx`
- [ ] Props: status: ConversionStatus, progress: number, error: string | null
- [ ] Show shadcn Progress bar when status is 'converting'
- [ ] Show checkmark icon and "Complete" text when status is 'complete'
- [ ] Show error icon and error message when status is 'error'
- [ ] Animated gradient on progress bar
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-030: Create FileList component
**Description:** As a user, I want to see all my uploaded files in a list.

**Acceptance Criteria:**
- [ ] Create `src/components/files/FileList.tsx`
- [ ] Read files from conversion store using useConversionStore hook
- [ ] Render FileCard for each file
- [ ] Empty state: show message "No files added yet"
- [ ] Use CSS grid or flex for layout
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-031: Add animations to FileList
**Description:** As a user, I want smooth animations when files are added or removed.

**Acceptance Criteria:**
- [ ] Install `framer-motion` package
- [ ] Wrap FileCard in motion.div with layout animation
- [ ] Add enter animation: fade in + slide up
- [ ] Add exit animation: fade out + slide down
- [ ] Use AnimatePresence for exit animations
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-032: Create SimpleQualitySettings component
**Description:** As a user, I want easy quality presets (Low/Medium/High).

**Acceptance Criteria:**
- [ ] Create `src/components/settings/SimpleQualitySettings.tsx`
- [ ] Three buttons in a row: Low (60%), Medium (80%), High (95%)
- [ ] Visual selection indicator (filled/outlined style)
- [ ] Update global settings in store on click
- [ ] Show brief description under each option
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-033: Create AdvancedQualitySettings component
**Description:** As a user, I want fine-grained quality control.

**Acceptance Criteria:**
- [ ] Create `src/components/settings/AdvancedQualitySettings.tsx`
- [ ] Slider for quality (1-100) using shadcn Slider
- [ ] Select dropdown for audio bitrate: 64, 128, 192, 256, 320 kbps
- [ ] Select dropdown for sample rate: 22050, 44100, 48000 Hz
- [ ] Labels showing current values
- [ ] Update store on change
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-034: Create SettingsPanel combining simple and advanced
**Description:** As a user, I want to toggle between simple and advanced settings.

**Acceptance Criteria:**
- [ ] Create `src/components/settings/SettingsPanel.tsx`
- [ ] Use shadcn Tabs with two tabs: "Simple" and "Advanced"
- [ ] Render SimpleQualitySettings in Simple tab
- [ ] Render AdvancedQualitySettings in Advanced tab
- [ ] Collapsible panel (hidden by default, expand button)
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-035: Create ConvertButton component
**Description:** As a user, I want a clear button to start conversion.

**Acceptance Criteria:**
- [ ] Create `src/components/actions/ConvertButton.tsx`
- [ ] Large button with gradient background
- [ ] Text: "Convert" with file count badge when files > 0
- [ ] Disabled state when no files or isConverting is true
- [ ] Loading spinner (lucide Loader2 icon) during conversion
- [ ] Call startConversion() from store on click
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-036: Create DownloadButton component
**Description:** As a user, I want to download converted files easily.

**Acceptance Criteria:**
- [ ] Create `src/components/actions/DownloadButton.tsx`
- [ ] Props: files: ConvertibleFile[] (only completed ones)
- [ ] Show only when at least one file has status 'complete'
- [ ] Single file: direct download with correct filename
- [ ] Multiple files: download as ZIP
- [ ] Install `jszip` package
- [ ] Animated checkmark icon
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-037: Create ClearAllButton component
**Description:** As a user, I want to clear all files and start fresh.

**Acceptance Criteria:**
- [ ] Create `src/components/actions/ClearAllButton.tsx`
- [ ] Ghost/outline button style
- [ ] Show confirmation dialog using shadcn Dialog
- [ ] Call clearAll() from store on confirm
- [ ] Hidden when no files
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-038: Assemble main page layout
**Description:** As a user, I want all components arranged on a single page.

**Acceptance Criteria:**
- [ ] Update `src/app/page.tsx`
- [ ] Layout order: DropZone → FileList → SettingsPanel → Action buttons row
- [ ] Centered container with max-w-4xl
- [ ] Responsive spacing (gap-6 on desktop, gap-4 on mobile)
- [ ] Action buttons: ConvertButton + DownloadButton + ClearAllButton in flex row
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-039: Wire up file upload to store
**Description:** As a developer, I need DropZone to add files to the store.

**Acceptance Criteria:**
- [ ] DropZone calls addFiles() action on file drop
- [ ] DropZone calls addFiles() action on file input change
- [ ] Files appear in FileList immediately after adding
- [ ] Format auto-detected using detectFormat()
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-040: Wire up format selection to store
**Description:** As a developer, I need FormatSelector to update file's target format.

**Acceptance Criteria:**
- [ ] FormatSelector receives file.to as selected value
- [ ] FormatSelector calls setOutputFormat(id, format) on change
- [ ] FileCard displays selected output format
- [ ] Default output format set on file add (first compatible format)
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-041: Wire up conversion to workers
**Description:** As a developer, I need ConvertButton to trigger worker-based conversion.

**Acceptance Criteria:**
- [ ] startConversion() action iterates over files with status 'pending'
- [ ] For each file, spawn worker via runConversion()
- [ ] Update file.progress via updateFile() on worker progress messages
- [ ] Update file.status to 'complete' and file.result to blob on worker complete
- [ ] Update file.status to 'error' and file.error on worker error
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-042: Wire up download functionality
**Description:** As a developer, I need DownloadButton to save converted files.

**Acceptance Criteria:**
- [ ] Single file: create object URL from blob, trigger download with anchor click
- [ ] Filename: original name with new extension
- [ ] Multiple files: use JSZip to create archive
- [ ] ZIP filename: "aepoconvert-files.zip"
- [ ] Revoke object URLs after download
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-043: Add toast notifications for actions
**Description:** As a user, I want feedback on actions via toast messages.

**Acceptance Criteria:**
- [ ] Toast on file added: "Added X file(s)"
- [ ] Toast on conversion started: "Converting..."
- [ ] Toast on conversion complete: "Conversion complete!"
- [ ] Toast on error: "Error: [message]"
- [ ] Use sonner toast() function
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-044: Add drag-over overlay to whole page
**Description:** As a user, I want visual feedback when dragging files anywhere on page.

**Acceptance Criteria:**
- [ ] Create `src/components/layout/DragOverlay.tsx`
- [ ] Fixed full-screen overlay (z-50)
- [ ] Show when files dragged over window (not just DropZone)
- [ ] Animated gradient background with opacity
- [ ] "Drop files to convert" centered text
- [ ] Hide on drag-leave or drop
- [ ] Add to layout.tsx
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-045: Add loading states for converter initialization
**Description:** As a user, I want to know when converters are loading.

**Acceptance Criteria:**
- [ ] Create `src/components/status/ConverterStatus.tsx`
- [ ] Show loading spinners while WASM libraries initialize
- [ ] Show checkmarks when ready
- [ ] Show error state if initialization fails
- [ ] Display in footer or corner of page
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-046: Create error handling for conversions
**Description:** As a user, I want clear error messages when conversion fails.

**Acceptance Criteria:**
- [ ] FileCard shows red border when status is 'error'
- [ ] Error message displayed below file name
- [ ] Retry button appears on error state
- [ ] Retry resets status to 'pending' and clears error
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-047: Add keyboard shortcuts
**Description:** As a user, I want to use keyboard shortcuts for efficiency.

**Acceptance Criteria:**
- [ ] Create `src/hooks/useKeyboardShortcuts.ts`
- [ ] Ctrl/Cmd + V: paste files from clipboard
- [ ] Ctrl/Cmd + Enter: start conversion
- [ ] Escape: clear all (with confirmation)
- [ ] Add hook to main page
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-048: Create Footer component
**Description:** As a user, I want to see credits and links in footer.

**Acceptance Criteria:**
- [ ] Create `src/components/layout/Footer.tsx`
- [ ] GitHub link icon
- [ ] "All conversions happen locally in your browser" text with shield icon
- [ ] Copyright: "© 2024 aepoconvert"
- [ ] Add to layout.tsx
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-049: Create PrivacyBadge component
**Description:** As a user, I want assurance that my files stay private.

**Acceptance Criteria:**
- [ ] Create `src/components/status/PrivacyBadge.tsx`
- [ ] Shield icon with "100% Private" text
- [ ] Tooltip on hover explaining local processing
- [ ] Use shadcn Tooltip component
- [ ] Place near DropZone
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-050: Create animated gradient background
**Description:** As a user, I want a visually appealing animated background.

**Acceptance Criteria:**
- [ ] Create `src/components/layout/GradientBackground.tsx`
- [ ] Animated gradient blobs using CSS animation
- [ ] Low opacity (0.1-0.2) to not distract
- [ ] Fixed position behind content (z-0)
- [ ] Respect prefers-reduced-motion media query
- [ ] Add to layout.tsx
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-051: Add micro-animations to UI elements
**Description:** As a user, I want smooth micro-animations for polish.

**Acceptance Criteria:**
- [ ] Button hover: scale(1.02) transition
- [ ] Card hover: subtle shadow increase
- [ ] Progress bar: shimmer effect animation
- [ ] Badge: pop animation on format change
- [ ] Use Tailwind transitions and framer-motion
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-052: Create responsive design for mobile
**Description:** As a user, I want the app to work well on mobile devices.

**Acceptance Criteria:**
- [ ] DropZone: full width, reduced height on mobile
- [ ] FileList: single column on mobile (< 640px)
- [ ] SettingsPanel: full width on mobile
- [ ] Buttons: min-height 44px for touch
- [ ] Test at 375px viewport width
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-053: Add file size limits and warnings
**Description:** As a user, I want to know if my file is too large.

**Acceptance Criteria:**
- [ ] Warn with toast if single file > 100MB
- [ ] Show estimated conversion time for files > 50MB
- [ ] Block files > 2GB with error toast
- [ ] Display file size in human-readable format
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-054: Create Dockerfile for deployment
**Description:** As a developer, I need Docker configuration for easy deployment.

**Acceptance Criteria:**
- [ ] Create `Dockerfile` with multi-stage build
- [ ] Stage 1: deps - install dependencies
- [ ] Stage 2: builder - build Next.js app
- [ ] Stage 3: runner - production image with node:alpine
- [ ] Set NODE_ENV=production
- [ ] Expose port 3000
- [ ] CMD ["node", "server.js"] for standalone output
- [ ] Update next.config.ts with output: 'standalone'
- [ ] Typecheck passes

---

### US-055: Create docker-compose.yml
**Description:** As a developer, I need docker-compose for local development.

**Acceptance Criteria:**
- [ ] Create `docker-compose.yml`
- [ ] Service 'app' building from Dockerfile
- [ ] Port mapping 3000:3000
- [ ] Volume for development: .:/app (optional dev override)
- [ ] Environment variables support
- [ ] App starts with `docker-compose up --build`
- [ ] Typecheck passes

---

### US-056: Add meta tags and SEO
**Description:** As a developer, I need proper SEO setup.

**Acceptance Criteria:**
- [ ] Update `src/app/layout.tsx` metadata export
- [ ] Title: "aepoconvert — Free Online File Converter"
- [ ] Description: "Convert images, audio, and documents for free. 100% private — all processing happens in your browser."
- [ ] Open Graph: title, description, type, url
- [ ] Twitter card meta tags
- [ ] Add favicon.ico to /app
- [ ] Typecheck passes

---

### US-057: Create 404 page
**Description:** As a user, I want a friendly 404 page.

**Acceptance Criteria:**
- [ ] Create `src/app/not-found.tsx`
- [ ] Display "Page not found" message
- [ ] Link back to home page
- [ ] Match app design style
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-058: Create error page
**Description:** As a user, I want a friendly error page.

**Acceptance Criteria:**
- [ ] Create `src/app/error.tsx` (client component)
- [ ] Display "Something went wrong" message
- [ ] Show retry button that calls reset()
- [ ] Link to home page
- [ ] Match app design style
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

### US-059: Add PWA manifest
**Description:** As a user, I want to install the app as PWA.

**Acceptance Criteria:**
- [ ] Create `public/manifest.json`
- [ ] name: "aepoconvert"
- [ ] short_name: "aepoconvert"
- [ ] Icons: 192x192 and 512x512 PNG
- [ ] theme_color and background_color matching app
- [ ] display: "standalone"
- [ ] Add manifest link to layout.tsx metadata
- [ ] Typecheck passes

---

### US-060: Final accessibility audit
**Description:** As a developer, I need to ensure accessibility compliance.

**Acceptance Criteria:**
- [ ] All buttons have aria-label when icon-only
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Screen reader announces status changes (aria-live regions)
- [ ] Keyboard navigation works: Tab through all controls
- [ ] Skip link to main content
- [ ] Typecheck passes
- [ ] Verify changes work in browser

---

## Non-Goals

- Video conversion (requires server-side processing, out of MVP scope)
- User accounts or saved conversion history
- Cloud storage integration (Google Drive, Dropbox)
- API for external integrations
- Batch processing via command line
- Custom watermarks or image editing features
- Real-time collaboration features

## Technical Considerations

### Stack
- **Framework:** Next.js 14 with App Router
- **UI:** shadcn/ui + TailwindCSS
- **State:** Zustand with immer
- **Converters:** Web Workers + WASM
- **i18n:** next-intl (English only initially)
- **Animations:** Framer Motion
- **Deployment:** Docker multi-stage build

### WASM Libraries
- `@imagemagick/magick-wasm` — Image conversion
- `@ffmpeg/ffmpeg` + `@ffmpeg/util` — Audio conversion  
- `pandoc.wasm` — Document conversion

### Key Dependencies
```json
{
  "zustand": "^4.x",
  "immer": "^10.x",
  "jszip": "^3.x",
  "sonner": "^1.x",
  "framer-motion": "^11.x",
  "next-intl": "^3.x",
  "lucide-react": "^0.x",
  "@imagemagick/magick-wasm": "^0.x",
  "@ffmpeg/ffmpeg": "^0.x",
  "@ffmpeg/util": "^0.x"
}
```

### Browser Requirements
- SharedArrayBuffer support (for FFmpeg) — requires HTTPS + COOP/COEP headers
- WebAssembly support
- Modern browser (Chrome 90+, Firefox 89+, Safari 15+, Edge 90+)

### Headers for SharedArrayBuffer
Add to `next.config.ts`:
```typescript
headers: async () => [
  {
    source: '/(.*)',
    headers: [
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
    ],
  },
]
```
