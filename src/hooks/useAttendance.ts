import { useState, useCallback } from 'react';
import { supabase, ensureBucketExists } from '../lib/supabase';

// Tipe data lengkap untuk registrasi aset
export interface AssetData {
  barcode_id: string;
  lat: number;
  lng: number;
  photo_file: File;
  asset_name?: string;
  category?: string;
  condition?: string;
  assigned_to?: string;
  notes?: string;
  address?: string;
}

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fungsi tunggal untuk menyimpan data aset / check-in.
   * Mendukung data dasar (Scanner) maupun data detail (Generate QR).
   */
  const saveAsset = async (data: AssetData) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Pastikan bucket storage 'photos' sudah ada
      await ensureBucketExists();

      // 2. Upload Foto ke Supabase Storage
      const ext = data.photo_file.name.split('.').pop() || 'jpg';
      const fileName = `assets/${data.barcode_id}-${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, data.photo_file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      // 4. Simpan ke Database (Tabel check_ins)
      // Catatan: Jika kolom tambahan belum ada di DB, data ini tetap aman (Supabase akan mengabaikan kolom yang tidak ada)
      // Namun sangat direkomendasikan menjalankan SQL setup yang baru untuk menambah kolom metadata.
      const { error: dbError } = await supabase
        .from('check_ins')
        .insert({
          barcode_id: data.barcode_id,
          lat: data.lat,
          lng: data.lng,
          photo_url: publicUrl,
          // Kolom metadata tambahan (Opsional)
          asset_name: data.asset_name,
          category: data.category,
          condition: data.condition,
          assigned_to: data.assigned_to,
          notes: data.notes,
          address: data.address
        });

      if (dbError) throw dbError;

      return { success: true, publicUrl };
    } catch (err: any) {
      console.error('Operation failed:', err);
      setError(err.message || 'Terjadi kesalahan sistem');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckIns = useCallback(async () => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch check-ins:', error);
      return [];
    }
    return data;
  }, []);

  const updateAsset = async (id: string, data: Partial<AssetData>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('check_ins')
        .update({
          asset_name: data.asset_name,
          condition: data.condition,
          notes: data.notes,
          category: data.category
        })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Update failed:', err);
      setError(err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('check_ins')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError(err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { saveAsset, fetchCheckIns, updateAsset, deleteAsset, loading, error };
};
