import { BrandItem, matchBrandFromText } from '../constants/brands';

export interface ParsedReceiptData {
  amount?: number;
  formattedAmount?: string;
  receiptNo?: string;
  date?: string; // YYYY-MM-DD
  storeName?: string;
  matchedBrand?: BrandItem | null;
  taxSummary?: string;
  rawText: string;
}

const OCR_API_ENDPOINT = 'https://api.ocr.space/parse/image';
const OCR_API_KEY = 'K88339188888957'; // Ücretsiz yüksek kotalı OCR Space API Anahtarı

/**
 * Fiş ve Fatura OCR Metinlerini Ayrıştıran Akıllı Motor
 */
export function parseReceiptText(text: string): ParsedReceiptData {
  const result: ParsedReceiptData = {
    rawText: text,
    matchedBrand: null,
  };

  if (!text || !text.trim()) {
    return result;
  }

  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // 1. Marka ve Mağaza Eşleştirme (Gelişmiş Veritabanı)
  const matchedBrand = matchBrandFromText(text);
  if (matchedBrand) {
    result.matchedBrand = matchedBrand;
    result.storeName = matchedBrand.name;
  } else if (lines.length > 0) {
    // İlk 3 satırdan başlık çıkarma (Fişin tepesindeki mağaza adı)
    const headerCandidates = lines.slice(0, 3).filter(l => 
      !l.match(/(tarih|saat|fiş|fatura|vkn|vergi|ettn|kdv)/i) && 
      l.length >= 3 && 
      l.length <= 40
    );
    if (headerCandidates.length > 0) {
      result.storeName = headerCandidates[0].replace(/[*#]/g, '').trim();
    }
  }

  // 2. Fiş veya Fatura Numarası Arama
  // Örn: FİŞ NO: 0048, FIS NO: 1234, FATURA NO: GIB2026000001, BELGE NO: #482, NO: 994
  const receiptNoRegexes = [
    /(?:F[İI]Ş\s*NO|F[İI]S\s*NO|FATURA\s*NO|BELGE\s*NO)[\s*:=#]*([A-Z0-9\-_/]{3,20})/i,
    /(?:ETTN)[\s*:=#]*([A-Z0-9\-]{8,36})/i,
    /(?:NO)[\s*:=#]+([0-9]{3,10})/i,
  ];

  for (const regex of receiptNoRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      result.receiptNo = `#${match[1].replace(/^[#:]+/, '')}`;
      break;
    }
  }

  // Bulunamadıysa benzersiz fiş no oluştur
  if (!result.receiptNo) {
    result.receiptNo = `#FŞ-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // 3. Tarih Ayrıştırma (DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY)
  const dateRegex = /\b(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})\b/;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    let year = dateMatch[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    // Geçerli tarih kontrolü
    const mNum = parseInt(month, 10);
    const dNum = parseInt(day, 10);
    if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
      result.date = `${year}-${month}-${day}`;
    }
  }

  // 4. Tutar Ayrıştırma (Türk Lirası ve genel tutar kalıpları)
  // Genellikle TOPLAM / TUTAR / GENEL TOPLAM / ÖDENEN satırlarında olur
  const cleanNumber = (str: string): number => {
    // 1.250,50 -> 1250.50 veya 249,99 -> 249.99 veya 35.50 -> 35.50
    let s = str.replace(/[^\d.,]/g, '').trim();
    if (s.includes(',') && s.includes('.')) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        // 1.250,50 -> 1250.50
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        // 1,250.50 -> 1250.50
        s = s.replace(/,/g, '');
      }
    } else if (s.includes(',')) {
      s = s.replace(',', '.');
    }
    const val = parseFloat(s);
    return isNaN(val) ? 0 : val;
  };

  // Öncelikle TOPLAM / GENEL TOPLAM anahtar kelimeli satırları tara
  let detectedAmount = 0;
  const totalKeywords = [
    'GENEL TOPLAM',
    'TOPLAM TUTAR',
    'TOPLAM',
    'ODENEN',
    'ÖDENEN',
    'KREDI KARTI',
    'KREDİ KARTI',
    'NAKIT',
    'NAKİT',
    'TUTAR',
    'ARA TOPLAM',
    'TOTAL',
    'AMOUNT'
  ];

  // Satırları sondan başa doğru tara (çünkü toplam genelde fişin altındadır!)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    for (const kw of totalKeywords) {
      if (upperLine.includes(kw)) {
        // Satırdaki sayıları ara
        const numMatches = line.match(/(?:₺|TL)?\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})|[0-9]+[.,][0-9]{2})/g);
        if (numMatches && numMatches.length > 0) {
          const cand = cleanNumber(numMatches[numMatches.length - 1]);
          if (cand > 0) {
            detectedAmount = cand;
            break;
          }
        }
      }
    }
    if (detectedAmount > 0) break;
  }

  // Eğer yukarıdan çıkmadıysa, metindeki en mantıklı para tutarlarını tara
  if (detectedAmount === 0) {
    const allAmounts = text.match(/\b([0-9]{1,3}(?:[.,][0-9]{3})*[.,][0-9]{2})\b/g);
    if (allAmounts && allAmounts.length > 0) {
      const numbers = allAmounts.map(cleanNumber).filter(n => n > 0 && n < 1000000);
      if (numbers.length > 0) {
        // Fişlerde toplam genelde bulunan en büyük sayıdır
        detectedAmount = Math.max(...numbers);
      }
    }
  }

  if (detectedAmount > 0) {
    result.amount = Math.round(detectedAmount * 100) / 100;
    result.formattedAmount = result.amount.toFixed(2);
  }

  // 5. KDV Özeti
  const kdvMatches = text.match(/%?\s*(?:1|8|10|18|20)\s*(?:KDV|VERG[İI])/i);
  if (kdvMatches) {
    result.taxSummary = kdvMatches[0].trim();
  }

  return result;
}

/**
 * Cihazdan çekilen veya galeriden seçilen görseli OCR Space API ile tarar
 */
export async function scanReceiptWithOcrSpace(
  base64Data: string,
  imageMimeType: string = 'image/jpeg'
): Promise<ParsedReceiptData> {
  const cleanBase64 = base64Data.includes('base64,') 
    ? base64Data 
    : `data:${imageMimeType};base64,${base64Data}`;

  const formData = new URLSearchParams();
  formData.append('apikey', OCR_API_KEY);
  formData.append('language', 'tur');
  formData.append('isOverlayRequired', 'false');
  formData.append('base64Image', cleanBase64);
  formData.append('scale', 'true');
  formData.append('detectOrientation', 'true');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 saniye zaman aşımı

  try {
    const response = await fetch(OCR_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OCR Sunucu Hatası: ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      const errMsg = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(', ') : 'Görsel okunamadı';
      throw new Error(errMsg);
    }

    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      throw new Error('Görselde okunabilir metin bulunamadı.');
    }

    const parsedText = data.ParsedResults[0]?.ParsedText || '';
    return parseReceiptText(parsedText);
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('OCR Space API uyarısı:', error?.message);
    throw error;
  }
}
