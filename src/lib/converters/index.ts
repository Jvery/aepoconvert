/**
 * Unified Converter Facade
 *
 * Provides a single entry point for all file conversions.
 * Routes to the appropriate converter based on file category (image/audio/document).
 */

import type { ConvertibleFile, QualitySettings, FormatCategory } from '@/types';
import { detectFormat } from '@/lib/formats';
import { convertImage } from './image-converter';
import { convertAudio } from './audio-converter';
import { convertDocument } from './document-converter';

// Re-export individual converters and loaders for direct access if needed
export { convertImage, isSupportedOutputFormat as isSupportedImageOutputFormat } from './image-converter';
export { convertAudio, isSupportedAudioOutputFormat, getAudioMimeType } from './audio-converter';
export { convertDocument, isSupportedDocumentOutputFormat, getDocumentMimeType } from './document-converter';
export { initializeMagick, isMagickReady, checkMagickReady } from './magick-loader';
export { initializeFFmpeg, isFFmpegReady, checkFFmpegReady } from './ffmpeg-loader';
export { initializePandoc, isPandocReady, checkPandocReady } from './pandoc-loader';

/**
 * Default quality settings used when none are provided
 */
const DEFAULT_QUALITY_SETTINGS: QualitySettings = {
  mode: 'simple',
  quality: 80,
};

/**
 * Detect the category of a file based on its format
 *
 * @param file - The ConvertibleFile to analyze
 * @returns The format category ('image', 'audio', or 'document')
 * @throws Error if format cannot be detected
 */
function detectCategory(file: ConvertibleFile): FormatCategory {
  // First, try to detect format using the file's 'from' extension
  const formatInfo = detectFormat(file.file);

  if (formatInfo) {
    return formatInfo.category;
  }

  // Fallback: try to determine category from MIME type prefix
  const mimeType = file.file.type.toLowerCase();

  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  if (
    mimeType.startsWith('text/') ||
    mimeType.includes('document') ||
    mimeType.includes('pdf') ||
    mimeType.includes('markdown') ||
    mimeType.includes('html')
  ) {
    return 'document';
  }

  throw new Error(
    `Unable to detect format category for file: ${file.name}. ` +
      `Extension: ${file.from}, MIME type: ${file.file.type}`
  );
}

/**
 * Convert a file to the specified format
 *
 * This is the main entry point for all conversions. It automatically routes
 * to the appropriate converter (image/audio/document) based on the source file's
 * category.
 *
 * @param file - The ConvertibleFile to convert (must have valid 'from' and 'to' formats)
 * @param onProgress - Optional callback for progress updates (0-100)
 * @param settings - Optional quality settings (uses defaults if not provided)
 * @returns Promise resolving to a Blob with the converted file
 * @throws Error if conversion fails, format is unsupported, or target format is not set
 *
 * @example
 * ```ts
 * const file: ConvertibleFile = {
 *   id: '123',
 *   file: new File([...], 'image.png', { type: 'image/png' }),
 *   name: 'image.png',
 *   size: 1024,
 *   from: 'png',
 *   to: 'jpeg',
 *   status: 'pending',
 *   progress: 0,
 *   error: null,
 *   result: null,
 * };
 *
 * const blob = await convert(file, (progress) => {
 *   console.log(`Conversion progress: ${progress}%`);
 * });
 * ```
 */
export async function convert(
  file: ConvertibleFile,
  onProgress?: (progress: number) => void,
  settings?: QualitySettings
): Promise<Blob> {
  // Validate that target format is set
  if (!file.to) {
    throw new Error(`Target format not set for file: ${file.name}`);
  }

  // Use provided settings or defaults
  const qualitySettings = settings || DEFAULT_QUALITY_SETTINGS;

  // Detect the category to route to the correct converter
  const category = detectCategory(file);

  console.log(
    `[Converter] Converting ${file.name} from ${file.from} to ${file.to} (category: ${category})`
  );

  // Report initial progress
  onProgress?.(0);

  try {
    let result: Blob;

    switch (category) {
      case 'image': {
        // Image conversion uses quality setting directly
        onProgress?.(10);
        result = await convertImage(file.file, file.to, qualitySettings.quality);
        onProgress?.(100);
        break;
      }

      case 'audio': {
        // Audio conversion uses full quality settings (quality, bitrate, sampleRate)
        onProgress?.(10);
        result = await convertAudio(file.file, file.to, qualitySettings);
        onProgress?.(100);
        break;
      }

      case 'document': {
        // Document conversion doesn't use quality settings
        onProgress?.(10);
        result = await convertDocument(file.file, file.to);
        onProgress?.(100);
        break;
      }

      default: {
        // This should never happen due to TypeScript, but handle it anyway
        throw new Error(`Unknown format category: ${category}`);
      }
    }

    console.log(
      `[Converter] Conversion complete: ${file.name} -> ${file.to} (${result.size} bytes)`
    );

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Converter] Conversion failed for ${file.name}:`, errorMessage);
    throw new Error(`Conversion failed: ${errorMessage}`);
  }
}

/**
 * Check if all converters are ready
 *
 * @returns Object with ready status for each converter
 */
export function getConverterStatus(): {
  image: boolean;
  audio: boolean;
  document: boolean;
} {
  // Import the ready flags dynamically to avoid circular dependencies
  const { checkMagickReady } = require('./magick-loader');
  const { checkFFmpegReady } = require('./ffmpeg-loader');
  const { checkPandocReady } = require('./pandoc-loader');

  return {
    image: checkMagickReady(),
    audio: checkFFmpegReady(),
    document: checkPandocReady(),
  };
}

/**
 * Initialize all converters
 *
 * This can be called at app startup to preload all WASM libraries.
 * Each converter initializes lazily on first use, but pre-initializing
 * can improve the user experience for the first conversion.
 *
 * @param onProgress - Optional callback for initialization progress
 * @returns Promise that resolves when all converters are initialized
 */
export async function initializeAllConverters(
  onProgress?: (converter: string, ready: boolean) => void
): Promise<void> {
  const { initializeMagick } = await import('./magick-loader');
  const { initializeFFmpeg } = await import('./ffmpeg-loader');
  const { initializePandoc } = await import('./pandoc-loader');

  console.log('[Converter] Initializing all converters...');

  // Initialize in parallel
  const results = await Promise.allSettled([
    initializeMagick().then(() => {
      onProgress?.('image', true);
      console.log('[Converter] ImageMagick ready');
    }),
    initializeFFmpeg().then(() => {
      onProgress?.('audio', true);
      console.log('[Converter] FFmpeg ready');
    }),
    initializePandoc().then(() => {
      onProgress?.('document', true);
      console.log('[Converter] Pandoc ready');
    }),
  ]);

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const converterName = ['ImageMagick', 'FFmpeg', 'Pandoc'][index];
      console.error(`[Converter] ${converterName} initialization failed:`, result.reason);
    }
  });

  console.log('[Converter] All converters initialized');
}
