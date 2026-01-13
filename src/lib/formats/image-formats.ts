import type { FormatInfo } from '@/types';

/**
 * Common output formats that most image formats can convert to
 */
const COMMON_OUTPUT_FORMATS = [
  'png',
  'jpeg',
  'webp',
  'gif',
  'bmp',
  'tiff',
  'avif',
  'jxl',
  'ico',
];

/**
 * Registry of supported image formats for conversion
 * Contains format information including extensions, MIME types, and conversion capabilities
 */
export const IMAGE_FORMATS: FormatInfo[] = [
  // Web-friendly formats
  {
    name: 'PNG',
    extensions: ['png'],
    mimeTypes: ['image/png'],
    category: 'image',
    canConvertTo: ['jpeg', 'webp', 'gif', 'bmp', 'tiff', 'avif', 'jxl', 'ico'],
  },
  {
    name: 'JPEG',
    extensions: ['jpeg', 'jpg'],
    mimeTypes: ['image/jpeg'],
    category: 'image',
    canConvertTo: ['png', 'webp', 'gif', 'bmp', 'tiff', 'avif', 'jxl', 'ico'],
  },
  {
    name: 'WebP',
    extensions: ['webp'],
    mimeTypes: ['image/webp'],
    category: 'image',
    canConvertTo: ['png', 'jpeg', 'gif', 'bmp', 'tiff', 'avif', 'jxl', 'ico'],
  },
  {
    name: 'GIF',
    extensions: ['gif'],
    mimeTypes: ['image/gif'],
    category: 'image',
    canConvertTo: ['png', 'jpeg', 'webp', 'bmp', 'tiff', 'avif', 'jxl'],
  },
  {
    name: 'BMP',
    extensions: ['bmp'],
    mimeTypes: ['image/bmp', 'image/x-bmp'],
    category: 'image',
    canConvertTo: ['png', 'jpeg', 'webp', 'gif', 'tiff', 'avif', 'jxl', 'ico'],
  },

  // High-quality / professional formats
  {
    name: 'TIFF',
    extensions: ['tiff', 'tif'],
    mimeTypes: ['image/tiff'],
    category: 'image',
    canConvertTo: ['png', 'jpeg', 'webp', 'gif', 'bmp', 'avif', 'jxl'],
  },
  {
    name: 'ICO',
    extensions: ['ico'],
    mimeTypes: ['image/x-icon', 'image/vnd.microsoft.icon'],
    category: 'image',
    canConvertTo: ['png', 'jpeg', 'webp', 'bmp', 'gif'],
  },
  {
    name: 'SVG',
    extensions: ['svg'],
    mimeTypes: ['image/svg+xml'],
    category: 'image',
    canConvertTo: ['png', 'jpeg', 'webp', 'gif', 'bmp', 'tiff'],
  },

  // Modern formats
  {
    name: 'AVIF',
    extensions: ['avif'],
    mimeTypes: ['image/avif'],
    category: 'image',
    canConvertTo: ['png', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'jxl'],
  },
  {
    name: 'JPEG XL',
    extensions: ['jxl'],
    mimeTypes: ['image/jxl'],
    category: 'image',
    canConvertTo: ['png', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'avif'],
  },

  // Apple formats (read-only, convert to other formats)
  {
    name: 'HEIC',
    extensions: ['heic'],
    mimeTypes: ['image/heic'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'HEIF',
    extensions: ['heif'],
    mimeTypes: ['image/heif'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },

  // Adobe Photoshop
  {
    name: 'PSD',
    extensions: ['psd'],
    mimeTypes: ['image/vnd.adobe.photoshop', 'application/x-photoshop'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },

  // RAW camera formats (read-only, convert to other formats)
  {
    name: 'NEF (Nikon RAW)',
    extensions: ['nef'],
    mimeTypes: ['image/x-nikon-nef'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'CR2 (Canon RAW)',
    extensions: ['cr2'],
    mimeTypes: ['image/x-canon-cr2'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'CR3 (Canon RAW)',
    extensions: ['cr3'],
    mimeTypes: ['image/x-canon-cr3'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'ARW (Sony RAW)',
    extensions: ['arw'],
    mimeTypes: ['image/x-sony-arw'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'DNG (Adobe RAW)',
    extensions: ['dng'],
    mimeTypes: ['image/x-adobe-dng'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'ORF (Olympus RAW)',
    extensions: ['orf'],
    mimeTypes: ['image/x-olympus-orf'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'RAF (Fujifilm RAW)',
    extensions: ['raf'],
    mimeTypes: ['image/x-fuji-raf'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'RW2 (Panasonic RAW)',
    extensions: ['rw2'],
    mimeTypes: ['image/x-panasonic-rw2'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'PEF (Pentax RAW)',
    extensions: ['pef'],
    mimeTypes: ['image/x-pentax-pef'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'SRW (Samsung RAW)',
    extensions: ['srw'],
    mimeTypes: ['image/x-samsung-srw'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'ERF (Epson RAW)',
    extensions: ['erf'],
    mimeTypes: ['image/x-epson-erf'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'NRW (Nikon RAW)',
    extensions: ['nrw'],
    mimeTypes: ['image/x-nikon-nrw'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'KDC (Kodak RAW)',
    extensions: ['kdc'],
    mimeTypes: ['image/x-kodak-kdc'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'DCR (Kodak RAW)',
    extensions: ['dcr'],
    mimeTypes: ['image/x-kodak-dcr'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'MRW (Minolta RAW)',
    extensions: ['mrw'],
    mimeTypes: ['image/x-minolta-mrw'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: '3FR (Hasselblad RAW)',
    extensions: ['3fr'],
    mimeTypes: ['image/x-hasselblad-3fr'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'X3F (Sigma RAW)',
    extensions: ['x3f'],
    mimeTypes: ['image/x-sigma-x3f'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },

  // Other image formats
  {
    name: 'TGA',
    extensions: ['tga'],
    mimeTypes: ['image/x-tga', 'image/x-targa'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'PCX',
    extensions: ['pcx'],
    mimeTypes: ['image/x-pcx'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'PPM',
    extensions: ['ppm'],
    mimeTypes: ['image/x-portable-pixmap'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'PGM',
    extensions: ['pgm'],
    mimeTypes: ['image/x-portable-graymap'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'PBM',
    extensions: ['pbm'],
    mimeTypes: ['image/x-portable-bitmap'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'PAM',
    extensions: ['pam'],
    mimeTypes: ['image/x-portable-anymap'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'XBM',
    extensions: ['xbm'],
    mimeTypes: ['image/x-xbitmap'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'XPM',
    extensions: ['xpm'],
    mimeTypes: ['image/x-xpixmap'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'EXR',
    extensions: ['exr'],
    mimeTypes: ['image/x-exr'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
  {
    name: 'HDR',
    extensions: ['hdr'],
    mimeTypes: ['image/vnd.radiance'],
    category: 'image',
    canConvertTo: COMMON_OUTPUT_FORMATS,
  },
];
