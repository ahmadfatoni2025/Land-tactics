Dalam dunia pertanian, pengelompokan kategori sangat penting untuk menentukan strategi manajemen, jenis teknologi yang digunakan, hingga sistem pemantauan di peta (seperti yang sedang kamu bangun).

Berikut adalah list kategori dalam dunia pertanian yang bisa kamu gunakan sebagai referensi data untuk sistem *barcode* dan *mapping* kamu:

### 1. Kategori Berdasarkan Jenis Komoditas
Ini adalah kategori yang paling umum digunakan untuk membedakan apa yang ditanam di suatu lahan.
* **Tanaman Pangan:** Padi, jagung, gandum, ubi jalar, singkong.
* **Hortikultura (Sayur & Buah):** Tomat, cabai, bawang, apel, mangga, jeruk.
* **Perkebunan:** Kelapa sawit, karet, kopi, kakao, teh, tebu.
* **Tanaman Hias:** Bunga potong, tanaman dalam pot (anggrek, mawar, dll).
* **Tanaman Obat (Biofarmaka):** Jahe, kunyit, temulawak, kencur.

### 2. Kategori Berdasarkan Sarana Produksi (Saprodi)
Jika aplikasi kamu digunakan untuk inventaris gudang atau distribusi, kategori ini sangat relevan:
* **Benih/Bibit:** Label varietas, tanggal kedaluwarsa benih.
* **Pupuk:** Pupuk organik (kompos, kohe) dan anorganik (UREA, NPK, TSP).
* **Pestisida:** Herbisida (gulma), Insektisida (serangga), Fungisida (jamur).
* **Zat Pengatur Tumbuh (ZPT):** Hormon untuk mempercepat pembuahan atau akar.

### 3. Kategori Berdasarkan Alat dan Mesin Pertanian (Alsintan)
Cocok jika sistem *barcode* kamu digunakan untuk manajemen aset alat berat:
* **Traktor:** Hand tractor, mini tractor, four-wheel tractor.
* **Alat Tanam:** *Transplanter* padi, *seeder* jagung.
* **Alat Pengolahan Lahan:** Kultivator, rotavator, bajak singkal.
* **Alat Panen:** *Combine harvester*, alat perontok padi (*thresher*).
* **Sistem Irigasi:** Pompa air, sprinkler, sistem irigasi tetes (*drip irrigation*).

### 4. Kategori Berdasarkan Status Lahan/Tanaman
Sangat berguna untuk ditampilkan sebagai warna *marker* yang berbeda di Leaflet Map kamu:
* **Fase Pertumbuhan:** Vegetatif (pertumbuhan daun/batang), Generatif (pembungaan), Panen.
* **Kesehatan Tanaman:** Sehat, Terserang Hama, Kekurangan Nutrisi, Layu.
* **Kondisi Tanah:** Lembap, Kering, pH Rendah, pH Tinggi.

### 5. Kategori Berdasarkan Metode Pertanian
* **Konvensional:** Pertanian terbuka menggunakan bahan kimia.
* **Organik:** Tanpa bahan kimia sintetis.
* **Hidroponik/Akuaponik:** Budidaya tanpa tanah (menggunakan media air).
* **Greenhouse:** Pertanian di dalam ruangan terkontrol.

---

### **Saran Implementasi pada Aplikasi Kamu:**

Jika kamu ingin memasukkan kategori ini ke dalam database **Supabase**, kamu bisa menambahkan kolom `category` dan `status` pada tabel `check_ins`.

**Contoh Skenario:**
> Tony melakukan scan pada sebuah area perkebunan kopi.
> * **Barcode ID:** KOPI-001
> * **Kategori:** Perkebunan
> * **Status:** Fase Generatif (Berbunga)
> * **Foto:** Kondisi bunga kopi.
> * **Map Marker:** Muncul dengan ikon berwarna hijau di lokasi tersebut.

Apakah kamu ingin saya bantu membuatkan **Drop-down Menu (Select Option)** di file `.tsx` kamu agar user bisa memilih kategori-kategori ini saat melakukan scan?