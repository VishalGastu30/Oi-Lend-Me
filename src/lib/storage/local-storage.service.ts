import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { StorageProvider, UploadResult } from './storage.types';

/**
 * Local filesystem storage implementation
 * Stores files in /storage directory and serves them via Next.js public routes
 */
export class LocalStorageService implements StorageProvider {
  private baseStoragePath: string;
  private baseUrl: string;

  constructor() {
    // Storage path is at project root level
    this.baseStoragePath = path.join(process.cwd(), 'storage');
    // Public URL path
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Save file to local storage
   * @param file - File buffer
   * @param relativePath - Path relative to storage root (e.g., 'item-images/abc123/file.jpg')
   * @param mimeType - MIME type
   */
  async save(file: Buffer, relativePath: string, mimeType: string): Promise<UploadResult> {
    // Sanitize path to prevent directory traversal
    const safePath = this.sanitizePath(relativePath);
    const fullPath = path.join(this.baseStoragePath, safePath);

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file);

    // Get file stats
    const stats = await fs.stat(fullPath);

    return {
      url: this.getPublicUrl(safePath),
      path: safePath,
      size: stats.size,
      mimeType,
    };
  }

  /**
   * Delete file from storage
   */
  async delete(relativePath: string): Promise<void> {
    const safePath = this.sanitizePath(relativePath);
    const fullPath = path.join(this.baseStoragePath, safePath);

    try {
      await fs.unlink(fullPath);
      
      // Try to remove parent directory if empty
      const dirPath = path.dirname(fullPath);
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.rmdir(dirPath);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, that's fine
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(relativePath: string): string {
    const safePath = this.sanitizePath(relativePath);
    // Files are served from /storage route
    return `${this.baseUrl}/storage/${safePath}`;
  }

  /**
   * Check if file exists
   */
  async exists(relativePath: string): Promise<boolean> {
    const safePath = this.sanitizePath(relativePath);
    const fullPath = path.join(this.baseStoragePath, safePath);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize path to prevent directory traversal attacks
   */
  private sanitizePath(filePath: string): string {
    // Normalize and remove any '..' or other dangerous patterns
    const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    // Remove leading slashes
    return normalized.replace(/^\/+/, '');
  }

  /**
   * Generate a unique filename
   * @param originalName - Original filename (optional, used for extension)
   * @returns UUID-based filename
   */
  static generateFileName(originalName?: string): string {
    const uuid = randomUUID();
    if (originalName) {
      const ext = path.extname(originalName).toLowerCase();
      return `${uuid}${ext}`;
    }
    return uuid;
  }

  /**
   * Construct path for item image
   * @param itemId - Item UUID
   * @param filename - Generated filename
   * @returns Relative path
   */
  static getItemImagePath(itemId: string, filename: string): string {
    return `item-images/${itemId}/${filename}`;
  }
}
