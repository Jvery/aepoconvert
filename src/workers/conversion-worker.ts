/**
 * Web Worker for file conversions
 *
 * This worker handles file conversions in a separate thread to prevent
 * blocking the main UI thread during CPU-intensive WASM operations.
 *
 * Message Protocol:
 * - Input: { type: 'convert', file: File, from: string, to: string, settings: QualitySettings }
 * - Output (progress): { type: 'progress', progress: number }
 * - Output (success): { type: 'complete', blob: Blob }
 * - Output (failure): { type: 'error', error: string }
 */

import type { QualitySettings, FormatCategory } from '@/types';

// Message types for type safety
export interface ConvertMessage {
  type: 'convert';
  file: File;
  from: string;
  to: string;
  settings: QualitySettings;
}

export interface ProgressMessage {
  type: 'progress';
  progress: number;
}

export interface CompleteMessage {
  type: 'complete';
  blob: Blob;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
}

export type WorkerInputMessage = ConvertMessage;
export type WorkerOutputMessage = ProgressMessage | CompleteMessage | ErrorMessage;

/**
 * Default quality settings used when none are provided
 */
const DEFAULT_QUALITY_SETTINGS: QualitySettings = {
  mode: 'simple',
  quality: 80,
};

/**
 * Detect the category of a file based on extension or MIME type
 */
function detectCategory(from: string, mimeType: string): FormatCategory {
  const ext = from.toLowerCase().replace(/^\./, '');

  // Image extensions
  const imageExtensions = [
    'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'ico', 'svg',
    'avif', 'heic', 'heif', 'jxl', 'psd', 'raw', 'nef', 'cr2', 'cr3', 'arw',
    'dng', 'orf', 'raf', 'rw2', 'pef', 'srw', 'tga', 'exr', 'hdr',
  ];

  // Audio extensions
  const audioExtensions = [
    'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'wma', 'aiff', 'aif', 'alac',
  ];

  // Document extensions
  const documentExtensions = [
    'pdf', 'docx', 'doc', 'md', 'markdown', 'txt', 'html', 'htm', 'epub',
    'odt', 'rtf', 'tex', 'latex', 'rst', 'adoc', 'asciidoc', 'asc',
  ];

  if (imageExtensions.includes(ext)) {
    return 'image';
  }
  if (audioExtensions.includes(ext)) {
    return 'audio';
  }
  if (documentExtensions.includes(ext)) {
    return 'document';
  }

  // Fallback to MIME type detection
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  if (
    mimeType.startsWith('text/') ||
    mimeType.includes('document') ||
    mimeType.includes('pdf')
  ) {
    return 'document';
  }

  throw new Error(`Unable to detect format category for extension: ${from}`);
}

/**
 * Post a progress message to the main thread
 */
function postProgress(progress: number): void {
  const message: ProgressMessage = { type: 'progress', progress };
  self.postMessage(message);
}

/**
 * Post a completion message to the main thread
 */
function postComplete(blob: Blob): void {
  const message: CompleteMessage = { type: 'complete', blob };
  self.postMessage(message);
}

/**
 * Post an error message to the main thread
 */
function postError(error: string): void {
  const message: ErrorMessage = { type: 'error', error };
  self.postMessage(message);
}

/**
 * Handle conversion request
 */
async function handleConvert(message: ConvertMessage): Promise<void> {
  const { file, from, to, settings } = message;
  const qualitySettings = settings || DEFAULT_QUALITY_SETTINGS;

  console.log(`[Worker] Starting conversion: ${file.name} (${from} -> ${to})`);

  try {
    // Detect category to route to correct converter
    const category = detectCategory(from, file.type);

    postProgress(0);

    let result: Blob;

    switch (category) {
      case 'image': {
        // Dynamically import image converter
        const { initializeMagick } = await import('@/lib/converters/magick-loader');
        const { convertImage } = await import('@/lib/converters/image-converter');

        postProgress(5);

        // Initialize ImageMagick if needed
        await initializeMagick();
        postProgress(15);

        // Convert the image
        result = await convertImage(file, to, qualitySettings.quality);
        postProgress(100);
        break;
      }

      case 'audio': {
        // Dynamically import audio converter
        const { initializeFFmpeg } = await import('@/lib/converters/ffmpeg-loader');
        const { convertAudio } = await import('@/lib/converters/audio-converter');

        postProgress(5);

        // Initialize FFmpeg if needed
        await initializeFFmpeg();
        postProgress(15);

        // Convert the audio
        result = await convertAudio(file, to, qualitySettings);
        postProgress(100);
        break;
      }

      case 'document': {
        // Dynamically import document converter
        const { initializePandoc } = await import('@/lib/converters/pandoc-loader');
        const { convertDocument } = await import('@/lib/converters/document-converter');

        postProgress(5);

        // Initialize Pandoc if needed
        await initializePandoc();
        postProgress(15);

        // Convert the document
        result = await convertDocument(file, to);
        postProgress(100);
        break;
      }

      default: {
        throw new Error(`Unknown format category: ${category}`);
      }
    }

    console.log(`[Worker] Conversion complete: ${file.name} (${result.size} bytes)`);
    postComplete(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Worker] Conversion failed: ${errorMessage}`);
    postError(errorMessage);
  }
}

/**
 * Handle incoming messages from the main thread
 */
self.onmessage = async (event: MessageEvent<WorkerInputMessage>) => {
  const message = event.data;

  if (message.type === 'convert') {
    await handleConvert(message);
  } else {
    console.warn(`[Worker] Unknown message type: ${(message as { type: string }).type}`);
  }
};

