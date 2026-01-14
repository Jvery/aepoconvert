'use client';

import { useEffect, useRef, useState } from 'react';
import { useConversionStore } from '@/store/conversion-store';

/**
 * StatusAnnouncer component provides screen reader announcements for status changes
 * Uses aria-live regions to announce file additions, conversion progress, and completion
 */
export function StatusAnnouncer() {
  const [announcement, setAnnouncement] = useState('');
  const [politeAnnouncement, setPoliteAnnouncement] = useState('');

  // Track previous state to detect changes
  const prevFilesRef = useRef<typeof files>([]);
  const prevIsConvertingRef = useRef(false);

  // Get state from store
  const files = useConversionStore((state) => state.files);
  const isConverting = useConversionStore((state) => state.isConverting);

  useEffect(() => {
    const prevFiles = prevFilesRef.current;
    const prevIsConverting = prevIsConvertingRef.current;

    // Detect new files added
    if (files.length > prevFiles.length) {
      const newCount = files.length - prevFiles.length;
      setPoliteAnnouncement(
        newCount === 1
          ? `${files[files.length - 1]?.name || 'File'} added for conversion`
          : `${newCount} files added for conversion`
      );
    }

    // Detect files removed
    if (files.length < prevFiles.length && files.length > 0) {
      const removedCount = prevFiles.length - files.length;
      setPoliteAnnouncement(
        removedCount === 1
          ? '1 file removed'
          : `${removedCount} files removed`
      );
    }

    // Detect all files cleared
    if (files.length === 0 && prevFiles.length > 0) {
      setPoliteAnnouncement('All files cleared');
    }

    // Detect conversion started
    if (isConverting && !prevIsConverting) {
      const pendingCount = files.filter(f => f.status === 'converting').length;
      setAnnouncement(`Starting conversion of ${pendingCount} file${pendingCount !== 1 ? 's' : ''}`);
    }

    // Detect conversion completed
    if (!isConverting && prevIsConverting) {
      const completedCount = files.filter(f => f.status === 'complete').length;
      const errorCount = files.filter(f => f.status === 'error').length;

      if (errorCount === 0 && completedCount > 0) {
        setAnnouncement(`Conversion complete. ${completedCount} file${completedCount !== 1 ? 's' : ''} ready for download`);
      } else if (errorCount > 0 && completedCount > 0) {
        setAnnouncement(`Conversion finished. ${completedCount} file${completedCount !== 1 ? 's' : ''} completed, ${errorCount} file${errorCount !== 1 ? 's' : ''} failed`);
      } else if (errorCount > 0 && completedCount === 0) {
        setAnnouncement(`Conversion failed. ${errorCount} file${errorCount !== 1 ? 's' : ''} had errors`);
      }
    }

    // Track individual file status changes for error announcements
    files.forEach((file) => {
      const prevFile = prevFiles.find(f => f.id === file.id);
      if (prevFile && prevFile.status !== file.status) {
        if (file.status === 'error' && file.error) {
          // Announce specific file error
          setAnnouncement(`Error converting ${file.name}: ${file.error}`);
        }
      }
    });

    // Update refs for next comparison
    prevFilesRef.current = files;
    prevIsConvertingRef.current = isConverting;
  }, [files, isConverting]);

  // Clear announcements after they've been read
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  useEffect(() => {
    if (politeAnnouncement) {
      const timer = setTimeout(() => setPoliteAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [politeAnnouncement]);

  return (
    <>
      {/* Assertive announcements for important status changes (conversion start/complete/error) */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Polite announcements for less urgent updates (file add/remove) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeAnnouncement}
      </div>
    </>
  );
}
