# Sistem Pemantauan Perkembangan Tanaman Berbasis Website

## Deskripsi Project

Sistem ini merupakan website modern untuk memantau perkembangan tanaman secara berkala, mulai dari proses penanaman, monitoring pertumbuhan, analisis kondisi tanaman, notifikasi otomatis, hingga laporan hasil panen.

Project ini dirancang untuk membantu petani, admin, maupun operator lapangan dalam melakukan pencatatan dan pengawasan tanaman secara lebih efektif, terstruktur, dan modern.

---

# Tujuan Sistem

## Tujuan Utama

Membuat sistem monitoring perkembangan tanaman berbasis website yang:

* mudah digunakan
* responsif dan modern
* mendukung monitoring harian/mingguan
* menampilkan grafik perkembangan tanaman
* memiliki notifikasi otomatis
* dapat menghasilkan laporan panen
* siap dikembangkan ke sistem IoT dan AI

---

# Role Pengguna

## 1. Admin

### Hak Akses:

* mengelola seluruh data
* mengelola user
* melihat semua laporan
* mengatur notifikasi sistem
* monitoring seluruh tanaman

---

## 2. Petani

### Hak Akses:

* input data tanaman
* update perkembangan tanaman
* upload foto tanaman
* melihat grafik pertumbuhan
* menerima notifikasi
* melihat laporan hasil panen

---

## 3. Operator Lapangan

### Hak Akses:

* monitoring kondisi lapangan
* input data sensor/manual
* update kondisi tanaman
* upload dokumentasi tanaman

---

# Modul Sistem Lengkap

---

# Modul 1 — Authentication System

## Fitur

* Login
* Logout
* Register User
* Forgot Password
* Reset Password
* Role-based Access Control
* Session Management

## Tabel Database

* users
* roles

---

# Modul 2 — Dashboard System

## Fitur

* total tanaman aktif
* total tanaman sehat
* total tanaman bermasalah
* jadwal penyiraman
* jadwal pemupukan
* notifikasi terbaru
* grafik pertumbuhan terbaru
* aktivitas terakhir

## Tujuan

Menampilkan overview kondisi tanaman secara real-time.

---

# Modul 3 — Master Data Tanaman

## Fitur

* tambah tanaman
* edit data tanaman
* hapus tanaman
* detail tanaman
* pencarian tanaman
* filter tanaman

## Data yang Disimpan

* nama tanaman
* jenis tanaman
* varietas
* tanggal tanam
* lokasi lahan
* metode tanam
* target panen
* status tanaman
* foto awal tanaman

## Tabel Database

* tanaman

---

# Modul 4 — Monitoring Berkala

## Fitur

* input monitoring harian
* input monitoring mingguan
* update kondisi tanaman
* upload foto perkembangan
* histori perkembangan

## Data Monitoring

* tinggi tanaman
* jumlah daun
* kondisi daun
* kelembapan tanah
* suhu udara
* pH tanah
* intensitas cahaya
* kondisi hama
* kondisi penyakit
* catatan tambahan
* foto terbaru

## Tabel Database

* monitoring
* foto_tanaman

---

# Modul 5 — Analisis Kondisi Tanaman

## Fitur

* pengecekan kondisi otomatis
* status kesehatan tanaman
* deteksi pertumbuhan lambat
* indikasi hama dan penyakit

## Output Status

* sehat
* perlu perhatian
* kritis

## Tabel Database

* analisis_tanaman

---

# Modul 6 — Notifikasi Otomatis

## Fitur

* notifikasi penyiraman
* notifikasi pemupukan
* notifikasi kondisi kritis
* notifikasi tanaman siap panen
* notifikasi risiko gagal panen

## Jenis Notifikasi

* dashboard alert
* email notification
* whatsapp notification (opsional)

## Tabel Database

* notifikasi

---

# Modul 7 — Grafik Monitoring

## Fitur

* line chart pertumbuhan
* grafik kelembapan
* grafik suhu
* grafik pH tanah
* grafik perkembangan daun
* grafik histori monitoring

## Tools Rekomendasi

* Chart.js
* Recharts
* ApexCharts

---

# Modul 8 — Dokumentasi Foto Tanaman

## Fitur

* upload foto berkala
* perbandingan foto tanaman
* histori visual perkembangan

## Tujuan

Memudahkan tracking perkembangan secara visual.

## Tabel Database

* foto_tanaman

---

# Modul 9 — Prediksi Panen (Opsional Modern)

## Fitur

* estimasi waktu panen
* prediksi kualitas hasil
* prediksi jumlah hasil panen
* rekomendasi tindakan

## Dasar Perhitungan

* umur tanaman
* kondisi pertumbuhan
* histori monitoring
* kondisi kesehatan tanaman

## Tabel Database

* prediksi_panen

---

# Modul 10 — Laporan Sistem

## Fitur

* generate laporan PDF
* export Excel
* laporan bulanan
* laporan perkembangan tanaman
* laporan hasil panen

## Tabel Database

* laporan
* panen

---

# Modul 11 — Arsip Data

## Fitur

* status selesai panen
* status gagal panen
* histori data lama
* backup data

## Tujuan

Penyimpanan histori untuk analisis berikutnya.

---

# Struktur Database Utama

## Tabel Inti

```text
users
roles
tanaman
monitoring
foto_tanaman
analisis_tanaman
notifikasi
prediksi_panen
laporan
panen
```

---

# Teknologi yang Direkomendasikan

## Frontend

* React.js
* Next.js
* Tailwind CSS
* Shadcn UI

## Backend

* Node.js + Express.js
* Laravel
* Django

## Database

* MySQL
* PostgreSQL

## Authentication

* JWT
* Firebase Auth

## Hosting

* Vercel
* Netlify
* VPS

## IoT (Pengembangan)

* ESP32
* Arduino
* Soil Moisture Sensor
* DHT11 / DHT22
* pH Sensor

---

# Flow Sistem Singkat

```text
Login
↓
Dashboard
↓
Input Data Tanaman
↓
Monitoring Berkala
↓
Analisis Kondisi
↓
Notifikasi Otomatis
↓
Grafik Monitoring
↓
Laporan Akhir
↓
Arsip Data
```

---

# Tahapan Development

## Phase 1

* authentication
* dashboard
* CRUD tanaman
* monitoring manual
* upload foto

## Phase 2

* grafik monitoring
* notifikasi otomatis
* laporan PDF & Excel

## Phase 3

* integrasi IoT sensor
* real-time monitoring

## Phase 4

* AI prediction
* disease detection
* smart farming system

---

# Kesimpulan

Project ini sangat cocok untuk:

* skripsi
* tugas akhir
* portfolio fullstack developer
* startup pertanian digital
* smart farming system

Karena memiliki kombinasi:

* website modern
* dashboard profesional
* data monitoring real-time
* visualisasi grafik
* potensi integrasi IoT dan AI

Sehingga project ini memiliki nilai teknis dan nilai bisnis yang sangat kuat.
