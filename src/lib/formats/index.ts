import type { FormatInfo, FormatCategory } from '@/types';
import { IMAGE_FORMATS } from './image-formats';
import { AUDIO_FORMATS } from './audio-formats';
import { DOCUMENT_FORMATS } from './document-formats';

/**
 * Combined array of all supported formats across all categories
 */
export const ALL_FORMATS: FormatInfo[] = [
  ...IMAGE_FORMATS,
  ...AUDIO_FORMATS,
  ...DOCUMENT_FORMATS,
];

// Re-export individual format arrays for convenience
export { IMAGE_FORMATS } from './image-formats';
export { AUDIO_FORMATS } from './audio-formats';
export { DOCUMENT_FORMATS } from './document-formats';

/**
 * Detect the format of a file by extension, with fallback to MIME type
 * @param file - The File object to detect the format for
 * @returns The FormatInfo if found, null otherwise
 */
export function detectFormat(file: File): FormatInfo | null {
  // Extract extension from filename (lowercase, without dot)
  const filename = file.name;
  const lastDotIndex = filename.lastIndexOf('.');
  const extension = lastDotIndex !== -1
    ? filename.slice(lastDotIndex + 1).toLowerCase()
    : '';

  // First, try to find by extension
  if (extension) {
    const formatByExtension = ALL_FORMATS.find((format) =>
      format.extensions.includes(extension)
    );
    if (formatByExtension) {
      return formatByExtension;
    }
  }

  // Fallback: try to find by MIME type
  const mimeType = file.type.toLowerCase();
  if (mimeType) {
    const formatByMime = ALL_FORMATS.find((format) =>
      format.mimeTypes.includes(mimeType)
    );
    if (formatByMime) {
      return formatByMime;
    }
  }

  return null;
}

/**
 * Get all formats that a given format can be converted to
 * @param from - The source FormatInfo
 * @returns Array of FormatInfo that the source can convert to
 */
export function getConvertibleFormats(from: FormatInfo): FormatInfo[] {
  return from.canConvertTo
    .map((ext) => getFormatByExtension(ext))
    .filter((format): format is FormatInfo => format !== null);
}

/**
 * Find a format by its extension
 * @param ext - The file extension (without dot, e.g., 'png', 'mp3')
 * @returns The FormatInfo if found, null otherwise
 */
export function getFormatByExtension(ext: string): FormatInfo | null {
  const normalizedExt = ext.toLowerCase().replace(/^\./, '');
  return ALL_FORMATS.find((format) =>
    format.extensions.includes(normalizedExt)
  ) ?? null;
}

/**
 * Get all formats in a specific category
 * @param category - The category to filter by ('image', 'audio', or 'document')
 * @returns Array of FormatInfo in the specified category
 */
export function getFormatsByCategory(category: FormatCategory | string): FormatInfo[] {
  return ALL_FORMATS.filter((format) => format.category === category);
}
