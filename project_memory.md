# TrioTrack - Proje Hafızası (Project Memory)

## 📌 Proje Özeti
TrioTrack, 3 popüler açık kaynaklı finans uygulamasının en güçlü yönlerini birleştiren modern, çevrimdışı öncelikli (offline-first) bir kişisel bütçe ve harcama takip uygulamasıdır:
1. **Buckwheat**: Akıllı günlük bütçe dağıtım motoru (kalan bütçeyi kalan günlere göre hesaplayarak her sabah güvenli harcama limiti çıkarma).
2. **Paisa**: 2x2 Genel Bakış kartları, cüzdanlar arası transfer mimarisi, kategori bazlı bütçe limitleri, tasarruf oranları ve zengin raporlama.
3. **Zero**: Sade monokrom minimalist estetik, 4 temel borç kategorisi (Kişi, Kredi Kartı, EMI/Taksit, Banka Kredisi) ve 3x4 matris ay/yıl seçici bottom sheet.

---

## 🎨 Tasarım Sistemleri ve Temalar
- **Material You (Dinamik):** Canlı renkler, yuvarlak köşeler, modern kartlar.
- **TrioTrack Minimalist (Zero):** Siyah-beyaz monokrom, yüksek kontrast, keskin veya hafif yuvarlatılmış köşeler. Metin rengi her zaman `colors.onPrimary` ile buton içi görünürlüğü garanti altına alır.
- **Buckwheat Sıcak Turuncu:** Sıcak tonlar, akıllı bütçe odaklı arayüz.

---

## 💾 Veri ve Durum Yönetimi (DataContext)
- **Kalıcılık:** `@react-native-async-storage/async-storage` ve WatermelonDB mimarisi. Veriler cihazda yerel kalır, uygulama yeniden açıldığında hiçbir veri kaybı yaşanmaz.
- **İşlem Tipleri (`Transaction`):**
  - `expense` (Gider)
  - `income` (Gelir)
  - `transfer` (Transfer - Kaynak cüzdandan düşüp hedef cüzdana ekler)
- **Borç/Alacak (`Debtor`):**
  - Borç Kategorileri: `person`, `credit_card`, `emi`, `loan`
  - Tipler: `owe_me` (Alacak), `i_owe` (Borç)
- **Aktif Dönem (`selectedMonth`):**
  - `YYYY-MM` formatında tutulur, tüm dashboard kartları, bütçe harcamaları ve raporlar bu döneme göre dinamik hesaplanır.

---

## 🔒 Güvenlik & Donanım Uyumluluğu
- **Navbar / Gesture Pill Güvenliği:** `useSafeAreaInsets` ile alt sistem çubuğu asla menü butonlarının üzerine binmez.
- **Status Bar:** Cihaz bildirim alanı şeffaf/renk uyumlu olarak yapılandırılmıştır.
- **Sürüm Takibi:** Her güncellemede `APP_VERSION` (`1.6.6`, versionCode 7) ve `APP_BUILD` (`2026.09.11`) artırılarak `app.json`, `package.json`, `android/app/build.gradle` ve `version.ts` dosyaları senkronize tutulur.
