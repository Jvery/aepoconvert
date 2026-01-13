/**
 * Pandoc WASM Loader
 *
 * Provides initialization and management of Pandoc WebAssembly for document conversion.
 * Uses the pandoc-wasm npm package which bundles the Pandoc WASM binary.
 */

import { Pandoc } from 'pandoc-wasm';

/**
 * Singleton Pandoc instance
 */
let pandocInstance: Pandoc | null = null;

/**
 * Flag indicating if Pandoc is ready for use
 */
export let isPandocReady = false;

/**
 * Flag indicating if initialization is in progress
 */
let isInitializing = false;

/**
 * Promise that resolves when initialization is complete
 */
let initPromise: Promise<void> | null = null;

/**
 * Initialize Pandoc WASM.
 *
 * Loads the Pandoc WebAssembly binary and prepares it for use.
 * This function handles concurrent initialization calls by returning
 * the same promise if initialization is already in progress.
 *
 * @returns Promise that resolves when Pandoc is initialized
 * @throws Error if initialization fails
 *
 * @example
 * ```ts
 * await initializePandoc();
 * // Pandoc is now ready to use
 * const result = await getPandocInstance()?.run({
 *   text: '# Hello World',
 *   options: { from: 'markdown', to: 'html' }
 * });
 * ```
 */
export async function initializePandoc(): Promise<void> {
  // Return if already initialized
  if (isPandocReady && pandocInstance) {
    return;
  }

  // Return existing promise if initialization is in progress
  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      console.log('[Pandoc Loader] Starting initialization...');

      // Create new Pandoc instance
      pandocInstance = new Pandoc();

      // Initialize - this downloads and loads the WASM binary
      await pandocInstance.init();

      // Verify initialization by getting version
      const version = await pandocInstance.getVersion();
      console.log(`[Pandoc Loader] Pandoc version: ${version}`);

      isPandocReady = true;
      isInitializing = false;

      console.log('[Pandoc Loader] Initialization complete');
    } catch (error) {
      isPandocReady = false;
      isInitializing = false;
      pandocInstance = null;
      initPromise = null;

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Pandoc Loader] Initialization failed:', errorMessage);

      throw new Error(`Failed to initialize Pandoc: ${errorMessage}`);
    }
  })();

  return initPromise;
}

/**
 * Get the current Pandoc instance.
 *
 * @returns The Pandoc instance if initialized, null otherwise
 */
export function getPandocInstance(): Pandoc | null {
  return pandocInstance;
}

/**
 * Check if Pandoc is ready for use.
 *
 * @returns true if Pandoc is initialized and ready
 */
export function checkPandocReady(): boolean {
  return isPandocReady && pandocInstance !== null;
}

/**
 * Reset the Pandoc state.
 *
 * This clears the internal flags and instance to allow reinitialization.
 * Useful for cleanup or testing scenarios.
 */
export function resetPandocState(): void {
  pandocInstance = null;
  isPandocReady = false;
  isInitializing = false;
  initPromise = null;

  console.log('[Pandoc Loader] State reset');
}
