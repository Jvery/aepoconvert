import type { FormatInfo } from '@/types';

/**
 * Common output formats that most audio formats can convert to
 */
const COMMON_AUDIO_OUTPUT_FORMATS = [
  'mp3',
  'wav',
  'ogg',
  'flac',
  'aac',
  'm4a',
  'opus',
  'aiff',
];

/**
 * Registry of supported audio formats for conversion
 * Contains format information including extensions, MIME types, and conversion capabilities
 */
export const AUDIO_FORMATS: FormatInfo[] = [
  // Common audio formats
  {
    name: 'MP3',
    extensions: ['mp3'],
    mimeTypes: ['audio/mpeg', 'audio/mp3'],
    category: 'audio',
    canConvertTo: ['wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'aiff', 'alac'],
  },
  {
    name: 'WAV',
    extensions: ['wav'],
    mimeTypes: ['audio/wav', 'audio/x-wav', 'audio/wave'],
    category: 'audio',
    canConvertTo: ['mp3', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'aiff', 'alac'],
  },
  {
    name: 'OGG Vorbis',
    extensions: ['ogg'],
    mimeTypes: ['audio/ogg', 'audio/vorbis'],
    category: 'audio',
    canConvertTo: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'opus', 'aiff', 'alac'],
  },
  {
    name: 'FLAC',
    extensions: ['flac'],
    mimeTypes: ['audio/flac', 'audio/x-flac'],
    category: 'audio',
    canConvertTo: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'opus', 'aiff', 'alac'],
  },
  {
    name: 'AAC',
    extensions: ['aac'],
    mimeTypes: ['audio/aac', 'audio/x-aac'],
    category: 'audio',
    canConvertTo: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'opus', 'aiff', 'alac'],
  },
  {
    name: 'M4A',
    extensions: ['m4a'],
    mimeTypes: ['audio/m4a', 'audio/x-m4a', 'audio/mp4'],
    category: 'audio',
    canConvertTo: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'opus', 'aiff', 'alac'],
  },
  {
    name: 'Opus',
    extensions: ['opus'],
    mimeTypes: ['audio/opus'],
    category: 'audio',
    canConvertTo: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'aiff', 'alac'],
  },

  // Microsoft format (read-only for output, can convert from)
  {
    name: 'WMA',
    extensions: ['wma'],
    mimeTypes: ['audio/x-ms-wma'],
    category: 'audio',
    canConvertTo: COMMON_AUDIO_OUTPUT_FORMATS,
  },

  // Apple/Professional formats
  {
    name: 'AIFF',
    extensions: ['aiff', 'aif'],
    mimeTypes: ['audio/aiff', 'audio/x-aiff'],
    category: 'audio',
    canConvertTo: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'alac'],
  },
  {
    name: 'ALAC (Apple Lossless)',
    extensions: ['alac'],
    mimeTypes: ['audio/alac'],
    category: 'audio',
    canConvertTo: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'aiff'],
  },
];
