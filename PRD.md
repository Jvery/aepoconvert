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
- [x] Install `zustand` package
- [x] Create `src/store/conversion-store.ts`
- [x] State: { files: ConvertibleFile[], isConverting: boolean, globalSettings: QualitySettings }
- [x] Actions: addFiles(files: File[]), removeFile(id: string), updateFile(id: string, updates: Partial<ConvertibleFile>), setOutputFormat(id: string, format: string), setGlobalSettings(settings: Partial<QualitySettings>), startConversion(), clearAll()
- [x] Use immer middleware for immutable updates
- [x] Install `immer` package
- [x] Typecheck passes

---

### US-011: Setup ImageMagick WASM loader
**Description:** As a developer, I need ImageMagick WASM ready for image conversion.

**Acceptance Criteria:**
- [x] Install `@imagemagick/magick-wasm` package
- [x] Create `src/lib/converters/magick-loader.ts`
- [x] Async function `initializeMagick(): Promise<void>` that calls `initializeImageMagick()` with wasm from CDN
- [x] Export `let isMagickReady: boolean = false` flag updated after init
- [x] Handle and log initialization errors
- [x] Typecheck passes

---

### US-012: Create ImageMagick converter class
**Description:** As a developer, I need a converter class for image operations.

**Acceptance Criteria:**
- [x] Create `src/lib/converters/image-converter.ts`
- [x] Export async function `convertImage(file: File, toFormat: string, quality: number): Promise<Blob>`
- [x] Use ImageMagick read() and write() methods
- [x] Support formats: PNG, JPEG, WEBP, GIF, BMP, TIFF
- [x] Apply quality setting for lossy formats
- [x] Return converted Blob with correct mimeType
- [x] Typecheck passes

---

### US-013: Extend ImageConverter for advanced formats
**Description:** As a developer, I need support for additional image formats.

**Acceptance Criteria:**
- [x] Add ICO output support
- [x] Add AVIF output support
- [x] Add JXL (JPEG XL) output support
- [x] Add HEIC/HEIF input support (read-only, convert to other formats)
- [x] Add RAW camera format input support (NEF, CR2, ARW — read-only)
- [x] Typecheck passes

---

### US-014: Setup FFmpeg WASM for audio
**Description:** As a developer, I need FFmpeg WASM ready for audio conversion.

**Acceptance Criteria:**
- [x] Install `@ffmpeg/ffmpeg` and `@ffmpeg/util` packages
- [x] Create `src/lib/converters/ffmpeg-loader.ts`
- [x] Async function `initializeFFmpeg(): Promise<FFmpeg>`
- [x] Load FFmpeg core from CDN (cdn.jsdelivr.net)
- [x] Export `let isFFmpegReady: boolean = false` flag
- [x] Check for SharedArrayBuffer support, warn if unavailable
- [x] Typecheck passes

---

### US-015: Create Audio converter function
**Description:** As a developer, I need a converter function for audio operations.

**Acceptance Criteria:**
- [x] Create `src/lib/converters/audio-converter.ts`
- [x] Export async function `convertAudio(file: File, toFormat: string, settings: QualitySettings): Promise<Blob>`
- [x] Write input file to FFmpeg virtual FS
- [x] Build FFmpeg command with codec based on output format
- [x] Support formats: MP3, WAV, OGG, FLAC, AAC, M4A
- [x] Apply bitrate setting (-b:a) when provided
- [x] Read output and return as Blob
- [x] Typecheck passes

---

### US-016: Extend AudioConverter for all formats
**Description:** As a developer, I need full audio format support.

**Acceptance Criteria:**
- [x] Add OPUS output support (libopus codec)
- [x] Add WMA output support (wmav2 codec)
- [x] Add AIFF output support (pcm_s16be codec)
- [x] Add ALAC output support (alac codec in m4a container)
- [x] Apply sample rate setting (-ar) when provided
- [x] Typecheck passes

---

### US-017: Setup Pandoc WASM for documents
**Description:** As a developer, I need Pandoc WASM ready for document conversion.

**Acceptance Criteria:**
- [x] Download pandoc.wasm to `public/pandoc.wasm` (from emscripten-forge or build)
- [x] Create `src/lib/converters/pandoc-loader.ts`
- [x] Async function `initializePandoc(): Promise<void>`
- [x] Export `let isPandocReady: boolean = false` flag
- [x] Typecheck passes

---

### US-018: Create Document converter function
**Description:** As a developer, I need a converter function for document operations.

**Acceptance Criteria:**
- [x] Create `src/lib/converters/document-converter.ts`
- [x] Export async function `convertDocument(file: File, toFormat: string): Promise<Blob>`
- [x] Support conversions: MD → HTML/PDF/DOCX, HTML → MD/PDF, TXT → MD/HTML
- [x] Use pandoc command-line syntax via WASM
- [x] Return converted Blob with correct mimeType
- [x] Typecheck passes

---

### US-019: Extend DocumentConverter for all formats
**Description:** As a developer, I need full document format support.

**Acceptance Criteria:**
- [x] Add EPUB output support
- [x] Add ODT output support
- [x] Add RTF output support
- [x] Add LaTeX output support
- [x] Add RST (reStructuredText) support
- [x] Add AsciiDoc support
- [x] Typecheck passes

---

### US-020: Create unified Converter facade
**Description:** As a developer, I need a single entry point for all conversions.

**Acceptance Criteria:**
- [x] Create `src/lib/converters/index.ts`
- [x] Export async function `convert(file: ConvertibleFile, onProgress?: (progress: number) => void): Promise<Blob>`
- [x] Detect converter type based on file.from category
- [x] Route to appropriate converter (image/audio/document)
- [x] Call onProgress callback during conversion
- [x] Typecheck passes

---

### US-021: Create Web Worker for conversions
**Description:** As a developer, I need conversions to run in a Web Worker to prevent UI blocking.

**Acceptance Criteria:**
- [x] Create `src/workers/conversion-worker.ts`
- [x] Worker receives message: { type: 'convert', file: File, from: string, to: string, settings: QualitySettings }
- [x] Worker posts progress updates: { type: 'progress', progress: number }
- [x] Worker posts result: { type: 'complete', blob: Blob } or { type: 'error', error: string }
- [x] Create `src/lib/converters/worker-client.ts` with `runConversion()` that wraps Worker communication
- [x] Typecheck passes

---

### US-022: Create color theme and CSS variables
**Description:** As a developer, I need a cohesive color system for the UI.

**Acceptance Criteria:**
- [x] Update `src/app/globals.css` with CSS variables
- [x] Variables: --gradient-start, --gradient-end, --gradient-accent
- [x] Create gradient classes: .gradient-bg, .gradient-text, .gradient-border
- [x] Add animated gradient keyframes for background effect
- [x] Dark mode variables via .dark class
- [x] Typecheck passes

---

### US-023: Create app layout with Header
**Description:** As a user, I want a clean header with logo and theme toggle.

**Acceptance Criteria:**
- [x] Create `src/components/layout/Header.tsx`
- [x] Display "aepoconvert" as styled text logo (gradient or bold)
- [x] Theme toggle button using sun/moon icons (lucide-react)
- [x] Install `lucide-react` package
- [x] Sticky header with backdrop-blur effect
- [x] Update `src/app/layout.tsx` to include Header
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-024: Create DropZone component
**Description:** As a user, I want to drag-and-drop files to start conversion.

**Acceptance Criteria:**
- [x] Create `src/components/upload/DropZone.tsx`
- [x] Large rectangular drop area (min-height: 200px)
- [x] Dashed border with rounded corners
- [x] Icon and text: "Drop files here or click to browse"
- [x] Accept multiple files via input[type=file]
- [x] onDrop and onClick handlers
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-025: Add drag-over visual feedback to DropZone
**Description:** As a user, I want visual feedback when dragging files over the drop zone.

**Acceptance Criteria:**
- [x] Border color changes to accent color on drag-over
- [x] Background color lightens/changes on drag-over
- [x] Scale transform subtle animation on drag-over
- [x] Use React state to track isDragging
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-026: Add file type validation to DropZone
**Description:** As a user, I want only supported files to be accepted.

**Acceptance Criteria:**
- [x] Filter dropped files by supported extensions using detectFormat()
- [x] Show toast error for unsupported files using shadcn toast
- [x] Configure Toaster in layout.tsx
- [x] Install `sonner` for toast notifications
- [x] Display hint text showing accepted file types
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-027: Create FileCard component
**Description:** As a user, I want to see each uploaded file with its details.

**Acceptance Criteria:**
- [x] Create `src/components/files/FileCard.tsx`
- [x] Props: file: ConvertibleFile, onRemove: () => void, onFormatChange: (format: string) => void
- [x] Display: file type icon, file name (truncated if long), file size (formatted: KB/MB)
- [x] Display detected format as Badge
- [x] Remove button (X icon) in top-right corner
- [x] Card uses shadcn Card component with subtle shadow
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-028: Create FormatSelector component
**Description:** As a user, I want to choose the output format for my file.

**Acceptance Criteria:**
- [x] Create `src/components/files/FormatSelector.tsx`
- [x] Props: currentFormat: string, availableFormats: FormatInfo[], onSelect: (format: string) => void
- [x] Use shadcn Select component
- [x] Group formats by category in SelectGroup
- [x] Show format name and extension in SelectItem
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-029: Create ConversionProgress component
**Description:** As a user, I want to see conversion progress for each file.

**Acceptance Criteria:**
- [x] Create `src/components/files/ConversionProgress.tsx`
- [x] Props: status: ConversionStatus, progress: number, error: string | null
- [x] Show shadcn Progress bar when status is 'converting'
- [x] Show checkmark icon and "Complete" text when status is 'complete'
- [x] Show error icon and error message when status is 'error'
- [x] Animated gradient on progress bar
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-030: Create FileList component
**Description:** As a user, I want to see all my uploaded files in a list.

**Acceptance Criteria:**
- [x] Create `src/components/files/FileList.tsx`
- [x] Read files from conversion store using useConversionStore hook
- [x] Render FileCard for each file
- [x] Empty state: show message "No files added yet"
- [x] Use CSS grid or flex for layout
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-031: Add animations to FileList
**Description:** As a user, I want smooth animations when files are added or removed.

**Acceptance Criteria:**
- [x] Install `framer-motion` package
- [x] Wrap FileCard in motion.div with layout animation
- [x] Add enter animation: fade in + slide up
- [x] Add exit animation: fade out + slide down
- [x] Use AnimatePresence for exit animations
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-032: Create SimpleQualitySettings component
**Description:** As a user, I want easy quality presets (Low/Medium/High).

**Acceptance Criteria:**
- [x] Create `src/components/settings/SimpleQualitySettings.tsx`
- [x] Three buttons in a row: Low (60%), Medium (80%), High (95%)
- [x] Visual selection indicator (filled/outlined style)
- [x] Update global settings in store on click
- [x] Show brief description under each option
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-033: Create AdvancedQualitySettings component
**Description:** As a user, I want fine-grained quality control.

**Acceptance Criteria:**
- [x] Create `src/components/settings/AdvancedQualitySettings.tsx`
- [x] Slider for quality (1-100) using shadcn Slider
- [x] Select dropdown for audio bitrate: 64, 128, 192, 256, 320 kbps
- [x] Select dropdown for sample rate: 22050, 44100, 48000 Hz
- [x] Labels showing current values
- [x] Update store on change
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-034: Create SettingsPanel combining simple and advanced
**Description:** As a user, I want to toggle between simple and advanced settings.

**Acceptance Criteria:**
- [x] Create `src/components/settings/SettingsPanel.tsx`
- [x] Use shadcn Tabs with two tabs: "Simple" and "Advanced"
- [x] Render SimpleQualitySettings in Simple tab
- [x] Render AdvancedQualitySettings in Advanced tab
- [x] Collapsible panel (hidden by default, expand button)
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-035: Create ConvertButton component
**Description:** As a user, I want a clear button to start conversion.

**Acceptance Criteria:**
- [x] Create `src/components/actions/ConvertButton.tsx`
- [x] Large button with gradient background
- [x] Text: "Convert" with file count badge when files > 0
- [x] Disabled state when no files or isConverting is true
- [x] Loading spinner (lucide Loader2 icon) during conversion
- [x] Call startConversion() from store on click
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-036: Create DownloadButton component
**Description:** As a user, I want to download converted files easily.

**Acceptance Criteria:**
- [x] Create `src/components/actions/DownloadButton.tsx`
- [x] Props: files: ConvertibleFile[] (only completed ones)
- [x] Show only when at least one file has status 'complete'
- [x] Single file: direct download with correct filename
- [x] Multiple files: download as ZIP
- [x] Install `jszip` package
- [x] Animated checkmark icon
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-037: Create ClearAllButton component
**Description:** As a user, I want to clear all files and start fresh.

**Acceptance Criteria:**
- [x] Create `src/components/actions/ClearAllButton.tsx`
- [x] Ghost/outline button style
- [x] Show confirmation dialog using shadcn Dialog
- [x] Call clearAll() from store on confirm
- [x] Hidden when no files
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-038: Assemble main page layout
**Description:** As a user, I want all components arranged on a single page.

**Acceptance Criteria:**
- [x] Update `src/app/page.tsx`
- [x] Layout order: DropZone → FileList → SettingsPanel → Action buttons row
- [x] Centered container with max-w-4xl
- [x] Responsive spacing (gap-6 on desktop, gap-4 on mobile)
- [x] Action buttons: ConvertButton + DownloadButton + ClearAllButton in flex row
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-039: Wire up file upload to store
**Description:** As a developer, I need DropZone to add files to the store.

**Acceptance Criteria:**
- [x] DropZone calls addFiles() action on file drop
- [x] DropZone calls addFiles() action on file input change
- [x] Files appear in FileList immediately after adding
- [x] Format auto-detected using detectFormat()
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-040: Wire up format selection to store
**Description:** As a developer, I need FormatSelector to update file's target format.

**Acceptance Criteria:**
- [x] FormatSelector receives file.to as selected value
- [x] FormatSelector calls setOutputFormat(id, format) on change
- [x] FileCard displays selected output format
- [x] Default output format set on file add (first compatible format)
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-041: Wire up conversion to workers
**Description:** As a developer, I need ConvertButton to trigger worker-based conversion.

**Acceptance Criteria:**
- [x] startConversion() action iterates over files with status 'pending'
- [x] For each file, spawn worker via runConversion()
- [x] Update file.progress via updateFile() on worker progress messages
- [x] Update file.status to 'complete' and file.result to blob on worker complete
- [x] Update file.status to 'error' and file.error on worker error
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-042: Wire up download functionality
**Description:** As a developer, I need DownloadButton to save converted files.

**Acceptance Criteria:**
- [x] Single file: create object URL from blob, trigger download with anchor click
- [x] Filename: original name with new extension
- [x] Multiple files: use JSZip to create archive
- [x] ZIP filename: "aepoconvert-files.zip"
- [x] Revoke object URLs after download
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-043: Add toast notifications for actions
**Description:** As a user, I want feedback on actions via toast messages.

**Acceptance Criteria:**
- [x] Toast on file added: "Added X file(s)"
- [x] Toast on conversion started: "Converting..."
- [x] Toast on conversion complete: "Conversion complete!"
- [x] Toast on error: "Error: [message]"
- [x] Use sonner toast() function
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-044: Add drag-over overlay to whole page
**Description:** As a user, I want visual feedback when dragging files anywhere on page.

**Acceptance Criteria:**
- [x] Create `src/components/layout/DragOverlay.tsx`
- [x] Fixed full-screen overlay (z-50)
- [x] Show when files dragged over window (not just DropZone)
- [x] Animated gradient background with opacity
- [x] "Drop files to convert" centered text
- [x] Hide on drag-leave or drop
- [x] Add to layout.tsx
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-045: Add loading states for converter initialization
**Description:** As a user, I want to know when converters are loading.

**Acceptance Criteria:**
- [x] Create `src/components/status/ConverterStatus.tsx`
- [x] Show loading spinners while WASM libraries initialize
- [x] Show checkmarks when ready
- [x] Show error state if initialization fails
- [x] Display in footer or corner of page
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-046: Create error handling for conversions
**Description:** As a user, I want clear error messages when conversion fails.

**Acceptance Criteria:**
- [x] FileCard shows red border when status is 'error'
- [x] Error message displayed below file name
- [x] Retry button appears on error state
- [x] Retry resets status to 'pending' and clears error
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-047: Add keyboard shortcuts
**Description:** As a user, I want to use keyboard shortcuts for efficiency.

**Acceptance Criteria:**
- [x] Create `src/hooks/useKeyboardShortcuts.ts`
- [x] Ctrl/Cmd + V: paste files from clipboard
- [x] Ctrl/Cmd + Enter: start conversion
- [x] Escape: clear all (with confirmation)
- [x] Add hook to main page
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-048: Create Footer component
**Description:** As a user, I want to see credits and links in footer.

**Acceptance Criteria:**
- [x] Create `src/components/layout/Footer.tsx`
- [x] GitHub link icon
- [x] "All conversions happen locally in your browser" text with shield icon
- [x] Copyright: "© 2024 aepoconvert"
- [x] Add to layout.tsx
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-049: Create PrivacyBadge component
**Description:** As a user, I want assurance that my files stay private.

**Acceptance Criteria:**
- [x] Create `src/components/status/PrivacyBadge.tsx`
- [x] Shield icon with "100% Private" text
- [x] Tooltip on hover explaining local processing
- [x] Use shadcn Tooltip component
- [x] Place near DropZone
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-050: Create animated gradient background
**Description:** As a user, I want a visually appealing animated background.

**Acceptance Criteria:**
- [x] Create `src/components/layout/GradientBackground.tsx`
- [x] Animated gradient blobs using CSS animation
- [x] Low opacity (0.1-0.2) to not distract
- [x] Fixed position behind content (z-0)
- [x] Respect prefers-reduced-motion media query
- [x] Add to layout.tsx
- [x] Typecheck passes
- [x] Verify changes work in browser

---

### US-051: Add micro-animations to UI elements
**Description:** As a user, I want smooth micro-animations for polish.

**Acceptance Criteria:**
- [x] Button hover: scale(1.02) transition
- [x] Card hover: subtle shadow increase
- [x] Progress bar: shimmer effect animation
- [x] Badge: pop animation on format change
- [x] Use Tailwind transitions and framer-motion
- [x] Typecheck passes
- [x] Verify changes work in browser

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
