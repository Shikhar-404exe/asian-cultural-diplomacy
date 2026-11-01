import crypto from 'crypto';

// In-memory rate limiting store for local MVP / single-instance server
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number } {
  // Relax rate limit in automated test environments
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true') {
    return { allowed: true, remaining: limit };
  }

  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

// Clean in-memory entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

// Sanitization for public user inputs (comments, contact forms)
export function sanitizePlainText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Client IP hash for privacy-preserving rate limiting
export function hashClientIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.SESSION_SECRET || 'acd_salt')).digest('hex').substring(0, 16);
}

// Allowed MIME types and extensions for uploads
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

export const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024; // 8 MB

export function validateImageUpload(file: { name: string; size: number; type: string }): { valid: boolean; error?: string } {
  if (file.size > MAX_UPLOAD_SIZE) {
    return { valid: false, error: 'File size exceeds maximum permitted limit of 8MB.' };
  }

  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
    return { valid: false, error: `Disallowed file extension "${ext}". Allowed: ${ALLOWED_IMAGE_EXTS.join(', ')}` };
  }

  if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
    return { valid: false, error: `Invalid MIME type "${file.type}". Only standard images are permitted.` };
  }

  return { valid: true };
}
