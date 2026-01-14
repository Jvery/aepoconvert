'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, AlertCircle, ImageIcon, Music, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ConverterName = 'image' | 'audio' | 'document';
type ConverterState = 'loading' | 'ready' | 'error';

interface ConverterInfo {
  name: ConverterName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  state: ConverterState;
  error?: string;
}

/**
 * ConverterStatus component displays the initialization status of WASM converters
 * Shows loading spinners while initializing, checkmarks when ready, and errors if failed
 */
export function ConverterStatus() {
  const [converters, setConverters] = useState<ConverterInfo[]>([
    { name: 'image', label: 'Images', icon: ImageIcon, state: 'loading' },
    { name: 'audio', label: 'Audio', icon: Music, state: 'loading' },
    { name: 'document', label: 'Documents', icon: FileText, state: 'loading' },
  ]);

  useEffect(() => {
    // Initialize each converter separately to track individual failures
    const initializeConverters = async () => {
      // Initialize ImageMagick (images)
      import('@/lib/converters/magick-loader')
        .then(({ initializeMagick }) => initializeMagick())
        .then(() => {
          setConverters((prev) =>
            prev.map((c) => (c.name === 'image' ? { ...c, state: 'ready' } : c))
          );
        })
        .catch((error) => {
          console.error('[ConverterStatus] ImageMagick failed:', error);
          setConverters((prev) =>
            prev.map((c) =>
              c.name === 'image'
                ? { ...c, state: 'error', error: 'ImageMagick initialization failed' }
                : c
            )
          );
        });

      // Initialize FFmpeg (audio)
      import('@/lib/converters/ffmpeg-loader')
        .then(({ initializeFFmpeg }) => initializeFFmpeg())
        .then(() => {
          setConverters((prev) =>
            prev.map((c) => (c.name === 'audio' ? { ...c, state: 'ready' } : c))
          );
        })
        .catch((error) => {
          console.error('[ConverterStatus] FFmpeg failed:', error);
          setConverters((prev) =>
            prev.map((c) =>
              c.name === 'audio'
                ? { ...c, state: 'error', error: 'FFmpeg requires HTTPS with special headers' }
                : c
            )
          );
        });

      // Initialize Pandoc (documents)
      import('@/lib/converters/pandoc-loader')
        .then(({ initializePandoc }) => initializePandoc())
        .then(() => {
          setConverters((prev) =>
            prev.map((c) => (c.name === 'document' ? { ...c, state: 'ready' } : c))
          );
        })
        .catch((error) => {
          console.error('[ConverterStatus] Pandoc failed:', error);
          setConverters((prev) =>
            prev.map((c) =>
              c.name === 'document'
                ? { ...c, state: 'error', error: 'Pandoc initialization failed' }
                : c
            )
          );
        });
    };

    initializeConverters();
  }, []);

  // Check if all converters are ready
  const allReady = converters.every((c) => c.state === 'ready');
  const hasErrors = converters.some((c) => c.state === 'error');
  const isLoading = converters.some((c) => c.state === 'loading');

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-40">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`
                flex items-center gap-1.5 rounded-full px-3 py-1.5
                bg-background/80 backdrop-blur-sm
                border shadow-sm
                transition-all duration-300
                ${hasErrors ? 'border-destructive/50' : allReady ? 'border-green-500/50' : 'border-border'}
              `}
              role="status"
              aria-label={
                isLoading
                  ? 'Loading converters...'
                  : hasErrors
                    ? 'Some converters failed to load'
                    : 'All converters ready'
              }
            >
              {converters.map((converter) => (
                <ConverterIndicator key={converter.name} converter={converter} />
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">Converter Status</p>
              <div className="space-y-1 text-sm">
                {converters.map((converter) => (
                  <div
                    key={converter.name}
                    className="flex items-center gap-2"
                  >
                    <converter.icon className="h-3.5 w-3.5" />
                    <span>{converter.label}:</span>
                    <span
                      className={`
                        ${converter.state === 'ready' ? 'text-green-500' : ''}
                        ${converter.state === 'error' ? 'text-destructive' : ''}
                        ${converter.state === 'loading' ? 'text-muted-foreground' : ''}
                      `}
                    >
                      {converter.state === 'ready' && 'Ready'}
                      {converter.state === 'error' && (converter.error || 'Failed')}
                      {converter.state === 'loading' && 'Loading...'}
                    </span>
                  </div>
                ))}
              </div>
              {allReady && (
                <p className="text-xs text-muted-foreground">
                  All file types can be converted
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/**
 * Individual converter status indicator
 */
function ConverterIndicator({ converter }: { converter: ConverterInfo }) {
  const Icon = converter.icon;

  return (
    <div
      className={`
        relative flex h-6 w-6 items-center justify-center rounded-full
        transition-colors duration-300
        ${converter.state === 'ready' ? 'bg-green-500/10 text-green-500' : ''}
        ${converter.state === 'error' ? 'bg-destructive/10 text-destructive' : ''}
        ${converter.state === 'loading' ? 'bg-muted text-muted-foreground' : ''}
      `}
    >
      {converter.state === 'loading' && (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      )}
      {converter.state === 'ready' && (
        <div className="relative">
          <Icon className="h-3.5 w-3.5" />
          <Check className="absolute -bottom-0.5 -right-0.5 h-2 w-2 text-green-500" />
        </div>
      )}
      {converter.state === 'error' && (
        <AlertCircle className="h-3.5 w-3.5" />
      )}
    </div>
  );
}
