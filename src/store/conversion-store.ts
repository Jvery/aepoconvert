import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ConvertibleFile, QualitySettings } from '@/types';

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
  startConversion: () => void;
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
 * Conversion store using Zustand with immer middleware for immutable updates
 */
export const useConversionStore = create<ConversionState & ConversionActions>()(
  immer((set) => ({
    // Initial state
    files: [],
    isConverting: false,
    globalSettings: defaultSettings,

    // Actions
    addFiles: (files: File[]) => {
      set((state) => {
        const newFiles: ConvertibleFile[] = files.map((file) => ({
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          from: getFileExtension(file.name),
          to: null,
          status: 'pending',
          progress: 0,
          error: null,
          result: null,
        }));
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

    startConversion: () => {
      set((state) => {
        state.isConverting = true;
        // Mark all pending files as ready for conversion
        state.files.forEach((file) => {
          if (file.status === 'pending' && file.to) {
            file.status = 'converting';
          }
        });
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
