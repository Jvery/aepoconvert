/**
 * FFmpeg WASM Loader
 *
 * Provides initialization and management of FFmpeg WebAssembly for audio conversion.
 * Uses @ffmpeg/ffmpeg and @ffmpeg/util packages.
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';

/**
 * Base URL for FFmpeg WASM core files on unpkg CDN
 * Using umd version for better compatibility
 */
const FFMPEG_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

/**
 * Singleton FFmpeg instance
 */
let ffmpegInstance: FFmpeg | null = null;

/**
 * Flag indicating if FFmpeg is ready for use
 */
export let isFFmpegReady = false;

/**
 * Flag indicating if initialization is in progress
 */
let isInitializing = false;

/**
 * Promise that resolves when initialization is complete
 */
let initPromise: Promise<FFmpeg> | null = null;

/**
 * Check if SharedArrayBuffer is supported in the current environment.
 * SharedArrayBuffer is required for FFmpeg's multi-threaded operations.
 *
 * @returns true if SharedArrayBuffer is supported
 */
export function checkSharedArrayBufferSupport(): boolean {
  try {
    // Check if SharedArrayBuffer exists
    if (typeof SharedArrayBuffer === 'undefined') {
      return false;
    }

    // Try to create a SharedArrayBuffer to verify full support
    new SharedArrayBuffer(1);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if required COOP/COEP headers are present for SharedArrayBuffer.
 * These headers are required for SharedArrayBuffer to work in modern browsers.
 *
 * @returns true if the necessary headers are likely present
 */
export function checkCrossOriginIsolation(): boolean {
  // crossOriginIsolated is a global property that indicates
  // if the page is cross-origin isolated (has proper COOP/COEP headers)
  if (typeof window !== 'undefined') {
    return window.crossOriginIsolated === true;
  }
  // In Node.js or non-browser environments, assume it's available
  return true;
}

/**
 * Log a warning about SharedArrayBuffer requirements.
 */
function warnAboutSharedArrayBuffer(): void {
  console.warn(
    '[FFmpeg Loader] SharedArrayBuffer is not available.',
    'FFmpeg requires SharedArrayBuffer for optimal performance.',
    'Ensure your server sends the following headers:',
    '\n  Cross-Origin-Opener-Policy: same-origin',
    '\n  Cross-Origin-Embedder-Policy: require-corp'
  );
}

/**
 * Initialize FFmpeg WASM.
 *
 * Loads the FFmpeg WebAssembly core from CDN and prepares it for use.
 * This function handles concurrent initialization calls by returning
 * the same promise if initialization is already in progress.
 *
 * @returns Promise that resolves to the FFmpeg instance
 * @throws Error if initialization fails
 *
 * @example
 * ```ts
 * const ffmpeg = await initializeFFmpeg();
 * // FFmpeg is now ready to use
 * await ffmpeg.writeFile('input.mp3', inputData);
 * await ffmpeg.exec(['-i', 'input.mp3', 'output.wav']);
 * const outputData = await ffmpeg.readFile('output.wav');
 * ```
 */
export async function initializeFFmpeg(): Promise<FFmpeg> {
  // Return existing instance if already initialized
  if (isFFmpegReady && ffmpegInstance) {
    return ffmpegInstance;
  }

  // Return existing promise if initialization is in progress
  if (isInitializing && initPromise) {
    return initPromise;
  }

  // Check for SharedArrayBuffer support
  const hasSharedArrayBuffer = checkSharedArrayBufferSupport();
  const isCrossOriginIsolated = checkCrossOriginIsolation();

  if (!hasSharedArrayBuffer || !isCrossOriginIsolated) {
    warnAboutSharedArrayBuffer();
    // We'll still try to load - some operations might work without SharedArrayBuffer
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      console.log('[FFmpeg Loader] Starting initialization...');

      // Create new FFmpeg instance
      ffmpegInstance = new FFmpeg();

      // Load FFmpeg core from CDN using direct URLs
      const coreURL = `${FFMPEG_BASE_URL}/ffmpeg-core.js`;
      const wasmURL = `${FFMPEG_BASE_URL}/ffmpeg-core.wasm`;

      // Optional: Load the worker file for multi-threaded support
      // Only available when SharedArrayBuffer is supported
      let workerURL: string | undefined;
      if (hasSharedArrayBuffer && isCrossOriginIsolated) {
        workerURL = `${FFMPEG_BASE_URL}/ffmpeg-core.worker.js`;
      }

      // Load FFmpeg with the core files
      await ffmpegInstance.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      isFFmpegReady = true;
      isInitializing = false;

      console.log('[FFmpeg Loader] Initialization complete');
      return ffmpegInstance;
    } catch (error) {
      isFFmpegReady = false;
      isInitializing = false;
      ffmpegInstance = null;
      initPromise = null;

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[FFmpeg Loader] Initialization failed:', errorMessage);

      throw new Error(`Failed to initialize FFmpeg: ${errorMessage}`);
    }
  })();

  return initPromise;
}

/**
 * Get the current FFmpeg instance.
 *
 * @returns The FFmpeg instance if initialized, null otherwise
 */
export function getFFmpegInstance(): FFmpeg | null {
  return ffmpegInstance;
}

/**
 * Check if FFmpeg is ready for use.
 *
 * @returns true if FFmpeg is initialized and ready
 */
export function checkFFmpegReady(): boolean {
  return isFFmpegReady && ffmpegInstance !== null && ffmpegInstance.loaded;
}

/**
 * Terminate FFmpeg and reset state.
 *
 * Useful for cleanup or when you need to reinitialize with different settings.
 */
export function terminateFFmpeg(): void {
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch (error) {
      console.warn('[FFmpeg Loader] Error during termination:', error);
    }
  }

  ffmpegInstance = null;
  isFFmpegReady = false;
  isInitializing = false;
  initPromise = null;

  console.log('[FFmpeg Loader] FFmpeg terminated and state reset');
}

/**
 * Reset the FFmpeg state without terminating.
 *
 * This clears the internal flags to allow reinitialization.
 * Use terminateFFmpeg() if you want to fully clean up.
 */
export function resetFFmpegState(): void {
  ffmpegInstance = null;
  isFFmpegReady = false;
  isInitializing = false;
  initPromise = null;
}
