import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share, Platform } from 'react-native';

const LOCAL_SNAPSHOT_KEY = '@triotrack_local_snapshot';
const LOCAL_SNAPSHOT_META_KEY = '@triotrack_local_snapshot_meta';

export interface LocalSnapshotMeta {
  savedAt: string;
  transactionCount: number;
  accountCount: number;
  userName?: string;
  totalBalance?: number;
}

export interface NormalizedBackupResult {
  success: boolean;
  message: string;
  sourceType: 'triotrack' | 'zero' | 'paisa' | 'unknown';
  data?: any;
  stats?: {
    transactions: number;
    accounts: number;
    categories: number;
    debtors: number;
    budgets: number;
  };
}

/**
 * Cihaz hafızasından dosya seçici ile .json yedek dosyasını seçip içeriğini okur
 */
export async function pickBackupFile(): Promise<{ canceled: boolean; content?: string; fileName?: string; error?: string }> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/*', '*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { canceled: true };
    }

    const asset = result.assets[0];
    const fileUri = asset.uri;
    const fileName = asset.name || 'yedek.json';

    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return { canceled: false, content, fileName };
  } catch (err: any) {
    return { canceled: false, error: err?.message || 'Dosya okunurken bir hata oluştu.' };
  }
}

/**
 * Panodan metni okur
 */
export async function readClipboardBackup(): Promise<string> {
  try {
    return await Clipboard.getStringAsync();
  } catch {
    return '';
  }
}

/**
 * Metni panoya kopyalar
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Yedeği .json dosyası olarak oluşturup paylaşım/kaydetme menüsünü açar
 */
export async function shareBackupAsFile(jsonString: string): Promise<{ success: boolean; message?: string }> {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `TrioTrack_Yedek_${dateStr}.json`;
    const tempFileUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(tempFileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(tempFileUri, {
        mimeType: 'application/json',
        dialogTitle: 'TrioTrack Yedeğini Kaydet / Paylaş',
        UTI: 'public.json',
      });
      return { success: true };
    } else {
      await Share.share({
        title: fileName,
        message: jsonString,
      });
      return { success: true };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Yedek dosyası paylaşılamadı.' };
  }
}

/**
 * Cihazın yerel depolama alanına (AsyncStorage) anlık snapshot kaydeder
 */
export async function saveLocalSnapshot(jsonString: string, meta?: Partial<LocalSnapshotMeta>): Promise<boolean> {
  try {
    await AsyncStorage.setItem(LOCAL_SNAPSHOT_KEY, jsonString);
    const snapshotMeta: LocalSnapshotMeta = {
      savedAt: new Date().toISOString(),
      transactionCount: meta?.transactionCount || 0,
      accountCount: meta?.accountCount || 0,
      userName: meta?.userName || 'Kullanıcı',
      totalBalance: meta?.totalBalance || 0,
    };
    await AsyncStorage.setItem(LOCAL_SNAPSHOT_META_KEY, JSON.stringify(snapshotMeta));
    return true;
  } catch {
    return false;
  }
}

/**
 * Cihazda saklanan yerel snapshot ve meta verisini getirir
 */
export async function getLocalSnapshot(): Promise<{ exists: boolean; content?: string; meta?: LocalSnapshotMeta }> {
  try {
    const content = await AsyncStorage.getItem(LOCAL_SNAPSHOT_KEY);
    const metaStr = await AsyncStorage.getItem(LOCAL_SNAPSHOT_META_KEY);
    if (!content) {
      return { exists: false };
    }
    const meta: LocalSnapshotMeta = metaStr ? JSON.parse(metaStr) : { savedAt: new Date().toISOString(), transactionCount: 0, accountCount: 0 };
    return { exists: true, content, meta };
  } catch {
    return { exists: false };
  }
}

/**
 * Ham JSON metnini inceler, TrioTrack, Zero veya Paisa formatını tespit edip normalize eder
 */
export function parseAndNormalizeBackup(rawJson: string): NormalizedBackupResult {
  if (!rawJson || !rawJson.trim()) {
    return { success: false, message: 'Yedek verisi boş.', sourceType: 'unknown' };
  }

  try {
    const parsed = JSON.parse(rawJson.trim());
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Geçersiz JSON formatı.', sourceType: 'unknown' };
    }

    // 1. Durum: Native TrioTrack formatı
    if (parsed.app === 'TrioTrack' || Array.isArray(parsed.transactions)) {
      const stats = {
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions.length : 0,
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts.length : 0,
        categories: Array.isArray(parsed.categories) ? parsed.categories.length : 0,
        debtors: Array.isArray(parsed.debtors) ? parsed.debtors.length : 0,
        budgets: Array.isArray(parsed.budgets) ? parsed.budgets.length : 0,
      };
      return {
        success: true,
        sourceType: 'triotrack',
        message: `TrioTrack yedeği (${stats.transactions} işlem, ${stats.accounts} cüzdan)`,
        data: parsed,
        stats,
      };
    }

    // 2. Durum: Zero formatı (expenses, categories, debtors, debts)
    if (Array.isArray(parsed.expenses) || Array.isArray(parsed.debts)) {
      const convertedTransactions = (parsed.expenses || []).map((exp: any, index: number) => ({
        id: `zero_tx_${Date.now()}_${index}`,
        title: exp.title || 'Harcama',
        amount: typeof exp.amount === 'number' ? Math.abs(exp.amount) : 0,
        type: 'expense' as const,
        categoryId: exp.category?.name || 'cat_other',
        accountId: 'acc_zero_default',
        date: exp.date ? new Date(exp.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        note: exp.description || 'Zero içe aktarımı',
      }));

      const convertedCategories = (parsed.categories || []).map((cat: any, index: number) => ({
        id: cat.id || `cat_zero_${index}`,
        name: cat.name || 'Kategori',
        icon: cat.icon || 'pricetag-outline',
        color: cat.color || '#4CAF50',
        type: 'expense' as const,
      }));

      const convertedDebtors = (parsed.debtors || []).map((d: any, index: number) => ({
        id: `debt_zero_${index}`,
        name: d.title || 'Borçlu',
        amount: 0,
        type: 'debt' as const,
        debtCategory: 'person' as const,
        date: new Date().toISOString().slice(0, 10),
        status: 'active' as const,
        note: 'Zero borç kaydı',
      }));

      const defaultAccount = {
        id: 'acc_zero_default',
        name: 'Zero Nakit Cüzdan',
        type: 'cash' as const,
        balance: 0,
        color: '#16a34a',
        icon: 'wallet-outline',
      };

      const normalized = {
        transactions: convertedTransactions,
        categories: convertedCategories,
        debtors: convertedDebtors,
        accounts: [defaultAccount],
        userName: parsed.users?.[0]?.username || 'Zero Kullanıcısı',
      };

      return {
        success: true,
        sourceType: 'zero',
        message: `Zero yedeği algılandı (${convertedTransactions.length} harcama, ${convertedCategories.length} kategori dönüştürüldü)`,
        data: normalized,
        stats: {
          transactions: convertedTransactions.length,
          accounts: 1,
          categories: convertedCategories.length,
          debtors: convertedDebtors.length,
          budgets: 0,
        },
      };
    }

    // 3. Durum: Paisa formatı
    if (parsed.app === 'Paisa' || (Array.isArray(parsed.accounts) && !parsed.transactions)) {
      return {
        success: true,
        sourceType: 'paisa',
        message: 'Paisa yedeği algılandı',
        data: parsed,
        stats: {
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions.length : 0,
          accounts: Array.isArray(parsed.accounts) ? parsed.accounts.length : 0,
          categories: Array.isArray(parsed.categories) ? parsed.categories.length : 0,
          debtors: 0,
          budgets: 0,
        },
      };
    }

    return { success: false, message: 'Tanınmayan yedek biçimi.', sourceType: 'unknown' };
  } catch (err: any) {
    return { success: false, message: 'JSON ayrıştırılamadı: ' + err.message, sourceType: 'unknown' };
  }
}
