/**
 * TypeScript type definitions for the file conversion system
 */

/**
 * Status of a file conversion operation
 */
export type ConversionStatus = 'pending' | 'converting' | 'complete' | 'error';

/**
 * Represents a file that can be converted
 */
export interface ConvertibleFile {
  /** Unique identifier for the file */
  id: string;
  /** The original File object */
  file: File;
  /** Display name of the file */
  name: string;
  /** File size in bytes */
  size: number;
  /** Source format extension (e.g., 'png', 'mp3') */
  from: string;
  /** Target format extension, null if not selected */
  to: string | null;
  /** Current conversion status */
  status: ConversionStatus;
  /** Conversion progress (0-100) */
  progress: number;
  /** Error message if conversion failed */
  error: string | null;
  /** Converted file blob if conversion succeeded */
  result: Blob | null;
  /** Preview URL for image files (Object URL) */
  previewUrl: string | null;
}

/**
 * Category of file format
 */
export type FormatCategory = 'image' | 'audio' | 'document';

/**
 * Information about a supported file format
 */
export interface FormatInfo {
  /** Display name of the format (e.g., 'PNG Image') */
  name: string;
  /** Supported file extensions (e.g., ['png']) */
  extensions: string[];
  /** Associated MIME types (e.g., ['image/png']) */
  mimeTypes: string[];
  /** Category of the format */
  category: FormatCategory;
  /** Array of format extensions this format can be converted to */
  canConvertTo: string[];
}

/**
 * Quality settings mode
 */
export type QualityMode = 'simple' | 'advanced';

/**
 * Settings for controlling conversion quality
 */
export interface QualitySettings {
  /** Quality settings mode */
  mode: QualityMode;
  /** Quality level (1-100) for lossy formats */
  quality: number;
  /** Audio bitrate in kbps (e.g., 128, 256, 320) */
  bitrate?: number;
  /** Audio sample rate in Hz (e.g., 44100, 48000) */
  sampleRate?: number;
}
