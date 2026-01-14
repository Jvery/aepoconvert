import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { detectFormat, getConvertibleFormats } from '@/lib/formats';
import { convertWithWorkerFallback } from '@/lib/converters/worker-client';
import type { ConvertibleFile, FormatInfo, QualitySettings } from '@/types';

/**
 * Generates a unique ID for files
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * State shape for the conversion store
 */
interface ConversionState {
  /** List of files to be converted */
  files: ConvertibleFile[];
  /** Whether a conversion is currently in progress */
  isConverting: boolean;
  /** Global quality settings applied to all conversions */
  globalSettings: QualitySettings;
}

/**
 * Actions available in the conversion store
 */
interface ConversionActions {
  /** Add multiple files to the conversion queue */
  addFiles: (files: File[]) => void;
  /** Remove a file from the queue by ID */
  removeFile: (id: string) => void;
  /** Update a file's properties */
  updateFile: (id: string, updates: Partial<ConvertibleFile>) => void;
 /** Set the output format for a specific file */
  setOutputFormat: (id: string, format: string) => void;
  /** Update global quality settings */
  setGlobalSettings: (settings: Partial<QualitySettings>) => void;
  /** Start the conversion process */
  startConversion: () => Promise<void>;
  /** Clear all files from the queue */
  clearAll: () => void;
}

/**
 * Default quality settings
 */
const defaultSettings: QualitySettings = {
  mode: 'simple',
  quality: 80,
  bitrate: undefined,
  sampleRate: undefined,
};

/**
 * Extracts the file extension from a filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Select a default output format for a detected format
 * Prefers the first convertible option that differs from the source extension
 */
function getDefaultOutputFormat(
  sourceExtension: string,
  detectedFormat: FormatInfo | null
): string | null {
  if (!detectedFormat) return null;

  const convertibleFormats = getConvertibleFormats(detectedFormat);
  if (convertibleFormats.length === 0) return null;

  const preferredFormat =
    convertibleFormats.find((format) => !format.extensions.includes(sourceExtension)) ??
    convertibleFormats[0];

  return preferredFormat.extensions[0] ?? null;
}

/**
 * Conversion store using Zustand with immer middleware for immutable updates
 */
export const useConversionStore = create<ConversionState & ConversionActions>()(
  immer((set, get) => ({
    // Initial state
    files: [],
    isConverting: false,
    globalSettings: defaultSettings,

    // Actions
    addFiles: (files: File[]) => {
      set((state) => {
        const newFiles: ConvertibleFile[] = files.map((file) => {
          const detectedFormat = detectFormat(file);
          const extension = getFileExtension(file.name);
          const normalizedFrom = detectedFormat
            ? (detectedFormat.extensions.includes(extension)
              ? extension
              : detectedFormat.extensions[0])
            : extension;

          const defaultOutput = getDefaultOutputFormat(normalizedFrom, detectedFormat);

          return {
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            from: normalizedFrom,
            to: defaultOutput,
            status: 'pending',
            progress: 0,
            error: null,
            result: null,
          };
        });
        state.files.push(...newFiles);
      });
    },

    removeFile: (id: string) => {
      set((state) => {
        const index = state.files.findIndex((f) => f.id === id);
        if (index !== -1) {
          state.files.splice(index, 1);
        }
      });
    },

    updateFile: (id: string, updates: Partial<ConvertibleFile>) => {
      set((state) => {
        const file = state.files.find((f) => f.id === id);
        if (file) {
          Object.assign(file, updates);
        }
      });
    },

    setOutputFormat: (id: string, format: string) => {
      set((state) => {
        const file = state.files.find((f) => f.id === id);
        if (file) {
          file.to = format;
        }
      });
    },

    setGlobalSettings: (settings: Partial<QualitySettings>) => {
      set((state) => {
        Object.assign(state.globalSettings, settings);
      });
    },

    startConversion: async () => {
      const state = get();

      // Prevent duplicate conversions
      if (state.isConverting) {
        return;
      }

      // Identify files ready for conversion
      const pendingFiles = state.files.filter(
        (file) => file.status === 'pending' && file.to
      );

      if (pendingFiles.length === 0) {
        return;
      }

      // Freeze settings snapshot for this conversion run
      const settings = { ...state.globalSettings };

      // Mark files as converting and reset progress/error state
      set((draft) => {
        draft.isConverting = true;
        pendingFiles.forEach((file) => {
          const target = draft.files.find((f) => f.id === file.id);
          if (target) {
            target.status = 'converting';
            target.progress = 0;
            target.error = null;
            target.result = null;
          }
        });
      });

      const runSingleConversion = async (file: ConvertibleFile) => {
        try {
          const result = await convertWithWorkerFallback({
            file: file.file,
            from: file.from,
            to: file.to as string,
            settings,
            onProgress: (progress) => {
              set((draft) => {
                const target = draft.files.find((f) => f.id === file.id);
                if (target && target.status === 'converting') {
                  target.progress = progress;
                }
              });
            },
          });

          if (result.success && result.blob) {
            set((draft) => {
              const target = draft.files.find((f) => f.id === file.id);
              if (target) {
                const blob = result.blob as Blob;
                target.status = 'complete';
                target.progress = 100;
                target.error = null;
                target.result = blob;
              }
            });
          } else {
            const errorMessage = result.error || 'Conversion failed';
            set((draft) => {
              const target = draft.files.find((f) => f.id === file.id);
              if (target) {
                target.status = 'error';
                target.error = errorMessage;
              }
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          set((draft) => {
            const target = draft.files.find((f) => f.id === file.id);
            if (target) {
              target.status = 'error';
              target.error = errorMessage;
            }
          });
        }
      };

      await Promise.allSettled(pendingFiles.map((file) => runSingleConversion(file)));

      // Reset converting flag when all conversions are done
      set((draft) => {
        draft.isConverting = false;
      });
    },

    clearAll: () => {
      set((state) => {
        state.files = [];
        state.isConverting = false;
      });
    },
  }))
);
