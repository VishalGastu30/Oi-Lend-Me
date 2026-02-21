import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET /storage/[...path]
 * Serve static files from the storage directory
 * This route makes files publicly accessible without authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Join path segments
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join('/');
    
    // Sanitize path to prevent directory traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Construct full file path
    const fullPath = path.join(process.cwd(), 'storage', safePath);
    
    // Security check: ensure the resolved path is still within storage directory
    const storageDir = path.join(process.cwd(), 'storage');
    if (!fullPath.startsWith(storageDir)) {
      return new Response('Forbidden', { status: 403 });
    }

    // Read file
    const fileBuffer = await fs.readFile(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Return file with appropriate headers
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return new Response('File not found', { status: 404 });
    }
    
    console.error('Storage file serving error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
