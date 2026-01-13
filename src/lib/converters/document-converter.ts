/**
 * Document Converter
 *
 * Provides document conversion functionality using Pandoc WebAssembly.
 * Supports converting between various document formats.
 */

import { initializePandoc, getPandocInstance } from './pandoc-loader';

/**
 * Mapping of file extensions to Pandoc input format names
 */
const INPUT_FORMAT_MAP: Record<string, string> = {
  md: 'markdown',
  markdown: 'markdown',
  html: 'html',
  htm: 'html',
  txt: 'plain',
  docx: 'docx',
  doc: 'docx', // Pandoc treats doc as docx
  epub: 'epub',
  odt: 'odt',
  rtf: 'rtf',
  tex: 'latex',
  latex: 'latex',
  rst: 'rst',
  adoc: 'asciidoc',
  asciidoc: 'asciidoc',
  asc: 'asciidoc',
};

/**
 * Mapping of file extensions to Pandoc output format names
 */
const OUTPUT_FORMAT_MAP: Record<string, string> = {
  md: 'markdown',
  markdown: 'markdown',
  html: 'html',
  htm: 'html',
  txt: 'plain',
  docx: 'docx',
  epub: 'epub',
  odt: 'odt',
  rtf: 'rtf',
  tex: 'latex',
  latex: 'latex',
  rst: 'rst',
  adoc: 'asciidoc',
  asciidoc: 'asciidoc',
  asc: 'asciidoc',
  pdf: 'pdf', // PDF requires additional handling
};

/**
 * MIME type lookup for output formats
 */
const MIME_TYPES: Record<string, string> = {
  md: 'text/markdown',
  markdown: 'text/markdown',
  html: 'text/html',
  htm: 'text/html',
  txt: 'text/plain',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  epub: 'application/epub+zip',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  tex: 'application/x-latex',
  latex: 'application/x-latex',
  rst: 'text/x-rst',
  adoc: 'text/asciidoc',
  asciidoc: 'text/asciidoc',
  asc: 'text/asciidoc',
  pdf: 'application/pdf',
};

/**
 * Binary output formats that require base64 decoding
 * These formats are returned as base64-encoded strings by Pandoc WASM
 */
const BINARY_OUTPUT_FORMATS: Set<string> = new Set([
  'docx',
  'epub',
  'odt',
]);

/**
 * Check if a format produces binary output
 */
function isBinaryOutputFormat(format: string): boolean {
  return BINARY_OUTPUT_FORMATS.has(format.toLowerCase());
}

/**
 * Decode base64 string to ArrayBuffer
 * Returns a fresh ArrayBuffer (not SharedArrayBuffer) for Blob compatibility
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const buffer = new ArrayBuffer(binaryString.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return buffer;
}

/**
 * Check if a format is supported for input
 */
export function isSupportedDocumentInputFormat(format: string): boolean {
  return format.toLowerCase() in INPUT_FORMAT_MAP;
}

/**
 * Check if a format is supported for output
 */
export function isSupportedDocumentOutputFormat(format: string): boolean {
  return format.toLowerCase() in OUTPUT_FORMAT_MAP;
}

/**
 * Get list of supported document input formats
 */
export function getSupportedDocumentInputFormats(): string[] {
  return Object.keys(INPUT_FORMAT_MAP);
}

/**
 * Get list of supported document output formats
 */
export function getSupportedDocumentOutputFormats(): string[] {
  return Object.keys(OUTPUT_FORMAT_MAP);
}

/**
 * Get the MIME type for a document format
 */
export function getDocumentMimeType(format: string): string {
  return MIME_TYPES[format.toLowerCase()] || 'application/octet-stream';
}

/**
 * Detect input format from file extension
 */
function detectInputFormat(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const pandocFormat = INPUT_FORMAT_MAP[extension];

  if (!pandocFormat) {
    throw new Error(
      `Unsupported input format: ${extension}. Supported formats: ${getSupportedDocumentInputFormats().join(', ')}`
    );
  }

  return pandocFormat;
}

/**
 * Convert a document file to another format
 *
 * @param file - The input document file
 * @param toFormat - Target format extension (e.g., 'html', 'md', 'docx')
 * @returns Promise that resolves to the converted Blob
 * @throws Error if conversion fails or format is unsupported
 *
 * @example
 * ```ts
 * const mdFile = new File(['# Hello World'], 'document.md', { type: 'text/markdown' });
 * const htmlBlob = await convertDocument(mdFile, 'html');
 * ```
 */
export async function convertDocument(
  file: File,
  toFormat: string
): Promise<Blob> {
  const normalizedFormat = toFormat.toLowerCase();

  // Validate output format
  if (!isSupportedDocumentOutputFormat(normalizedFormat)) {
    throw new Error(
      `Unsupported output format: ${toFormat}. Supported formats: ${getSupportedDocumentOutputFormats().join(', ')}`
    );
  }

  // PDF output requires special handling (LaTeX engine or wkhtmltopdf)
  // Pandoc WASM may not support PDF generation directly
  if (normalizedFormat === 'pdf') {
    throw new Error(
      'PDF output is not supported in browser-based conversion. ' +
        'Please convert to HTML or another format first.'
    );
  }

  // Initialize Pandoc
  await initializePandoc();
  const pandoc = getPandocInstance();

  if (!pandoc) {
    throw new Error('Pandoc is not initialized');
  }

  // Detect input format
  const inputFormat = detectInputFormat(file);
  const outputFormat = OUTPUT_FORMAT_MAP[normalizedFormat];

  console.log(
    `[Document Converter] Converting ${file.name} from ${inputFormat} to ${outputFormat}`
  );

  try {
    // Read file content as text
    const inputText = await file.text();

    // Run Pandoc conversion
    const result = await pandoc.run({
      text: inputText,
      options: {
        from: inputFormat,
        to: outputFormat,
      },
    });

    // Get MIME type for output
    const mimeType = getDocumentMimeType(normalizedFormat);

    // Create Blob from result
    // Binary formats (docx, epub, odt) are returned as base64-encoded strings
    // Text formats are returned as plain strings
    let blob: Blob;
    if (isBinaryOutputFormat(normalizedFormat)) {
      // Decode base64 to binary ArrayBuffer
      const binaryData = base64ToArrayBuffer(result);
      blob = new Blob([binaryData], { type: mimeType });
    } else {
      // Text-based format
      const outputData = typeof result === 'string' ? result : String(result);
      blob = new Blob([outputData], { type: mimeType });
    }

    console.log(
      `[Document Converter] Conversion complete: ${file.name} -> ${normalizedFormat} (${blob.size} bytes)`
    );

    return blob;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Document Converter] Conversion failed:', errorMessage);
    throw new Error(`Document conversion failed: ${errorMessage}`);
  }
}
