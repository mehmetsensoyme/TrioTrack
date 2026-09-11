/**
 * TrioTrack Evrensel Para ve Ondalık Sayı Biçimlendirici (v1.6.8)
 * 
 * Türk Lirası ve uluslararası finans standartlarına uygun olarak:
 * - Binlik ayıracı: . (nokta)
 * - Ondalık ayıracı: , (virgül)
 * - Sabit 2 hane kuruş/ondalık hassasiyeti: 1.000,00
 */

/**
 * Sayıyı sabit 2 ondalık basamaklı Türk standart formatına dönüştürür.
 * Örnekler:
 * 1000 -> "1.000,00"
 * 250.5 -> "250,50"
 * 0 -> "0,00"
 * -1500.25 -> "-1.500,25"
 */
export function formatNumber(value: number | string | undefined | null): string {
  if (value === null || value === undefined || value === '') return '0,00';
  
  let num: number;
  if (typeof value === 'string') {
    // Eğer "1.000,50" veya "1000.50" veya "1000,50" formatındaysa temizle
    const cleanStr = value.includes(',') && value.includes('.')
      ? value.replace(/\./g, '').replace(',', '.')
      : value.replace(',', '.');
    num = parseFloat(cleanStr);
  } else {
    num = value;
  }

  if (isNaN(num)) return '0,00';

  const isNeg = num < 0;
  const absNum = Math.abs(num);

  try {
    const formatted = absNum.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isNeg ? `-${formatted}` : formatted;
  } catch {
    // Intl API kısıtlı cihazlar için güvenli yedek
    const parts = absNum.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const res = parts.join(',');
    return isNeg ? `-${res}` : res;
  }
}

/**
 * Para birimi sembolü ve isteğe bağlı işaret (+ / - / ↔) ile tam finansal metin üretir.
 * 
 * Örnekler:
 * formatCurrency(1000, '₺') -> "₺ 1.000,00"
 * formatCurrency(1000, '₺', { showSign: true }) -> "+₺ 1.000,00"
 * formatCurrency(-1000, '₺') -> "-₺ 1.000,00"
 * formatCurrency(500, '₺', { isTransfer: true }) -> "↔₺ 500,00"
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  currency: string = '₺',
  options?: { 
    showSign?: boolean; 
    isTransfer?: boolean;
    type?: 'income' | 'expense' | 'transfer';
    sign?: '+' | '-' | '↔';
    hideDecimals?: boolean;
  }
): string {
  let num: number;
  if (typeof amount === 'string') {
    const cleanStr = amount.includes(',') && amount.includes('.')
      ? amount.replace(/\./g, '').replace(',', '.')
      : amount.replace(',', '.');
    num = parseFloat(cleanStr);
  } else {
    num = amount ?? 0;
  }

  if (isNaN(num)) num = 0;

  const isNeg = num < 0;
  const absNum = Math.abs(num);
  const formattedNum = formatNumber(absNum);

  if (options?.isTransfer || options?.type === 'transfer' || options?.sign === '↔') {
    return `↔${currency} ${formattedNum}`;
  }

  if (options?.type === 'expense' || options?.sign === '-') {
    return `-${currency} ${formattedNum}`;
  }

  if (options?.type === 'income' || options?.sign === '+') {
    return `+${currency} ${formattedNum}`;
  }

  if (isNeg) {
    return `-${currency} ${formattedNum}`;
  }

  if (options?.showSign && num > 0) {
    return `+${currency} ${formattedNum}`;
  }

  return `${currency} ${formattedNum}`;
}

/**
 * Kullanıcı girdisinden (1.000,50 veya 1000,50 veya 1000.50) ham float değer üretir.
 */
export function parseCurrencyInput(input: string | number | undefined | null): number {
  if (input === null || input === undefined || input === '') return 0;
  if (typeof input === 'number') return isNaN(input) ? 0 : input;

  const str = input.trim();
  if (!str) return 0;

  // Hem nokta hem virgül varsa (örn 1.000,50)
  if (str.includes('.') && str.includes(',')) {
    const normalized = str.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(normalized);
    return isNaN(val) ? 0 : val;
  }

  // Sadece virgül varsa (örn 250,50)
  if (str.includes(',')) {
    const val = parseFloat(str.replace(',', '.'));
    return isNaN(val) ? 0 : val;
  }

  // Standart float
  const val = parseFloat(str);
  return isNaN(val) ? 0 : val;
}
