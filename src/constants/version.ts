export const APP_VERSION = '1.6.6';
export const APP_BUILD = '2026.09.11';
export const APP_NAME = 'TrioTrack';
export const APP_DESCRIPTION = 'Paisa, Zero ve Buckwheat mimarilerini birleştiren akıllı kişisel finans ve bütçe yöneticisi';

export type ChangeType = 'feature' | 'design' | 'fix' | 'core' | 'ai';

export interface ChangelogItem {
  id: string;
  type: ChangeType;
  typeLabel: string;
  title: string;
  description: string;
}

export interface VersionRelease {
  version: string;
  buildDate: string;
  title: string;
  isLatest?: boolean;
  summary: string;
  items: ChangelogItem[];
}

export const CHANGELOG_HISTORY: VersionRelease[] = [
  {
    version: '1.6.6',
    buildDate: '11 Eylül 2026',
    title: 'Tek Standart Header Mimarisi & Hızlı Modül Yönetimi',
    isLatest: true,
    summary: 'Tüm sekmelerdeki başlık ve aksiyon çubukları tek bir standart görsel dilde birleştirildi, cüzdan ve borç defterine hızlı kayıt butonları eklendi.',
    items: [
      {
        id: '166-1',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Tüm Sekmelerde Birleşik Standart Header (Birinci Sınıf UI)',
        description: 'Ana Sayfa, Cüzdan & Bütçe, Borçlar ve Raporlar sekmelerindeki başlık alanları; 44x44 piksellik modül rozetleri, 18px standart başlık boyutu ve bağlamsal hap butonlarıyla tek bir görsel dilde birleştirildi.'
      },
      {
        id: '166-2',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Borç & Alacak İçin Yepyeni Modül Başlığı ve Hızlı Ekleme',
        description: 'Borç & Alacak sekmesindeki eksik başlık giderilerek People rozeti, aktif kişi sayacı ve tek dokunuşla borç/alacak ekleme (+) ve ayarlar (⚙️) butonları entegre edildi.'
      },
      {
        id: '166-3',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Finansal Analiz & Raporlar İçin Optimize Header ve Ay Seçici',
        description: 'Rapor ekranındaki orantısız başlık revize edildi; Pie Chart rozeti, ana sayfayla tam uyumlu kompakt ay seçici hap butonu ve sağ ayarlar kısayolu yerleştirildi.'
      },
      {
        id: '166-4',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Cüzdan & Bütçe Headerına Hızlı Hesap Ekleme Butonu',
        description: 'Hesaplar sekmesi başlığında doğrudan hesap açmayı sağlayan (+) butonu ve ayarlar kısayolu tek bir aksiyon grubunda buluşturuldu.'
      }
    ]
  },
  {
    version: '1.6.5',
    buildDate: '11 Eylül 2026',
    title: 'Kalıcı Tema Hafızası & Gelişmiş Değişiklik Günlüğü',
    summary: 'Cihaz beklemedeyken temanın sıfırlanması giderildi, tek bakışta kapanan akıllı bildirim rozeti ve ilk sürümlerden itibaren tüm sürüm geçmişi eklendi.',
    items: [
      {
        id: '165-1',
        type: 'fix',
        typeLabel: 'DÜZELTME',
        title: 'Kalıcı Tema & Tipografi Hafızası (AsyncStorage)',
        description: 'Cihaz uzun süre beklemede kaldığında veya arka plandan yeniden bağlandığında seçilen tema (Paisa, Zero, Buckwheat), tema modu (Aydınlık / Koyu) ve yazı tipinin (Modern, Klasik, Kod) sistem varsayılanına sıfırlanması sorunu yerel depolama katmanıyla kalıcı olarak çözüldü.'
      },
      {
        id: '165-2',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Akıllı Sürüm Bildirim Rozeti (Seen/Unseen)',
        description: 'Ana ekrandaki "Neler Yeni?" butonu artık sadece yeni bir güncelleme geldiğinde görünür. Bir kez incelendikten sonra ana ekrandan temizlenir, geçmişe Ayarlar menüsünden her zaman ulaşılabilir. Yeni bir güncelleme yaptığınızda otomatik olarak tekrar aktifleşir.'
      },
      {
        id: '165-3',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Metin Kaymalarını Önleyen Kararlı Tipografi Kartları',
        description: 'Farklı yazı tipi ve boyut seçimlerinde (Kompakt / Geniş) satırların birbiri üzerine binmesi ve kayması sorunu, dinamik satır yüksekliği ve sabit simgeli kart mimarisiyle tamamen düzeltildi.'
      },
      {
        id: '165-4',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'İlk Sürümlerden İtibaren Tam Sürüm Geçmişi',
        description: 'v1.0.0 çekirdek sürümünden bugüne kadar geliştirilen tüm yenilikler, mimari sıçramalar ve hata düzeltmeleri interaktif sürüm seçici sekmeleriyle değişiklik günlüğüne entegre edildi.'
      }
    ]
  },
  {
    version: '1.6.4',
    buildDate: '10 Eylül 2026',
    title: 'Android Status Bar Bütünlüğü & 6. Adım (Finansal Hedefler)',
    summary: 'Durum çubuğu karartma kesintisi giderildi, garantili modal kapanışı ve 5 hibrit finansal hedef entegre edildi.',
    items: [
      {
        id: '164-1',
        type: 'fix',
        typeLabel: 'DÜZELTME',
        title: 'Android Status Bar & Modal Karartma Bütünlüğü',
        description: 'Android cihazlarda pencereler (Modal) açıldığında üst durum çubuğunun beyaz kalarak karartmayı kesmesi sorunu tüm 22 modala statusBarTranslucent={true} eklenerek kökten çözüldü.'
      },
      {
        id: '164-2',
        type: 'fix',
        typeLabel: 'DÜZELTME',
        title: 'Garantili Arka Plan Dokunarak Kapanış (Backdrop Dismiss)',
        description: 'Arka plan boşluğuna dokunulduğunda Android dokunma algılayıcısının (hit-testing) ıskalamasını önleyen in-flow TouchableOpacity mimarisi ile tüm modallar %100 güvenilir şekilde kapatılabilir hale getirildi.'
      },
      {
        id: '164-3',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: '6. Adım: Para Birimi & 5 Hibrit Finansal Hedef',
        description: 'Canlı bakiye önizleme kartı, 6 popüler para birimi çipi, 20+ dünya para birimi akordeon listesi, 5 öncelikli finansal hedef kartı ve 4 seviyeli aylık birikim oranı seçimi.'
      }
    ]
  },
  {
    version: '1.6.3',
    buildDate: '10 Eylül 2026',
    title: 'Tamamen Şeffaf Üst Navigasyon & Kararlı Alt Bar',
    summary: 'İçeriğin şeffaf butonların altından aktığı modern yüzen gezinme yapısı.',
    items: [
      {
        id: '163-1',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Şeffaf Yüzen Üst Navigasyon Barı',
        description: 'Karşılama ekranında üst Geri ve Atla butonları şeffaf ve dokunma geçirgen (pointerEvents="box-none") yapıya getirilerek içeriğin arkalarından kesintisiz akması sağlandı.'
      },
      {
        id: '163-2',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Kararlı ve Sabit Alt Buton Barı',
        description: 'Alt gezinme çubuğu (İLERİ butonu ve adım göstergesi) orijinal, sabit ve taşmayan yapısıyla ekranın alt kısmında korundu.'
      },
      {
        id: '163-3',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Etkileşimli Profil Fotoğrafı Dairesi',
        description: 'Profil dairesinin altındaki mükerrer metin butonu kaldırılarak doğrudan daireye dokunarak seçim yapılması sağlandı.'
      }
    ]
  },
  {
    version: '1.6.2',
    buildDate: '10 Eylül 2026',
    title: 'Kamera / Galeri Profil Fotoğrafı & Canlı Tipografi',
    summary: 'Cihazdan profil fotoğrafı seçimi, 6 tematik hazır avatar rozeti ve canlı yazı tipi kontrolleri.',
    items: [
      {
        id: '162-1',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Kamera ve Galeriden Profil Fotoğrafı Yükleme',
        description: 'Kullanıcıların cihaz galerisinden veya kameradan kendi profil fotoğraflarını yükleyip kırpabilmesi ve profil dairesine bağlayabilmesi sağlandı.'
      },
      {
        id: '162-2',
        type: 'design',
        typeLabel: 'TASARIM',
        title: '6 Tematik Karakter Avatar Rozeti',
        description: 'Soluk ve cansız duran emoji yerine Finansör, Gizlilik, Enerjik, Girişimci, Minimalist ve Vizyoner hazır tematik rozetleri oluşturuldu.'
      },
      {
        id: '162-3',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Yazı Tipi & Boyutu Seçimi (Modern, Klasik, Kod)',
        description: 'Sans-serif, Serif/Georgia ve Monospace/Menlo yazı tipi aileleri ile Kompakt, Standart ve Geniş punto ölçeklendirmesi uygulamaya entegre edildi.'
      }
    ]
  },
  {
    version: '1.6.1',
    buildDate: '10 Eylül 2026',
    title: 'TrioTrack Mobius Logosu & Modern Bottom Sheet Modalları',
    summary: 'Resmi marka kimliği, felsefi manifesto ve modern alt çekmece pencereleri.',
    items: [
      {
        id: '161-1',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Resmi TrioTrack Mobius / Sonsuzluk Logosu',
        description: 'Üç uygulamanın uyumunu simgeleyen yüksek çözünürlüklü marka logosu karşılama ekranı başlığının üstüne yerleştirildi.'
      },
      {
        id: '161-2',
        type: 'core',
        typeLabel: 'ÇEKİRDEK',
        title: '3 Uygulamanın Felsefi Manifestosu',
        description: 'Paisa (Görsel Güç), Zero (Sıfır Tabanlı Bütçe) ve Buckwheat (Günlük Harçlık Disiplini) yaklaşımlarının sentezini özetleyen vizyon metni oluşturuldu.'
      },
      {
        id: '161-3',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Modern Alt Çekmece (Bottom Sheet) Pencereleri',
        description: 'Masaüstü tarzı ortalanmış kutular yerine modern mobil alt çekmece (Bottom Sheet) pencereleri ve tutamaçları (sheet handle) uygulandı.'
      }
    ]
  },
  {
    version: '1.6.0',
    buildDate: '10 Eylül 2026',
    title: '7 Adımlı Hibrit Karşılama Akışı & Çok Kanallı Yedekleme',
    summary: 'Kapsamlı Onboarding mimarisi, Slate-200 aydınlık tema kontrastları ve anında giriş.',
    items: [
      {
        id: '160-1',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: '7 Adımlı Hibrit Karşılama Akışı (Onboarding)',
        description: 'Kullanıcıyı sıfırdan karşılayan, adımlı, bilgilendirici ve kişiselleştirilebilir yeni kurulum mimarisi hayata geçirildi.'
      },
      {
        id: '160-2',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Çok Kanallı Anında Yedekten Geri Yükleme Merkezi',
        description: 'JSON dosya seçici, panodan otomatik yapıştırma ve yerel depolama anlık görüntüsünden tek dokunuşla tam veri restorasyonu.'
      },
      {
        id: '160-3',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Aydınlık Tema Slate-200 Kenarlıklar & Canlı Vurgular',
        description: 'Aydınlık temada silik kalan tüm kartlar için net kenarlıklar, 2px aktif seçim vurguları ve dinamik renkli ikon kutuları tasarlandı.'
      },
      {
        id: '160-4',
        type: 'fix',
        typeLabel: 'DÜZELTME',
        title: 'Yapay Gecikmesiz Anında Ana Ekrana Geçiş',
        description: 'Onboarding bitiminde dönen gereksiz yükleme simgeleri ve yapay gecikmeler kaldırılarak ana ekrana anında geçiş sağlandı.'
      }
    ]
  },
  {
    version: '1.5.9',
    buildDate: '9 Eylül 2026',
    title: 'Kamera / Galeri Fiş OCR Motoru & CDN Marka Logoları',
    summary: 'Yapay zeka fiş ayrıştırma ve 35+ CDN marka logosu entegrasyonu.',
    items: [
      {
        id: '159-1',
        type: 'ai',
        typeLabel: 'YAPAY ZEKA',
        title: 'Akıllı Fiş & Fatura OCR Motoru',
        description: 'Kamera ve galeri üzerinden çekilen fişlerden mağaza ismi, toplam tutar, tarih ve fiş numarası otomatik olarak okunur.'
      },
      {
        id: '159-2',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: '35+ Popüler CDN Marka Logosu Kataloğu',
        description: 'Netflix, Spotify, Getir, Trendyol, Starbucks, Shell gibi markaların vektörel logoları ve çevrimdışı monogram yedekleme sistemi.'
      },
      {
        id: '159-3',
        type: 'design',
        typeLabel: 'TASARIM',
        title: 'Evrensel Modal Arka Plan Kapanışı',
        description: 'Pencerelerin karartılmış dış boşluğuna dokunulduğunda yumuşak animasyonla kapanma altyapısı eklendi.'
      }
    ]
  },
  {
    version: '1.5.8',
    buildDate: '8 Eylül 2026',
    title: 'Paisa & Zero Arama Modalı, Mahremiyet & Entegre Yönetim',
    summary: 'Gelişmiş arama, bakiye gizleme ve birleşik hesap & bütçe ekranı.',
    items: [
      {
        id: '158-1',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Paisa & Zero Çift Dilli Akıllı Arama',
        description: 'Tire, boşluk ve Türkçe/İngilizce karakter duyarsız anında arama, hesap ve işlem türüne göre filtreleme.'
      },
      {
        id: '158-2',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Mahremiyet (Bakiye Gizleme) Modu',
        description: 'Toplu taşımada veya halka açık alanlarda tek dokunuşla tüm hesap ve toplam bütçe rakamlarını gizleyen göz butonu.'
      },
      {
        id: '158-3',
        type: 'core',
        typeLabel: 'ÇEKİRDEK',
        title: 'Sıfır Bakiye İlkesi (Zero-Balance Logic)',
        description: 'Sıfır bakiyeli hesapların gereksiz eksiye düşürülmemesi ve sıfır tabanlı bütçeleme kurallarına tam uyum.'
      }
    ]
  },
  {
    version: '1.5.0',
    buildDate: '7 Eylül 2026',
    title: 'Buckwheat Harçlık Motoru & Borç / Alacak Defteri',
    summary: 'Dinamik günlük harçlık hesabı, borç takip modülü ve bütçe limitleri.',
    items: [
      {
        id: '150-1',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Buckwheat Günlük Harçlık Motoru',
        description: 'Maaş döngüsünün kalan günlerine göre günlük kullanılabilir harcama limitini dinamik yeniden hesaplayan algoritma.'
      },
      {
        id: '150-2',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Kapsamlı Borç & Alacak Takip Modülü',
        description: 'Kişi bazlı borç verme, borç alma, vade tarihi hatırlatması ve kısmi ödeme düşme yetenekleri.'
      },
      {
        id: '150-3',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Kategori Bazlı Bütçe İlerleme Çubukları',
        description: 'Aylık bütçe limitleri belirleme ve harcama durumuna göre renk değiştiren akıllı göstergeler.'
      }
    ]
  },
  {
    version: '1.0.0',
    buildDate: '1 Eylül 2026',
    title: 'TrioTrack Çekirdek Sürüm (Paisa + Zero + Buckwheat)',
    summary: 'Üçlü kişisel finans sentezinin çevrimdışı ve yerel SQLite/AsyncStorage ilk temeli.',
    items: [
      {
        id: '100-1',
        type: 'core',
        typeLabel: 'ÇEKİRDEK',
        title: 'Çevrimdışı ve Yerel Veri Güvenliği',
        description: 'Sunucu bağımlılığı olmadan tamamen kullanıcının cihazında çalışan, %100 gizlilik odaklı mimari.'
      },
      {
        id: '100-2',
        type: 'core',
        typeLabel: 'ÇEKİRDEK',
        title: 'Gelir, Gider ve Hesaplar Arası Transfer İşlemleri',
        description: 'Kategori bazlı harcama kaydı, nakit ve banka hesapları arasında bakiye transferleri.'
      },
      {
        id: '100-3',
        type: 'feature',
        typeLabel: 'ÖZELLİK',
        title: 'Çoklu Tema Motoru (Paisa, Zero, Buckwheat)',
        description: 'Kullanıcının dilediği görsel stili (Material You Mor, Minimalist Monokrom, Enerjik Turuncu) seçebilme esnekliği.'
      }
    ]
  }
];
