/**
 * ImageMagick WASM loader
 * Handles initialization of the ImageMagick WASM library for browser-based image conversion
 */

import { initializeImageMagick } from '@imagemagick/magick-wasm';

/** Flag indicating whether ImageMagick WASM is ready for use */
export let isMagickReady = false;

/** Flag indicating whether initialization is in progress */
let isInitializing = false;

/** Promise for the initialization process (for deduplication) */
let initPromise: Promise<void> | null = null;

/**
 * CDN URL for the ImageMagick WASM binary
 * Using jsDelivr for reliable CDN delivery
 */
const MAGICK_WASM_CDN_URL = 'https://cdn.jsdelivr.net/npm/@imagemagick/magick-wasm@0.0.37/dist/magick.wasm';

/**
 * Initialize ImageMagick WASM library
 * Loads the WASM binary from CDN and initializes the library
 *
 * @returns Promise that resolves when ImageMagick is ready
 * @throws Error if initialization fails
 */
export async function initializeMagick(): Promise<void> {
  // Already initialized
  if (isMagickReady) {
    return;
  }

  // Return existing promise if initialization is in progress
  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      console.log('[ImageMagick] Starting initialization...');

      // Fetch WASM binary from CDN
      const wasmUrl = new URL(MAGICK_WASM_CDN_URL);

      // Initialize ImageMagick with the WASM URL
      await initializeImageMagick(wasmUrl);

      isMagickReady = true;
      console.log('[ImageMagick] Initialization complete');
    } catch (error) {
      isMagickReady = false;
      isInitializing = false;
      initPromise = null;

      // Log the error with details
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[ImageMagick] Initialization failed:', errorMessage);

      throw new Error(`Failed to initialize ImageMagick: ${errorMessage}`);
    }
  })();

  return initPromise;
}

/**
 * Check if ImageMagick is ready for use
 * @returns true if ImageMagick is initialized and ready
 */
export function checkMagickReady(): boolean {
  return isMagickReady;
}

/**
 * Reset the initialization state (useful for testing or retry scenarios)
 */
export function resetMagickState(): void {
  isMagickReady = false;
  isInitializing = false;
  initPromise = null;
}
