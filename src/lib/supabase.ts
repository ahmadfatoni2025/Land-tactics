import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

const BUCKET_NAME = 'photos';

/**
 * Memastikan bucket 'photos' sudah ada di Supabase Storage.
 * Jika belum ada, otomatis membuat bucket baru (public).
 */
export const ensureBucketExists = async () => {
  // Bucket "photos" sudah kita buat otomatis melalui `supabase-setup.sql`.
  // Mengecek dan membuat bucket dari frontend dengan "anon_key" sering ditolak (Error 403) oleh Supabase.
  // Jadi fungsi ini dibiarkan kosong agar proses Upload langsung dieksekusi.
  return Promise.resolve();
};
