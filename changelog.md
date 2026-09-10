# TrioTrack - Değişiklik Günlüğü (Changelog)

Tüm önemli değişiklikler bu dosyada belgelenmektedir. Proje [SemVer](https://semver.org/) prensiplerine uymaktadır.

---

## [v1.6.0] - 2026-09-10 (Derleme: 2026.09.10)
### 🌟 Yeni Nesil Hibrit Karşılama Akışı (Onboarding), Tema Kontrast Kusursuzluğu & Avatar Seçici
- **Kişiselleştirilmiş Karşılama & Profil Ekranı (Onboarding Slide 2):**
  - Üst gezinme çubuğu şeffaf, yüzen ve dokunma olaylarını engelleyen (`pointerEvents="box-none"`) modern bir yapıya kavuşturuldu.
  - Avatar altındaki gereksiz "Fotoğrafı / Stili Değiştir" metni kaldırıldı; avatarın kendisine dokunulduğunda açılan şık alt menü ile doğrudan fotoğraf seçimi sağlandı.
  - Galeri fotoğraf seçimi, kamera entegrasyonu ve yüksek kontrastlı minimalist karakter/rozet avatarları optimize edildi.
- **Para Birimi & Finansal Hedefler Ekranı (Slide 3):**
  - Para birimleri 2 satır x 3 sütun eşit genişlikli chipler ve canlı format önizleme kartı ile donatıldı.
  - 5 öncelikli finansal hedef kartı (`daily_pocket`, `saving`, `debt_free`, `zero_budget`, `investing`) net bir içerik hiyerarşisiyle sunuldu.
  - 4'lü segmented birikim oranı hapları (`%10`, `%20` Önerilen, `%30`, `%50` FIRE) ve dinamik açıklama kartı eklendi.
  - Sabit rozet kapsayıcısı ile tüm yüzde metinlerinin baselinesı milimetrik olarak hizalandı.
- **Aydınlık & Koyu Tema Kusursuzluğu (Light Theme Polish):**
  - Aydınlık temada silik kalan beyaz kartlar için standart, net `#E2E8F0` (Slate-200) kenarlıklar uygulandı.
  - Seçili kart arka planında kirli leke oluşturan düşük alfalı renkler kaldırılarak 2px canlı birincil renk kenarlığı ve temiz kontrast getirildi.
  - Hedef ikon kutuları seçildiğinde hedefin kendi canlı rengi ve beyaz ikonla dinamik olarak dolarak net geri bildirim sağlandı.
  - Seçilmemiş radyo butonları zarif `#CBD5E1` halka rengine kavuşturuldu.
- **Kesintisiz Başlatma & Geçiş (Slide 6):**
  - "Her Şey Hazır!" ekranında "BAŞLA" butonuna basıldığında logonun dönen bir yükleme simgesine dönüşmesi sorunu tamamen kaldırıldı; avatar ve başlık sabit tutuldu.
  - Yapay 600ms bekleme süresi kaldırılarak ana ekrana anında geçiş sağlandı.
- **Sürüm Yükseltmesi:**
  - `v1.6.0` (Build `2026.09.10`, `versionCode 5`) olarak tüm yapılandırma dosyaları güncellendi.

---

## [v1.5.9] - 2026-09-10 (Derleme: 2026.09.10)
### 🌟 Canlı Kamera & OCR Motoru, CDN Marka Logoları & Evrensel Modal Backdrop Dismiss
- **Gerçek Kamera ve Galeri Entegrasyonu ile Canlı OCR:**
  - `expo-image-picker` ile cihaz kamerasından doğrudan fiş/fatura fotoğrafı çekme ve galeriden görsel seçme yeteneği eklendi.
  - Kamera ve depolama izinleri (`CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES`) `app.json` içine eklendi.
  - `src/utils/ocrService.ts`: Canlı OCR Space API entegrasyonu ve akıllı Türkçe fiş ayrıştırıcı motoru (Toplam Tutar, Fiş No, Tarih, Mağaza Eşleme, KDV algılama) devreye alındı.
  - Harcama formuna gerçek fiş fotoğrafı önizleme kartı, fotoğrafı silme veya kamerayla yeniden çekme kontrolleri entegre edildi.
  - Çekilen fiş fotoğrafı harcama nesnesine (`receiptImage`) kaydedilir ve işlem detay modalında tam boyutta incelenebilir.
- **Paisa CDN Marka Logoları Kataloğu:**
  - 35+ popüler marka (Netflix, Spotify, YouTube, Disney+, Starbucks, Migros, BİM, A101, ŞOK, Shell, Opet, Trendyol, Apple vb.) yüksek çözünürlüklü CDN URL'leri ile kataloglandı (`src/constants/brands.ts`).
  - Harcama formundaki simge seçici iki sekmeli hale getirildi: "✨ Marka CDN Logoları" (kategori filtreli arama ızgarası) ve "🎨 Vektör Simgeler".
  - Marka logoları ana ekranda, işlem detayında, global aramada, cüzdan geçmişinde ve raporlar ekranındaki en büyük gider bannerında avatar olarak sergilenir.
- **Evrensel Modal Backdrop Dismiss (Dış Boşluğa Dokununca Kapanma):**
  - Uygulamadaki istisnasız tüm modallarda (Fiş Tarayıcı, Hesap Makinesi, Logo Seçici, İşlem Arama, İşlem Detayı, Ay/Dönem Seçici, Neler Yeni, Hesap Ekle, Kategori Bütçesi, Cüzdan Detay, Kategori Ekle, Abonelik Ekle, Borç Ekle, Kısmi Ödeme, Borç Geçmişi, Bütçe Hedefi, JSON İçe Aktar, Kurulum Yedek Yükleme) karartılmış dış siyah alana dokunulduğunda modalın anında kapanması sağlandı.
  - Tüm modallara Android fiziksel geri tuşu entegrasyonu (`onRequestClose`) tamamlandı.
- **Sürüm Yükseltmesi:**
  - `v1.5.9` (Build `2026.09.10`, `versionCode 4`) olarak tüm yapılandırma dosyaları senkronize edildi.

---

## [v1.5.8] - 2026-09-10 (Derleme: 2026.09.10)
### 🌟 Fiş/Fatura OCR Tanıma, Bakiye Mahremiyeti & Bütünleşik Hesaplar Merkezi
- **Akıllı Fiş & Fatura Tarayıcı (OCR & Otomatik Fiş No):**
  - Harcama ekleme ekranına (`AddExpenseScreen.tsx`) tam teşekküllü "Fiş & Fatura Belgesi" modülü entegre edildi.
  - Lazer tarama animasyonlu OCR modalı, gerçekçi Türk market ve fatura şablonları (BİM, Starbucks, Opet, Enerjisa, Eczane) ve serbest metin regex ayrıştırıcısı eklendi.
  - Taranan fişlerden Fiş No (`#FŞ-xxxx`), KDV dahil toplam tutar, mağaza başlığı ve ilgili kategori otomatik algılanıp forma doldurulur.
  - Harcamalara resmi formatta tek dokunuşla otomatik fiş numarası üretme (`#FŞ-xxxx`) ve fiş kaldırma desteği eklendi.
  - Ana ekrandaki işlem detay modalında (`selectedTxForDetail`) kayıtlı fiş numarası ve belgesi rozet olarak sergilenmektedir.
- **Paisa Tarzı Zengin Logo ve İkon Kataloğu:**
  - İşlemler için 7 ana kategoride (Abonelikler, Faturalar, Market, Alışveriş, Ulaşım, Sağlık, Finans) ve 12'li canlı renk paletinde simge/logo seçici eklendi.
- **Toplam Bakiye Mahremiyet Seçeneği (Privacy Mode):**
  - Ana ekran Toplam Net Bakiye kartında ve Cüzdanlar sekmesinde göz simgesi (`eye-outline` / `eye-off-outline`) ile açılıp kapatılabilen mahremiyet modu eklendi.
  - Aktif olduğunda toplam bakiye, gelir, gider, günlük harçlık ve cüzdan bakiyeleri `₺ ••••••` şeklinde maskelenir.
  - Mahremiyet tercihi AsyncStorage üzerinde `@triotrack_hide_balance` anahtarıyla kalıcı olarak saklanır.
- **Navigasyondan Ayarlar Sekmesini Kaldırma & Hesaplar ile Bütünleştirme:**
  - Alt navigasyon çubuğundaki bağımsız "Ayarlar" sekmesi kaldırılarak 4 ana modüle (Ana Sayfa, Hesaplar, Borçlar, Raporlar) sadeleştirildi.
  - Paisa `003245` ekran tasarımına uygun olarak Hesaplar ekranı (`AccountsBudgetsScreen.tsx`) kullanıcı profili ("Merhaba, Mehmet!"), harf avatarı, hızlı eylem butonları (Hesap Ekle, Ayarlar, Bütçeler, Abonelikler) ve tam kapsamlı "Uygulama & Sistem Ayarları" kartı ile donatıldı.
  - Ayarlar sayfası Stack Navigator içine alınarak her noktadan tek dokunuşla ve geri dönülebilir şekilde erişilebilir kılındı.
- **Dinamik "Neler Yeni?" Sürüm Yenilikleri Merkezi:**
  - Ana ekranın üst çubuğuna klasik metin yerine parıltılı, rozetli `v1.5.8` hap butonu entegre edildi.
  - Tıklandığında son sürümün getirdiği tüm özellikleri, geliştirmeleri ve düzeltmeleri Paisa tarzı renkli etiketlerle (`[ÖZELLİK]`, `[GELİŞTİRME]`, `[DÜZELTME]`) listeleyen zarif bir modal açılmaktadır.
- **Hibrit Ana Ekran Korundu & Mikro Animasyonlar:**
  - Paisa ana ekranı kopyalanmayarak TrioTrack'in özgün hibrit yapısı (Buckwheat harçlık motoru + Zero bütçe tahsisi + Paisa istatistikleri) korundu; akıcı mikro animasyonlar ve yüksek stabilite sağlandı.

---

## [v1.5.7] - 2026-09-10 (Derleme: 2026.09.10)
### 🌟 Paisa, Zero & Buckwheat Hibrit Karşılama Akışı (Onboarding) & Geliştirici İmzası
- **Kapsamlı Karşılama Akışı Yenilendi (`OnboardingScreen.tsx`):**
  - **Slide 0 (Mimari Karşılama Hub'ı):** Paisa (Zengin Cüzdanlar & Bütçeleme), Zero (Alacak/Borç & %100 Çevrimdışı) ve Buckwheat (Akıllı Günlük Harçlık) felsefeleri vitrin kartlarıyla tanıtıldı. İlk ekranda hem "Sıfırdan Başla" hem de daha önce dışa aktarılmış yedekler için doğrudan "Zaten bir yedeğim var (Geri Yükle)" butonu eklendi.
  - **Slide 1 (Paisa "Verin, Kontrolün" Veri Güvencesi & Sorumluluk Listesi):** %100 yerel SQLite saklama, sıfır reklam/izleyici ve yerel yedekleme sorumluluğunu içeren interaktif onay kartları entegre edildi.
  - **Slide 2 (Zero "What should we call you?" Kişiselleştirme):** Dinamik baş harf avatar rozeti, isim girişi, canlı tema modu (Sistem, Açık, Koyu) ve arayüz tarzı (Material, Minimal, Dinamik) seçimleri sunuldu.
  - **Slide 3 (Paisa & Zero Çoklu Para Birimi Arama & Seçim Izgarası):** Arama filtreli, bayraklı ve sembollü zengin para birimi listesi eklendi.
  - **Slide 4 (Zero "Pick your categories" Kategori Seçimi):** İkonlu ve renkli kategori çipleriyle kullanıcının takip etmek istediği varsayılan kategorileri seçebilmesini sağlayan çoklu seçim mekanizması kuruldu.
  - **Slide 5 (Finansal Tercihler & Gelişmiş Modüller):**
    - Kullanıcının doğrudan talep ettiği **Hafta Başlangıcı Günü (Pazartesi vs Pazar)** seçimi ilk kurulum ekranına yerleştirildi.
    - **Buckwheat Maaş / Bütçe Döngü Başlangıç Günü (1, 5, 10, 15, 20, 25)** çipleri eklendi.
    - İlk cüzdan adı ve sıfırdan temiz başlangıç (0.00 TL) ayarlandı.
    - Borç/Alacak Takibi ve Kategori Bütçe Sınırları modül anahtarları entegre edildi.
  - **Slide 6 (Hazırlanıyor & Canlı Kurulum Geçişi):** Seçilen tüm tercihleri özetleyen zarif kart ve sorunsuz ana ekrana geçiş animasyonu oluşturuldu.
- **Ayarlar Ekranında Geliştirici & Marka İmzası (`SettingsScreen.tsx`):**
  - Ayarlar sayfasının en altına özel markalı kart eklendi: TrioTrack logosu, versiyon etiketi (`v1.5.7`), "Paisa • Zero • Buckwheat Hibrit Gücü" açıklaması.
  - "Geliştirici: Mehmet Şensoy" imzası ve doğrudan `https://github.com/mehmetsensoyme` profiline yönlendiren tıklanabilir GitHub butonu (`Linking.openURL`) entegre edildi.
- **Veri Katmanı Genişletmesi (`DataContext.tsx`):**
  - `completeOnboarding` fonksiyonuna `budgetCycleDay` ve `selectedCategoryIds` parametreleri eklenerek ilk kurulum tercihlerinin veri tabanına kalıcı olarak işlenmesi sağlandı.

---

## [v1.5.6] - 2026-09-10 (Derleme: 2026.09.10)
### 🚀 Bağımsız Çevrimdışı (Standalone Offline) Release APK Derlemesi
- Metro sunucusu bağımlılığı (`Unable to load script`) tamamen ortadan kaldırıldı.
- JavaScript ve TypeScript kod tabanı Metro/Hermes tarafından derlenerek doğrudan APK'nın `assets/` dizinine gömüldü (`assembleRelease`).
- Uygulama artık hiçbir bilgisayara veya Wi-Fi ağına ihtiyaç duymadan telefonda %100 yerel ve çevrimdışı çalışacak şekilde paketlendi.

---

## [v1.5.5] - 2026-09-10 (Derleme: 2026.09.10)
### 📊 APK Boyut Analizi & Mimari Ayrıştırma Raporu
- Üretilen debug APK dosyasının mimari ve kütüphane dağılımı detaylı olarak analiz edildi.
- 156 MB'lık debug APK boyutunun %84'ünün (143 MB) 4 farklı işlemci mimarisi (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) ve sıkıştırmasız debug C++ kütüphanelerinden kaynaklandığı tespit edildi.
- Release ve mimari bazlı üretimde (modern telefonlar için `arm64-v8a`) boyutun ~25-35 MB seviyesine düşürülebileceği belgelendi.

---

## [v1.5.4] - 2026-09-10 (Derleme: 2026.09.10)
### 🚀 Sıfır Temiz Başlangıç & Yerel Android Build Altyapısı
- **Sıfırdan Temiz Hesap & Bakiye Başlangıcı:**
  - Yeni hesap oluşturulduğunda veya karşılama ekranı tamamlandığında artık önceki demo hesaplar veya hayalet bakiyeler kesinlikle aktarılmaz. Kullanıcının oluşturduğu ilk hesap, belirlenen net bakiye (varsayılan 0.00 TL) ile başlar.
  - İlk kurulumda ve tüm verileri sıfırlama işlemlerinde işlemler, borçlar, abonelikler ve bütçeler tamamen boş (`[]`) olarak sıfır noktasından başlatılır.
- **Yerel Android Ortamı & Android Studio:**
  - `OpenJDK 17` ve `Android Studio` (/Applications/Android Studio.app) sisteme kuruldu.
  - `android-commandlinetools`, `platform-tools`, `platforms;android-35`, `build-tools;35.0.0` kuruldu ve tüm lisanslar onaylandı.
  - `~/.zshrc` içine `JAVA_HOME`, `ANDROID_HOME` ve `PATH` kalıcı olarak tanımlandı.
  - Projede yerel Android derleme altyapısı (`./android` dizini) `npx expo prebuild` ile üretildi.
- **Expo Go Log Açıklaması:**
  - `Native JSI SQLite bulunamadı (Expo Go)` uyarısının Expo Go'nun doğası gereği native WatermelonDB C++ modüllerini barındırmamasından kaynaklandığı ve yerel APK çıktısında tam native modda çalışacağı doğrulandı.

---

## [v1.5.3] - 2026-09-10 (Derleme: 2026.09.10)
### 🔄 Oturum Başlatma & Yerel Ortam Kontrolleri
- Proje açılış durumu doğrulandı, `npx tsc --noEmit` ile TypeScript tam tip güvenliği teyit edildi.
- Sistem Homebrew ve Java ortamı kontrol edildi; yerel Android SDK ve OpenJDK 17 kurulumu hazırlıkları tamamlandı.

---

## [v1.5.2] - 2026-09-10 (Derleme: 2026.09.10)
### 🔄 Oturum Kapanış Durumu & Yerel Derleme Yol Haritası
- Kod tabanı derleme kararlılığı `npx tsc --noEmit` ile 0 hata doğrulanarak mühürlendi.
- Bir sonraki oturum için yerel Android APK derleme adımları (OpenJDK 17 + Android SDK) planlandı.

---

## [v1.5.1] - 2026-09-10 (Derleme: 2026.09.10)
### 📦 Android APK Derleme Yapılandırması (EAS Build)
- `app.json` dosyasına Android paket kimliği (`package: "com.triotrack.app"`) ve sürüm kodu (`versionCode: 1`) tanımlandı.
- Bağımsız `.apk` çıktısı üretecek `eas.json` yapılandırma profili (`preview` ve `production` -> `buildType: "apk"`) oluşturuldu.
- `package.json` içine `npm run build:apk` script'i eklendi.

---

## [v1.5.0] - 2026-09-10 (Derleme: 2026.09.10)
### 🚀 Yenilikler ve Eklenen Özellikler (Paisa, Zero & Buckwheat Hibriti)
- **Buckwheat Maaş / Bütçe Döngü Başlangıç Günü:**
  - Ayın 1'ine bağımlı kalmadan, maaş veya harcama döngüsünün başladığı günü seçme desteği (`budgetCycleDay`: 1-28).
  - Günlük limit ve kalan bütçe günleri seçilen maaş gününe göre dinamik olarak döngüsel hesaplanır.
- **Buckwheat Canlı Durum Bildirim Rozeti:**
  - Ana sayfadaki Buckwheat kartında akıllı durum rozeti ("Mükemmel! Güvenli limit bölgesindesiniz", "Bugünkü limite yaklaştınız", "Limit Aşıldı").
  - Ay sonu harcama projeksiyonu ve harcama temposu uyarısı.
- **Paisa JSON Tam Yedekleme & Geri Yükleme Hub'ı:**
  - `SettingsScreen` üzerinden tek dokunuşla tüm verileri (işlemler, hesaplar, kategoriler, bütçeler, borçlar, abonelikler) JSON formatında dışa aktarma (`Share.share`).
  - Dahili JSON geri yükleme modalı (`showImportModal`) ile yedekten eksiksiz geri yükleme.
  - Aylık Bütçe Hedefi düzenleme modalı (`showGoalModal`) ve Biyometrik / Uygulama Kilidi ayar anahtarı.
- **Zero & Paisa İşlem Detay ve Not Düzenleme Müfettişi:**
  - Ana sayfada ve arama sonuçlarında herhangi bir işleme dokunulduğunda açılan detaylı `TransactionDetailModal`.
  - Tutar, kategori rozeti, kaynak/hedef hesap akışı, tarih ve anlık not düzenleme (`editTransaction`) desteği.
- **Zero Sıfır Tabanlı Bütçe Dağıtım Kartı (Zero-Based Budgeting):**
  - "Bütçeler" sekmesinde toplam hedef, tahsis edilen kategori limitleri ve boşta kalan tutar göstergesi.
  - Tüm para tahsis edildiğinde beliren `✓ Zero-Budgeted` rozeti.
- **Net Değer (Net Worth) KPI Hub'ı:**
  - "Cüzdanlar" sekmesinde Toplam Varlıklar, Kalan Borç Yükü ve Bekleyen Alacakları sentezleyen canlı Net Finansal Değer kartı.
- **Zero Borç Vade Takvimi & Gecikme Uyarıları:**
  - Borç ekleme ekranında hızlı vade butonları (`+15`, `+30`, `+60`, `+90 Gün`) ve özel tarih girişi.
  - Borç kartlarında dinamik vade tarihi ve süresi geçen borçlar için kırmızı "Vadesi Geçti!" ikaz etiketi.

---

## [v1.3.0] - 2026-09-10 (Derleme: 2026.09.10)
### 🚀 Yenilikler ve Eklenen Özellikler (Paisa, Zero & Buckwheat Hibriti)
- **Paisa 2x2 "Genel Bakış" Hub Kartları:**
  - Ana sayfada Bütçeler, Varlıklar/Cüzdanlar, Borçlar ve Finansal Raporlar için modüler, dokunmatik 2x2 grid yapısı eklendi.
- **Transfer İşlem Desteği (Paisa):**
  - Gider ve Gelir sekmelerine ek olarak "Transfer" sekmesi eklendi.
  - Kaynak ve Hedef cüzdan seçimi ile cüzdanlar arası bakiye aktarımı doğrudan `addTransaction` ve `deleteTransaction` seviyesinde entegre edildi.
  - Transfer işlemleri için mor renkli `#7C3AED` kategori ve çift yönlü ok (`↔`) rozeti tanımlandı.
- **Dahili Hesap Makinesi (Paisa & Buckwheat):**
  - Tutar girişinde `calc` ikonuna basıldığında açılan interaktif pop-up hesap makinesi eklendi (`+ - × ÷ AC DEL =`).
  - Matematiksel ifadeyi canlı hesaplayıp doğrudan tutar alanına aktarma özelliği.
- **Zero 4'lü Borç & Alacak Kategorizasyonu:**
  - Borçlar ekranına Zero uygulamasından esinlenilen 4 temel kategori entegre edildi:
    1. Kişi (`person`)
    2. Kredi Kartı (`credit_card`)
    3. Taksit / EMI (`emi`)
    4. Banka Kredisi (`loan`)
  - Borç ekleme modalında kategori rozetleri ve liste kartlarında renkli etiketler sağlandı.
- **Zero Ay ve Yıl Seçici Modal (3x4 Matris):**
  - Ana sayfada ve Raporlar ekranında yer alan dönem hapı (`Eylül 2026 ▾`) ile açılan dinamik yıl değiştirici ve 12 aylık ızgara seçici modal eklendi.
  - Seçilen ay (`selectedMonth`) global context üzerinden tüm ekranlarda (ana sayfa, bütçeler, raporlar) senkronize hale getirildi.
- **Paisa Hızlı Bakış Finansal Metrikleri:**
  - Raporlar ekranında: Tasarruf Oranı (%), Günlük Ortalama Harcama, Toplam İşlem Sayısı, Lider Kategori ve Ayın En Büyük Tekil Gideri kartları.
  - Kategori Dağılım Çubukları ve Son 7 Günlük Trend Sütunları grafikleri.

### 🛡️ İyileştirmeler ve Hata Düzeltmeleri
- **TrioTrack Minimalist Kontrast Düzeltmesi:**
  - Minimalist (Zero) temasında beyaz üzeri beyaz yazı veya buton sorunu `colors.onPrimary` kontrast kuralı ile tamamen giderildi.
- **Güvenli Alan (Navbar / Status Bar Padding):**
  - Ekranın altındaki sistem navigasyon şeridi (gesture bar) ve üst bildirim çubuğu (notch / status bar) için `useSafeAreaInsets` ile dinamik uyum sağlandı.
- **Veri Güvenliği & Sıfır Veri Kaybı:**
  - AsyncStorage tabanlı yerel persistence yapısı tüm transfer, borç kategorisi ve ay seçimi alanlarıyla geriye dönük %100 uyumlu tutuldu.
- **Kod Tabanı Sağlığı:**
  - TypeScript tam denetimi (`npx tsc --noEmit`) 0 hata ile doğrulandı.
  - Metro Bundler (1450 modül) temiz şekilde derlendi.

---

## [v1.2.0] - 2026-09-09
- Çoklu para birimi seçimi (20+ global para birimi).
- Tipografi ve yazı boyutu çarpanı (Küçük, Normal, Büyük).
- 3 farklı tasarım karakteri: Material You, TrioTrack Minimalist (Zero), Buckwheat Sıcak Turuncu.
- Dinamik hafta başlangıcı seçimi (Pazartesi / Pazar) karşılama ve ayarlar ekranlarına entegre edildi.

---

## [v1.1.0] - 2026-09-08
- Onboarding karşılama sihirbazı.
- Buckwheat Akıllı Günlük Bütçe algoritması.
- WatermelonDB ve mock/AsyncStorage hibrit veri katmanı.

---

## [v1.0.0] - 2026-09-07
- TrioTrack ilk yayın.
