// POST /api/upload  → auth required. Mints a short-lived, scoped client-upload
// token so the browser can upload a PDF or image DIRECTLY to Vercel Blob.
//
// Why direct-to-Blob: Vercel serverless functions have a hard ~4.5 MB request
// body limit, so a 25 MB PDF can't be POSTed through a function. The client
// (@vercel/blob/client `upload()`) calls this handler for a token, then streams
// the file straight to Blob storage — validated here against type + size.
//
// Auth: the browser passes the admin token as `clientPayload`; we verify it
// against ADMIN_TOKEN before handing out any upload token.

import { handleUpload } from '@vercel/blob/client';
import crypto from 'node:crypto';

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
];

function tokenOk(token) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || typeof token !== 'string') return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({ error: 'Server is missing ADMIN_TOKEN. Run: vercel env add ADMIN_TOKEN' });
  }

  try {
    const json = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // clientPayload carries the admin token (sent over HTTPS in the body).
        if (!tokenOk(clientPayload)) {
          throw new Error('Unauthorized');
        }
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ at: Date.now() }),
        };
      },
      // Runs server->server after the upload finishes. Not called on localhost.
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(json);
  } catch (err) {
    const msg = err && err.message ? err.message : 'Upload failed.';
    const code = /unauth/i.test(msg) ? 401 : 400;
    return res.status(code).json({ error: msg });
  }
}
