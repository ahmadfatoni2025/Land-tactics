import { useState, useCallback } from 'react';
import { supabase, ensureBucketExists } from '../lib/supabase';
import { compressImage } from '../lib/imageProcessor';

// Tipe data lengkap untuk registrasi aset
export interface AssetData {
  barcode_id: string;
  lat?: number;
  lng?: number;
  accuracy?: number; // Akurasi GPS
  photo_file: File; // Foto Overview
  photo_detail?: File; // Foto Close-up
  asset_name?: string;
  category?: string;
  condition?: string;
  assigned_to?: string;
  notes?: string;
  address?: string;
  // Professional Monitoring Fields
  tinggi_tanaman?: number;
  diameter_batang?: number;
  jumlah_daun?: number;
  lebar_kanopi?: number;
  jumlah_bunga_buah?: number;
  fase_pertumbuhan?: string;
  warna_daun?: string;
  status_hama?: string;
  kelembapan_tanah?: string;
  kondisi_gulma?: string;
  ph_tanah?: number;
  tindakan_diambil?: string[]; // Array of strings
  suhu_udara?: number;
  intensitas_cahaya?: number;
  metode_tanam?: string;
  target_panen?: string;
}

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAsset = async (data: AssetData) => {
    setLoading(true);
    setError(null);

    try {
      await ensureBucketExists();

      // 1. Upload Overview Photo
      const compressedOverview = await compressImage(data.photo_file, 1200, 0.6);
      const extOverview = data.photo_file.name.split('.').pop() || 'jpg';
      const fileOverview = `assets/${data.barcode_id}-${Date.now()}-overview.${extOverview}`;

      const { error: uploadError1 } = await supabase.storage
        .from('photos')
        .upload(fileOverview, compressedOverview);
      if (uploadError1) throw uploadError1;

      const { data: { publicUrl: urlOverview } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileOverview);

      // 2. Upload Detail Photo (Optional)
      let urlDetail = null;
      if (data.photo_detail) {
        const compressedDetail = await compressImage(data.photo_detail, 1200, 0.6);
        const extDetail = data.photo_detail.name.split('.').pop() || 'jpg';
        const fileDetail = `assets/${data.barcode_id}-${Date.now()}-detail.${extDetail}`;

        const { error: uploadError2 } = await supabase.storage
          .from('photos')
          .upload(fileDetail, compressedDetail);
        if (uploadError2) throw uploadError2;

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileDetail);
        urlDetail = publicUrl;
      }

      // 3. Save to check_ins table
      const { error: dbError } = await supabase
        .from('check_ins')
        .insert({
          barcode_id: data.barcode_id,
          lat: data.lat,
          lng: data.lng,
          accuracy_gps: data.accuracy,
          photo_url: urlOverview,
          photo_detail_url: urlDetail,
          asset_name: data.asset_name,
          category: data.category,
          condition: data.condition,
          notes: data.notes,
          address: data.address,
          // New structured fields
          tinggi_tanaman: data.tinggi_tanaman,
          diameter_batang: data.diameter_batang,
          jumlah_daun: data.jumlah_daun,
          lebar_kanopi: data.lebar_kanopi,
          jumlah_bunga_buah: data.jumlah_bunga_buah,
          fase_pertumbuhan: data.fase_pertumbuhan,
          warna_daun: data.warna_daun,
          status_hama: data.status_hama,
          kelembapan_tanah: data.kelembapan_tanah,
          kondisi_gulma: data.kondisi_gulma,
          ph_tanah: data.ph_tanah,
          suhu_udara: data.suhu_udara,
          intensitas_cahaya: data.intensitas_cahaya,
          metode_tanam: data.metode_tanam,
          target_panen: data.target_panen,
          tindakan: data.tindakan_diambil
        });

      if (dbError) throw dbError;

      return { success: true, urlOverview };
    } catch (err: any) {
      console.error('Operation failed:', err);
      const msg = err.message || 'Terjadi kesalahan sistem';
      setError(msg);
      return { success: false, error: msg };
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

  const getAssetByBarcode = async (barcodeId: string) => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('barcode_id', barcodeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn('Asset not found or error:', error.message);
      return null;
    }
    return data;
  };

  return { saveAsset, fetchCheckIns, updateAsset, deleteAsset, getAssetByBarcode, loading, error };
};
