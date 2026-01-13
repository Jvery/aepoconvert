/**
 * Image Converter
 * Handles image conversion using ImageMagick WASM
 */

import { ImageMagick, MagickFormat } from '@imagemagick/magick-wasm';
import { initializeMagick, checkMagickReady } from './magick-loader';

/**
 * Maps lowercase format extensions to ImageMagick format constants
 */
const FORMAT_MAP: Record<string, MagickFormat> = {
  png: MagickFormat.Png,
  jpeg: MagickFormat.Jpeg,
  jpg: MagickFormat.Jpeg,
  webp: MagickFormat.WebP,
  gif: MagickFormat.Gif,
  bmp: MagickFormat.Bmp,
  tiff: MagickFormat.Tiff,
  tif: MagickFormat.Tiff,
};

/**
 * Maps format extensions to their MIME types
 */
const MIME_TYPE_MAP: Record<string, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
};

/**
 * Lossy formats that support quality settings
 */
const LOSSY_FORMATS = new Set(['jpeg', 'jpg', 'webp']);

/**
 * Convert an image file to a different format using ImageMagick WASM
 *
 * @param file - The source image file to convert
 * @param toFormat - Target format extension (e.g., 'png', 'jpeg', 'webp')
 * @param quality - Quality setting (1-100) for lossy formats
 * @returns Promise resolving to a Blob with the converted image
 * @throws Error if conversion fails or format is not supported
 */
export async function convertImage(
  file: File,
  toFormat: string,
  quality: number = 80
): Promise<Blob> {
  // Ensure ImageMagick is initialized
  if (!checkMagickReady()) {
    await initializeMagick();
  }

  // Normalize format to lowercase
  const normalizedFormat = toFormat.toLowerCase();

  // Validate target format
  const magickFormat = FORMAT_MAP[normalizedFormat];
  if (!magickFormat) {
    throw new Error(`Unsupported target format: ${toFormat}`);
  }

  // Get MIME type for the output
  const mimeType = MIME_TYPE_MAP[normalizedFormat];
  if (!mimeType) {
    throw new Error(`Unknown MIME type for format: ${toFormat}`);
  }

  // Validate quality parameter
  const clampedQuality = Math.max(1, Math.min(100, quality));

  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const sourceBytes = new Uint8Array(arrayBuffer);

    // Use ImageMagick to read, convert, and write the image
    const resultBlob = await ImageMagick.read(sourceBytes, async (image) => {
      // Set quality for lossy formats
      if (LOSSY_FORMATS.has(normalizedFormat)) {
        image.quality = clampedQuality;
      }

      // Write to the target format and return the data
      return image.write(magickFormat, (outputData: Uint8Array) => {
        // Create a copy of the data before it goes out of scope
        const dataCopy = new Uint8Array(outputData);
        return new Blob([dataCopy], { type: mimeType });
      });
    });

    return resultBlob;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Image conversion failed: ${errorMessage}`);
  }
}

/**
 * Check if a format is supported for output
 *
 * @param format - Format extension to check
 * @returns true if the format is supported
 */
export function isSupportedOutputFormat(format: string): boolean {
  return format.toLowerCase() in FORMAT_MAP;
}

/**
 * Get list of supported output formats
 *
 * @returns Array of supported format extensions
 */
export function getSupportedOutputFormats(): string[] {
  return Object.keys(FORMAT_MAP);
}
