# TrioTrack - Görev ve Yol Haritası (TODO List)

## ✅ Tamamlanan Özellikler (v1.5.8)
- [x] Sürüm numarası `v1.5.8` (Derleme: `2026.09.10`) olarak tüm konfigürasyonlara (`app.json`, `package.json`, `version.ts`, `build.gradle`, `changelog.md`) uygulandı.
- [x] **Akıllı Fiş & Fatura Tarayıcı (OCR & Fiş No):** Harcamalara fiş belgesi ekleme, otomatik Fiş No üretme (`#FŞ-xxxx`), lazer tarama animasyonlu OCR modalı, Türk mağaza/fatura hazır şablonları (BİM, Starbucks, Opet, Enerjisa, Eczane) ve regex metin ayrıştırıcısı eklendi.
- [x] **Toplam Bakiye Mahremiyet Seçeneği (Privacy Mode):** Ana ekran kartında ve Cüzdanlar sekmesinde göz simgesi (`eye-outline` / `eye-off-outline`) ile tutarları `₺ ••••••` şeklinde gizleyen kalıcı mahremiyet modu entegre edildi (`@triotrack_hide_balance`).
- [x] **Navigasyon Sadeleştirmesi & Birleşik Hesaplar/Ayarlar:** Alt menüden Ayarlar sekmesi kaldırılarak 4 sekmeye indirildi; Paisa `003245` tarzı kullanıcı profili, hesap yönetimi ve ayarlar tek merkezde toplandı.
- [x] **Paisa Tarzı Logo & İkon Kataloğu:** Harcamalar için 7 kategoride onlarca simge ve 12 renkli palet seçici eklendi.
- [x] **Dinamik "Neler Yeni?" Merkezi:** Üst çubuğa parıltılı `v1.5.8` rozeti ve tıklandığında açılan Paisa etiketli (`[ÖZELLİK]`, `[GELİŞTİRME]`, `[DÜZELTME]`) yenilikler modalı eklendi.
- [x] **Hibrit Ana Ekran Korundu & Mikro Animasyonlar:** Buckwheat harçlık + Zero bütçe tahsisi + Paisa istatistikleri korunarak akıcı mikro animasyonlar ve sıfır hata sağlandı.

## ✅ Tamamlanan Özellikler (v1.5.7)
- [x] Sürüm numarası `v1.5.7` (Derleme: `2026.09.10`) olarak tüm konfigürasyonlara (`app.json`, `package.json`, `version.ts`, `build.gradle`, `changelog.md`) uygulandı.
- [x] Paisa, Zero ve Buckwheat felsefelerini harmanlayan çok adımlı karşılama akışı (`OnboardingScreen.tsx` - 7 Adım) kuruldu.
- [x] Onboarding Slide 0'a doğrudan JSON yedekten geri yükleme modalı (`showRestoreModal`, `importDataFromJSON`) entegre edildi.
- [x] Onboarding Slide 1'e Paisa "Verin, Kontrolün" veri gizliliği ve yerel yedekleme sorumluluk onay listesi eklendi.
- [x] Onboarding Slide 2'ye Zero "What should we call you?" kişiselleştirme, dinamik harf avatarı ve canlı tema/arayüz/yazı tipi önizlemesi eklendi.
- [x] Onboarding Slide 3'e Paisa & Zero çoklu para birimi arama ve seçim ızgarası eklendi.
- [x] Onboarding Slide 4'e Zero tarzı ikonlu ve çoklu seçimli kategori seçim çipleri eklendi.
- [x] Onboarding Slide 5'e kullanıcının talep ettiği **Hafta Başlangıcı Günü (Pazartesi vs Pazar)** seçimi, **Buckwheat Maaş Döngü Başlangıç Günü (1-25)** ve temiz sıfır başlangıçlı ilk cüzdan (0.00 TL) eklendi.
- [x] Ayarlar ekranının en altına TrioTrack marka logosu, versiyon bilgisi ve "Geliştirici: Mehmet Şensoy" tıklanabilir GitHub linki (`https://github.com/mehmetsensoyme`) eklendi.
- [x] Çevrimdışı / Bağımsız (Standalone Offline) Release APK derlendi: `TrioTrack-v1.5.6-release.apk` üretildi (77 MB, Metro gerektirmez, %100 yerel ve çevrimdışı).
- [x] Sıfırdan temiz hesap & bakiye başlangıcı (demo kalıntıları ve hayalet bakiyeler temizlendi).
- [x] Android Studio (`/Applications/Android Studio.app`) ve OpenJDK 17 kuruldu.
- [x] Android SDK Platform Tools, Platform-35/36 ve Build-Tools 35/36 lisansları onaylanarak yerel derleme ortamı kuruldu.
- [x] Yerel Android proje altyapısı (`./android`) `npx expo prebuild` ile oluşturuldu.
- [x] **Yerel Android APK Derlemesi Başarıyla Tamamlandı:** `TrioTrack-v1.5.4-debug.apk` üretildi.
- [x] Android APK derleme altyapısı hazırlandı (`eas.json`, `package: com.triotrack.app`, `versionCode: 1`, `build:apk` scripti).
- [x] Buckwheat Maaş / Bütçe Döngü Başlangıç Günü (1-28) dinamik döngüsel hesaplayıcı ile entegre edildi.
- [x] Buckwheat Canlı Durum Bildirim Rozeti ve ay sonu harcama projeksiyonu eklendi.
- [x] Paisa JSON Tam Yedekleme & Geri Yükleme Hub'ı (`exportDataAsJSON`, `importDataFromJSON` modalı) `SettingsScreen`'e eklendi.
- [x] Aylık Bütçe Hedefi düzenleme modalı (`showGoalModal`) ve Biyometrik / Uygulama Kilidi ayarları eklendi.
- [x] Zero & Paisa İşlem Detay & Not Düzenleme Müfettişi (`TransactionDetailModal`) ve `editTransaction` entegre edildi.
- [x] Zero Sıfır Tabanlı Bütçe Planı (`Zero-Based Budgeting`) tahsis takip kartı eklendi.
- [x] Net Değer (Net Worth) KPI Hub'ı (Varlıklar vs Yükümlülükler) Cüzdanlar sekmesine eklendi.
- [x] Zero Borç Vade Takvimi & Gecikme Uyarıları (`dueDate`, hızlı +15/+30/+60 gün butonları ve ikaz etiketleri) eklendi.
- [x] TypeScript derleme denetimi `npx tsc --noEmit` -> 0 hata.
- [x] Metro Bundler canlı çalışır durumda.

## 📌 Gelecek Yol Haritası (v1.6.0 ve Sonrası)
- [ ] Çoklu para birimi cüzdanlar arası anlık döviz kuru çevirici.
- [ ] Harcama fişi / makbuz görseli kamera ve galeriden ekleme desteği.
- [ ] Aylık otomatik PDF harcama özeti raporu oluşturma.
