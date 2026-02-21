/**
 * Storage service type definitions
 * These interfaces abstract storage operations to allow easy migration between providers
 */

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

export interface StorageProvider {
  /**
   * Save a file to storage
   * @param file - File buffer to save
   * @param path - Relative path where file should be stored
   * @param mimeType - MIME type of the file
   * @returns Upload result with public URL
   */
  save(file: Buffer, path: string, mimeType: string): Promise<UploadResult>;

  /**
   * Delete a file from storage
   * @param path - Relative path of file to delete
   */
  delete(path: string): Promise<void>;

  /**
   * Get public URL for a stored file
   * @param path - Relative path of the file
   * @returns Public URL
   */
  getPublicUrl(path: string): string;

  /**
   * Check if a file exists
   * @param path - Relative path to check
   * @returns True if file exists
   */
  exists(path: string): Promise<boolean>;
}

export interface StorageConfig {
  baseUrl: string;
  basePath: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_ITEM: 10,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
} as const;
