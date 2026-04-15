-- ============================================
-- FINAL SQL SETUP (TACTICAL ASSET MANAGER)
-- Jalankan ini di SQL Editor Supabase untuk sinkronisasi kolom
-- ============================================

-- 1. Update / Buat Tabel check_ins dengan kolom detail agronomi lengkap
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode_id TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy_gps DOUBLE PRECISION,
  photo_url TEXT,
  photo_detail_url TEXT,
  
  -- Metadata Aset
  asset_name TEXT,
  category TEXT,
  condition TEXT,
  assigned_to TEXT,
  notes TEXT,
  address TEXT,

  -- Monitoring Agronomi (New Fields)
  tinggi_tanaman DOUBLE PRECISION,
  diameter_batang DOUBLE PRECISION,
  jumlah_daun INTEGER,
  lebar_kanopi DOUBLE PRECISION,
  jumlah_bunga_buah INTEGER,
  fase_pertumbuhan TEXT,
  warna_daun TEXT,
  status_hama TEXT,
  kelembapan_tanah TEXT,
  kondisi_gulma TEXT,
  ph_tanah DOUBLE PRECISION,
  tindakan JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migrasi: Jika tabel sudah ada tapi kolom baru belum ada
DO $$ 
BEGIN 
    -- Menambah kolom baru jika belum ada
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='check_ins' AND column_name='accuracy_gps') THEN
        ALTER TABLE public.check_ins ADD COLUMN accuracy_gps DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='check_ins' AND column_name='photo_detail_url') THEN
        ALTER TABLE public.check_ins ADD COLUMN photo_detail_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='check_ins' AND column_name='tinggi_tanaman') THEN
        ALTER TABLE public.check_ins ADD COLUMN tinggi_tanaman DOUBLE PRECISION;
        ALTER TABLE public.check_ins ADD COLUMN diameter_batang DOUBLE PRECISION;
        ALTER TABLE public.check_ins ADD COLUMN jumlah_daun INTEGER;
        ALTER TABLE public.check_ins ADD COLUMN lebar_kanopi DOUBLE PRECISION;
        ALTER TABLE public.check_ins ADD COLUMN jumlah_bunga_buah INTEGER;
        ALTER TABLE public.check_ins ADD COLUMN fase_pertumbuhan TEXT;
        ALTER TABLE public.check_ins ADD COLUMN warna_daun TEXT;
        ALTER TABLE public.check_ins ADD COLUMN status_hama TEXT;
        ALTER TABLE public.check_ins ADD COLUMN kelembapan_tanah TEXT;
        ALTER TABLE public.check_ins ADD COLUMN kondisi_gulma TEXT;
        ALTER TABLE public.check_ins ADD COLUMN ph_tanah DOUBLE PRECISION;
        ALTER TABLE public.check_ins ADD COLUMN tindakan JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Matikan Sementara RLS
ALTER TABLE public.check_ins DISABLE ROW LEVEL SECURITY;

-- 3. Beri Izin Akses CRUD Ke Publik (Anon / Authenticated)
GRANT ALL ON TABLE public.check_ins TO anon;
GRANT ALL ON TABLE public.check_ins TO authenticated;
GRANT ALL ON TABLE public.check_ins TO service_role;

-- 4. Setup Storage Bucket 'photos'
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Policy Storage
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
