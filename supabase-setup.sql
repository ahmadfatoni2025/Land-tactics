-- ============================================
-- FINAL SQL SETUP (TACTICAL ASSET MANAGER)
-- Jalankan ini di SQL Editor Supabase
-- ============================================

-- 1. Update / Buat Tabel check_ins dengan kolom detail
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode_id TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  photo_url TEXT,
  
  -- Kolom Metadata Tambahan
  asset_name TEXT,
  category TEXT,
  condition TEXT,
  assigned_to TEXT,
  notes TEXT,
  address TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Matikan Sementara RLS (ROW LEVEL SECURITY)
-- Karena aplikasi ini belum memiliki sistem login (auth),
-- kita matikan RLS agar anon (publik) bisa melakukan INSERT data tanpa error "new row violates row-level security policy".
ALTER TABLE public.check_ins DISABLE ROW LEVEL SECURITY;

-- 3. Beri Izin Akses CRUD Ke Publik (Anon / Authenticated)
GRANT ALL ON TABLE public.check_ins TO anon;
GRANT ALL ON TABLE public.check_ins TO authenticated;
GRANT ALL ON TABLE public.check_ins TO service_role;

-- 4. Setup Storage Bucket 'photos'
-- Pastikan bucket ini ada dan publik
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Policy Storage: Izin upload & baca publik
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "Public Read" ON storage.objects;
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Public Update" ON storage.objects;
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
