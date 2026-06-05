# SpendWise 🪙 — AI-Powered Personal Finance Tracker

SpendWise adalah aplikasi pelacakan keuangan pribadi pintar yang membantu pengguna memantau pemasukan, pengeluaran, dompet, dan menetapkan anggaran. Aplikasi ini dilengkapi dengan asisten AI yang dapat memberikan analisis keuangan bulanan (Monthly Insights) dan memprediksi status kesehatan finansial bulan berikutnya menggunakan model Deep Learning kustom.

Aplikasi ini merupakan bagian dari Proyek Capstone CC26.

---

## 📂 Struktur Direktori Proyek

```text
```text
SpendWise/
├── ai-model/                              # Layanan AI (Python Flask)
│   ├── models/                            # File model & scaler biner
│   │   ├── model_monthly.keras            # Model Keras (Deep Learning)
│   │   └── scaler.joblib                  # Scaler StandardScaler
│   ├── Spedwise_Modeling.ipynb            # Jupyter Notebook training model
│   ├── inference.py                       # Skrip pengujian model AI lokal
│   ├── venv/                              # Virtual Environment Python
│   └── app.py                             # Endpoint API Flask
├── backend/                               # Layanan Backend (Node.js)
│   ├── prisma/                            # Schema & Migrasi Database
│   │   ├── schema.prisma                  # Definisi Database & Model Prisma
│   │   └── dev.db                         # Database SQLite Utama
│   ├── src/                               # Source Code API
│   │   ├── services/                      # Service modul (auth, ai, wallets, dll)
│   │   └── server.js                      # Entry point backend
│   └── .env                               # Variabel Lingkungan Backend
├── data/                                  # Analisis Data & Dashboard Presentasi
|    ├── Pemrosesan data/                  # Pemrosesan data
│    │   ├── Capstone_Project.ipynb        # Jupyter Notebook pemrosesan data
│    │   ├── Data dictionary - Bulanan.csv # Data dictionary untuk data latih dan data test
|    |   ├── Laporan Komprehensif.pdf      # Dokumen Penjelasan Pemrosesan dan Visualisasi Data
│    │   ├── data.csv                      # Dataset mentah yang didapat dari kaggle
│    │   ├── df_test2.csv                  # Dataset untuk testing model
│    │   └── df_train2.csv                 # Dataset untuk training model
|    └── dashboard/                        # Aplikasi Streamlit Dashboard
│        ├── SpendWise Logo.png            # Aset Logo Aplikasi
│        ├── dashboard.py                  # Dashboard Analisis Data
│        ├── df_clean2.csv                 # Dataset utama hasil cleaning
│        ├── requirements.txt              # Dependensi Streamlit
│        └── url.txt                       # Link deployment streamlit cloud 
├── frontend/                              # Layanan Frontend (React)
│   ├── src/
│   │   ├── components/                    # Komponen UI Reusable
│   │   ├── pages/                         # Halaman Dashboard, Transaksi, Suggestion, dll
│   │   └── utils/                         # Request API & Helper
│   └── index.html                         # Entry point HTML
└── README.md                              # Dokumentasi Utama
```
---

## 🚀 Panduan Instalasi & Penggunaan

Ikuti langkah-langkah di bawah ini untuk menjalankan seluruh layanan SpendWise di komputer lokal Anda.

### Prasyarat
Pastikan Anda sudah menginstal:
*   [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
*   [Python](https://www.python.org/) (versi 3.10 atau 3.11 direkomendasikan)
*   [Git](https://git-scm.com/)

---

### 1. Konfigurasi Backend

1.  Masuk ke direktori `backend`:
    ```bash
    cd backend
    ```
2.  Instal seluruh dependensi Node.js:
    ```bash
    npm install
    ```
3.  Salin atau buat file `.env` di dalam folder `backend/`:
    ```env
    HOST=localhost
    PORT=3000
    ACCESS_TOKEN_KEY=your_access_token_jwt_secret_key
    REFRESH_TOKEN_KEY=your_refresh_token_jwt_secret_key
    GEMINI_API_KEY=your_google_gemini_api_key
    ```
4.  Generate Prisma Client dan terapkan migrasi database SQLite:
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```
5.  Jalankan server backend dalam mode development:
    ```bash
    npm run start-dev
    ```
    *Server backend akan berjalan di: `http://localhost:3000`*

---

### 2. Konfigurasi Python AI Service

1.  Buka terminal baru dan masuk ke direktori `ai-model`:
    ```bash
    cd ai-model
    ```
2.  Buat virtual environment Python jika belum ada, lalu aktifkan:
    *   **Windows (PowerShell)**:
        ```powershell
        python -m venv venv
        .\venv\Scripts\Activate.ps1
        ```
    *   **Mac/Linux**:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
3.  Instal dependensi Python yang dibutuhkan:
    ```bash
    pip install -r requirements.txt
    ```
4.  Jalankan server Flask:
    ```bash
    python app.py
    ```
    *AI Server akan berjalan di: `http://localhost:5000`*

---

### 3. Konfigurasi Frontend (React)

1.  Buka terminal baru dan masuk ke direktori `frontend`:
    ```bash
    cd frontend
    ```
2.  Instal seluruh dependensi:
    ```bash
    npm install
    ```
3.  Jalankan aplikasi React:
    ```bash
    npm run dev
    ```
    *Aplikasi frontend dapat diakses di: `http://localhost:5173`*

---

### 4. Konfigurasi Dashboard Streamlit

1.  Buka terminal baru dan masuk ke direktori `data/dashboard`:
    ```bash
    cd data/dashboard
    ```
2.  Instal dependensi Python yang dibutuhkan:
    ```bash
    pip install -r requirements.txt
    ```
3.  Jalankan aplikasi Streamlit:
    ```bash
    streamlit run dashboard.py
    ```
    *Dashboard analitis akan berjalan di: `http://localhost:8501`*

---

## 🤖 Detail Integrasi Model Machine Learning

### Fitur Input Rasio Keuangan (11 Ratios)
Layanan AI memproses pengeluaran bulanan pengguna dengan mengonversinya menjadi 11 rasio pengeluaran terhadap total pemasukan sebagai berikut:
1.  `Rent_Ratio` (Sewa tempat tinggal)
2.  `Loan_Repayment_Ratio` (Cicilan)
3.  `Insurance_Ratio` (Asuransi)
4.  `Groceries_Ratio` (Bahan makanan)
5.  `Transport_Ratio` (Transportasi)
6.  `Eating_Out_Ratio` (Makan di luar)
7.  `Entertainment_Ratio` (Hiburan)
8.  `Utilities_Ratio` (Listrik, air, gas)
9.  `Healthcare_Ratio` (Kesehatan)
10. `Education_Ratio` (Pendidikan)
11. `Miscellaneous_Ratio` (Lainnya)

### Klasifikasi & Mapping Output
Setelah rasio dimasukkan dan discaling oleh `StandardScaler`, model kustom Deep Learning mengklasifikasikan status keuangan pengguna menjadi 3 status:
*   **Kelas 0 (`Sehat`)**: Rasio pengeluaran terkendali dengan sisa tabungan tinggi.
*   **Kelas 1 (`Moderate`)**: Rasio pengeluaran stabil namun beberapa kategori memerlukan pengawasan anggaran.
*   **Kelas 2 (`Rentan`)**: Pengeluaran melebihi batas wajar pemasukan, memerlukan penyesuaian finansial mendesak.

### Rekomendasi Dinamis
Berdasarkan status klasifikasi di atas, backend Node.js bekerjasama dengan LLM Gemini untuk:
1.  **Mengestimasi pengeluaran bulan depan**:
    *   **Sehat**: Proyeksi pengeluaran diturunkan 10% (`x 0.9`).
    *   **Moderate**: Proyeksi pengeluaran dinaikkan 5% (`x 1.05`).
    *   **Rentan**: Proyeksi pengeluaran dinaikkan 25% (`x 1.25`).
2.  **Menghasilkan Insight Finansial & Tindakan yang Disarankan** secara real-time dan disesuaikan langsung dengan riwayat transaksi pengguna.

---

## ⚠️ Catatan Penting untuk Development
*   **Scoping Variabel**: Saat memodifikasi file [ai-controller.js](backend/src/services/ai/controllers/ai-controller.js), pastikan variabel `summary` dideklarasikan di lingkup terluar fungsi (*function scope*) agar blok `catch` dapat membaca data transaksi dan menghasilkan rekomendasi finansial secara dinamis apabila Gemini API mendadak mengalami kendala *rate limit*.
*   **Custom Class Deserialization**: Model Keras menggunakan modul kustom `ResidualBlock`. Saat memuat model di Python [app.py](ai-model/app.py), muat model menggunakan modul Keras standalone (`keras.models.load_model(..., compile=False)`) dan daftarkan custom layer tersebut ke registry Keras `get_custom_objects()` sebelum proses loading weights agar tidak memicu kegagalan deserialisasi model.
