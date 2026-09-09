/**
 * Paisa Tarzı Vektörel Simge ve Glif Kütüphanesi
 * Paisa'nın orijinal ekran görüntülerindeki (Subscriptions & Streaming, Bills & Utilities,
 * Groceries & Food, Shopping & Fashion, Transport & Travel, Family & Kids, Pets & Animals,
 * Gifts & Donations, Entertainment & Hobbies, Other) tüm kategorileri ve vektörel marka gliflerini içerir.
 */

export interface PaisaIconItem {
  id: string;
  icon: string; // Ionicons adı
  name: string; // Türkçe açıklayıcı adı
  englishName?: string;
  category: string;
  keywords: string[];
  isBrand?: boolean;
  monogram?: string; // Netflix 'N', Hulu 'h' gibi özel harf logoları
  brandColor?: string;
}

export interface PaisaCategoryGroup {
  id: string;
  name: string;
  englishName: string;
  icons: PaisaIconItem[];
}

// 🌟 Paisa'nın Temel 10 Kategorisi (Birebir Paisa Ekranları)
export const PAISA_CORE_CATEGORIES: PaisaCategoryGroup[] = [
  {
    id: 'subscriptions',
    name: 'Abonelik & Dijital Medya',
    englishName: 'Subscriptions & Streaming',
    icons: [
      { id: 'netflix', icon: 'play-circle', name: 'Netflix', monogram: 'N', brandColor: '#E50914', isBrand: true, category: 'subscriptions', keywords: ['netflix', 'dizi', 'film'] },
      { id: 'spotify', icon: 'musical-notes', name: 'Spotify', brandColor: '#1DB954', isBrand: true, category: 'subscriptions', keywords: ['spotify', 'müzik', 'şarkı'] },
      { id: 'youtube', icon: 'logo-youtube', name: 'YouTube', brandColor: '#FF0000', isBrand: true, category: 'subscriptions', keywords: ['youtube', 'video', 'premium'] },
      { id: 'apple', icon: 'logo-apple', name: 'Apple', brandColor: '#A2AAAD', isBrand: true, category: 'subscriptions', keywords: ['apple', 'itunes', 'icloud', 'app store'] },
      { id: 'googleplay', icon: 'logo-google-playstore', name: 'Google Play', brandColor: '#00C3FF', isBrand: true, category: 'subscriptions', keywords: ['google', 'play store', 'android'] },
      { id: 'twitch', icon: 'logo-twitch', name: 'Twitch', brandColor: '#9146FF', isBrand: true, category: 'subscriptions', keywords: ['twitch', 'yayın', 'stream'] },
      { id: 'patreon', icon: 'heart-circle', name: 'Patreon', monogram: 'P', brandColor: '#FF424D', isBrand: true, category: 'subscriptions', keywords: ['patreon', 'bağış', 'içerik'] },
      { id: 'hulu', icon: 'tv', name: 'Hulu / HBO', monogram: 'h', brandColor: '#1CE783', isBrand: true, category: 'subscriptions', keywords: ['hulu', 'hbo', 'dizi'] },
      { id: 'vimeo', icon: 'logo-vimeo', name: 'Vimeo', brandColor: '#1AB7EA', isBrand: true, category: 'subscriptions', keywords: ['vimeo', 'video'] },
      { id: 'media_player', icon: 'play-forward', name: 'Medya Oynatıcı', category: 'subscriptions', keywords: ['player', 'video', 'oynatıcı'] },
      { id: 'soundcloud', icon: 'logo-soundcloud', name: 'SoundCloud', brandColor: '#FF5500', isBrand: true, category: 'subscriptions', keywords: ['soundcloud', 'ses', 'müzik'] },
      { id: 'steam', icon: 'logo-steam', name: 'Steam', brandColor: '#171A21', isBrand: true, category: 'subscriptions', keywords: ['steam', 'oyun', 'valve'] },
      { id: 'playstation', icon: 'logo-playstation', name: 'PlayStation', brandColor: '#003791', isBrand: true, category: 'subscriptions', keywords: ['playstation', 'psn', 'sony'] },
      { id: 'xbox', icon: 'logo-xbox', name: 'Xbox', brandColor: '#107C10', isBrand: true, category: 'subscriptions', keywords: ['xbox', 'microsoft', 'game pass'] },
      { id: 'amazon_prime', icon: 'logo-amazon', name: 'Amazon Prime', brandColor: '#00A8E1', isBrand: true, category: 'subscriptions', keywords: ['amazon', 'prime'] },
      { id: 'discord', icon: 'logo-discord', name: 'Discord', brandColor: '#5865F2', isBrand: true, category: 'subscriptions', keywords: ['discord', 'nitro', 'sohbet'] },
      { id: 'twitter', icon: 'logo-twitter', name: 'X / Twitter', brandColor: '#1DA1F2', isBrand: true, category: 'subscriptions', keywords: ['twitter', 'x', 'sosyal'] },
      { id: 'disney', icon: 'sparkles', name: 'Disney+', monogram: 'D+', brandColor: '#113CCF', isBrand: true, category: 'subscriptions', keywords: ['disney', 'marvel', 'animasyon'] },
    ]
  },
  {
    id: 'bills',
    name: 'Faturalar & Giderler',
    englishName: 'Bills & Utilities',
    icons: [
      { id: 'water', icon: 'water', name: 'Su Faturası', category: 'bills', keywords: ['su', 'iski', 'aski', 'fatura'] },
      { id: 'flash', icon: 'flash', name: 'Elektrik', category: 'bills', keywords: ['elektrik', 'enerji', 'enerjisa', 'fatura', 'akım'] },
      { id: 'gas', icon: 'flame', name: 'Doğalgaz & Isınma', category: 'bills', keywords: ['gaz', 'doğalgaz', 'igdas', 'tüp', 'ısınma'] },
      { id: 'bulb', icon: 'bulb', name: 'Aydınlatma & Genel', category: 'bills', keywords: ['lamba', 'ampul', 'ışık', 'aidat'] },
      { id: 'phone', icon: 'call', name: 'Telefon & Operatör', category: 'bills', keywords: ['telefon', 'turkcell', 'vodafone', 'turk telekom', 'gsm', 'iletişim'] },
      { id: 'wifi', icon: 'wifi', name: 'İnternet & Modem', category: 'bills', keywords: ['internet', 'wifi', 'fiber', 'modem', 'ttnet'] },
      { id: 'card_bill', icon: 'card', name: 'Kredi Kartı Ekstresi', category: 'bills', keywords: ['kart', 'ekstre', 'borç', 'ödeme'] },
      { id: 'cash_bill', icon: 'cash', name: 'Nakit Gider / Harç', category: 'bills', keywords: ['nakit', 'para', 'harç', 'vergi'] },
      { id: 'rent_home', icon: 'home', name: 'Kira & Konut', category: 'bills', keywords: ['kira', 'ev', 'konut', 'apartman', 'site'] },
      { id: 'tv_bill', icon: 'tv', name: 'Kablo TV / Uydu', category: 'bills', keywords: ['tv', 'uydu', 'digiturk', 'd-smart'] },
      { id: 'trash_bill', icon: 'trash', name: 'Çöp & Temizlik', category: 'bills', keywords: ['temizlik', 'çöp', 'apartman aidatı'] },
      { id: 'repair_bill', icon: 'construct', name: 'Tadilat & Tesisat', category: 'bills', keywords: ['tamir', 'onarım', 'usta', 'tesisat'] },
    ]
  },
  {
    id: 'groceries',
    name: 'Market & Gıda',
    englishName: 'Groceries & Food',
    icons: [
      { id: 'apple_fruit', icon: 'nutrition', name: 'Meyve & Sebze', category: 'groceries', keywords: ['meyve', 'sebze', 'manav', 'elma', 'organik'] },
      { id: 'fast_food', icon: 'fast-food', name: 'Fast Food', category: 'groceries', keywords: ['burger', 'hamburger', 'patates', 'fast food', 'mcdonalds', 'burger king'] },
      { id: 'cart', icon: 'cart', name: 'Market Arabası', category: 'groceries', keywords: ['market', 'süpermarket', 'bim', 'a101', 'şok', 'migros', 'alışveriş'] },
      { id: 'bag_groceries', icon: 'bag-handle', name: 'Market Poşeti', category: 'groceries', keywords: ['poşet', 'çanta', 'bakkal', 'file'] },
      { id: 'storefront', icon: 'storefront', name: 'Manav & Şarküteri', category: 'groceries', keywords: ['şarküteri', 'kasap', 'manav', 'dükkan'] },
      { id: 'cafe', icon: 'cafe', name: 'Kahve & Çay', category: 'groceries', keywords: ['kahve', 'starbucks', 'çay', 'kafe', 'espresso'] },
      { id: 'drink_bottle', icon: 'beer', name: 'İçecek & Meşrubat', category: 'groceries', keywords: ['içecek', 'su', 'soda', 'meyve suyu', 'bira'] },
      { id: 'cake', icon: 'cake', name: 'Pasta & Fırın', category: 'groceries', keywords: ['pasta', 'tatlı', 'fırın', 'ekmek', 'unlu mamül'] },
      { id: 'restaurant', icon: 'restaurant', name: 'Restoran & Akşam Yemeği', category: 'groceries', keywords: ['yemek', 'restoran', 'akşam yemeği', 'lokanta'] },
      { id: 'pizza', icon: 'pizza', name: 'Pizza & İtalyan', category: 'groceries', keywords: ['pizza', 'dominos', 'lahmacun', 'pide'] },
      { id: 'ice_cream', icon: 'ice-cream', name: 'Dondurma & Tatlı', category: 'groceries', keywords: ['dondurma', 'tatlı', 'waffle'] },
      { id: 'fish_food', icon: 'fish', name: 'Balık & Deniz Ürünleri', category: 'groceries', keywords: ['balık', 'deniz ürünü', 'somon'] },
    ]
  },
  {
    id: 'shopping',
    name: 'Alışveriş & Giyim',
    englishName: 'Shopping & Fashion',
    icons: [
      { id: 'shopping_bag', icon: 'bag', name: 'Alışveriş Çantası', category: 'shopping', keywords: ['alışveriş', 'avm', 'mağaza'] },
      { id: 'pricetag', icon: 'pricetag', name: 'İndirim & Fırsat', category: 'shopping', keywords: ['indirim', 'fiyat', 'kampanya', 'etiket'] },
      { id: 'shirt', icon: 'shirt', name: 'Giyim & Tekstil', category: 'shopping', keywords: ['giyim', 'kıyafet', 'tişört', 'elbise', 'zara', 'pantolon'] },
      { id: 'shoe', icon: 'walk', name: 'Ayakkabı & Sneaker', category: 'shopping', keywords: ['ayakkabı', 'sneaker', 'bot', 'spor ayakkabı'] },
      { id: 'watch', icon: 'watch', name: 'Saat & Aksesuar', category: 'shopping', keywords: ['saat', 'akıllı saat', 'kol saati'] },
      { id: 'wallet', icon: 'wallet', name: 'Cüzdan & Deri', category: 'shopping', keywords: ['cüzdan', 'kemer', 'çanta'] },
      { id: 'briefcase', icon: 'briefcase', name: 'Evrak & İş Çantası', category: 'shopping', keywords: ['çanta', 'valiz', 'laptop çantası'] },
      { id: 'bag_check', icon: 'bag-check', name: 'Online Sipariş', category: 'shopping', keywords: ['sipariş', 'trendyol', 'hepsiburada', 'amazon'] },
      { id: 'gift_box', icon: 'gift', name: 'Hediye & Paket', category: 'shopping', keywords: ['hediye', 'sürpriz', 'paket'] },
      { id: 'furniture', icon: 'bed', name: 'Mobilya & Dekor', category: 'shopping', keywords: ['mobilya', 'ev', 'yatak', 'koltuk', 'ikea'] },
      { id: 'diamond', icon: 'diamond', name: 'Mücevher & Kuyum', category: 'shopping', keywords: ['altın', 'pırlanta', 'gümüş', 'yüzük'] },
      { id: 'glasses', icon: 'glasses', name: 'Gözlük & Optik', category: 'shopping', keywords: ['gözlük', 'güneş gözlüğü', 'lens'] },
    ]
  },
  {
    id: 'transport',
    name: 'Ulaşım & Seyahat',
    englishName: 'Transport & Travel',
    icons: [
      { id: 'car', icon: 'car', name: 'Otomobil & Araba', category: 'transport', keywords: ['araba', 'otomobil', 'araç', 'bakım'] },
      { id: 'bus', icon: 'bus', name: 'Otobüs & Minibüs', category: 'transport', keywords: ['otobüs', 'iett', 'minibüs', 'toplu taşıma'] },
      { id: 'train', icon: 'train', name: 'Tren & YHT', category: 'transport', keywords: ['tren', 'yht', 'marmaray', 'demiryolu'] },
      { id: 'subway', icon: 'subway', name: 'Metro & Tramvay', category: 'transport', keywords: ['metro', 'tramvay', 'ulaşım'] },
      { id: 'airplane', icon: 'airplane', name: 'Uçak & Bilet', category: 'transport', keywords: ['uçak', 'bilet', 'thy', 'pegasus', 'uçuş'] },
      { id: 'taxi', icon: 'car-sport', name: 'Taksi & Özel Araç', category: 'transport', keywords: ['taksi', 'bitaksi', 'uber'] },
      { id: 'bicycle', icon: 'bicycle', name: 'Bisiklet & Scooter', category: 'transport', keywords: ['bisiklet', 'martı', 'scooter', 'binbin'] },
      { id: 'moto', icon: 'speedometer', name: 'Motosiklet & Hız', category: 'transport', keywords: ['motor', 'motosiklet', 'kurye'] },
      { id: 'fuel', icon: 'color-fill', name: 'Akaryakıt & Benzin', category: 'transport', keywords: ['benzin', 'mazot', 'lpg', 'opet', 'shell', 'petrol'] },
      { id: 'boat', icon: 'boat', name: 'Vapur & Gemi', category: 'transport', keywords: ['vapur', 'motor', 'feribot', 'deniz otobüsü'] },
      { id: 'luggage', icon: 'briefcase', name: 'Bavul & Seyahat', category: 'transport', keywords: ['tatil', 'bavul', 'otel', 'seyahat'] },
      { id: 'navigation', icon: 'navigate', name: 'Navigasyon & Otoyol', category: 'transport', keywords: ['yol', 'otoyol', 'köprü', 'hgs', 'ogs'] },
    ]
  },
  {
    id: 'family',
    name: 'Aile & Çocuk',
    englishName: 'Family & Kids',
    icons: [
      { id: 'people_family', icon: 'people', name: 'Aile & Ev Halkı', category: 'family', keywords: ['aile', 'anne', 'baba', 'çocuklar'] },
      { id: 'baby_stroller', icon: 'happy', name: 'Bebek & Puset', category: 'family', keywords: ['bebek', 'bezi', 'mama', 'puset'] },
      { id: 'toy_blocks', icon: 'cube', name: 'Oyuncak & Lego', category: 'family', keywords: ['oyuncak', 'lego', 'blok'] },
      { id: 'teddy_bear', icon: 'heart', name: 'Sevgi & Çocuk', category: 'family', keywords: ['çocuk', 'harçlık', 'sevgi'] },
      { id: 'puzzle', icon: 'extension-puzzle', name: 'Yapboz & Zeka Oyunu', category: 'family', keywords: ['yapboz', 'puzzle', 'zeka oyunu'] },
      { id: 'pencil_art', icon: 'pencil', name: 'Kırtasiye & Boya', category: 'family', keywords: ['kalem', 'defter', 'kırtasiye', 'boya'] },
      { id: 'school', icon: 'school', name: 'Okul & Kolej', category: 'family', keywords: ['okul', 'harç', 'kolej', 'üniversite', 'dershane'] },
      { id: 'books', icon: 'book', name: 'Ders Kitapları & Okuma', category: 'family', keywords: ['kitap', 'roman', 'ders kitabı'] },
    ]
  },
  {
    id: 'pets',
    name: 'Evcil Hayvanlar',
    englishName: 'Pets & Animals',
    icons: [
      { id: 'dog_pet', icon: 'paw', name: 'Köpek & Mama', category: 'pets', keywords: ['köpek', 'mama', 'veteriner', 'tasması'] },
      { id: 'cat_pet', icon: 'paw-outline', name: 'Kedi & Kumu', category: 'pets', keywords: ['kedi', 'mama', 'kum', 'veteriner'] },
      { id: 'bird_pet', icon: 'paper-plane', name: 'Kuş & Kafes', category: 'pets', keywords: ['kuş', 'yem', 'kafes', 'muhabbet kuşu'] },
      { id: 'fish_pet', icon: 'fish', name: 'Akvaryum & Balık', category: 'pets', keywords: ['balık', 'akvaryum', 'yem'] },
      { id: 'paw_general', icon: 'paw', name: 'Veteriner & Aşı', category: 'pets', keywords: ['veteriner', 'aşı', 'klinik', 'bakım'] },
      { id: 'nature_animal', icon: 'leaf', name: 'Doğa & Çiftlik', category: 'pets', keywords: ['doğa', 'çiftlik', 'at', 'kümes'] },
    ]
  },
  {
    id: 'gifts',
    name: 'Bağış & Hediyeler',
    englishName: 'Gifts & Donations',
    icons: [
      { id: 'gift_present', icon: 'gift', name: 'Doğum Günü Hediyesi', category: 'gifts', keywords: ['hediye', 'doğum günü', 'yıldönümü', 'kutlama'] },
      { id: 'heart_donate', icon: 'heart', name: 'Gönüllü Bağış', category: 'gifts', keywords: ['bağış', 'yardım', 'kızılay', 'losev', 'dernek'] },
      { id: 'solidarity', icon: 'heart-circle', name: 'Dayanışma & Destek', category: 'gifts', keywords: ['dayanışma', 'ahbap', 'yardım eli'] },
      { id: 'community', icon: 'people-circle', name: 'Toplumsal Yardım', category: 'gifts', keywords: ['topluluk', 'vakıf', 'burs'] },
      { id: 'charity', icon: 'heart-half', name: 'Sağlık / Tedavi Desteği', category: 'gifts', keywords: ['tedavi', 'sma', 'ilaç yardımı'] },
      { id: 'ribbon_honor', icon: 'ribbon', name: 'Şefkat & Anma', category: 'gifts', keywords: ['anma', 'rozet', 'fidan'] },
      { id: 'trophy_award', icon: 'trophy', name: 'Ödül & Başarı Primi', category: 'gifts', keywords: ['ödül', 'prim', 'kupa', 'teşvik'] },
    ]
  },
  {
    id: 'entertainment',
    name: 'Eğlence & Hobiler',
    englishName: 'Entertainment & Hobbies',
    icons: [
      { id: 'music_notes', icon: 'musical-notes', name: 'Müzik & Konser', category: 'entertainment', keywords: ['müzik', 'konser', 'festival'] },
      { id: 'guitar', icon: 'musical-note', name: 'Enstrüman & Hobi', category: 'entertainment', keywords: ['gitar', 'enstrüman', 'ders'] },
      { id: 'piano_keys', icon: 'grid', name: 'Piyano & Klavyeler', category: 'entertainment', keywords: ['piyano', 'klavye', 'müzik aleti'] },
      { id: 'camera', icon: 'camera', name: 'Fotoğraf & Çekim', category: 'entertainment', keywords: ['fotoğraf', 'kamera', 'lens', 'stüdyo'] },
      { id: 'cinema', icon: 'film', name: 'Sinema & Tiyatro', category: 'entertainment', keywords: ['sinema', 'film', 'tiyatro', 'bilet'] },
      { id: 'gamepad', icon: 'game-controller', name: 'Oyun Kolu & Gaming', category: 'entertainment', keywords: ['oyun', 'gamer', 'playstation', 'konsol'] },
      { id: 'palette_art', icon: 'color-palette', name: 'Resim & Heykel', category: 'entertainment', keywords: ['resim', 'sanat', 'tuval', 'fırça', 'atölye'] },
      { id: 'reading_journal', icon: 'journal', name: 'Kitap & Çizgi Roman', category: 'entertainment', keywords: ['dergi', 'çizgi roman', 'manga'] },
      { id: 'basketball', icon: 'basketball', name: 'Basketbol & Spor Salonu', category: 'entertainment', keywords: ['basketbol', 'nba', 'maç'] },
      { id: 'football', icon: 'football', name: 'Futbol & Halı Saha', category: 'entertainment', keywords: ['futbol', 'maç', 'halı saha', 'forma'] },
      { id: 'target_dart', icon: 'locate', name: 'Dart & Hedef Sporları', category: 'entertainment', keywords: ['dart', 'bowling', 'atış'] },
      { id: 'billiards', icon: 'disc', name: 'Bilardo & Masa Oyunları', category: 'entertainment', keywords: ['bilardo', 'langırt'] },
      { id: 'dice_game', icon: 'dice', name: 'Kutu Oyunları & Zar', category: 'entertainment', keywords: ['kutu oyunu', 'monopoly', 'catan', 'zar'] },
    ]
  },
  {
    id: 'other',
    name: 'Diğer & Genel',
    englishName: 'Other',
    icons: [
      { id: 'cash_other', icon: 'cash-outline', name: 'Nakit Para', category: 'other', keywords: ['nakit', 'para', 'bozukluk'] },
      { id: 'card_other', icon: 'card-outline', name: 'Kart İşlemi', category: 'other', keywords: ['kart', 'banka', 'pos'] },
      { id: 'person_other', icon: 'person-outline', name: 'Kişisel Masraf', category: 'other', keywords: ['kişisel', 'kendim', 'özel'] },
      { id: 'calendar_other', icon: 'calendar-outline', name: 'Periyodik / Takvim', category: 'other', keywords: ['takvim', 'aylık', 'düzenli'] },
      { id: 'alert_other', icon: 'alert-circle-outline', name: 'Beklenmedik Gider', category: 'other', keywords: ['acil', 'ceza', 'beklenmedik', 'kaza'] },
      { id: 'star_other', icon: 'star-outline', name: 'Favori / Özel', category: 'other', keywords: ['yıldız', 'özel', 'favori'] },
      { id: 'info_other', icon: 'information-circle-outline', name: 'Bilgi & Danışmanlık', category: 'other', keywords: ['bilgi', 'danışman', 'hukuk'] },
      { id: 'help_other', icon: 'help-circle-outline', name: 'Açıklamasız Masraf', category: 'other', keywords: ['soru', 'diğer', 'muhtelif'] },
      { id: 'settings_other', icon: 'settings-outline', name: 'Sistem & Donanım', category: 'other', keywords: ['ayar', 'araç', 'servis'] },
      { id: 'shield_other', icon: 'shield-checkmark-outline', name: 'Sigorta & Güvenlik', category: 'other', keywords: ['sigorta', 'kasko', 'dask', 'güvenlik'] },
    ]
  }
];

// 🌟 "Daha Fazla" (Show More) Açıldığında Gösterilen Genişletilmiş Kategoriler (100+ İlave Simge)
export const PAISA_EXTENDED_CATEGORIES: PaisaCategoryGroup[] = [
  {
    id: 'health_wellness',
    name: 'Sağlık & Medikal',
    englishName: 'Health & Medical',
    icons: [
      { id: 'medkit', icon: 'medkit', name: 'Eczane & İlaç', category: 'health_wellness', keywords: ['eczane', 'ilaç', 'sağlık'] },
      { id: 'fitness', icon: 'fitness', name: 'Fitness & Salon', category: 'health_wellness', keywords: ['fitness', 'gym', 'salon', 'üyelik'] },
      { id: 'bandage', icon: 'bandage', name: 'İlk Yardım & Pansuman', category: 'health_wellness', keywords: ['yara', 'pansuman', 'kaza'] },
      { id: 'barbell', icon: 'barbell', name: 'Vücut Geliştirme', category: 'health_wellness', keywords: ['ağırlık', 'halter', 'kas'] },
      { id: 'pulse', icon: 'pulse', name: 'Kardiyo & Nabız', category: 'health_wellness', keywords: ['nabız', 'kardiyo', 'koşu'] },
      { id: 'eye_check', icon: 'eye', name: 'Göz Muayenesi & Optik', category: 'health_wellness', keywords: ['göz', 'doktor', 'hastane'] },
      { id: 'thermometer', icon: 'thermometer', name: 'Ateş & Muayene', category: 'health_wellness', keywords: ['ateş', 'hastalık', 'doktor'] },
    ]
  },
  {
    id: 'work_finance',
    name: 'İş, Yatırım & Finans',
    englishName: 'Work & Investing',
    icons: [
      { id: 'trend_up', icon: 'trending-up', name: 'Borsa & Kar', category: 'work_finance', keywords: ['hisse', 'kar', 'bist', 'yatırım'] },
      { id: 'trend_down', icon: 'trending-down', name: 'Zarar & Düşüş', category: 'work_finance', keywords: ['düşüş', 'kayıp'] },
      { id: 'bar_chart', icon: 'bar-chart', name: 'İstatistik & Analiz', category: 'work_finance', keywords: ['grafik', 'analiz', 'rapor'] },
      { id: 'pie_chart', icon: 'pie-chart', name: 'Portföy & Fon', category: 'work_finance', keywords: ['fon', 'dağılım', 'tefas'] },
      { id: 'calculator', icon: 'calculator', name: 'Muhasebe & Vergi', category: 'work_finance', keywords: ['hesap', 'vergi', 'kdv', 'stopaj'] },
      { id: 'document', icon: 'document-text', name: 'Sözleşme & Noter', category: 'work_finance', keywords: ['noter', 'sözleşme', 'evrak'] },
      { id: 'crypto', icon: 'logo-bitcoin', name: 'Kripto Para / Bitcoin', category: 'work_finance', keywords: ['kripto', 'btc', 'ethereum'] },
    ]
  },
  {
    id: 'tech_gadgets',
    name: 'Teknoloji & Donanım',
    englishName: 'Tech & Gadgets',
    icons: [
      { id: 'laptop', icon: 'laptop', name: 'Dizüstü Bilgisayar', category: 'tech_gadgets', keywords: ['laptop', 'macbook', 'pc'] },
      { id: 'smartphone', icon: 'phone-portrait', name: 'Akıllı Telefon', category: 'tech_gadgets', keywords: ['telefon', 'iphone', 'samsung'] },
      { id: 'tablet', icon: 'tablet-portrait', name: 'Tablet & iPad', category: 'tech_gadgets', keywords: ['tablet', 'ipad'] },
      { id: 'desktop', icon: 'desktop', name: 'Masaüstü & Monitör', category: 'tech_gadgets', keywords: ['monitör', 'kasa', 'ekran'] },
      { id: 'chip', icon: 'hardware-chip', name: 'İşlemci & Parça', category: 'tech_gadgets', keywords: ['işlemci', 'ram', 'ssd'] },
      { id: 'headset', icon: 'headset', name: 'Kulaklık & Ses', category: 'tech_gadgets', keywords: ['kulaklık', 'airpods', 'hoparlör'] },
      { id: 'server', icon: 'server', name: 'Sunucu & Bulut', category: 'tech_gadgets', keywords: ['server', 'hosting', 'domain', 'cloud'] },
    ]
  },
  {
    id: 'home_garden',
    name: 'Ev, Bahçe & Bakım',
    englishName: 'Home & Living',
    icons: [
      { id: 'key', icon: 'key', name: 'Anahtarlık & Çilingir', category: 'home_garden', keywords: ['anahtar', 'kilit', 'çilingir'] },
      { id: 'hammer', icon: 'hammer', name: 'Hırdavat & Marangoz', category: 'home_garden', keywords: ['çekiç', 'vida', 'alet'] },
      { id: 'brush_clean', icon: 'brush', name: 'Boya & Badana', category: 'home_garden', keywords: ['boya', 'fırça', 'badana'] },
      { id: 'flower', icon: 'flower', name: 'Çiçek & Bahçıvan', category: 'home_garden', keywords: ['çiçek', 'bahçe', 'bitki', 'toprak'] },
      { id: 'sunny', icon: 'sunny', name: 'Güneş & Yazlık', category: 'home_garden', keywords: ['yaz', 'tatil', 'plaj'] },
      { id: 'moon', icon: 'moon', name: 'Gece & Dinlenme', category: 'home_garden', keywords: ['uyku', 'otel'] },
    ]
  }
];

// Tüm simgeleri düz bir listede arama için birleştiren liste
export const ALL_PAISA_ICONS: PaisaIconItem[] = [
  ...PAISA_CORE_CATEGORIES.flatMap(c => c.icons),
  ...PAISA_EXTENDED_CATEGORIES.flatMap(c => c.icons)
];

/**
 * Kullanıcı arama sorgusuna göre simgeleri filtreler
 */
export function searchPaisaIcons(query: string): PaisaIconItem[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return ALL_PAISA_ICONS.filter(item => 
    item.name.toLowerCase().includes(q) ||
    (item.englishName && item.englishName.toLowerCase().includes(q)) ||
    item.keywords.some(k => k.toLowerCase().includes(q)) ||
    item.icon.toLowerCase().includes(q)
  );
}
