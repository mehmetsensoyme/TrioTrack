/**
 * Paisa, Zero ve Buckwheat Mimarisinden İlham Alan
 * Kapsamlı ve Oturaklı Vektörel Simge Kütüphanesi
 * 
 * - Paisa: Estetik yuvarlak çip tasarımı ve Subscriptions & Streaming marka glifleri (Netflix 'N', Spotify, YouTube, Apple vb.)
 * - Zero: Lucide/Ionicons tabanlı zengin kategori mimarisi ve çift dilli (Türkçe & İngilizce) arama anahtar kelimeleri
 * - Buckwheat: Sadeliği, yüksek okunabilirliği ve gereksiz kalabalıktan arındırılmış net görsel dili
 */

export interface PaisaIconItem {
  id: string;
  icon: string; // Ionicons adı (100% geçerli glif)
  name: string; // Türkçe açıklayıcı adı
  englishName?: string;
  category: string;
  keywords: string[];
  isBrand?: boolean;
  monogram?: string; // Harf logoları (örn. Netflix 'N', Hulu 'h', Disney 'D+')
  brandColor?: string;
}

export interface PaisaCategoryGroup {
  id: string;
  name: string;
  englishName: string;
  icon: string; // Kategori sekme simgesi
  icons: PaisaIconItem[];
}

// 🌟 Paisa'nın Temel Çekirdek 6 Kategorisi (Hızlı & Günlük Kullanım)
export const PAISA_CORE_CATEGORIES: PaisaCategoryGroup[] = [
  {
    id: 'subscriptions',
    name: 'Abonelik & Medya',
    englishName: 'Subscriptions & Streaming',
    icon: 'play-circle-outline',
    icons: [
      { id: 'netflix', icon: 'play-circle', name: 'Netflix', monogram: 'N', brandColor: '#E50914', isBrand: true, category: 'subscriptions', keywords: ['netflix', 'dizi', 'film', 'sinema', 'streaming'] },
      { id: 'spotify', icon: 'musical-notes', name: 'Spotify', brandColor: '#1DB954', isBrand: true, category: 'subscriptions', keywords: ['spotify', 'müzik', 'şarkı', 'podcast', 'audio'] },
      { id: 'youtube', icon: 'logo-youtube', name: 'YouTube', brandColor: '#FF0000', isBrand: true, category: 'subscriptions', keywords: ['youtube', 'video', 'premium', 'yt'] },
      { id: 'apple', icon: 'logo-apple', name: 'Apple', brandColor: '#A2AAAD', isBrand: true, category: 'subscriptions', keywords: ['apple', 'itunes', 'icloud', 'app store', 'ios'] },
      { id: 'googleplay', icon: 'logo-google-playstore', name: 'Google Play', brandColor: '#00C3FF', isBrand: true, category: 'subscriptions', keywords: ['google', 'play store', 'android', 'uygulama'] },
      { id: 'twitch', icon: 'logo-twitch', name: 'Twitch', brandColor: '#9146FF', isBrand: true, category: 'subscriptions', keywords: ['twitch', 'yayın', 'stream', 'canlı'] },
      { id: 'patreon', icon: 'heart-circle', name: 'Patreon', monogram: 'P', brandColor: '#FF424D', isBrand: true, category: 'subscriptions', keywords: ['patreon', 'bağış', 'içerik', 'üyelik'] },
      { id: 'hulu', icon: 'tv', name: 'Hulu / HBO', monogram: 'h', brandColor: '#1CE783', isBrand: true, category: 'subscriptions', keywords: ['hulu', 'hbo', 'dizi', 'max'] },
      { id: 'vimeo', icon: 'logo-vimeo', name: 'Vimeo', brandColor: '#1AB7EA', isBrand: true, category: 'subscriptions', keywords: ['vimeo', 'video', 'kamera'] },
      { id: 'media_player', icon: 'play-forward', name: 'Medya Oynatıcı', category: 'subscriptions', keywords: ['player', 'video', 'oynatıcı', 'film'] },
      { id: 'soundcloud', icon: 'logo-soundcloud', name: 'SoundCloud', brandColor: '#FF5500', isBrand: true, category: 'subscriptions', keywords: ['soundcloud', 'ses', 'müzik', 'parça'] },
      { id: 'steam', icon: 'logo-steam', name: 'Steam', brandColor: '#171A21', isBrand: true, category: 'subscriptions', keywords: ['steam', 'oyun', 'valve', 'pc', 'gaming'] },
      { id: 'playstation', icon: 'logo-playstation', name: 'PlayStation', brandColor: '#003791', isBrand: true, category: 'subscriptions', keywords: ['playstation', 'psn', 'sony', 'ps5', 'ps4'] },
      { id: 'xbox', icon: 'logo-xbox', name: 'Xbox', brandColor: '#107C10', isBrand: true, category: 'subscriptions', keywords: ['xbox', 'microsoft', 'game pass', 'konsol'] },
      { id: 'amazon_prime', icon: 'logo-amazon', name: 'Amazon Prime', brandColor: '#00A8E1', isBrand: true, category: 'subscriptions', keywords: ['amazon', 'prime', 'prime video'] },
      { id: 'discord', icon: 'logo-discord', name: 'Discord', brandColor: '#5865F2', isBrand: true, category: 'subscriptions', keywords: ['discord', 'nitro', 'sohbet', 'sesli'] },
      { id: 'twitter', icon: 'logo-twitter', name: 'X / Twitter', brandColor: '#1DA1F2', isBrand: true, category: 'subscriptions', keywords: ['twitter', 'x', 'sosyal', 'tweet'] },
      { id: 'disney', icon: 'sparkles', name: 'Disney+', monogram: 'D+', brandColor: '#113CCF', isBrand: true, category: 'subscriptions', keywords: ['disney', 'marvel', 'animasyon', 'star wars'] },
    ]
  },
  {
    id: 'food',
    name: 'Yemek & Kafe',
    englishName: 'Food & Dining',
    icon: 'restaurant-outline',
    icons: [
      { id: 'restaurant', icon: 'restaurant', name: 'Restoran & Yemek', category: 'food', keywords: ['yemek', 'restoran', 'lokanta', 'öğle', 'akşam', 'döner', 'kebap', 'food', 'dining'] },
      { id: 'cafe', icon: 'cafe', name: 'Kahve & Kafe', category: 'food', keywords: ['kahve', 'starbucks', 'çay', 'kafe', 'espresso', 'latte', 'içecek', 'coffee', 'tea'] },
      { id: 'pizza', icon: 'pizza', name: 'Pizza & İtalyan', category: 'food', keywords: ['pizza', 'dominos', 'lahmacun', 'pide', 'hamur'] },
      { id: 'fast_food', icon: 'fast-food', name: 'Fast Food & Burger', category: 'food', keywords: ['burger', 'hamburger', 'patates', 'mcdonalds', 'burger king', 'fast food'] },
      { id: 'wine', icon: 'wine', name: 'Şarap & Kokteyl', category: 'food', keywords: ['şarap', 'kokteyl', 'alkol', 'gece', 'bar', 'wine'] },
      { id: 'beer', icon: 'beer', name: 'Bira & Pub', category: 'food', keywords: ['bira', 'pub', 'meşrubat', 'içecek', 'bar', 'beer'] },
      { id: 'apple_fruit', icon: 'nutrition', name: 'Meyve & Sağlıklı Gıda', category: 'food', keywords: ['meyve', 'sebze', 'manav', 'elma', 'organik', 'diyet', 'sağlıklı'] },
      { id: 'fish_food', icon: 'fish', name: 'Balık & Deniz Ürünleri', category: 'food', keywords: ['balık', 'deniz ürünü', 'somon', 'hamsi', 'seafood'] },
      { id: 'ice_cream', icon: 'ice-cream', name: 'Dondurma & Tatlı', category: 'food', keywords: ['dondurma', 'tatlı', 'pasta', 'waffle', 'fırın', 'dessert'] },
      { id: 'cart', icon: 'cart', name: 'Market Arabası', category: 'food', keywords: ['market', 'süpermarket', 'bim', 'a101', 'şok', 'migros', 'bakkal', 'grocery'] },
      { id: 'basket', icon: 'basket', name: 'Alışveriş Sepeti', category: 'food', keywords: ['sepet', 'file', 'pazar', 'bakkal'] },
      { id: 'storefront', icon: 'storefront', name: 'Manav & Şarküteri', category: 'food', keywords: ['şarküteri', 'kasap', 'manav', 'dükkan', 'et'] },
    ]
  },
  {
    id: 'bills',
    name: 'Fatura & Ev',
    englishName: 'Bills & Utilities',
    icon: 'receipt-outline',
    icons: [
      { id: 'water', icon: 'water', name: 'Su Faturası', category: 'bills', keywords: ['su', 'iski', 'aski', 'fatura', 'damacana', 'water'] },
      { id: 'flash', icon: 'flash', name: 'Elektrik Enerjisi', category: 'bills', keywords: ['elektrik', 'enerji', 'enerjisa', 'fatura', 'akım', 'power', 'electricity'] },
      { id: 'gas', icon: 'flame', name: 'Doğalgaz & Isınma', category: 'bills', keywords: ['gaz', 'doğalgaz', 'igdas', 'tüp', 'ısınma', 'kombi', 'gas'] },
      { id: 'bulb', icon: 'bulb', name: 'Aydınlatma & Genel', category: 'bills', keywords: ['lamba', 'ampul', 'ışık', 'aidat', 'ortak alan'] },
      { id: 'phone', icon: 'call', name: 'Telefon & Operatör', category: 'bills', keywords: ['telefon', 'turkcell', 'vodafone', 'türk telekom', 'gsm', 'iletişim', 'fatura'] },
      { id: 'wifi', icon: 'wifi', name: 'İnternet & Modem', category: 'bills', keywords: ['internet', 'wifi', 'fiber', 'modem', 'ttnet', 'superonline', 'broadband'] },
      { id: 'card_bill', icon: 'card', name: 'Kredi Kartı Ekstresi', category: 'bills', keywords: ['kart', 'ekstre', 'borç', 'ödeme', 'taksit', 'faiz'] },
      { id: 'cash_bill', icon: 'cash', name: 'Nakit Gider / Harç', category: 'bills', keywords: ['nakit', 'para', 'harç', 'vergi', 'ceza', 'aidat'] },
      { id: 'rent_home', icon: 'home', name: 'Kira & Konut', category: 'bills', keywords: ['kira', 'ev', 'konut', 'apartman', 'site', 'aidat', 'depozito'] },
      { id: 'tv_bill', icon: 'tv', name: 'Kablo TV / Uydu', category: 'bills', keywords: ['tv', 'uydu', 'digiturk', 'd-smart', 'tivibu', 'televizyon'] },
      { id: 'trash_bill', icon: 'trash', name: 'Çöp & Temizlik', category: 'bills', keywords: ['temizlik', 'çöp', 'apartman aidatı', 'temizlikçi'] },
      { id: 'repair_bill', icon: 'construct', name: 'Tadilat & Tesisat', category: 'bills', keywords: ['tamir', 'onarım', 'usta', 'tesisat', 'boyacı', 'musluk'] },
    ]
  },
  {
    id: 'transport',
    name: 'Ulaşım & Seyahat',
    englishName: 'Transport & Travel',
    icon: 'car-outline',
    icons: [
      { id: 'car', icon: 'car', name: 'Otomobil & Araba', category: 'transport', keywords: ['araba', 'otomobil', 'araç', 'bakım', 'kasko', 'sigorta', 'muayene'] },
      { id: 'bus', icon: 'bus', name: 'Otobüs & Minibüs', category: 'transport', keywords: ['otobüs', 'iett', 'minibüs', 'toplu taşıma', 'bilet', 'kart'] },
      { id: 'train', icon: 'train', name: 'Tren & YHT', category: 'transport', keywords: ['tren', 'yht', 'marmaray', 'demiryolu', 'tcdd'] },
      { id: 'subway', icon: 'subway', name: 'Metro & Tramvay', category: 'transport', keywords: ['metro', 'tramvay', 'ulaşım', 'metrobüs'] },
      { id: 'airplane', icon: 'airplane', name: 'Uçak & Bilet', category: 'transport', keywords: ['uçak', 'bilet', 'thy', 'pegasus', 'uçuş', 'tatil', 'havalimanı', 'flight'] },
      { id: 'taxi', icon: 'car-sport', name: 'Taksi & Özel Araç', category: 'transport', keywords: ['taksi', 'bitaksi', 'uber', 'şoför'] },
      { id: 'bicycle', icon: 'bicycle', name: 'Bisiklet & Scooter', category: 'transport', keywords: ['bisiklet', 'martı', 'scooter', 'binbin', 'pedal'] },
      { id: 'moto', icon: 'speedometer', name: 'Motosiklet & Hız', category: 'transport', keywords: ['motor', 'motosiklet', 'kurye', 'hız', 'ekipman'] },
      { id: 'fuel', icon: 'color-fill', name: 'Akaryakıt & Benzin', category: 'transport', keywords: ['benzin', 'mazot', 'lpg', 'opet', 'shell', 'petrol', 'yakıt', 'fuel'] },
      { id: 'boat', icon: 'boat', name: 'Vapur & Feribot', category: 'transport', keywords: ['vapur', 'motor', 'feribot', 'deniz otobüsü', 'ido', 'gemi'] },
      { id: 'luggage', icon: 'briefcase', name: 'Bavul & Seyahat', category: 'transport', keywords: ['tatil', 'bavul', 'otel', 'seyahat', 'valiz', 'gezi'] },
      { id: 'navigation', icon: 'navigate', name: 'Navigasyon & Otoyol', category: 'transport', keywords: ['yol', 'otoyol', 'köprü', 'hgs', 'ogs', 'gişe'] },
      { id: 'trail_sign', icon: 'trail-sign', name: 'Otopark & Tabela', category: 'transport', keywords: ['otopark', 'park', 'ispark', 'vale', 'tabela'] },
      { id: 'map', icon: 'map', name: 'Harita & Rota', category: 'transport', keywords: ['harita', 'adres', 'konum', 'rota', 'gps'] },
    ]
  },
  {
    id: 'shopping',
    name: 'Alışveriş & Giyim',
    englishName: 'Shopping & Fashion',
    icon: 'bag-handle-outline',
    icons: [
      { id: 'shopping_bag', icon: 'bag-handle', name: 'Alışveriş Çantası', category: 'shopping', keywords: ['alışveriş', 'avm', 'mağaza', 'poşet', 'çanta', 'store'] },
      { id: 'bag_simple', icon: 'bag', name: 'Alışveriş Poşeti', category: 'shopping', keywords: ['poşet', 'çanta', 'pazar', 'alışveriş'] },
      { id: 'pricetag', icon: 'pricetag', name: 'İndirim & Fırsat', category: 'shopping', keywords: ['indirim', 'fiyat', 'kampanya', 'etiket', 'sale', 'deal'] },
      { id: 'pricetags', icon: 'pricetags', name: 'Toplu İndirim', category: 'shopping', keywords: ['indirimler', 'kampanyalar', 'kupon'] },
      { id: 'shirt', icon: 'shirt', name: 'Giyim & Tekstil', category: 'shopping', keywords: ['giyim', 'kıyafet', 'tişört', 'elbise', 'zara', 'pantolon', 'moda', 'clothes'] },
      { id: 'shoe', icon: 'walk', name: 'Ayakkabı & Sneaker', category: 'shopping', keywords: ['ayakkabı', 'sneaker', 'bot', 'spor ayakkabı', 'çizme'] },
      { id: 'watch', icon: 'watch', name: 'Saat & Aksesuar', category: 'shopping', keywords: ['saat', 'akıllı saat', 'kol saati', 'bileklik'] },
      { id: 'diamond', icon: 'diamond', name: 'Mücevher & Kuyum', category: 'shopping', keywords: ['altın', 'pırlanta', 'gümüş', 'yüzük', 'kolye', 'kuyumcu'] },
      { id: 'gift_box', icon: 'gift', name: 'Hediye & Sürpriz', category: 'shopping', keywords: ['hediye', 'sürpriz', 'paket', 'doğum günü'] },
      { id: 'furniture', icon: 'bed', name: 'Mobilya & Yatak', category: 'shopping', keywords: ['mobilya', 'ev', 'yatak', 'koltuk', 'ikea', 'dekorasyon'] },
      { id: 'glasses', icon: 'glasses', name: 'Gözlük & Optik', category: 'shopping', keywords: ['gözlük', 'güneş gözlüğü', 'lens', 'optik'] },
      { id: 'archive', icon: 'archive', name: 'Kargo & Sipariş', category: 'shopping', keywords: ['kargo', 'koli', 'paket', 'trendyol', 'hepsiburada', 'amazon'] },
      { id: 'barcode', icon: 'barcode', name: 'Barkod & Fiş', category: 'shopping', keywords: ['barkod', 'tarama', 'fiş', 'ürün'] },
    ]
  },
  {
    id: 'finance',
    name: 'Finans & Yatırım',
    englishName: 'Finance & Money',
    icon: 'wallet-outline',
    icons: [
      { id: 'wallet', icon: 'wallet', name: 'Cüzdan & Nakit', category: 'finance', keywords: ['cüzdan', 'nakit', 'para', 'bütçe', 'maaş', 'gelir', 'wallet'] },
      { id: 'bank_branch', icon: 'business', name: 'Banka Şubesi / Kurum', category: 'finance', keywords: ['banka', 'şube', 'havale', 'eft', 'finans', 'atm'] },
      { id: 'cash_money', icon: 'cash', name: 'Banknot & Para', category: 'finance', keywords: ['nakit', 'para', 'maaş', 'ikramiye', 'tahsilat', 'ödeme'] },
      { id: 'trending_up', icon: 'trending-up', name: 'Borsa & Kar / Artış', category: 'finance', keywords: ['kar', 'artış', 'borsa', 'hisse', 'bist', 'yatırım', 'kazanç'] },
      { id: 'trending_down', icon: 'trending-down', name: 'Zarar / Değer Kaybı', category: 'finance', keywords: ['zarar', 'düşüş', 'kayıp', 'masraf'] },
      { id: 'coins', icon: 'cash-outline', name: 'Madeni Paralar', category: 'finance', keywords: ['bozuk para', 'madeni para', 'para', 'harçlık'] },
      { id: 'card_finance', icon: 'card-outline', name: 'Banka & Debit Kartı', category: 'finance', keywords: ['kart', 'banka kartı', 'hesap kartı', 'pos'] },
      { id: 'calculator', icon: 'calculator', name: 'Muhasebe & Hesap', category: 'finance', keywords: ['hesap', 'muhasebe', 'vergi', 'kdv', 'stopaj', 'hesap makinesi'] },
      { id: 'crypto', icon: 'logo-bitcoin', name: 'Kripto Para / BTC', category: 'finance', keywords: ['kripto', 'bitcoin', 'btc', 'ethereum', 'coin', 'binance'] },
      { id: 'receipt_doc', icon: 'receipt', name: 'Makbuz & Belge', category: 'finance', keywords: ['makbuz', 'fatura', 'senet', 'dekont', 'belge'] },
    ]
  }
];

// 🌟 "Daha Fazla" Açıldığında Sunulan Genişletilmiş 7 Kategori (Zero & Buckwheat Sentezi)
export const PAISA_EXTENDED_CATEGORIES: PaisaCategoryGroup[] = [
  {
    id: 'health',
    name: 'Sağlık & Spor',
    englishName: 'Health & Wellness',
    icon: 'heart-outline',
    icons: [
      { id: 'heart', icon: 'heart', name: 'Sağlık & Yaşam', category: 'health', keywords: ['sağlık', 'kalp', 'yaşam', 'checkup', 'doktor'] },
      { id: 'pulse', icon: 'pulse', name: 'Kardiyo & Nabız', category: 'health', keywords: ['nabız', 'kardiyo', 'koşu', 'kalp atışı', 'tansiyon'] },
      { id: 'fitness', icon: 'fitness', name: 'Fitness & Salon', category: 'health', keywords: ['fitness', 'gym', 'salon', 'üyelik', 'antrenman', 'spor'] },
      { id: 'medkit', icon: 'medkit', name: 'Eczane & İlaç', category: 'health', keywords: ['eczane', 'ilaç', 'reçete', 'doktor', 'hastane', 'medikal'] },
      { id: 'bandage', icon: 'bandage', name: 'İlk Yardım & Pansuman', category: 'health', keywords: ['yara', 'pansuman', 'kaza', 'tedavi', 'merhem'] },
      { id: 'barbell', icon: 'barbell', name: 'Vücut Geliştirme', category: 'health', keywords: ['ağırlık', 'halter', 'kas', 'dambıl', 'fitness'] },
      { id: 'walk_steps', icon: 'walk', name: 'Yürüyüş & Adım', category: 'health', keywords: ['yürüyüş', 'adım', 'gezi', 'parkur'] },
      { id: 'thermometer', icon: 'thermometer', name: 'Ateş & Muayene', category: 'health', keywords: ['ateş', 'hastalık', 'derece', 'klinik'] },
      { id: 'eye_exam', icon: 'eye', name: 'Göz Muayenesi & Optik', category: 'health', keywords: ['göz', 'doktor', 'lens', 'muayene'] },
    ]
  },
  {
    id: 'entertainment',
    name: 'Eğlence & Hobiler',
    englishName: 'Entertainment & Hobbies',
    icon: 'game-controller-outline',
    icons: [
      { id: 'music_notes', icon: 'musical-notes', name: 'Müzik & Konser', category: 'entertainment', keywords: ['müzik', 'konser', 'festival', 'şarkı', 'albüm'] },
      { id: 'guitar', icon: 'musical-note', name: 'Canlı Müzik & Enstrüman', category: 'entertainment', keywords: ['gitar', 'enstrüman', 'ders', 'nota'] },
      { id: 'headset', icon: 'headset', name: 'Kulaklık & Podcast', category: 'entertainment', keywords: ['kulaklık', 'airpods', 'podcast', 'sesli kitap'] },
      { id: 'cinema', icon: 'film', name: 'Sinema & Tiyatro', category: 'entertainment', keywords: ['sinema', 'film', 'tiyatro', 'bilet', 'vizyon'] },
      { id: 'camera', icon: 'camera', name: 'Fotoğraf & Çekim', category: 'entertainment', keywords: ['fotoğraf', 'kamera', 'lens', 'stüdyo', 'vesikalık'] },
      { id: 'videocam', icon: 'videocam', name: 'Video & Prodüksiyon', category: 'entertainment', keywords: ['video', 'çekim', 'kamera', 'youtube'] },
      { id: 'palette_art', icon: 'color-palette', name: 'Resim & Sanat', category: 'entertainment', keywords: ['resim', 'sanat', 'tuval', 'fırça', 'atölye', 'hobi'] },
      { id: 'brush_art', icon: 'brush', name: 'Fırça & Boya', category: 'entertainment', keywords: ['boya', 'fırça', 'çizim', 'sanat'] },
      { id: 'ticket_event', icon: 'ticket', name: 'Etkinlik & Bilet', category: 'entertainment', keywords: ['bilet', 'konser', 'maç', 'standup', 'festival'] },
      { id: 'gamepad', icon: 'game-controller', name: 'Oyun Kolu & Gaming', category: 'entertainment', keywords: ['oyun', 'gamer', 'playstation', 'konsol', 'gaming'] },
      { id: 'football', icon: 'football', name: 'Futbol & Halı Saha', category: 'entertainment', keywords: ['futbol', 'maç', 'halı saha', 'forma', 'süper lig'] },
      { id: 'basketball', icon: 'basketball', name: 'Basketbol & Spor', category: 'entertainment', keywords: ['basketbol', 'nba', 'maç', 'potası'] },
      { id: 'tennis', icon: 'tennisball', name: 'Tenis & Kort', category: 'entertainment', keywords: ['tenis', 'raket', 'kort', 'top'] },
      { id: 'dice_game', icon: 'dice', name: 'Kutu Oyunları & Zar', category: 'entertainment', keywords: ['kutu oyunu', 'monopoly', 'catan', 'zar', 'şans'] },
      { id: 'radio', icon: 'radio', name: 'Radyo & Yayın', category: 'entertainment', keywords: ['radyo', 'fm', 'yayın', 'haber'] },
      { id: 'mic', icon: 'mic', name: 'Mikrofon & Şarkı', category: 'entertainment', keywords: ['mikrofon', 'şarkı', 'karaoke', 'kayıt'] },
    ]
  },
  {
    id: 'work_education',
    name: 'İş, Eğitim & Ofis',
    englishName: 'Work & Education',
    icon: 'school-outline',
    icons: [
      { id: 'books', icon: 'book', name: 'Ders Kitapları & Okuma', category: 'work_education', keywords: ['kitap', 'roman', 'ders kitabı', 'kütüphane'] },
      { id: 'journal_notes', icon: 'journal', name: 'Ajanda & Defter', category: 'work_education', keywords: ['ajanda', 'defter', 'not', 'planlayıcı'] },
      { id: 'school', icon: 'school', name: 'Okul & Kolej', category: 'work_education', keywords: ['okul', 'harç', 'kolej', 'üniversite', 'dershane', 'eğitim'] },
      { id: 'document', icon: 'document-text', name: 'Sözleşme & Noter', category: 'work_education', keywords: ['noter', 'sözleşme', 'evrak', 'resmi', 'rapor'] },
      { id: 'briefcase', icon: 'briefcase', name: 'İş Çantası & Kariyer', category: 'work_education', keywords: ['iş', 'ofis', 'kariyer', 'maaş', 'toplantı'] },
      { id: 'trophy', icon: 'trophy', name: 'Başarı Kupası & Prim', category: 'work_education', keywords: ['ödül', 'prim', 'kupa', 'teşvik', 'başarı'] },
      { id: 'ribbon', icon: 'ribbon', name: 'Madalya & Sertifika', category: 'work_education', keywords: ['sertifika', 'madalya', 'diploma', 'kurs'] },
      { id: 'newspaper', icon: 'newspaper', name: 'Gazete & Abonelik', category: 'work_education', keywords: ['gazete', 'dergi', 'basın', 'makale'] },
      { id: 'target_goal', icon: 'locate', name: 'Hedef & Strateji', category: 'work_education', keywords: ['hedef', 'proje', 'hedefleme', 'ok'] },
    ]
  },
  {
    id: 'home_living',
    name: 'Ev & Yaşam',
    englishName: 'Home & Living',
    icon: 'home-outline',
    icons: [
      { id: 'home_main', icon: 'home', name: 'Ev & Konut', category: 'home_living', keywords: ['ev', 'apartman', 'daire', 'villa', 'yuva'] },
      { id: 'key', icon: 'key', name: 'Anahtarlık & Çilingir', category: 'home_living', keywords: ['anahtar', 'kilit', 'çilingir', 'kapı'] },
      { id: 'lock', icon: 'lock-closed', name: 'Emniyet & Kilit', category: 'home_living', keywords: ['kilit', 'kasa', 'güvenlik', 'şifre'] },
      { id: 'shield', icon: 'shield-checkmark', name: 'Sigorta & Kalkan', category: 'home_living', keywords: ['sigorta', 'kasko', 'dask', 'koruma'] },
      { id: 'bed', icon: 'bed', name: 'Yatak Odası & Otel', category: 'home_living', keywords: ['yatak', 'uyku', 'dinlenme', 'otel'] },
      { id: 'hammer', icon: 'hammer', name: 'Çekiç & Hırdavat', category: 'home_living', keywords: ['çekiç', 'alet', 'vida', 'tamirat'] },
      { id: 'construct', icon: 'construct', name: 'İngiliz Anahtarı & Tesisat', category: 'home_living', keywords: ['tesisat', 'tamir', 'servis', 'bakım'] },
      { id: 'desktop', icon: 'desktop', name: 'Masaüstü PC & Monitör', category: 'home_living', keywords: ['bilgisayar', 'pc', 'monitör', 'ekran'] },
      { id: 'laptop', icon: 'laptop', name: 'Dizüstü Bilgisayar', category: 'home_living', keywords: ['laptop', 'macbook', 'notebook'] },
    ]
  },
  {
    id: 'pets',
    name: 'Evcil Hayvanlar',
    englishName: 'Pets & Animals',
    icon: 'paw-outline',
    icons: [
      { id: 'dog_pet', icon: 'paw', name: 'Köpek & Mama', category: 'pets', keywords: ['köpek', 'mama', 'veteriner', 'tasması', 'köpek maması'] },
      { id: 'cat_pet', icon: 'paw-outline', name: 'Kedi & Kumu', category: 'pets', keywords: ['kedi', 'mama', 'kum', 'veteriner', 'kedi maması'] },
      { id: 'bird_pet', icon: 'paper-plane', name: 'Kuş & Kafes', category: 'pets', keywords: ['kuş', 'yem', 'kafes', 'kanarya', 'papağan'] },
      { id: 'fish_pet', icon: 'fish', name: 'Akvaryum & Balık', category: 'pets', keywords: ['balık', 'akvaryum', 'yem', 'fanus'] },
      { id: 'nature_animal', icon: 'leaf', name: 'Doğa & Çiftlik', category: 'pets', keywords: ['doğa', 'çiftlik', 'at', 'kümes'] },
    ]
  },
  {
    id: 'nature',
    name: 'Doğa & Tatil',
    englishName: 'Nature & Outdoors',
    icon: 'leaf-outline',
    icons: [
      { id: 'leaf_nature', icon: 'leaf', name: 'Doğa & Bitki', category: 'nature', keywords: ['doğa', 'yaprak', 'yeşil', 'çevre', 'ekoloji'] },
      { id: 'flower', icon: 'flower', name: 'Çiçek & Bahçıvan', category: 'nature', keywords: ['çiçek', 'bahçe', 'bitki', 'toprak', 'saksı'] },
      { id: 'sunny', icon: 'sunny', name: 'Güneş & Yaz Tatili', category: 'nature', keywords: ['yaz', 'tatil', 'plaj', 'güneş', 'deniz'] },
      { id: 'moon', icon: 'moon', name: 'Gece & Konaklama', category: 'nature', keywords: ['gece', 'ay', 'uyku', 'otel'] },
      { id: 'snow', icon: 'snow', name: 'Kar & Kış Tatili', category: 'nature', keywords: ['kar', 'kayak', 'kış', 'soğuk', 'uludağ'] },
      { id: 'star_fav', icon: 'star', name: 'Favori & Yıldız', category: 'nature', keywords: ['yıldız', 'özel', 'favori', 'önemli'] },
      { id: 'cloud_weather', icon: 'cloud', name: 'Bulut & Hava Durumu', category: 'nature', keywords: ['bulut', 'hava', 'depolama', 'cloud'] },
      { id: 'earth_globe', icon: 'earth', name: 'Dünya & Yurtdışı', category: 'nature', keywords: ['dünya', 'yurtdışı', 'uluslararası', 'küresel', 'vize'] },
    ]
  },
  {
    id: 'communication',
    name: 'İletişim & Sosyal',
    englishName: 'Communication & Social',
    icon: 'chatbubbles-outline',
    icons: [
      { id: 'chat', icon: 'chatbubble-ellipses', name: 'Sohbet & Mesaj', category: 'communication', keywords: ['mesaj', 'sms', 'sohbet', 'whatsapp', 'telegram'] },
      { id: 'mail', icon: 'mail', name: 'E-Posta & Mektup', category: 'communication', keywords: ['mail', 'eposta', 'mektup', 'posta'] },
      { id: 'send', icon: 'send', name: 'Gönderim & Havale', category: 'communication', keywords: ['gönder', 'transfer', 'ilet', 'paylaş'] },
      { id: 'bell_notif', icon: 'notifications', name: 'Bildirim & Alarm', category: 'communication', keywords: ['bildirim', 'alarm', 'hatırlatıcı', 'zil'] },
      { id: 'people_group', icon: 'people', name: 'Aile & Topluluk', category: 'communication', keywords: ['aile', 'arkadaşlar', 'grup', 'topluluk', 'ekip'] },
      { id: 'person_user', icon: 'person', name: 'Kişisel Masraf', category: 'communication', keywords: ['benim', 'kişisel', 'kendim', 'bireysel'] },
      { id: 'happy_smile', icon: 'happy', name: 'Bebek & Neşe', category: 'communication', keywords: ['bebek', 'çocuk', 'gülümseme', 'harçlık', 'mutluluk'] },
    ]
  }
];

// Vektörel simge kategori filtre etiketleri (Pills)
export const VECTOR_CATEGORY_NAMES = [
  'Tümü',
  'Abonelik & Medya',
  'Yemek & Kafe',
  'Fatura & Ev',
  'Ulaşım & Seyahat',
  'Alışveriş & Giyim',
  'Finans & Yatırım',
  'Sağlık & Spor',
  'Eğlence & Hobiler',
  'İş, Eğitim & Ofis',
  'Ev & Yaşam',
  'Evcil Hayvanlar',
  'Doğa & Tatil',
  'İletişim & Sosyal'
] as const;

// Tüm simgeleri düz bir listede arama için birleştiren liste
export const ALL_PAISA_ICONS: PaisaIconItem[] = [
  ...PAISA_CORE_CATEGORIES.flatMap(c => c.icons),
  ...PAISA_EXTENDED_CATEGORIES.flatMap(c => c.icons)
];

/**
 * Kullanıcı arama sorgusuna göre simgeleri filtreler
 * Zero'nun akıllı normalizasyon algoritması (aksanları, tireleri ve boşlukları yok sayar)
 */
export function searchPaisaIcons(query: string): PaisaIconItem[] {
  if (!query || !query.trim()) return [];
  const normalizedQuery = query.toLowerCase().replace(/[-\s]/g, '').trim();
  
  return ALL_PAISA_ICONS.filter(item => {
    const normName = item.name.toLowerCase().replace(/[-\s]/g, '');
    if (normName.includes(normalizedQuery)) return true;
    
    if (item.englishName) {
      const normEng = item.englishName.toLowerCase().replace(/[-\s]/g, '');
      if (normEng.includes(normalizedQuery)) return true;
    }
    
    const normIcon = item.icon.toLowerCase().replace(/[-\s]/g, '');
    if (normIcon.includes(normalizedQuery)) return true;
    
    return item.keywords.some(k => k.toLowerCase().replace(/[-\s]/g, '').includes(normalizedQuery));
  });
}
