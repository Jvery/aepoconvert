/**
 * Audio Converter
 *
 * Provides audio conversion functionality using FFmpeg WebAssembly.
 * Supports converting between various audio formats with quality settings.
 */

import type { QualitySettings } from '@/types';
import { initializeFFmpeg } from './ffmpeg-loader';

/**
 * Mapping of audio format extensions to FFmpeg codec configurations
 */
const FORMAT_CONFIG: Record<
  string,
  { codec: string; extension: string; mimeType: string }
> = {
  mp3: {
    codec: 'libmp3lame',
    extension: 'mp3',
    mimeType: 'audio/mpeg',
  },
  wav: {
    codec: 'pcm_s16le',
    extension: 'wav',
    mimeType: 'audio/wav',
  },
  ogg: {
    codec: 'libvorbis',
    extension: 'ogg',
    mimeType: 'audio/ogg',
  },
  flac: {
    codec: 'flac',
    extension: 'flac',
    mimeType: 'audio/flac',
  },
  aac: {
    codec: 'aac',
    extension: 'aac',
    mimeType: 'audio/aac',
  },
  m4a: {
    codec: 'aac',
    extension: 'm4a',
    mimeType: 'audio/mp4',
  },
};

/**
 * MIME type lookup for output formats
 */
const MIME_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
  aac: 'audio/aac',
  m4a: 'audio/mp4',
};

/**
 * Formats that support bitrate settings
 */
const BITRATE_SUPPORTED_FORMATS = ['mp3', 'aac', 'm4a', 'ogg'];

/**
 * Check if a format is supported for output
 */
export function isSupportedAudioOutputFormat(format: string): boolean {
  return format.toLowerCase() in FORMAT_CONFIG;
}

/**
 * Get list of supported audio output formats
 */
export function getSupportedAudioOutputFormats(): string[] {
  return Object.keys(FORMAT_CONFIG);
}

/**
 * Build FFmpeg command arguments for audio conversion
 */
function buildFFmpegArgs(
  inputFile: string,
  outputFile: string,
  toFormat: string,
  settings: QualitySettings
): string[] {
  const config = FORMAT_CONFIG[toFormat.toLowerCase()];
  if (!config) {
    throw new Error(`Unsupported output format: ${toFormat}`);
  }

  const args: string[] = [];

  // Input file
  args.push('-i', inputFile);

  // Audio codec
  args.push('-c:a', config.codec);

  // Apply bitrate if supported and provided
  if (
    BITRATE_SUPPORTED_FORMATS.includes(toFormat.toLowerCase()) &&
    settings.bitrate
  ) {
    args.push('-b:a', `${settings.bitrate}k`);
  }

  // Apply sample rate if provided
  if (settings.sampleRate) {
    args.push('-ar', settings.sampleRate.toString());
  }

  // For lossy formats, apply quality if no explicit bitrate is set
  if (
    !settings.bitrate &&
    BITRATE_SUPPORTED_FORMATS.includes(toFormat.toLowerCase())
  ) {
    // Convert quality (1-100) to appropriate bitrate
    // Quality 100 = 320kbps, Quality 50 = 160kbps, Quality 1 = 64kbps
    const bitrate = Math.round(64 + ((settings.quality - 1) / 99) * 256);
    args.push('-b:a', `${bitrate}k`);
  }

  // Overwrite output file without asking
  args.push('-y');

  // Output file
  args.push(outputFile);

  return args;
}

/**
 * Convert an audio file to another format
 *
 * @param file - The input audio file
 * @param toFormat - Target format extension (e.g., 'mp3', 'wav', 'ogg')
 * @param settings - Quality settings for the conversion
 * @returns Promise that resolves to the converted Blob
 * @throws Error if conversion fails or format is unsupported
 *
 * @example
 * ```ts
 * const wavFile = new File([...], 'audio.wav', { type: 'audio/wav' });
 * const settings: QualitySettings = { mode: 'simple', quality: 80 };
 * const mp3Blob = await convertAudio(wavFile, 'mp3', settings);
 * ```
 */
export async function convertAudio(
  file: File,
  toFormat: string,
  settings: QualitySettings
): Promise<Blob> {
  const normalizedFormat = toFormat.toLowerCase();

  // Validate output format
  if (!isSupportedAudioOutputFormat(normalizedFormat)) {
    throw new Error(
      `Unsupported output format: ${toFormat}. Supported formats: ${getSupportedAudioOutputFormats().join(', ')}`
    );
  }

  // Initialize FFmpeg
  const ffmpeg = await initializeFFmpeg();

  // Generate unique file names to avoid conflicts
  const timestamp = Date.now();
  const inputFileName = `input_${timestamp}`;
  const outputFileName = `output_${timestamp}.${FORMAT_CONFIG[normalizedFormat].extension}`;

  try {
    // Read input file as Uint8Array
    const inputData = new Uint8Array(await file.arrayBuffer());

    // Write input file to FFmpeg's virtual filesystem
    await ffmpeg.writeFile(inputFileName, inputData);

    // Build and execute FFmpeg command
    const args = buildFFmpegArgs(
      inputFileName,
      outputFileName,
      normalizedFormat,
      settings
    );

    console.log('[Audio Converter] Executing FFmpeg with args:', args);

    await ffmpeg.exec(args);

    // Read output file from virtual filesystem
    const outputData = await ffmpeg.readFile(outputFileName);

    // Ensure we have a Uint8Array
    if (!(outputData instanceof Uint8Array)) {
      throw new Error('Unexpected output format from FFmpeg');
    }

    // Get MIME type for output
    const mimeType = MIME_TYPES[normalizedFormat] || 'application/octet-stream';

    // Create a copy of the data with a clean ArrayBuffer to avoid type issues
    const outputBuffer = new Uint8Array(outputData).buffer;

    // Create Blob from output data
    const blob = new Blob([outputBuffer], { type: mimeType });

    console.log(
      `[Audio Converter] Conversion complete: ${file.name} -> ${normalizedFormat} (${blob.size} bytes)`
    );

    return blob;
  } finally {
    // Clean up: remove files from virtual filesystem
    try {
      await ffmpeg.deleteFile(inputFileName);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await ffmpeg.deleteFile(outputFileName);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Get the MIME type for an audio format
 */
export function getAudioMimeType(format: string): string {
  return MIME_TYPES[format.toLowerCase()] || 'application/octet-stream';
}
