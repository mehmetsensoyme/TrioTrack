# 📘 TrioTrack — Kapsamlı Proje ve Mimari Dokümantasyonu

> **Sürüm:** 1.6.0  
> **Son Güncelleme:** 10 Eylül 2026  
> **Durum:** Aktif Geliştirme (Adım Adım İlerleme)

---

## 📑 İçindekiler
1. [Proje Vizyonu ve Hibrit Felsefe](#1-proje-vizyonu-ve-hibrit-felsefe)
2. [Ekran Akışı & Adım Adım Mimari](#2-ekran-akisi--adim-adim-mimari)
3. [Karşılama Ekranı & Çok Kanallı Yedekleme Sistemi](#3-karsilama-ekrani--cok-kanalli-yedekleme-sistemi)
4. [Veri Modeli ve Depolama Mimarisi](#4-veri-modeli-ve-depolama-mimarisi)
5. [OCR, CDN Marka Logoları ve Simge Kataloğu](#5-ocr-cdn-marka-logolari-ve-simge-katalogu)
6. [Animasyon ve Arayüz Altyapısı](#6-animasyon-ve-arayuz-altyapisi)
7. [Adım Adım Yol Haritası ve Değişiklik Günlüğü](#7-adim-adim-yol-haritasi-ve-degisiklik-gunlugu)

---

## 1. Proje Vizyonu ve Hibrit Felsefe

TrioTrack, modern açık kaynak kişisel finans dünyasının en güçlü ve sevilen üç uygulamasının en iyi taraflarını tek bir yerel, gizlilik odaklı mimaride harmanlar:

```mermaid
flowchart TD
    subgraph TrioTrack["🌟 TrioTrack Çekirdek"]
        P["🎨 Paisa: Zengin Cüzdanlar, Bütçeleme & Marka Rozetleri"]
        Z["🔒 Zero: Sıfır Tabanlı Bütçe, Alacak/Borç & %100 Çevrimdışı"]
        B["⚡ Buckwheat: Canlı Günlük Harçlık & Kalan Güne Dağıtım Motoru"]
    end
    P --> TrioTrack
    Z --> TrioTrack
    B --> TrioTrack
```

### 3 Temel Direk (The 3 Pillars)
* **Paisa:**
  * Modern Material You tasarım estetiği ve dinamik renk temaları.
  * Çoklu cüzdanlar (Nakit, Banka, Kredi Kartı, Birikim).
  * Kategori bazlı harcama limitleri ve bütçe ilerleme çubukları.
  * Dijital abonelik ve platform marka rozetleri (Netflix, Spotify, YouTube vb.).
* **Zero:**
  * Sıfır tabanlı bütçeleme (Zero-based budgeting) felsefesi.
  * %100 yerel ve çevrimdışı gizlilik (Veriler yalnızca cihazda saklanır, dışa sızmaz).
  * Gelişmiş vadeli borç/alacak ve kısmi ödeme takip sistemi.
  * Akıllı çift dilli (Türkçe & İngilizce) arama normalizasyonu.
* **Buckwheat:**
  * Dinamik günlük harçlık motoru.
  * Maaş veya bütçe döngü gününe kadar her gün ne kadar harcama yapılabileceğini anlık hesaplama.
  * Harcama yapılmadığında artan bütçeyi kalan günlere akıllıca paylaştırma modu (`split_to_rest_days`).

---

## 2. Ekran Akışı & Adım Adım Mimari

Uygulamanın ekran geçiş mimarisi React Navigation Native Stack ve Bottom Tabs ile yönetilir:

```mermaid
flowchart LR
    Onboarding["Onboarding (Karşılama 0-6)"] -->|İlk Kurulum Tamamlandı| MainTabs["Ana Sekmeler"]
    Onboarding -->|Yedek Geri Yükle| MainTabs
    
    subgraph MainTabs
        Home["🏠 Genel Bakış (Buckwheat + Paisa)"]
        Reports["📊 Raporlar (Zero Analitik)"]
        AddBtn["➕ Hızlı İşlem Ekle (OCR & Hesap Makinesi)"]
        Wallets["💼 Cüzdanlar & Bütçeler"]
        Debts["🤝 Borç & Alacak (Zero)"]
    end
    
    Home --> Settings["⚙️ Ayarlar & Çok Kanallı Yedekleme"]
```

---

## 3. Karşılama Ekranı, Bottom Sheet Mimarisi & Çok Kanallı Yedekleme

### 3.1. Karşılama Ekranı (Slide 0) Tasarımı
* **Resmi TrioTrack Logosu:**
  * Paisa (Viyolet/İndigo), Zero (Zümrüt Yeşili) ve Buckwheat (Kehribar Altın) kimliklerini temsil eden 3 boyutlu sonsuzluk (mobius) app ikonu üretildi ve `assets/triotrack_logo.png` olarak başlığın üstüne eklendi.
* **Hibrit Sentez Manifestosu:**
  * *"Paisa'nın zengin cüzdan estetiği, Zero'nun sıfır tabanlı gizlilik disiplini ve Buckwheat'in akıllı günlük harçlık zekası tek bir kusursuz deneyimde buluştu."*
* **3 Temel Direk Kartları:** Paisa, Zero ve Buckwheat kartları yumuşak renk tonları ve net açıklamalarla konumlandırıldı.
* **"Zaten bir yedeğim var (Geri Yükle)" Butonu:** Ekranın alt kısmında kullanıcıyı karşılar ve tek dokunuşla Bottom Sheet açar.

### 3.2. Ekranla Bütünleşik Modern Bottom Sheet (Alt Çekmece) Mimarisi
Eski masaüstü tarzı, ekranın tam ortasında beliren ve mobil hissi vermeyen kutu şeklindeki pencereler yerine **Modern Mobil Bottom Sheet Standartları** getirildi:
* **Ekran Bütünlüğü:** Ekranın tabanına oturan (`justifyContent: 'flex-end'`), üst köşeleri yumuşakça yuvarlatılmış (`borderTopLeftRadius: 28, borderTopRightRadius: 28`) tasarım.
* **Çekme Tutamacı (Sheet Handle):** Pencerenin tepesinde minimalist tutamaç çubuğu (pill bar).
* **Güvenli Alan (Safe Area):** Cihazın alt bar/çentik yüksekliğine (`insets.bottom`) dinamik uyum.
* **Doğal Kapanış:** Boş alana dokunulduğunda (`TouchableWithoutFeedback`) veya kapat butonuna basıldığında ekranın altına kayarak kapanma.
* **Uygulanan Ekranlar:** Hem `OnboardingScreen` (Yedek Geri Yükleme) hem de `SettingsScreen` (Hedef Belirleme, Yedek Alma, Yedek Yükleme).

### 3.3. Çok Kanallı Yedekleme & Geri Yükleme Motoru (`backupService.ts`)
Yedekleme sistemi tek bir metin kutusundan çıkarılmış, hem karşılama ekranında hem de ayarlar ekranında **4 farklı kanala** kavuşturulmuştur:

| Kanal | Teknoloji | Açıklama |
|---|---|---|
| 📁 **Cihazdan .json Dosyası Seç** | `expo-document-picker` + `expo-file-system` | Telefonun dosya yöneticisinden `.json` yedeğini tek dokunuşla seçip okuma. Google Drive, iCloud, İndirilenler doğrudan seçilebilir. |
| 📋 **Panodan Yapıştır (Tek Dokunuş)** | `expo-clipboard` | Kopyalanan JSON metnini otomatik algılayıp doğrulama. |
| 💾 **Cihazdaki Son Yerel Snapshot** | `AsyncStorage` (`@triotrack_local_snapshot`) | Cihaz hafızasında saklanan son güvenli kopyayı tarih ve işlem sayısıyla listeleme. |
| ✏️ **Manuel JSON Metni** | Çok satırlı `TextInput` | İleri düzey kullanıcılar için doğrudan kod yapıştırma/düzenleme alanı. |

### 3.4. Google Drive & Bulut Yedekleme Analizi: Maliyet ve Seçenekler

#### Google Drive API'si Ücretli mi? (Para Ödemek Gerekir mi?)
* **Cevap: HAYIR, tamamen ÜCRETSİZDİR (0 TL).**
* **Neden Ücretsiz?**
  1. **Google Cloud Platform (GCP) Ücretsiz Kotası:** Google Drive API çağrıları için geliştiriciden ücret talep etmez. Kişisel veya topluluk odaklı bir uygulamanın günde alacağı yedekler, GCP'nin ücretsiz kota tavanının %0.001'ine bile ulaşamaz.
  2. **Kullanıcı Başına Depolama:** Yedeklenen dosyalar geliştiricinin sunucusunda değil, **kullanıcının kendi kişisel Google Drive hesabında** durur. Her Google kullanıcısının 15 GB ücretsiz Drive kotası vardır. TrioTrack yedek dosyaları ise yalnızca **50 KB - 300 KB** (1 MB'ın bile çok altında) boyutundadır.
  3. **Hazır ve Sıfır Konfigürasyonlu Zaten Çalışan Yöntem:** TrioTrack'teki `expo-document-picker` ile "Cihazdan .json Dosyası Seç" veya Paylaş butonu tıklandığında, telefonun yerel dosya yöneticisi açılır. Android ve iOS sistem dosya yöneticisinde **Google Drive ve iCloud Drive** varsayılan olarak zaten vardır! Dolayısıyla hiçbir Google Cloud API kurulumu yapmadan bile kullanıcı dosyayı Google Drive'ına kaydedebilir veya oradan seçebilir.

### 3.5. Kullanıcı Profili, Fotoğraf/Avatar ve Tipografi Kişiselleştirmesi (Slide 2)

* **Kullanıcı Fotoğrafı Yükleme Mimarisi:**
  * Kullanıcı avatar alanına dokunduğunda açılan Bottom Sheet üzerinden **Galeriden Fotoğraf Seçme** veya **Kamera ile Çekme** imkanı (`expo-image-picker`).
  * Fotoğraflar 1:1 kare formatında kırpılır, cihazda yerel olarak saklanır (`@triotrack_user_avatar`).
* **Ham Emoji Sorununun Çözümü & Mor/Tüm Temalarda Kusursuz Kontrast:**
  * Eski `'👤'` ham emojisi kaldırıldı. Mor temada veya açık/koyu modlarda soluk ve yapay duran emoji yerine;
    1. Yüklenen gerçek kullanıcı fotoğrafı,
    2. Veya seçilen şık hazır avatar rozeti,
    3. Veya ismin baş harfinden oluşan zarif monogram harf (`colors.onPrimary`),
    4. Veya yüksek kontrastlı Ionicons vektör silüeti gösterilir.
* **6 Hazır Karakter & Rozet Stili (`avatarUtils.ts`):**
  * Fotoğraf yüklemek istemeyen kullanıcılar için tek dokunuşla seçilebilen 6 özel tematik avatar:
    * 💼 **Finansör** (`#6750A4`)
    * 🛡️ **Gizlilik** (`#009688`)
    * 🔥 **Enerjik** (`#F29F05`)
    * 🚀 **Girişimci** (`#3F51B5`)
    * 🌿 **Minimalist** (`#4CAF50`)
    * ⭐ **Vizyoner** (`#E91E63`)
* **Yazı Tipi (Tipografi) ve Yazı Boyutu Ayarları:**
  * **Modern (Sans-Serif):** Günlük, temiz, çağdaş arayüz fontu.
  * **Klasik (Serif / Georgia):** Prestijli, dengeli, geleneksel finans fontu.
  * **Teknik (Monospace / Menlo):** Kodlama ve sayısal veri odaklı finansal font.
  * **Yazı Boyutu:** Kompakt (%85), Standart (%100), Geniş (%120).
* **Evrensel Senkronizasyon:**
  * Seçilen avatar ve yazı tipi Onboarding sonrasında hem **Ayarlar (`SettingsScreen`)** profil kartında hem de **Cüzdanlar & Bütçeler (`AccountsBudgetsScreen`)** selamlama başlığında anında canlı olarak görünür.

---

## 4. Veri Modeli ve Depolama Mimarisi

Tüm veriler cihaz üzerinde yerel olarak saklanır.

### Temel Varlıklar (Entities)
1. **Transaction (İşlem):**
   * `id`, `title`, `amount`, `type` (`expense` | `income` | `transfer`)
   * `categoryId`, `accountId`, `toAccountId`
   * `date` (YYYY-MM-DD), `note`
   * `receiptImage`, `receiptNo` (OCR fiş belgesi)
   * `customIcon`, `customColor`, `brandLogoUrl` (CDN logoları)
2. **Account (Hesap / Cüzdan):**
   * `id`, `name`, `type` (`cash` | `bank` | `card` | `savings`), `balance`, `color`, `icon`
3. **Category (Kategori):**
   * `id`, `name`, `icon`, `color`, `type`
4. **CategoryBudget (Bütçe):**
   * `categoryId`, `limit`
5. **Debtor (Borç & Alacak):**
   * `id`, `name`, `amount`, `type` (`debt` | `credit`), `debtCategory`, `dueDate`, `payments[]`
6. **BuckwheatMetrics (Harçlık Motoru):**
   * `dailyBudget`, `todayRemaining`, `daysRemainingInCycle`, `recalcMode`

---

## 5. OCR, CDN Marka Logoları ve Simge Kataloğu

### 5.1. Akıllı Fiş & Fatura OCR Motoru
* `expo-image-picker` ile gerçek kamera çekimi veya galeriden belge seçme.
* Canlı lazer tarama animasyonu.
* **OCR Space API** + **Yerel Heuristik Regex Motoru**:
  * Fiş üzerindeki mağaza adı, toplam tutar, tarih ve fiş numarası otomatik tespit edilir.
  * İlgili kategori ve marka logosu otomatik atanır.

### 5.2. Popüler Markalar CDN Kataloğu
* Popüler markaların (Netflix, Spotify, Getir, Trendyol, Starbucks, Shell vb.) vektörel/CDN logoları.
* Akıllı Fallback: Görsel yüklenemezse veya çevrimdışıysa otomatik monogram rozet (örn. Netflix 'N') veya Ionicons devreye girer.

### 5.3. 13 Zengin Kategori & Çift Dilli Arama (Paisa & Zero)
* 13 kategori grubu: *Abonelik & Medya, Yemek & Kafe, Fatura & Ev, Ulaşım, Alışveriş, Finans, Sağlık, Eğlence, İş/Eğitim, Ev, Evcil Hayvanlar, Doğa, İletişim*.
* Zero tarzı akıllı arama algoritması (`searchPaisaIcons`): Tire, boşluk ve Türkçe/İngilizce karakter duyarsız anında arama.
* Yatay kaydırılabilir kategori filtre çipleri (Pills).
* "Daha fazla / Daha az" dinamik genişletme düğmesi.

---

## 6. Animasyon ve Arayüz Altyapısı

> [!IMPORTANT]
> **Sorunsuz ve Kararlı Animasyon İlkesi:**  
> Kullanıcının "yeter ki sorunsuz olsun, stabil olsun" ilkesi doğrultusunda; React 19 ve Expo SDK 57 ile uyumsuzluk veya APK derleme hataları (Hermes JSI crash) yaratabilecek aşırı karmaşık kütüphaneler yerine, **Donanım Hızlandırmalı (Hardware Accelerated) Yerel Sürücü (`useNativeDriver: true`)** ve **`LayoutAnimation`** altyapısı tercih edilmiştir.

### Kullanılan Kararlı Animasyonlar:
1. **Lazer Tarama Animasyonu:** OCR ekranında 60/120fps native thread üzerinde çalışan `Animated.loop` tarama efekti.
4. **Evrensel Modal Kapanışı (Backdrop Dismiss):** Tüm modalların siyah/saydam boş alanına dokunulduğunda (`TouchableWithoutFeedback`) anında ve yumuşak kapanma.
5. **Şeffaf Yüzen Üst Bar & Gömülü Alt Navigasyon (Transparent Floating Top & Embedded Bottom Bar):** Onboarding ekranında üst 'Geri' ve 'Atla' alanı tamamen şeffaf ve havada yüzen yapıda bırakılırken; alt navigasyon çubuğu (adım noktaları ve 'İleri/Başla' butonu) doğrudan kaydırılabilir sayfa içeriğine gömülü (`embedded`) hale getirilmiştir. Bu sayede form öğeleri ve kartlar hiçbir zaman alt butonlar tarafından örtülmez; kullanıcı seçenekleri inceleyip aşağı indikçe butonlar doğal bir şekilde formun en altında belirir.

---

## 7. Adım Adım Yol Haritası ve Değişiklik Günlüğü

```mermaid
flowchart TD
    Step1["✅ 1. Adım: Veritabanı & Sıfır Bakiye Düzeltmesi"]
    Step2["✅ 2. Adım: Simge Kataloğu & 13 Kategori Sentezi"]
    Step3["✅ 3. Adım: Karşılama Ekranı (Slide 0) & Çok Kanallı Yedek"]
    Step4["✅ 4. Adım: Özellik Turu (Slide 1) Onayı"]
    Step5["✅ 5. Adım: Kişiselleştirme, Fotoğraf & Tipografi & Gömülü Alt Bar (Slide 2)"]
    Step6["⏳ 6. Adım: Para Birimi & Finansal Hedef (Slide 3)"]
    Step7["⏳ 7. Adım: Varsayılan Cüzdanlar & Bakiyeler (Slide 4)"]
    Step8["⏳ 8. Adım: Buckwheat Harçlık Motoru Kurulumu (Slide 5)"]
    
    Step1 --> Step2 --> Step3 --> Step4 --> Step5 --> Step6 --> Step7 --> Step8
```

### Değişiklik Günlüğü (Changelog):
* **v1.6.3 (10 Eylül 2026):**
  * **Gömülü Alt Navigasyon Çubuğu (Embedded In-Flow Bottom Bar):** Alt navigasyon alanı kaydırılabilir sayfa akışına doğrudan gömülü (`flexGrow: 1`, `justifyContent: 'space-between'`) hale getirildi. Uzun formlarda (Slide 2 gibi) butonlar sayfa içeriğinin üzerine binmez, en alta kaydırıldığında doğal olarak görünür.
  * **Tamamen Şeffaf Yüzen Üst Bar:** Üst 'Geri' ve 'Atla' buton alanı arka plansız ve şeffaf yapıda bırakıldı.
  * **Avatar Düğme Temizliği:** Profil fotoğrafı seçim dairesinin altındaki mükerrer metin butonu kaldırıldı.
* **v1.6.2 (10 Eylül 2026):**
  * **Kullanıcı Fotoğrafı Yükleme:** Onboarding 3. adım (Slide 2) ve Ayarlar ekranına `expo-image-picker` ile Galeri ve Kamera üzerinden profil fotoğrafı yükleme ve kırpma yeteneği eklendi.
  * **Ham Emoji Probleminin Çözümü:** Mor temada ve diğer seçeneklerde yapay/soluk duran `'👤'` emojisi kaldırıldı; yerine seçilen gerçek fotoğraf, 6 şık tematik avatar rozeti veya yüksek kontrastlı monogram harf getirildi.
  * **Hazır Karakter Rozetleri (`avatarUtils.ts`):** Finansör, Gizlilik, Enerjik, Girişimci, Minimalist ve Vizyoner olmak üzere 6 tematik hazır avatar seçeneği eklendi.
  * **Yazı Tipi (Tipografi) & Boyutu Seçimi:** Onboarding Slide 2'ye canlı font önizlemeli Modern (Sans-serif), Klasik (Serif/Georgia) ve Teknik (Monospace/Menlo) yazı tipi ile Kompakt/Standart/Geniş punto kontrolleri entegre edildi.
  * **Uygulama Geneli Canlı Senkronizasyon:** Profil avatarı ve yazı tipi ayarları hem Onboarding özet kartına (Slide 6), hem Ayarlar (`SettingsScreen`) ekranına, hem de Cüzdanlar (`AccountsBudgetsScreen`) selamlama başlığına bağlandı.
* **v1.6.1 (10 Eylül 2026):**
  * TrioTrack resmi sonsuzluk/mobius uygulama logosu üretildi ve Karşılama Ekranı (Slide 0) başlığının üstüne yerleştirildi.
  * Karşılama ekranına 3 uygulamanın felsefi birleşimini yansıtan ilham verici manifesto metni eklendi.
  * Karşılama ve Ayarlar ekranlarındaki tüm pencereler masaüstü tarzı yapay ortalanmış kutudan, modern mobil **Bottom Sheet (Alt Çekmece)** yapısına dönüştürüldü (`sheetHandle`, safe-area alt padding, pürüzsüz dokunarak kapanış).
  * Google Drive API maliyeti (0 TL, ücretsiz) ve bulut yedekleme alternatifleri dokümante edildi.
* **v1.6.0 (10 Eylül 2026):**
  * Karşılama ekranı başlığı sadeleştirildi.
  * Çok kanallı yedekleme ve geri yükleme servisi (`backupService.ts`) yazıldı.
  * Karşılama ve Ayarlar ekranlarına Cihaz Dosyası, Pano, Yerel Snapshot ve Manuel seçenekleri eklendi.
  * Zero ve Paisa formatlarını otomatik tanıyan akıllı normalizasyon motoru kuruldu.
* **v1.5.9:**
  * Paisa, Zero ve Buckwheat simge kütüphanesi sentezi tamamlandı (13 kategori, 270+ simge, çift dilli arama).
  * Evrensel modal backdrop dokunarak kapatma özelliği eklendi.
* **v1.5.8:**
  * Akıllı Fiş/Fatura OCR motoru ve canlı kamera desteği eklendi.
  * Popüler CDN marka logoları ve akıllı rozet fallback sistemi entegre edildi.
