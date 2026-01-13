import type { FormatInfo } from '@/types';

/**
 * Common output formats that most document formats can convert to via Pandoc
 */
const COMMON_DOCUMENT_OUTPUT_FORMATS = [
  'pdf',
  'docx',
  'md',
  'txt',
  'html',
  'epub',
  'odt',
  'rtf',
  'latex',
  'rst',
  'asciidoc',
];

/**
 * Registry of supported document formats for conversion
 * Contains format information including extensions, MIME types, and conversion capabilities
 * Conversions are powered by Pandoc WASM
 */
export const DOCUMENT_FORMATS: FormatInfo[] = [
  // PDF - Portable Document Format
  {
    name: 'PDF',
    extensions: ['pdf'],
    mimeTypes: ['application/pdf'],
    category: 'document',
    canConvertTo: ['txt', 'html', 'md'], // PDF has limited conversion options
  },

  // Microsoft Word formats
  {
    name: 'DOCX (Word)',
    extensions: ['docx'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    category: 'document',
    canConvertTo: ['pdf', 'md', 'txt', 'html', 'epub', 'odt', 'rtf', 'latex', 'rst', 'asciidoc'],
  },
  {
    name: 'DOC (Word 97-2003)',
    extensions: ['doc'],
    mimeTypes: ['application/msword'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'md', 'txt', 'html', 'epub', 'odt', 'rtf', 'latex', 'rst', 'asciidoc'],
  },

  // Plain text and Markdown
  {
    name: 'Markdown',
    extensions: ['md', 'markdown'],
    mimeTypes: ['text/markdown', 'text/x-markdown'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'txt', 'html', 'epub', 'odt', 'rtf', 'latex', 'rst', 'asciidoc'],
  },
  {
    name: 'Plain Text',
    extensions: ['txt'],
    mimeTypes: ['text/plain'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'md', 'html', 'epub', 'odt', 'rtf', 'latex', 'rst', 'asciidoc'],
  },

  // Web formats
  {
    name: 'HTML',
    extensions: ['html', 'htm'],
    mimeTypes: ['text/html'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'md', 'txt', 'epub', 'odt', 'rtf', 'latex', 'rst', 'asciidoc'],
  },

  // E-book format
  {
    name: 'EPUB',
    extensions: ['epub'],
    mimeTypes: ['application/epub+zip'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'md', 'txt', 'html', 'odt', 'rtf', 'latex', 'rst', 'asciidoc'],
  },

  // OpenDocument format
  {
    name: 'ODT (OpenDocument)',
    extensions: ['odt'],
    mimeTypes: ['application/vnd.oasis.opendocument.text'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'md', 'txt', 'html', 'epub', 'rtf', 'latex', 'rst', 'asciidoc'],
  },

  // Rich Text Format
  {
    name: 'RTF',
    extensions: ['rtf'],
    mimeTypes: ['application/rtf', 'text/rtf'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'md', 'txt', 'html', 'epub', 'odt', 'latex', 'rst', 'asciidoc'],
  },

  // LaTeX
  {
    name: 'LaTeX',
    extensions: ['tex', 'latex'],
    mimeTypes: ['application/x-latex', 'text/x-latex'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'md', 'txt', 'html', 'epub', 'odt', 'rtf', 'rst', 'asciidoc'],
  },

  // reStructuredText
  {
    name: 'reStructuredText',
    extensions: ['rst'],
    mimeTypes: ['text/x-rst', 'text/prs.fallenstein.rst'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'md', 'txt', 'html', 'epub', 'odt', 'rtf', 'latex', 'asciidoc'],
  },

  // AsciiDoc
  {
    name: 'AsciiDoc',
    extensions: ['adoc', 'asciidoc', 'asc'],
    mimeTypes: ['text/asciidoc', 'text/x-asciidoc'],
    category: 'document',
    canConvertTo: ['pdf', 'docx', 'md', 'txt', 'html', 'epub', 'odt', 'rtf', 'latex', 'rst'],
  },
];
