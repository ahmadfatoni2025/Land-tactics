Alur Sistem Monitoring Pohon

 A. User (Petugas Lapangan)

**1. Login**
User masuk dengan akun yang sudah dibuat oleh admin. User tidak bisa daftar sendiri.

**2. Sidebar User — 2 Halaman**

**Halaman 1: Dashboard Utama**
Berisi ringkasan semua aktivitas user:
- Daftar titik lokasi miliknya beserta jumlah pohon per titik
- Status upload terakhir per titik (sudah/belum dalam periode ini)
- Klik salah satu titik → lihat detail foto dan data pohon di titik tersebut

**Halaman 2: Input Data**
Satu halaman yang menampung dua jenis aksi:
- **Buat titik baru** — input koordinat manual (paste dari Google Maps) atau klik tombol "Tandai Lokasi Saya Sekarang" (auto GPS). Titik baru langsung muncul di peta admin.
- **Pembaruan rutin** — user memilih titik yang sudah ada lalu foto pohon langsung dari kamera website (otomatis dikompres), isi form pertumbuhan (diameter, tinggi, kondisi, catatan, dll), lalu simpan.

**3. Batasan Akses User**
User hanya bisa melihat dan mengelola titik-titik miliknya sendiri.


 B. Admin

**1. Login**
Admin masuk dengan akun khusus admin.

**2. Sidebar Admin — 4 Halaman**

**Halaman 1: Dashboard Peta (Utama)**
Peta berisi semua titik dari semua user. Klik salah satu titik → muncul detail lengkap:
- Siapa user pemilik titik
- Berapa pohon di titik itu
- Foto pohon per individu
- **Data mentah yang diinput user: diameter, tinggi, kondisi, catatan, dll**
- Riwayat pembaruan per periode
- Kapan terakhir diperbarui

**Halaman 2: Monitoring User**
- Daftar semua user aktif
- Status upload masing-masing per periode (misal 3 bulan sekali)
- User yang belum upload diberi penanda khusus (merah/kuning)

**Halaman 3: Analitik ML**
Hasil analisis otomatis dari ML:
- Titik mana yang pertumbuhannya bagus
- Titik mana yang terancam / bermasalah
- Tren pertumbuhan per periode
- Prediksi kondisi ke depan

**Halaman 4: Manajemen Akun User**
- Tambah akun user baru
- Ubah data akun user
- Hapus akun user
- Data & titik milik user yang dihapus tetap tersimpan di sistem