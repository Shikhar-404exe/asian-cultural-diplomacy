import { createClient } from '@supabase/supabase-js';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * Storage Provider Configuration
 * Checks for Supabase Storage credentials in environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 * - SUPABASE_SERVICE_ROLE_KEY (preferred for server-side upload bypassing RLS) or SUPABASE_ANON_KEY
 * - SUPABASE_STORAGE_BUCKET (defaults to 'media')
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'media';

let supabaseClient: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
}

export type StorageProvider = 'supabase' | 'local';

export function getStorageProvider(): StorageProvider {
  if (supabaseClient) {
    return 'supabase';
  }
  return 'local';
}

/**
 * Uploads a file buffer to managed cloud storage (Supabase) or local filesystem.
 */
export async function uploadFile(
  buffer: Buffer,
  safeFileName: string,
  mimeType: string
): Promise<{ url: string; provider: StorageProvider }> {
  // Option 1: Managed Supabase Object Storage (Production / Staging)
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.storage
        .from(bucketName)
        .upload(safeFileName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw error;
      }

      // Retrieve public CDN URL
      const { data: publicUrlData } = supabaseClient.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        provider: 'supabase',
      };
    } catch (err) {
      console.warn('Falling back to local storage after Supabase upload attempt failed:', err);
      // Fallback to local if Supabase fails
    }
  }

  // Option 2: Local Filesystem Storage (Localhost MVP)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, safeFileName);
  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${safeFileName}`,
    provider: 'local',
  };
}

/**
 * Deletes a file from managed cloud storage or local filesystem.
 */
export async function deleteFile(fileUrlOrName: string): Promise<boolean> {
  const isCloudUrl = fileUrlOrName.startsWith('http://') || fileUrlOrName.startsWith('https://');

  if (isCloudUrl && supabaseClient) {
    try {
      // Extract file path from URL
      const parts = fileUrlOrName.split('/');
      const fileName = parts[parts.length - 1];
      const { error } = await supabaseClient.storage.from(bucketName).remove([fileName]);
      return !error;
    } catch (err) {
      console.error('Failed to delete cloud file:', err);
      return false;
    }
  }

  // Local file deletion
  try {
    const fileName = path.basename(fileUrlOrName);
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
    if (existsSync(filePath)) {
      await unlink(filePath);
      return true;
    }
  } catch (err) {
    console.error('Failed to delete local file:', err);
  }

  return false;
}

