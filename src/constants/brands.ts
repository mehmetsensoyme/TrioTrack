export interface BrandItem {
  id: string;
  name: string;
  category: string;
  domain: string;
  logoUrl: string;
  color: string;
  defaultCategoryKeyword: string;
  keywords: string[];
  vectorIcon?: string;
  monogram?: string;
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
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;

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
    keywords: ['netflix', 'netfllx', 'nflx'],
    vectorIcon: 'play-circle',
    monogram: 'N'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Abonelik & Medya',
    domain: 'spotify.com',
    logoUrl: getCdnUrl('spotify.com'),
    color: '#1DB954',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['spotify', 'spotıfy'],
    vectorIcon: 'musical-notes',
    monogram: 'S'
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    category: 'Abonelik & Medya',
    domain: 'youtube.com',
    logoUrl: getCdnUrl('youtube.com'),
    color: '#FF0000',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['youtube', 'google youtube', 'yt premium'],
    vectorIcon: 'logo-youtube',
    monogram: 'YT'
  },
  {
    id: 'disney',
    name: 'Disney+',
    category: 'Abonelik & Medya',
    domain: 'disneyplus.com',
    logoUrl: getCdnUrl('disneyplus.com'),
    color: '#113CCF',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['disney', 'disney+', 'disneyplus'],
    vectorIcon: 'sparkles',
    monogram: 'D+'
  },
  {
    id: 'amazon_prime',
    name: 'Amazon Prime',
    category: 'Abonelik & Medya',
    domain: 'primevideo.com',
    logoUrl: getCdnUrl('primevideo.com'),
    color: '#00A8E1',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['prime video', 'amazon prime', 'primevideo'],
    vectorIcon: 'logo-amazon',
    monogram: 'P'
  },
  {
    id: 'blutv',
    name: 'BluTV',
    category: 'Abonelik & Medya',
    domain: 'blutv.com',
    logoUrl: getCdnUrl('blutv.com'),
    color: '#0099FF',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['blutv', 'blu tv'],
    vectorIcon: 'tv',
    monogram: 'BLU'
  },
  {
    id: 'gain',
    name: 'GAİN',
    category: 'Abonelik & Medya',
    domain: 'gain.tv',
    logoUrl: getCdnUrl('gain.tv'),
    color: '#FFD200',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['gain', 'gain tv'],
    vectorIcon: 'film',
    monogram: 'G'
  },
  {
    id: 'exxen',
    name: 'Exxen',
    category: 'Abonelik & Medya',
    domain: 'exxen.com',
    logoUrl: getCdnUrl('exxen.com'),
    color: '#FFC800',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['exxen', 'acun'],
    vectorIcon: 'play-circle',
    monogram: 'EXX'
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
    keywords: ['migros', 'migros ticaret', 'macrocenter', 'mjet', '5m migros'],
    vectorIcon: 'cart',
    monogram: 'M'
  },
  {
    id: 'bim',
    name: 'BİM',
    category: 'Market & Alışveriş',
    domain: 'bim.com.tr',
    logoUrl: getCdnUrl('bim.com.tr'),
    color: '#E20613',
    defaultCategoryKeyword: 'market',
    keywords: ['bim', 'bim birleşik', 'bim magaza', 'bim market'],
    vectorIcon: 'basket',
    monogram: 'BİM'
  },
  {
    id: 'a101',
    name: 'A101',
    category: 'Market & Alışveriş',
    domain: 'a101.com.tr',
    logoUrl: getCdnUrl('a101.com.tr'),
    color: '#00ADEF',
    defaultCategoryKeyword: 'market',
    keywords: ['a101', 'a-101', 'yeni magazacilik', 'a 101'],
    vectorIcon: 'cart',
    monogram: 'A101'
  },
  {
    id: 'sok',
    name: 'ŞOK Market',
    category: 'Market & Alışveriş',
    domain: 'www.sokmarket.com.tr',
    logoUrl: getCdnUrl('www.sokmarket.com.tr'),
    color: '#E30613',
    defaultCategoryKeyword: 'market',
    keywords: ['şok', 'sok', 'şok market', 'sok marketler'],
    vectorIcon: 'cart',
    monogram: 'ŞOK'
  },
  {
    id: 'carrefoursa',
    name: 'CarrefourSA',
    category: 'Market & Alışveriş',
    domain: 'carrefoursa.com',
    logoUrl: getCdnUrl('carrefoursa.com'),
    color: '#004F9F',
    defaultCategoryKeyword: 'market',
    keywords: ['carrefour', 'carrefoursa', 'carrefour sa'],
    vectorIcon: 'cart',
    monogram: 'C'
  },
  {
    id: 'trendyol',
    name: 'Trendyol',
    category: 'Market & Alışveriş',
    domain: 'trendyol.com',
    logoUrl: getCdnUrl('trendyol.com'),
    color: '#F27A1A',
    defaultCategoryKeyword: 'alışveriş',
    keywords: ['trendyol', 'dsm grup', 'trendyol yemek', 'trendyol hizli market'],
    vectorIcon: 'bag-handle',
    monogram: 'TY'
  },
  {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    category: 'Market & Alışveriş',
    domain: 'hepsiburada.com',
    logoUrl: getCdnUrl('hepsiburada.com'),
    color: '#FF6000',
    defaultCategoryKeyword: 'alışveriş',
    keywords: ['hepsiburada', 'd-market'],
    vectorIcon: 'bag-handle',
    monogram: 'HB'
  },
  {
    id: 'amazon_tr',
    name: 'Amazon',
    category: 'Market & Alışveriş',
    domain: 'amazon.com.tr',
    logoUrl: getCdnUrl('amazon.com.tr'),
    color: '#FF9900',
    defaultCategoryKeyword: 'alışveriş',
    keywords: ['amazon', 'amazon turkey', 'amazon com tr'],
    vectorIcon: 'logo-amazon',
    monogram: 'AMZ'
  },
  {
    id: 'getir',
    name: 'Getir',
    category: 'Market & Alışveriş',
    domain: 'getir.com',
    logoUrl: getCdnUrl('getir.com'),
    color: '#5D3EBC',
    defaultCategoryKeyword: 'market',
    keywords: ['getir', 'getir perakende', 'getir buyuk'],
    vectorIcon: 'basket',
    monogram: 'GTR'
  },
  {
    id: 'ikea',
    name: 'IKEA',
    category: 'Market & Alışveriş',
    domain: 'ikea.com.tr',
    logoUrl: getCdnUrl('ikea.com.tr'),
    color: '#0058A3',
    defaultCategoryKeyword: 'ev',
    keywords: ['ikea', 'mapa mobilya'],
    vectorIcon: 'home',
    monogram: 'IKEA'
  },
  {
    id: 'zara',
    name: 'Zara',
    category: 'Market & Alışveriş',
    domain: 'zara.com',
    logoUrl: getCdnUrl('zara.com'),
    color: '#111111',
    defaultCategoryKeyword: 'giyim',
    keywords: ['zara', 'inditex', 'zara giyim'],
    vectorIcon: 'shirt',
    monogram: 'ZARA'
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
    keywords: ['starbucks', 'shaya kahve', 'starbucks coffee'],
    vectorIcon: 'cafe',
    monogram: 'SB'
  },
  {
    id: 'yemeksepeti',
    name: 'Yemeksepeti',
    category: 'Yemek & Kafe',
    domain: 'yemeksepeti.com',
    logoUrl: getCdnUrl('yemeksepeti.com'),
    color: '#EA004B',
    defaultCategoryKeyword: 'yemek',
    keywords: ['yemeksepeti', 'yemek sepeti', 'delivery hero'],
    vectorIcon: 'fast-food',
    monogram: 'YS'
  },
  {
    id: 'mcdonalds',
    name: "McDonald's",
    category: 'Yemek & Kafe',
    domain: 'mcdonalds.com',
    logoUrl: getCdnUrl('mcdonalds.com'),
    color: '#FFBC0D',
    defaultCategoryKeyword: 'yemek',
    keywords: ['mcdonalds', 'mc donalds', 'anadolu restoran'],
    vectorIcon: 'fast-food',
    monogram: 'M'
  },
  {
    id: 'burgerking',
    name: 'Burger King',
    category: 'Yemek & Kafe',
    domain: 'burgerking.com.tr',
    logoUrl: getCdnUrl('burgerking.com.tr'),
    color: '#D62300',
    defaultCategoryKeyword: 'yemek',
    keywords: ['burger king', 'tab gıda', 'tab gida'],
    vectorIcon: 'fast-food',
    monogram: 'BK'
  },
  {
    id: 'dominos',
    name: "Domino's Pizza",
    category: 'Yemek & Kafe',
    domain: 'dominos.com.tr',
    logoUrl: getCdnUrl('dominos.com.tr'),
    color: '#006491',
    defaultCategoryKeyword: 'yemek',
    keywords: ['dominos', "domino's", 'dp avrasya'],
    vectorIcon: 'pizza',
    monogram: 'DOM'
  },
  {
    id: 'kahvedunyasi',
    name: 'Kahve Dünyası',
    category: 'Yemek & Kafe',
    domain: 'kahvedunyasi.com',
    logoUrl: getCdnUrl('kahvedunyasi.com'),
    color: '#4A2511',
    defaultCategoryKeyword: 'yemek',
    keywords: ['kahve dünyası', 'kahve dunyasi', 'altınmarka'],
    vectorIcon: 'cafe',
    monogram: 'KD'
  },
  {
    id: 'espressolab',
    name: 'Espressolab',
    category: 'Yemek & Kafe',
    domain: 'espressolab.com',
    logoUrl: getCdnUrl('espressolab.com'),
    color: '#222222',
    defaultCategoryKeyword: 'yemek',
    keywords: ['espressolab', 'espresso lab'],
    vectorIcon: 'cafe',
    monogram: 'EL'
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
    keywords: ['turkcell', 'turkcell iletisim'],
    vectorIcon: 'call',
    monogram: 'TC'
  },
  {
    id: 'vodafone',
    name: 'Vodafone',
    category: 'Fatura & Operatör',
    domain: 'vodafone.com.tr',
    logoUrl: getCdnUrl('vodafone.com.tr'),
    color: '#E60000',
    defaultCategoryKeyword: 'fatura',
    keywords: ['vodafone', 'vodafone telekomunikasyon'],
    vectorIcon: 'call',
    monogram: 'VF'
  },
  {
    id: 'turktelekom',
    name: 'Türk Telekom',
    category: 'Fatura & Operatör',
    domain: 'turktelekom.com.tr',
    logoUrl: getCdnUrl('turktelekom.com.tr'),
    color: '#002D72',
    defaultCategoryKeyword: 'fatura',
    keywords: ['türk telekom', 'turk telekom', 'ttnet'],
    vectorIcon: 'call',
    monogram: 'TT'
  },
  {
    id: 'enerjisa',
    name: 'Enerjisa',
    category: 'Fatura & Operatör',
    domain: 'enerjisa.com.tr',
    logoUrl: getCdnUrl('enerjisa.com.tr'),
    color: '#003B46',
    defaultCategoryKeyword: 'fatura',
    keywords: ['enerjisa', 'ayedaş', 'toroslar', 'baskent'],
    vectorIcon: 'flash',
    monogram: 'ENJ'
  },
  {
    id: 'igdas',
    name: 'İGDAŞ',
    category: 'Fatura & Operatör',
    domain: 'igdas.istanbul',
    logoUrl: getCdnUrl('igdas.istanbul'),
    color: '#1B365D',
    defaultCategoryKeyword: 'fatura',
    keywords: ['igdas', 'i̇gdaş', 'istanbul gaz'],
    vectorIcon: 'flame',
    monogram: 'İGDAŞ'
  },
  {
    id: 'iski',
    name: 'İSKİ',
    category: 'Fatura & Operatör',
    domain: 'iski.istanbul',
    logoUrl: getCdnUrl('iski.istanbul'),
    color: '#0066B3',
    defaultCategoryKeyword: 'fatura',
    keywords: ['iski', 'i̇ski̇', 'istanbul su'],
    vectorIcon: 'water',
    monogram: 'İSKİ'
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
    keywords: ['shell', 'shell petrol', 'turcas'],
    vectorIcon: 'speedometer',
    monogram: 'SHL'
  },
  {
    id: 'opet',
    name: 'Opet',
    category: 'Ulaşım & Akaryakıt',
    domain: 'opet.com.tr',
    logoUrl: getCdnUrl('opet.com.tr'),
    color: '#0C2340',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['opet', 'opet petrolcülük'],
    vectorIcon: 'speedometer',
    monogram: 'OPT'
  },
  {
    id: 'petrolofisi',
    name: 'Petrol Ofisi',
    category: 'Ulaşım & Akaryakıt',
    domain: 'petrolofisi.com.tr',
    logoUrl: getCdnUrl('petrolofisi.com.tr'),
    color: '#ED1C24',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['petrol ofisi', 'po petrol'],
    vectorIcon: 'speedometer',
    monogram: 'PO'
  },
  {
    id: 'uber',
    name: 'Uber',
    category: 'Ulaşım & Akaryakıt',
    domain: 'uber.com',
    logoUrl: getCdnUrl('uber.com'),
    color: '#1A1A1A',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['uber', 'uber bv', 'uber trip'],
    vectorIcon: 'car',
    monogram: 'UBER'
  },
  {
    id: 'bitaksi',
    name: 'BiTaksi',
    category: 'Ulaşım & Akaryakıt',
    domain: 'bitaksi.com',
    logoUrl: getCdnUrl('bitaksi.com'),
    color: '#FCD116',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['bitaksi', 'bi taksi'],
    vectorIcon: 'car',
    monogram: 'BTX'
  },
  {
    id: 'marti',
    name: 'Martı',
    category: 'Ulaşım & Akaryakıt',
    domain: 'marti.tech',
    logoUrl: getCdnUrl('marti.tech'),
    color: '#00D26A',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['martı', 'marti', 'marti tag', 'martı tag'],
    vectorIcon: 'bicycle',
    monogram: 'MRTI'
  },
  {
    id: 'thy',
    name: 'Türk Hava Yolları',
    category: 'Ulaşım & Akaryakıt',
    domain: 'turkishairlines.com',
    logoUrl: getCdnUrl('turkishairlines.com'),
    color: '#E81932',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['thy', 'türk hava yolları', 'turkish airlines'],
    vectorIcon: 'airplane',
    monogram: 'THY'
  },
  {
    id: 'pegasus',
    name: 'Pegasus',
    category: 'Ulaşım & Akaryakıt',
    domain: 'flypgs.com',
    logoUrl: getCdnUrl('flypgs.com'),
    color: '#EF7C00',
    defaultCategoryKeyword: 'ulaşım',
    keywords: ['pegasus', 'flypgs', 'pegasus hava'],
    vectorIcon: 'airplane',
    monogram: 'PGS'
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
    keywords: ['apple', 'itunes', 'app store', 'apple.com/bill'],
    vectorIcon: 'logo-apple',
    monogram: 'AAPL'
  },
  {
    id: 'google',
    name: 'Google',
    category: 'Oyun & Teknoloji',
    domain: 'google.com',
    logoUrl: getCdnUrl('google.com'),
    color: '#4285F4',
    defaultCategoryKeyword: 'teknoloji',
    keywords: ['google', 'google play', 'google storage'],
    vectorIcon: 'logo-google',
    monogram: 'GOOG'
  },
  {
    id: 'openai',
    name: 'ChatGPT / OpenAI',
    category: 'Oyun & Teknoloji',
    domain: 'openai.com',
    logoUrl: getCdnUrl('openai.com'),
    color: '#10A37F',
    defaultCategoryKeyword: 'teknoloji',
    keywords: ['openai', 'chatgpt', 'chatgpt plus'],
    vectorIcon: 'hardware-chip',
    monogram: 'AI'
  },
  {
    id: 'steam',
    name: 'Steam',
    category: 'Oyun & Teknoloji',
    domain: 'steampowered.com',
    logoUrl: getCdnUrl('steampowered.com'),
    color: '#171A21',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['steam', 'valve', 'steampowered'],
    vectorIcon: 'logo-steam',
    monogram: 'STM'
  },
  {
    id: 'playstation',
    name: 'PlayStation Store',
    category: 'Oyun & Teknoloji',
    domain: 'playstation.com',
    logoUrl: getCdnUrl('playstation.com'),
    color: '#003791',
    defaultCategoryKeyword: 'eğlence',
    keywords: ['playstation', 'ps store', 'sony interactive'],
    vectorIcon: 'logo-playstation',
    monogram: 'PS'
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
    keywords: ['papara', 'papara elektronik'],
    vectorIcon: 'card',
    monogram: 'PPR'
  },
  {
    id: 'garanti',
    name: 'Garanti BBVA',
    category: 'Banka & Finans',
    domain: 'garantibbva.com.tr',
    logoUrl: getCdnUrl('garantibbva.com.tr'),
    color: '#00693E',
    defaultCategoryKeyword: 'finans',
    keywords: ['garanti', 'garanti bbva'],
    vectorIcon: 'card',
    monogram: 'GBB'
  },
  {
    id: 'isbank',
    name: 'İş Bankası',
    category: 'Banka & Finans',
    domain: 'isbank.com.tr',
    logoUrl: getCdnUrl('isbank.com.tr'),
    color: '#002B49',
    defaultCategoryKeyword: 'finans',
    keywords: ['iş bankası', 'isbank', 'is bankasi', 'türkiye iş'],
    vectorIcon: 'card',
    monogram: 'İŞ'
  },
  {
    id: 'yapikredi',
    name: 'Yapı Kredi',
    category: 'Banka & Finans',
    domain: 'yapikredi.com.tr',
    logoUrl: getCdnUrl('yapikredi.com.tr'),
    color: '#003399',
    defaultCategoryKeyword: 'finans',
    keywords: ['yapı kredi', 'yapi kredi', 'ykb'],
    vectorIcon: 'card',
    monogram: 'YKB'
  },
  {
    id: 'akbank',
    name: 'Akbank',
    category: 'Banka & Finans',
    domain: 'akbank.com',
    logoUrl: getCdnUrl('akbank.com'),
    color: '#E30A17',
    defaultCategoryKeyword: 'finans',
    keywords: ['akbank', 'akbank t.a.ş.'],
    vectorIcon: 'card',
    monogram: 'AKB'
  },
  {
    id: 'ziraat',
    name: 'Ziraat Bankası',
    category: 'Banka & Finans',
    domain: 'ziraatbank.com.tr',
    logoUrl: getCdnUrl('ziraatbank.com.tr'),
    color: '#E30613',
    defaultCategoryKeyword: 'finans',
    keywords: ['ziraat', 'ziraat bankası'],
    vectorIcon: 'card',
    monogram: 'ZRT'
  },
  {
    id: 'enpara',
    name: 'Enpara.com',
    category: 'Banka & Finans',
    domain: 'enpara.com',
    logoUrl: getCdnUrl('enpara.com'),
    color: '#722282',
    defaultCategoryKeyword: 'finans',
    keywords: ['enpara', 'enpara.com', 'qnb enpara'],
    vectorIcon: 'card',
    monogram: 'ENP'
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
