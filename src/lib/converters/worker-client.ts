/**
 * Worker Client for file conversions
 *
 * Provides a Promise-based API for running conversions in a Web Worker.
 * This allows the main thread to remain responsive during CPU-intensive
 * WASM operations.
 */

import type { QualitySettings } from '@/types';
import type {
  WorkerOutputMessage,
  ProgressMessage,
  CompleteMessage,
  ErrorMessage,
} from '@/workers/conversion-worker';

/**
 * Options for running a conversion
 */
export interface RunConversionOptions {
  /** The file to convert */
  file: File;
  /** Source format extension (e.g., 'png', 'mp3') */
  from: string;
  /** Target format extension (e.g., 'jpeg', 'wav') */
  to: string;
  /** Quality settings for the conversion */
  settings: QualitySettings;
  /** Callback for progress updates (0-100) */
  onProgress?: (progress: number) => void;
}

/**
 * Result of a conversion operation
 */
export interface ConversionResult {
  /** Whether the conversion was successful */
  success: boolean;
  /** The converted blob (if successful) */
  blob?: Blob;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Default quality settings
 */
const DEFAULT_QUALITY_SETTINGS: QualitySettings = {
  mode: 'simple',
  quality: 80,
};

/**
 * Create a new conversion worker
 *
 * @returns A new Worker instance for conversions
 */
function createWorker(): Worker {
  // Use the worker constructor with module type for ES modules
  // Next.js will handle the bundling of the worker
  return new Worker(
    new URL('@/workers/conversion-worker', import.meta.url),
    { type: 'module' }
  );
}

/**
 * Run a file conversion in a Web Worker
 *
 * This function spawns a Web Worker to perform the conversion, keeping the
 * main thread responsive. The worker is terminated after the conversion
 * completes (success or error).
 *
 * @param options - Conversion options
 * @returns Promise resolving to the conversion result
 *
 * @example
 * ```ts
 * const result = await runConversion({
 *   file: myFile,
 *   from: 'png',
 *   to: 'jpeg',
 *   settings: { mode: 'simple', quality: 80 },
 *   onProgress: (progress) => console.log(`Progress: ${progress}%`),
 * });
 *
 * if (result.success && result.blob) {
 *   // Use the converted blob
 *   const url = URL.createObjectURL(result.blob);
 * }
 * ```
 */
export function runConversion(options: RunConversionOptions): Promise<ConversionResult> {
  const { file, from, to, settings = DEFAULT_QUALITY_SETTINGS, onProgress } = options;

  return new Promise((resolve) => {
    let worker: Worker | null = null;

    try {
      // Create a new worker for this conversion
      worker = createWorker();

      // Handle messages from the worker
      worker.onmessage = (event: MessageEvent<WorkerOutputMessage>) => {
        const message = event.data;

        switch (message.type) {
          case 'progress': {
            const progressMsg = message as ProgressMessage;
            onProgress?.(progressMsg.progress);
            break;
          }

          case 'complete': {
            const completeMsg = message as CompleteMessage;
            // Terminate the worker
            worker?.terminate();
            worker = null;
            resolve({
              success: true,
              blob: completeMsg.blob,
            });
            break;
          }

          case 'error': {
            const errorMsg = message as ErrorMessage;
            // Terminate the worker
            worker?.terminate();
            worker = null;
            resolve({
              success: false,
              error: errorMsg.error,
            });
            break;
          }

          default: {
            console.warn(`[WorkerClient] Unknown message type: ${(message as { type: string }).type}`);
          }
        }
      };

      // Handle worker errors
      worker.onerror = (event: ErrorEvent) => {
        console.error('[WorkerClient] Worker error:', event.message);
        worker?.terminate();
        worker = null;
        resolve({
          success: false,
          error: event.message || 'Unknown worker error',
        });
      };

      // Send the conversion message to the worker
      worker.postMessage({
        type: 'convert',
        file,
        from,
        to,
        settings,
      });
    } catch (error) {
      // Handle worker creation errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[WorkerClient] Failed to create worker:', errorMessage);

      worker?.terminate();

      resolve({
        success: false,
        error: `Failed to create worker: ${errorMessage}`,
      });
    }
  });
}

/**
 * Check if Web Workers are supported in the current environment
 *
 * @returns True if Web Workers are supported
 */
export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Convert a file using a worker or fallback to main thread
 *
 * This is a convenience function that uses a worker if supported,
 * otherwise falls back to main thread conversion.
 *
 * @param options - Conversion options
 * @returns Promise resolving to the conversion result
 */
export async function convertWithWorkerFallback(
  options: RunConversionOptions
): Promise<ConversionResult> {
  if (isWorkerSupported()) {
    return runConversion(options);
  }

  // Fallback to main thread conversion
  console.warn('[WorkerClient] Web Workers not supported, using main thread');

  const { file, from, to, settings, onProgress } = options;

  try {
    // Import the main converter facade
    const { convert } = await import('@/lib/converters');

    // Create a minimal ConvertibleFile for the converter
    const convertibleFile = {
      id: 'fallback',
      file,
      name: file.name,
      size: file.size,
      from,
      to,
      status: 'pending' as const,
      progress: 0,
      error: null,
      result: null,
      previewUrl: null,
    };

    const blob = await convert(convertibleFile, onProgress, settings);

    return {
      success: true,
      blob,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
