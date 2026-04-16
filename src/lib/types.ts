// Tipe data untuk sistem monitoring pohon

export interface Profile {
  id: string;
  full_name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  method: 'manual' | 'gps';
  tree_count: number;
  last_updated_at?: string;
  created_at: string;
  // Joined fields
  profile?: Profile;
  check_ins_count?: number;
  latest_check_in?: CheckInRecord;
}

export interface CheckInRecord {
  id: string;
  barcode_id: string;
  user_id?: string;
  location_id?: string;
  lat: number;
  lng: number;
  accuracy_gps?: number;
  photo_url: string;
  photo_detail_url?: string;
  asset_name?: string;
  category?: string;
  condition?: string;
  assigned_to?: string;
  notes?: string;
  address?: string;
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
  tindakan?: string[];
  created_at: string;
  // Joined
  profile?: Profile;
  location?: Location;
}

export interface UserUploadStatus {
  user: Profile;
  total_locations: number;
  total_check_ins: number;
  last_upload_at?: string;
  is_overdue: boolean; // belum upload dalam periode
  locations: Location[];
}

export interface GrowthTrend {
  period: string;
  avg_tinggi: number;
  avg_diameter: number;
  avg_daun: number;
  total_entries: number;
}

export interface AnalyticsData {
  healthy_locations: Location[];
  warning_locations: Location[];
  growth_trends: GrowthTrend[];
  total_users: number;
  total_locations: number;
  total_check_ins: number;
  overdue_users: number;
}
