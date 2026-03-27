import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { getSessionUserFromRequest } from '../../../lib/auth/session';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const POST: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker', 'agent'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!file || !(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'File too large (max 10 MB)' }), { status: 400 });
  }

  const ext = extname(file.name).toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  if (!allowed.includes(ext)) {
    return new Response(JSON.stringify({ error: 'Only image files are allowed' }), { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(UPLOAD_DIR, filename), buffer);

  const publicUrl = `/uploads/${filename}`;
  return new Response(JSON.stringify({ publicUrl, storagePath: filename }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
