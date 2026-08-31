/**
 * One-time setup: creates or resets the admin user in Supabase.
 * Run: npm run setup:admin
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (never commit .env).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ADMIN_EMAIL = 'admin@islamicdigitallibrary.com';
const ADMIN_PASSWORD = 'Admin@12345';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  const vars = {};
  if (!existsSync(envPath)) {
    console.error('Missing .env file. Copy .env.example and fill in Supabase keys.');
    process.exit(1);
  }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL?.trim();
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error('Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
if (listError) {
  console.error('Failed to list users:', listError.message);
  process.exit(1);
}

const existing = listData.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (error) {
    console.error('Failed to update admin password:', error.message);
    process.exit(1);
  }
  console.log('Admin user updated:', ADMIN_EMAIL);
} else {
  const { error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Admin', role: 'admin' },
  });
  if (error) {
    console.error('Failed to create admin user:', error.message);
    process.exit(1);
  }
  console.log('Admin user created:', ADMIN_EMAIL);
}

console.log('Password:', ADMIN_PASSWORD);
console.log('Done. Login will work on all devices once VITE_SUPABASE_* env vars match this project.');
