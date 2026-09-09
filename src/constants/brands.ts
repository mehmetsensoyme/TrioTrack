export interface BrandItem {
  id: string;
  name: string;
  category: string;
  domain: string;
  logoUrl: string;
  color: string;
  defaultCategoryKeyword: string;
  keywords: string[];
}

export const BRAND_CATEGORIES = [
  'Tümü',
  'Abonelik & Medya',
  'Market & Alışveriş',
  'Yemek & Kafe',
  'Fatura & Operatör',
  'Ulaşım & Akaryakıt',
  'Oyun & Teknoloji',
  'Banka & Finans'
] as const;

// Google yüksek çözünürlüklü Favicon & Touch Icon CDN API'si (128px PNG, kesintisiz, hızlı)
const getCdnUrl = (domain: string) => 
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;

export const POPULAR_BRANDS: BrandItem[] = [
  // 🌟 ABONELİK & MEDYA
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Abonelik & Medya',
    domain: 'netflix.com',
    logoUrl: getCdnUrl('netflix.com'),
    color: '#E50914',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['netflix', 'netfllx', 'nflx']
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Abonelik & Medya',
    domain: 'spotify.com',
    logoUrl: getCdnUrl('spotify.com'),
    color: '#1DB954',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['spotify', 'spotıfy']
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    category: 'Abonelik & Medya',
    domain: 'youtube.com',
    logoUrl: getCdnUrl('youtube.com'),
    color: '#FF0000',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['youtube', 'google youtube', 'yt premium']
  },
  {
    id: 'disney',
    name: 'Disney+',
    category: 'Abonelik & Medya',
    domain: 'disneyplus.com',
    logoUrl: getCdnUrl('disneyplus.com'),
    color: '#113CCF',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['disney', 'disney+', 'disneyplus']
  },
  {
    id: 'amazon_prime',
    name: 'Amazon Prime',
    category: 'Abonelik & Medya',
    domain: 'primevideo.com',
    logoUrl: getCdnUrl('primevideo.com'),
    color: '#00A8E1',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['prime video', 'amazon prime', 'primevideo']
  },
  {
    id: 'blutv',
    name: 'BluTV',
    category: 'Abonelik & Medya',
    domain: 'blutv.com',
    logoUrl: getCdnUrl('blutv.com'),
    color: '#0099FF',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['blutv', 'blu tv']
  },
  {
    id: 'gain',
    name: 'GAİN',
    category: 'Abonelik & Medya',
    domain: 'gain.tv',
    logoUrl: getCdnUrl('gain.tv'),
    color: '#FFD200',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['gain', 'gain tv']
  },

  // 🛒 MARKET & ALIŞVERİŞ
  {
    id: 'migros',
    name: 'Migros',
    category: 'Market & Alışveriş',
    domain: 'migros.com.tr',
    logoUrl: getCdnUrl('migros.com.tr'),
    color: '#F37021',
    defaultCategoryKeyword: 'market',
    keywords: ['migros', 'migros ticaret', 'macrocenter', 'mjet', '5m migros']
  },
  {
    id: 'bim',
    name: 'BİM',
    category: 'Market & Alışveriş',
    domain: 'bim.com.tr',
    logoUrl: getCdnUrl('bim.com.tr'),
    color: '#E20613',
    defaultCategoryKeyword: 'market',
    keywords: ['bim', 'bim birleşik', 'bim magaza', 'bim market']
  },
  {
    id: 'a101',
    name: 'A101',
    category: 'Market & Alışveriş',
    domain: 'a101.com.tr',
    logoUrl: getCdnUrl('a101.com.tr'),
    color: '#00ADEF',
    defaultCategoryKeyword: 'market',
    keywords: ['a101', 'a-101', 'yeni magazacilik', 'a 101']
  },
  {
    id: 'sok',
    name: 'ŞOK Market',
    category: 'Market & Alışveriş',
    domain: 'sokmarket.com.tr',
    logoUrl: getCdnUrl('sokmarket.com.tr'),
    color: '#E30613',
    defaultCategoryKeyword: 'market',
    keywords: ['şok', 'sok', 'şok market', 'sok marketler']
  },
  {
    id: 'carrefoursa',
    name: 'CarrefourSA',
    category: 'Market & Alışveriş',
    domain: 'carrefoursa.com',
    logoUrl: getCdnUrl('carrefoursa.com'),
    color: '#004F9F',
    defaultCategoryKeyword: 'market',
    keywords: ['carrefour', 'carrefoursa', 'carrefour sa']
  },
  {
    id: 'trendyol',
    name: 'Trendyol',
    category: 'Market & Alışveriş',
    domain: 'trendyol.com',
    logoUrl: getCdnUrl('trendyol.com'),
    color: '#F27A1A',
    defaultCategoryKeyword: 'alışveriş',
    keywords: ['trendyol', 'dsm grup', 'trendyol yemek', 'trendyol hizli market']
  },
  {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    category: 'Market & Alışveriş',
    domain: 'hepsiburada.com',
    logoUrl: getCdnUrl('hepsiburada.com'),
    color: '#FF6000',
    defaultCategoryKeyword: 'alışveriş',
    keywords: ['hepsiburada', 'd-market']
  },
  {
    id: 'amazon_tr',
    name: 'Amazon',
    category: 'Market & Alışveriş',
    domain: 'amazon.com.tr',
    logoUrl: getCdnUrl('amazon.com.tr'),
    color: '#FF9900',
    defaultCategoryKeyword: 'alışveriş',
    keywords: ['amazon', 'amazon turkey', 'amazon com tr']
  },
  {
    id: 'getir',
    name: 'Getir',
    category: 'Market & Alışveriş',
    domain: 'getir.com',
    logoUrl: getCdnUrl('getir.com'),
    color: '#5D3EBC',
    defaultCategoryKeyword: 'market',
    keywords: ['getir', 'getir perakende', 'getir buyuk']
  },
  {
    id: 'ikea',
    name: 'IKEA',
    category: 'Market & Alışveriş',
    domain: 'ikea.com.tr',
    logoUrl: getCdnUrl('ikea.com.tr'),
    color: '#0058A3',
    defaultCategoryKeyword: 'ev',
    keywords: ['ikea', 'mapa mobilya']
  },
  {
    id: 'zara',
    name: 'Zara',
    category: 'Market & Alışveriş',
    domain: 'zara.com',
    logoUrl: getCdnUrl('zara.com'),
    color: '#111111',
    defaultCategoryKeyword: 'giyim',
    keywords: ['zara', 'inditex', 'zara giyim']
  },

  // ☕ YEMEK & KAFE
  {
    id: 'starbucks',
    name: 'Starbucks',
    category: 'Yemek & Kafe',
    domain: 'starbucks.com',
    logoUrl: getCdnUrl('starbucks.com'),
    color: '#006241',
    defaultCategoryKeyword: 'yemek',
    keywords: ['starbucks', 'shaya kahve', 'starbucks coffee']
  },
  {
    id: 'yemeksepeti',
    name: 'Yemeksepeti',
    category: 'Yemek & Kafe',
    domain: 'yemeksepeti.com',
    logoUrl: getCdnUrl('yemeksepeti.com'),
    color: '#EA004B',
    defaultCategoryKeyword: 'yemek',
    keywords: ['yemeksepeti', 'yemek sepeti', 'delivery hero']
  },
  {
    id: 'mcdonalds',
    name: "McDonald's",
    category: 'Yemek & Kafe',
    domain: 'mcdonalds.com',
    logoUrl: getCdnUrl('mcdonalds.com'),
    color: '#FFBC0D',
    defaultCategoryKeyword: 'yemek',
    keywords: ['mcdonalds', 'mc donalds', 'anadolu restoran']
  },
  {
    id: 'burgerking',
    name: 'Burger King',
    category: 'Yemek & Kafe',
    domain: 'burgerking.com.tr',
    logoUrl: getCdnUrl('burgerking.com.tr'),
    color: '#D62300',
    defaultCategoryKeyword: 'yemek',
    keywords: ['burger king', 'tab gıda', 'tab gida']
  },
  {
    id: 'dominos',
    name: "Domino's Pizza",
    category: 'Yemek & Kafe',
    domain: 'dominos.com.tr',
    logoUrl: getCdnUrl('dominos.com.tr'),
    color: '#006491',
    defaultCategoryKeyword: 'yemek',
    keywords: ['dominos', "domino's", 'dp avrasya']
  },
  {
    id: 'kahvedunyasi',
    name: 'Kahve Dünyası',
    category: 'Yemek & Kafe',
    domain: 'kahvedunyasi.com',
    logoUrl: getCdnUrl('kahvedunyasi.com'),
    color: '#4A2511',
    defaultCategoryKeyword: 'yemek',
    keywords: ['kahve dünyası', 'kahve dunyasi', 'altınmarka']
  },
  {
    id: 'espressolab',
    name: 'Espressolab',
    category: 'Yemek & Kafe',
    domain: 'espressolab.com',
    logoUrl: getCdnUrl('espressolab.com'),
    color: '#222222',
    defaultCategoryKeyword: 'yemek',
    keywords: ['espressolab', 'espresso lab']
  },

  // ⚡ FATURA & OPERATÖR
  {
    id: 'turkcell',
    name: 'Turkcell',
    category: 'Fatura & Operatör',
    domain: 'turkcell.com.tr',
    logoUrl: getCdnUrl('turkcell.com.tr'),
    color: '#002855',
    defaultCategoryKeyword: 'fatura',
    keywords: ['turkcell', 'turkcell iletisim']
  },
  {
    id: 'vodafone',
    name: 'Vodafone',
    category: 'Fatura & Operatör',
    domain: 'vodafone.com.tr',
    logoUrl: getCdnUrl('vodafone.com.tr'),
    color: '#E60000',
    defaultCategoryKeyword: 'fatura',
    keywords: ['vodafone', 'vodafone telekomunikasyon']
  },
  {
    id: 'turktelekom',
    name: 'Türk Telekom',
    category: 'Fatura & Operatör',
    domain: 'turktelekom.com.tr',
    logoUrl: getCdnUrl('turktelekom.com.tr'),
    color: '#002D72',
    defaultCategoryKeyword: 'fatura',
    keywords: ['türk telekom', 'turk telekom', 'ttnet']
  },
  {
    id: 'enerjisa',
    name: 'Enerjisa',
    category: 'Fatura & Operatör',
    domain: 'enerjisa.com.tr',
    logoUrl: getCdnUrl('enerjisa.com.tr'),
    color: '#003B46',
    defaultCategoryKeyword: 'fatura',
    keywords: ['enerjisa', 'ayedaş', 'toroslar', 'baskent']
  },
  {
    id: 'igdas',
    name: 'İGDAŞ',
    category: 'Fatura & Operatör',
    domain: 'igdas.istanbul',
    logoUrl: getCdnUrl('igdas.istanbul'),
    color: '#1B365D',
    defaultCategoryKeyword: 'fatura',
    keywords: ['igdas', 'i̇gdaş', 'istanbul gaz']
  },
  {
    id: 'iski',
    name: 'İSKİ',
    category: 'Fatura & Operatör',
    domain: 'iski.istanbul',
    logoUrl: getCdnUrl('iski.istanbul'),
    color: '#0066B3',
    defaultCategoryKeyword: 'fatura',
    keywords: ['iski', 'i̇ski̇', 'istanbul su']
  },

  // 🚗 ULAŞIM & AKARYAKIT
  {
    id: 'shell',
    name: 'Shell',
    category: 'Ulaşım & Akaryakıt',
    domain: 'shell.com.tr',
    logoUrl: getCdnUrl('shell.com.tr'),
    color: '#FBCE07',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['shell', 'shell petrol', 'turcas']
  },
  {
    id: 'opet',
    name: 'Opet',
    category: 'Ulaşım & Akaryakıt',
    domain: 'opet.com.tr',
    logoUrl: getCdnUrl('opet.com.tr'),
    color: '#0C2340',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['opet', 'opet petrolcülük']
  },
  {
    id: 'petrolofisi',
    name: 'Petrol Ofisi',
    category: 'Ulaşım & Akaryakıt',
    domain: 'petrolofisi.com.tr',
    logoUrl: getCdnUrl('petrolofisi.com.tr'),
    color: '#ED1C24',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['petrol ofisi', 'po petrol']
  },
  {
    id: 'uber',
    name: 'Uber',
    category: 'Ulaşım & Akaryakıt',
    domain: 'uber.com',
    logoUrl: getCdnUrl('uber.com'),
    color: '#1A1A1A',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['uber', 'uber bv', 'uber trip']
  },
  {
    id: 'bitaksi',
    name: 'BiTaksi',
    category: 'Ulaşım & Akaryakıt',
    domain: 'bitaksi.com',
    logoUrl: getCdnUrl('bitaksi.com'),
    color: '#FCD116',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['bitaksi', 'bi taksi']
  },
  {
    id: 'marti',
    name: 'Martı',
    category: 'Ulaşım & Akaryakıt',
    domain: 'marti.tech',
    logoUrl: getCdnUrl('marti.tech'),
    color: '#00D26A',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['martı', 'marti', 'marti tag', 'martı tag']
  },
  {
    id: 'thy',
    name: 'Türk Hava Yolları',
    category: 'Ulaşım & Akaryakıt',
    domain: 'turkishairlines.com',
    logoUrl: getCdnUrl('turkishairlines.com'),
    color: '#E81932',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['thy', 'türk hava yolları', 'turkish airlines']
  },
  {
    id: 'pegasus',
    name: 'Pegasus',
    category: 'Ulaşım & Akaryakıt',
    domain: 'flypgs.com',
    logoUrl: getCdnUrl('flypgs.com'),
    color: '#EF7C00',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['pegasus', 'flypgs', 'pegasus hava']
  },

  // 🎮 OYUN & TEKNOLOJİ
  {
    id: 'apple',
    name: 'Apple',
    category: 'Oyun & Teknoloji',
    domain: 'apple.com',
    logoUrl: getCdnUrl('apple.com'),
    color: '#555555',
    defaultCategoryKeyword: 'teknoloji',
    keywords: ['apple', 'itunes', 'app store', 'apple.com/bill']
  },
  {
    id: 'google',
    name: 'Google',
    category: 'Oyun & Teknoloji',
    domain: 'google.com',
    logoUrl: getCdnUrl('google.com'),
    color: '#4285F4',
    defaultCategoryKeyword: 'teknoloji',
    keywords: ['google', 'google play', 'google storage']
  },
  {
    id: 'openai',
    name: 'ChatGPT / OpenAI',
    category: 'Oyun & Teknoloji',
    domain: 'openai.com',
    logoUrl: getCdnUrl('openai.com'),
    color: '#10A37F',
    defaultCategoryKeyword: 'teknoloji',
    keywords: ['openai', 'chatgpt', 'chatgpt plus']
  },
  {
    id: 'steam',
    name: 'Steam',
    category: 'Oyun & Teknoloji',
    domain: 'store.steampowered.com',
    logoUrl: getCdnUrl('store.steampowered.com'),
    color: '#171A21',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['steam', 'valve', 'steampowered']
  },
  {
    id: 'playstation',
    name: 'PlayStation Store',
    category: 'Oyun & Teknoloji',
    domain: 'playstation.com',
    logoUrl: getCdnUrl('playstation.com'),
    color: '#003791',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['playstation', 'ps store', 'sony interactive']
  },

  // 💳 BANKA & FİNANS
  {
    id: 'papara',
    name: 'Papara',
    category: 'Banka & Finans',
    domain: 'papara.com',
    logoUrl: getCdnUrl('papara.com'),
    color: '#6610F2',
    defaultCategoryKeyword: 'finans',
    keywords: ['papara', 'papara elektronik']
  },
  {
    id: 'garanti',
    name: 'Garanti BBVA',
    category: 'Banka & Finans',
    domain: 'garantibbva.com.tr',
    logoUrl: getCdnUrl('garantibbva.com.tr'),
    color: '#00693E',
    defaultCategoryKeyword: 'finans',
    keywords: ['garanti', 'garanti bbva']
  },
  {
    id: 'isbank',
    name: 'İş Bankası',
    category: 'Banka & Finans',
    domain: 'isbank.com.tr',
    logoUrl: getCdnUrl('isbank.com.tr'),
    color: '#002B49',
    defaultCategoryKeyword: 'finans',
    keywords: ['iş bankası', 'isbank', 'is bankasi', 'türkiye iş']
  },
  {
    id: 'yapikredi',
    name: 'Yapı Kredi',
    category: 'Banka & Finans',
    domain: 'yapikredi.com.tr',
    logoUrl: getCdnUrl('yapikredi.com.tr'),
    color: '#003399',
    defaultCategoryKeyword: 'finans',
    keywords: ['yapı kredi', 'yapi kredi', 'ykb']
  },
  {
    id: 'akbank',
    name: 'Akbank',
    category: 'Banka & Finans',
    domain: 'akbank.com',
    logoUrl: getCdnUrl('akbank.com'),
    color: '#E30A17',
    defaultCategoryKeyword: 'finans',
    keywords: ['akbank', 'akbank t.a.ş.']
  },
  {
    id: 'ziraat',
    name: 'Ziraat Bankası',
    category: 'Banka & Finans',
    domain: 'ziraatbank.com.tr',
    logoUrl: getCdnUrl('ziraatbank.com.tr'),
    color: '#E30613',
    defaultCategoryKeyword: 'finans',
    keywords: ['ziraat', 'ziraat bankası']
  },
  {
    id: 'enpara',
    name: 'Enpara.com',
    category: 'Banka & Finans',
    domain: 'enpara.com',
    logoUrl: getCdnUrl('enpara.com'),
    color: '#722282',
    defaultCategoryKeyword: 'finans',
    keywords: ['enpara', 'enpara.com', 'qnb enpara']
  }
];

/**
 * OCR ile taranan metinden bilinen popüler markayı eşleştirir
 */
export function matchBrandFromText(text: string): BrandItem | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const brand of POPULAR_BRANDS) {
    for (const kw of brand.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return brand;
      }
    }
  }
  return null;
}
