import { LocalStorageService } from './local-storage.service';
import { STORAGE_LIMITS } from './storage.types';
import type { StorageProvider } from './storage.types';

/**
 * Main storage service singleton
 * This is the only file that needs to change when migrating to Supabase
 */

// Current implementation uses local filesystem
// To migrate to Supabase, replace this with SupabaseStorageService
export const storageService: StorageProvider = new LocalStorageService();

/**
 * Validation utilities
 */
export const StorageValidation = {
  /**
   * Check if MIME type is allowed
   */
  isAllowedMimeType(mimeType: string): boolean {
    return (STORAGE_LIMITS.ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType.toLowerCase());
  },

  /**
   * Check if file size is within limits
   */
  isValidFileSize(size: number): boolean {
    return size > 0 && size <= STORAGE_LIMITS.MAX_FILE_SIZE;
  },

  /**
   * Extract file extension from filename
   */
  getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  },

  /**
   * Validate file extension
   */
  isAllowedExtension(filename: string): boolean {
    const ext = this.getExtension(filename);
    return (STORAGE_LIMITS.ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
  },

  /**
   * Get human-readable file size
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  /**
   * Get maximum file size in human-readable format
   */
  getMaxFileSizeFormatted(): string {
    return this.formatFileSize(STORAGE_LIMITS.MAX_FILE_SIZE);
  },
};

// Re-export types and constants for convenience
export { STORAGE_LIMITS };
export type { StorageProvider, UploadResult } from './storage.types';
