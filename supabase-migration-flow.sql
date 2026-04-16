-- ============================================
-- MIGRATION: Alur Sistem Monitoring Pohon
-- Jalankan di SQL Editor Supabase
-- ============================================

-- 1. Tabel Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabel Lokasi / Titik
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  method TEXT DEFAULT 'manual' CHECK (method IN ('manual', 'gps')),
  tree_count INTEGER DEFAULT 0,
  last_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tambah kolom user_id dan location_id pada check_ins
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='check_ins' AND column_name='user_id') THEN
    ALTER TABLE public.check_ins ADD COLUMN user_id UUID REFERENCES auth.users ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='check_ins' AND column_name='location_id') THEN
    ALTER TABLE public.check_ins ADD COLUMN location_id UUID REFERENCES public.locations ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies - Profiles
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
CREATE POLICY "Admin full access profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. RLS Policies - Locations
DROP POLICY IF EXISTS "Users view own locations" ON public.locations;
CREATE POLICY "Users view own locations" ON public.locations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own locations" ON public.locations;
CREATE POLICY "Users insert own locations" ON public.locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own locations" ON public.locations;
CREATE POLICY "Users update own locations" ON public.locations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access locations" ON public.locations;
CREATE POLICY "Admin full access locations" ON public.locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. RLS Policies - Check-ins
DROP POLICY IF EXISTS "Users view own check_ins" ON public.check_ins;
CREATE POLICY "Users view own check_ins" ON public.check_ins
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own check_ins" ON public.check_ins;
CREATE POLICY "Users insert own check_ins" ON public.check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access check_ins" ON public.check_ins;
CREATE POLICY "Admin full access check_ins" ON public.check_ins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow anonymous insert for backward compatibility (optional, remove later)
DROP POLICY IF EXISTS "Anon insert check_ins" ON public.check_ins;
CREATE POLICY "Anon insert check_ins" ON public.check_ins
  FOR INSERT WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Anon select check_ins" ON public.check_ins;
CREATE POLICY "Anon select check_ins" ON public.check_ins
  FOR SELECT USING (user_id IS NULL);

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_location_id ON public.check_ins(location_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 9. Grants
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.locations TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT, INSERT ON TABLE public.check_ins TO anon;
