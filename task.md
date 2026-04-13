Pilihan yang tepat. Menggunakan **.tsx** berarti kita akan memanfaatkan **React** (atau Next.js), yang membuat manajemen *state* untuk kamera, map, dan data dari Supabase menjadi jauh lebih terorganisir.

Berikut adalah panduan struktur kode dan implementasi menggunakan **React/Next.js + Supabase + Leaflet**.

---

## 🏗️ Struktur Folder (Next.js/React)

Karena kita menggunakan `.tsx`, kita akan membagi logika ke dalam komponen agar tidak menumpuk di satu file.

```text
src/
├── lib/
│   └── supabase.ts      // Konfigurasi client Supabase
├── components/
│   ├── Scanner.tsx      // Komponen html5-qrcode
│   ├── MapView.tsx      // Komponen Leaflet Map
│   └── FormInput.tsx    // Handle upload & koordinat
└── App.tsx              // Main Page
```

---

## 🛠️ Implementasi Kode Dasar

### 1. Konfigurasi Client (`src/lib/supabase.ts`)
```tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Komponen Scanner (`src/components/Scanner.tsx`)
Gunakan `useEffect` untuk inisialisasi kamera agar tidak terjadi *memory leak*.

```tsx
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

interface ScannerProps {
  onResult: (decodedText: string) => void;
}

export const Scanner = ({ onResult }: ScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: { width: 250, height: 250 } }, 
      /* verbose= */ false
    );

    scanner.render(onResult, (error) => {
      // Diamkan saja agar tidak spam console saat tidak ada barcode
    });

    return () => scanner.clear();
  }, [onResult]);

  return <div id="reader" className="w-full max-w-md mx-auto"></div>;
};
```

### 3. Logika Upload & Simpan (`src/components/FormInput.tsx`)
Fungsi utama untuk menangani alur GPS, Foto, dan Database.

```tsx
import { supabase } from '../lib/supabase';

export const saveAttendance = async (barcodeId: string, file: File) => {
  // 1. Ambil GPS
  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  const { latitude, longitude } = pos.coords;

  // 2. Upload Foto ke Supabase Storage
  const fileName = `${barcodeId}-${Date.now()}.jpg`;
  const { data: storageData, error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // 3. Ambil Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName);

  // 4. Simpan ke Database
  const { error: dbError } = await supabase
    .from('check_ins')
    .insert({
      barcode_id: barcodeId,
      lat: latitude,
      lng: longitude,
      photo_url: publicUrl
    });

  if (dbError) throw dbError;
};
```

---

## 📋 Skema Database (SQL)
Jalankan perintah ini di **SQL Editor** Supabase kamu untuk membuat tabel yang sesuai:

```sql
-- Buat Tabel
create table check_ins (
  id uuid default gen_random_uuid() primary key,
  barcode_id text not null,
  lat float8 not null,
  lng float8 not null,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Buat Bucket Storage (Bisa juga via Dashboard UI)
-- Pastikan bucket 'photos' diset PUBLIC.
```

---

## 💡 Catatan Penting untuk .tsx:
1.  **Leaflet di Next.js:** Leaflet membutuhkan objek `window`. Jika kamu pakai Next.js, pastikan mengimpor komponen Map menggunakan `dynamic import` dengan `{ ssr: false }`.
2.  **Type Safety:** Karena ini `.tsx`, pastikan kamu mendefinisikan interface untuk data yang kamu ambil dari Supabase agar *IntelliSense* berjalan maksimal.

Apakah kamu ingin saya buatkan **Halaman Utama (`App.tsx`)** yang menggabungkan semua komponen ini menjadi satu alur utuh?