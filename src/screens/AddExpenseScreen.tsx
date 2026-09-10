import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal, 
  Animated, 
  Easing,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { POPULAR_BRANDS, BRAND_CATEGORIES, BrandItem } from '../constants/brands';
import { 
  PAISA_CORE_CATEGORIES, 
  PAISA_EXTENDED_CATEGORIES, 
  searchPaisaIcons, 
  PaisaIconItem,
  PaisaCategoryGroup,
  VECTOR_CATEGORY_NAMES
} from '../constants/paisaIcons';
import { scanReceiptWithOcrSpace, parseReceiptText, ParsedReceiptData } from '../utils/ocrService';

// Akıllı Marka Logosu (Hata durumunda otomatik vektör ikon veya monogram rozet fallback)
const BrandLogoImage: React.FC<{ 
  brand: BrandItem; 
  size?: number; 
  color?: string; 
}> = ({ brand, size = 22, color }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    if (brand.vectorIcon) {
      return <Ionicons name={brand.vectorIcon as any} size={size} color={color || brand.color} />;
    }
    return (
      <Text style={{ 
        fontWeight: 'bold', 
        fontSize: size * 0.55, 
        color: color || brand.color 
      }}>
        {brand.monogram || brand.name.slice(0, 2).toUpperCase()}
      </Text>
    );
  }

  return (
    <Image
      source={{ uri: brand.logoUrl }}
      style={{ width: size, height: size, borderRadius: 5 }}
      resizeMode="contain"
      onError={() => setHasError(true)}
    />
  );
};

const PALETTE_COLORS = [
  '#FF9800', '#E91E63', '#2196F3', '#9C27B0', 
  '#4CAF50', '#F44336', '#009688', '#3F51B5', 
  '#795548', '#607D8B', '#10B981', '#6366F1'
];

// Gerçekçi Akıllı Fiş Presetleri (OCR Simülasyonu)
const RECEIPT_PRESETS = [
  {
    store: 'BİM Birleşik Mağazalar A.Ş.',
    amount: '248.50',
    receiptNo: '#FŞ-0482',
    categoryId: 'cat_market',
    categoryName: 'Market & Gıda',
    icon: 'cart-outline',
    color: '#FF9800',
    desc: 'Haftalık temel gıda & temizlik alışverişi'
  },
  {
    store: 'Starbucks Coffee',
    amount: '135.00',
    receiptNo: '#FŞ-1109',
    categoryId: 'cat_dining',
    categoryName: 'Yemek & Kafe',
    icon: 'cafe-outline',
    color: '#E91E63',
    desc: 'Filtre Kahve & Kurabiye'
  },
  {
    store: 'Opet Akaryakıt',
    amount: '1250.00',
    receiptNo: '#FŞ-8471',
    categoryId: 'cat_transport',
    categoryName: 'Ulaşım & Akaryakıt',
    icon: 'car-outline',
    color: '#2196F3',
    desc: 'Kurşunsuz Motorin / Benzin Dolumu'
  },
  {
    store: 'Enerjisa Elektrik Dağıtım',
    amount: '480.00',
    receiptNo: '#FAT-2026-904',
    categoryId: 'cat_bills',
    categoryName: 'Faturalar & Abonelik',
    icon: 'flash-outline',
    color: '#9C27B0',
    desc: 'Aylık konut elektrik tüketim faturası'
  },
  {
    store: 'Merkez Şifa Eczanesi',
    amount: '320.00',
    receiptNo: '#ECZ-3912',
    categoryId: 'cat_health',
    categoryName: 'Sağlık & Eczane',
    icon: 'medkit-outline',
    color: '#F44336',
    desc: 'Reçeteli ilaç ve vitamin takviyesi'
  }
];

export default function AddExpenseScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, styles: tStyles, currency, isDark } = useTheme();
  const { categories, accounts, addTransaction } = useData();

  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  // Logo & Marka CDN & Özel Simge
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconModalTab, setIconModalTab] = useState<'brands' | 'icons'>('brands');
  const [selectedBrandCategory, setSelectedBrandCategory] = useState<string>('Tümü');
  const [selectedVectorCategory, setSelectedVectorCategory] = useState<string>('Tümü');
  const [showMoreIcons, setShowMoreIcons] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  // Fiş / Fatura & Gerçek Kamera & OCR
  const [receiptImageUri, setReceiptImageUri] = useState<string | null>(null);
  const [receiptNo, setReceiptNo] = useState('');
  const [receiptAttached, setReceiptAttached] = useState(false);
  const [receiptStoreName, setReceiptStoreName] = useState('');
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [manualOCRInput, setManualOCRInput] = useState('');

  // Tarayıcı animasyonu
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Tarih seçimi (Bugün / Dün)
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const filteredCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));
  const [selectedCategoryId, setSelectedCategoryId] = useState(filteredCategories[0]?.id || categories[0]?.id || '');
  
  // Hesaplar (Kaynak ve Transfer için Hedef)
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');

  // Hesap Makinesi Modal Durumu (Paisa & Buckwheat Hibriti)
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcExpression, setCalcExpression] = useState('');
  const [calcPreview, setCalcPreview] = useState('0');

  const m = tStyles.fontSizeMultiplier;

  // Lazer Tarama Döngüsü
  useEffect(() => {
    if (showReceiptScanner) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [showReceiptScanner, scanAnim]);

  // Kamera ile Doğrudan Fiş Çekme ve Canlı OCR
  const handleCaptureWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Kamera İzni Gerekli', 'Fiş ve faturalarınızı doğrudan kamera ile taramak için lütfen kamera erişim izni verin.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setReceiptImageUri(asset.uri);
        setReceiptAttached(true);
        setShowReceiptScanner(true);
        await processReceiptOcr(asset.base64, asset.uri);
      }
    } catch (err: any) {
      Alert.alert('Kamera Hatası', err?.message || 'Kamera açılırken bir sorun oluştu.');
    }
  };

  // Galeriden Fiş / Fatura Seçme ve Canlı OCR
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Galeri İzni Gerekli', 'Fiş görseli yüklemek için lütfen fotoğraf kitaplığı izni verin.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setReceiptImageUri(asset.uri);
        setReceiptAttached(true);
        setShowReceiptScanner(true);
        await processReceiptOcr(asset.base64, asset.uri);
      }
    } catch (err: any) {
      Alert.alert('Galeri Hatası', err?.message || 'Görsel seçilirken bir sorun oluştu.');
    }
  };

  // Fiş Görselini OCR Motoru ile Ayrıştırma
  const processReceiptOcr = async (base64?: string | null, imgUri?: string) => {
    setIsScanningOCR(true);
    setOcrStatusText('Belge taranıyor, tutar ve fiş bilgileri yapay zeka ile okunuyor...');
    try {
      let parsed: ParsedReceiptData | null = null;
      if (base64) {
        try {
          parsed = await scanReceiptWithOcrSpace(base64);
        } catch (apiErr) {
          console.warn('OCR Space API uyarısı, yerel heuristik devrede:', apiErr);
        }
      }

      if (parsed && (parsed.amount || parsed.storeName || parsed.receiptNo)) {
        if (parsed.formattedAmount) setAmount(parsed.formattedAmount);
        if (parsed.receiptNo) setReceiptNo(parsed.receiptNo);
        if (parsed.date) setSelectedDate(parsed.date);
        if (parsed.storeName) {
          setTitle(parsed.storeName);
          setReceiptStoreName(parsed.storeName);
        }
        if (parsed.matchedBrand) {
          setBrandLogoUrl(parsed.matchedBrand.logoUrl);
          setCustomColor(parsed.matchedBrand.color);
          const matchedCat = categories.find(c => 
            c.name.toLowerCase().includes(parsed!.matchedBrand!.defaultCategoryKeyword.toLowerCase()) ||
            c.id.includes(parsed!.matchedBrand!.defaultCategoryKeyword)
          );
          if (matchedCat) {
            setSelectedCategoryId(matchedCat.id);
          }
        }
        setReceiptAttached(true);
        setIsScanningOCR(false);
        setOcrStatusText('');
        setShowReceiptScanner(false);
        Alert.alert(
          'Fiş Başarıyla Ayrıştırıldı 🎉',
          `Mağaza: ${parsed.storeName || 'Fiş'}\nTutar: ${currency} ${parsed.formattedAmount || amount}\nFiş No: ${parsed.receiptNo || receiptNo}`
        );
      } else {
        const fallbackNo = `#FŞ-${Math.floor(1000 + Math.random() * 9000)}`;
        setReceiptNo(prev => prev || fallbackNo);
        setReceiptAttached(true);
        setIsScanningOCR(false);
        setOcrStatusText('');
        setShowReceiptScanner(false);
        Alert.alert(
          'Fiş Fotoğrafı İliştirildi 📸',
          'Fiş görseli işleme başarıyla eklendi. Tutar ve açıklamayı kontrol edebilirsiniz.'
        );
      }
    } catch (err: any) {
      setIsScanningOCR(false);
      setOcrStatusText('');
      setShowReceiptScanner(false);
      Alert.alert('Belge Eklendi', 'Fiş görseli eklendi. Tutar alanını manuel tamamlayabilirsiniz.');
    }
  };

  // Marka Seçildiğinde Çağrılır
  const handleSelectBrand = (brand: BrandItem) => {
    setBrandLogoUrl(brand.logoUrl);
    setCustomColor(brand.color);
    setCustomIcon(null);
    if (!title.trim() || POPULAR_BRANDS.some(b => b.name === title)) {
      setTitle(brand.name);
    }
    const matched = categories.find(c => 
      c.name.toLowerCase().includes(brand.defaultCategoryKeyword.toLowerCase()) ||
      c.id.toLowerCase().includes(brand.defaultCategoryKeyword.toLowerCase())
    );
    if (matched) {
      setSelectedCategoryId(matched.id);
    }
    setShowIconModal(false);
  };

  // Paisa Vektörel Simge Seçildiğinde Çağrılır
  const handleSelectPaisaIcon = (item: PaisaIconItem) => {
    setCustomIcon(item.icon);
    setBrandLogoUrl(null);
    if (item.brandColor) {
      setCustomColor(item.brandColor);
    } else if (!customColor) {
      setCustomColor(PALETTE_COLORS[0]);
    }
    if (item.isBrand && (!title.trim() || PAISA_CORE_CATEGORIES[0].icons.some(b => b.name === title))) {
      setTitle(item.name);
    }
  };

  // Otomatik Fiş No Üretici
  const handleGenerateReceiptNo = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newNo = `#FŞ-${randomNum}`;
    setReceiptNo(newNo);
    setReceiptAttached(true);
    Alert.alert('Fiş No Oluşturuldu', `Resmi fiş numarası kaydedildi: ${newNo}`);
  };

  // OCR Hazır Şablon Uygulama
  const handleApplyReceiptPreset = (preset: typeof RECEIPT_PRESETS[0]) => {
    setIsScanningOCR(true);
    setTimeout(() => {
      setIsScanningOCR(false);
      setAmount(preset.amount);
      setTitle(preset.store);
      setReceiptNo(preset.receiptNo);
      setReceiptStoreName(preset.store);
      setReceiptAttached(true);
      setNote(`${preset.desc} • ${preset.receiptNo}`);
      
      const matchedCat = categories.find(c => c.id === preset.categoryId || c.name.toLowerCase().includes(preset.categoryName.toLowerCase()));
      if (matchedCat) {
        setSelectedCategoryId(matchedCat.id);
      }
      setCustomIcon(preset.icon);
      setCustomColor(preset.color);
      setShowReceiptScanner(false);
      Alert.alert('Fiş Başarıyla Ayrıştırıldı 🎉', `İşlem: ${preset.store}\nTutar: ${currency} ${preset.amount}\nFiş No: ${preset.receiptNo}`);
    }, 500);
  };

  // Özel Fiş Metni Regex ile OCR Ayrıştırma
  const handleParseCustomOCRText = () => {
    if (!manualOCRInput.trim()) {
      Alert.alert('Uyarı', 'Lütfen fiş üzerindeki metni girin veya yapıştırın.');
      return;
    }

    setIsScanningOCR(true);
    setTimeout(() => {
      setIsScanningOCR(false);
      const parsed = parseReceiptText(manualOCRInput);
      
      if (parsed.formattedAmount) setAmount(parsed.formattedAmount);
      if (parsed.receiptNo) setReceiptNo(parsed.receiptNo);
      if (parsed.date) setSelectedDate(parsed.date);
      if (parsed.storeName) {
        setTitle(parsed.storeName);
        setReceiptStoreName(parsed.storeName);
      }
      if (parsed.matchedBrand) {
        setBrandLogoUrl(parsed.matchedBrand.logoUrl);
        setCustomColor(parsed.matchedBrand.color);
      }
      setReceiptAttached(true);
      setNote(`OCR Metin Ayrıştırma • ${parsed.receiptNo}`);
      setShowReceiptScanner(false);
      setManualOCRInput('');
      Alert.alert('Metin Ayrıştırıldı', `Fiş No: ${parsed.receiptNo}\nTutar: ${parsed.formattedAmount || 'Manuel Belirtin'}`);
    }, 400);
  };

  // Hesap Makinesi Tuş İşlemleri
  const handleCalcInput = (key: string) => {
    if (key === 'AC') {
      setCalcExpression('');
      setCalcPreview('0');
      return;
    }
    if (key === 'DEL') {
      const updated = calcExpression.slice(0, -1);
      setCalcExpression(updated);
      calculateSafe(updated);
      return;
    }
    if (key === '=') {
      const res = calculateSafe(calcExpression);
      if (res) {
        setCalcExpression(res);
        setCalcPreview(res);
      }
      return;
    }

    const updated = calcExpression + key;
    setCalcExpression(updated);
    calculateSafe(updated);
  };

  const calculateSafe = (expr: string): string => {
    try {
      if (!expr.trim()) {
        setCalcPreview('0');
        return '0';
      }
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = Function("'use strict'; return (" + sanitized + ")")();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const formatted = (Math.round(result * 100) / 100).toString();
        setCalcPreview(formatted);
        return formatted;
      }
    } catch {
      // formül tamamlanmamış olabilir
    }
    return '';
  };

  const applyCalculatorResult = () => {
    const finalVal = calcPreview !== '0' && calcPreview ? calcPreview : calcExpression;
    if (finalVal && !isNaN(parseFloat(finalVal))) {
      setAmount(finalVal);
    }
    setShowCalculator(false);
  };

  const handleSave = async () => {
    if (!amount.trim()) {
      Alert.alert('Eksik Alan', 'Lütfen tutar girin.');
      return;
    }

    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin.');
      return;
    }

    if (type === 'transfer' && selectedAccountId === targetAccountId) {
      Alert.alert('Transfer Hatası', 'Kaynak ve hedef hesap aynı olamaz. Lütfen farklı bir cüzdan seçin.');
      return;
    }

    const sourceAcc = accounts.find(a => a.id === selectedAccountId);
    const destAcc = accounts.find(a => a.id === targetAccountId);

    let finalTitle = title.trim();
    if (!finalTitle) {
      if (type === 'transfer') {
        finalTitle = `${sourceAcc?.name || 'Hesap'} ➔ ${destAcc?.name || 'Hesap'}`;
      } else {
        const cat = categories.find(c => c.id === selectedCategoryId);
        finalTitle = cat?.name || (type === 'expense' ? 'Gider' : 'Gelir');
      }
    }

    await addTransaction({
      title: finalTitle,
      amount: val,
      type,
      categoryId: type === 'transfer' ? 'cat_transfer' : selectedCategoryId,
      accountId: selectedAccountId,
      toAccountId: type === 'transfer' ? targetAccountId : undefined,
      date: selectedDate,
      note,
      receiptNo: receiptAttached && receiptNo.trim() ? receiptNo.trim() : undefined,
      receiptImage: receiptAttached ? (receiptImageUri || 'receipt_attached_doc') : undefined,
      customIcon: customIcon || undefined,
      customColor: customColor || undefined,
      brandLogoUrl: brandLogoUrl || undefined,
    });

    navigation.goBack();
  };

  const selectedCategoryObj = categories.find(c => c.id === selectedCategoryId);
  const displayIcon = customIcon || selectedCategoryObj?.icon || 'pricetag-outline';
  const displayColor = customColor || selectedCategoryObj?.color || colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m, fontWeight: tStyles.titleWeight }]}>
            Yeni İşlem Ekle
          </Text>
          <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
            TrioTrack v1.6.0 Hibrit Finans
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.calcHeaderBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
          onPress={() => {
            setCalcExpression(amount || '');
            setCalcPreview(amount || '0');
            setShowCalculator(true);
          }}
        >
          <Ionicons name="calculator-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* 3 Sekmeli Tip Seçici (Paisa Tarzı: Gider / Gelir / Transfer) */}
        <View style={[styles.typeTabBar, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
          <TouchableOpacity
            style={[
              styles.typeBtn, 
              type === 'expense' && { backgroundColor: '#E91E63', borderRadius: Math.max(tStyles.roundness / 2, 6) }
            ]}
            onPress={() => {
              setType('expense');
              const cats = categories.filter(c => c.type === 'expense');
              if (cats.length > 0) setSelectedCategoryId(cats[0].id);
            }}
          >
            <Text style={[styles.typeBtnText, { color: type === 'expense' ? '#FFF' : colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              Gider
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeBtn, 
              type === 'income' && { backgroundColor: '#4CAF50', borderRadius: Math.max(tStyles.roundness / 2, 6) }
            ]}
            onPress={() => {
              setType('income');
              const cats = categories.filter(c => c.type === 'income');
              if (cats.length > 0) setSelectedCategoryId(cats[0].id);
            }}
          >
            <Text style={[styles.typeBtnText, { color: type === 'income' ? '#FFF' : colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              Gelir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeBtn, 
              type === 'transfer' && { backgroundColor: '#7C3AED', borderRadius: Math.max(tStyles.roundness / 2, 6) }
            ]}
            onPress={() => setType('transfer')}
          >
            <Text style={[styles.typeBtnText, { color: type === 'transfer' ? '#FFF' : colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              Transfer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tutar Kartı (Hesap Makinesi Entegreli) */}
        <View style={[styles.amountCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.amountHeaderRow}>
            <Text style={[styles.label, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              TUTAR
            </Text>
            <TouchableOpacity 
              style={styles.inlineCalcTrigger}
              onPress={() => {
                setCalcExpression(amount || '');
                setCalcPreview(amount || '0');
                setShowCalculator(true);
              }}
            >
              <Ionicons name="calculator-outline" size={15} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 11 * m, fontFamily: tStyles.fontFamily, fontWeight: 'bold', marginLeft: 4 }}>
                Hesap Makinesi
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amountInputRow}>
            <Text style={[styles.currencySymbol, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 32 * m }]}>
              {currency}
            </Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 34 * m }]}
              placeholder="0.00"
              placeholderTextColor={colors.text + '40'}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
        </View>

        {/* İşlem Başlığı & Özel Logo/İkon Seçici (Paisa) */}
        <View style={[styles.inputCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.label, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              {type === 'transfer' ? 'TRANSFER AÇIKLAMASI' : 'İŞLEM ADI'}
            </Text>
            
            {/* Özel İkon & Logo Seçici Butonu */}
            <TouchableOpacity 
              style={[styles.customIconPill, { backgroundColor: displayColor + '18', borderRadius: 16 }]}
              onPress={() => setShowIconModal(true)}
            >
              {brandLogoUrl ? (
                <Image source={{ uri: brandLogoUrl }} style={{ width: 16, height: 16, borderRadius: 4, marginRight: 4 }} resizeMode="contain" />
              ) : (
                <Ionicons name={displayIcon as any} size={15} color={displayColor} />
              )}
              <Text style={{ color: displayColor, fontSize: 11 * m, fontFamily: tStyles.fontFamily, fontWeight: 'bold', marginLeft: 4 }}>
                {brandLogoUrl ? 'Marka Logosu' : customIcon ? 'Özel Simge' : 'Simge ve Logo Seç'}
              </Text>
              <Ionicons name="color-palette-outline" size={13} color={displayColor} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              style={[styles.iconAvatarBox, { backgroundColor: displayColor + '20', borderRadius: 12, overflow: 'hidden' }]}
              onPress={() => setShowIconModal(true)}
            >
              {brandLogoUrl ? (
                <Image source={{ uri: brandLogoUrl }} style={{ width: 28, height: 28, borderRadius: 6 }} resizeMode="contain" />
              ) : (
                <Ionicons name={displayIcon as any} size={22} color={displayColor} />
              )}
            </TouchableOpacity>
            <TextInput
              style={[styles.textInput, { flex: 1, marginLeft: 12, color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m }]}
              placeholder={type === 'transfer' ? 'Örn: Bankadan Nakit Çekme...' : 'Örn: BİM Market, Netflix, Starbucks...'}
              placeholderTextColor={colors.text + '50'}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* 🌟 FİŞ & FATURA OTOMATİK TANIMA (OCR) MERKEZİ */}
        <View style={[styles.receiptHubCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.receiptHubHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.receiptHubIconBox, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="document-text-outline" size={18} color="#10B981" />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.receiptHubTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }]}>
                  Fiş & Fatura Belgesi
                </Text>
                <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m, fontFamily: tStyles.fontFamily }}>
                  Kamera ile Canlı OCR & Fiş No Ayrıştırma
                </Text>
              </View>
            </View>

            {receiptAttached && (
              <View style={[styles.receiptAttachedBadge, { backgroundColor: '#10B98125' }]}>
                <Ionicons name="checkmark-circle" size={13} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={{ color: '#10B981', fontSize: 10 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }}>
                  Eklendi
                </Text>
              </View>
            )}
          </View>

          {receiptAttached ? (
            /* Fiş Ekli Görünümü (Gerçek Fotoğraf Önizlemeli) */
            <View style={[styles.attachedInfoBox, { backgroundColor: colors.background, borderRadius: tStyles.roundness / 1.5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {receiptImageUri ? (
                  <View style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.1)', marginRight: 10 }}>
                    <Image source={{ uri: receiptImageUri }} style={{ width: 44, height: 44 }} resizeMode="cover" />
                  </View>
                ) : (
                  <Ionicons name="receipt" size={24} color={colors.primary} style={{ marginRight: 10 }} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }}>
                    {receiptNo || 'Kayıtlı Fiş / Belge'}
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
                    {receiptStoreName ? `${receiptStoreName} • ` : ''}Tutar: {currency} {amount || '0.00'}
                  </Text>
                  {receiptImageUri && (
                    <Text style={{ color: '#10B981', fontSize: 10 * m, fontFamily: tStyles.fontFamily, fontWeight: 'bold', marginTop: 2 }}>
                      📸 Fotoğraf Belgesi İliştirildi
                    </Text>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  style={[styles.removeReceiptBtn, { marginRight: 6 }]}
                  onPress={handleCaptureWithCamera}
                >
                  <Ionicons name="camera-outline" size={18} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.removeReceiptBtn}
                  onPress={() => {
                    setReceiptAttached(false);
                    setReceiptNo('');
                    setReceiptStoreName('');
                    setReceiptImageUri(null);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Fiş Ekleme / Tarama Butonları */
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TouchableOpacity 
                  style={[styles.receiptActionBtn, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                  onPress={handleCaptureWithCamera}
                >
                  <Ionicons name="camera-outline" size={16} color={colors.onPrimary} />
                  <Text style={[styles.receiptActionText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: 'bold', marginLeft: 6 }]}>
                    Kamera ile Çek (OCR)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.receiptActionBtnSec, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                  onPress={handlePickFromGallery}
                >
                  <Ionicons name="images-outline" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: '600', marginLeft: 5 }}>
                    Galeriden Seç
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity 
                  style={[styles.receiptActionBtnSec, { flex: 1, backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                  onPress={() => setShowReceiptScanner(true)}
                >
                  <Ionicons name="scan-outline" size={14} color={colors.text} style={{ opacity: 0.7 }} />
                  <Text style={{ color: colors.text, opacity: 0.8, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: '600', marginLeft: 5 }}>
                    OCR Menüsü & Şablonlar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.receiptActionBtnSec, { flex: 0.8, backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                  onPress={handleGenerateReceiptNo}
                >
                  <Ionicons name="flash-outline" size={14} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: '600', marginLeft: 5 }}>
                    Fiş No Üret
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Hızlı Tarih Seçici Çipleri */}
        <View style={styles.dateSelectorRow}>
          <Text style={[styles.label, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m, marginBottom: 8 }]}>
            İŞLEM TARİHİ
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            <TouchableOpacity
              style={[
                styles.dateChip,
                { backgroundColor: colors.card, borderRadius: tStyles.roundness },
                selectedDate === todayStr && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setSelectedDate(todayStr)}
            >
              <Ionicons name="today-outline" size={14} color={selectedDate === todayStr ? colors.onPrimary : colors.text} />
              <Text style={[styles.dateChipText, { color: selectedDate === todayStr ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                Bugün ({todayStr.slice(5)})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateChip,
                { backgroundColor: colors.card, borderRadius: tStyles.roundness },
                selectedDate === yesterdayStr && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setSelectedDate(yesterdayStr)}
            >
              <Ionicons name="time-outline" size={14} color={selectedDate === yesterdayStr ? colors.onPrimary : colors.text} />
              <Text style={[styles.dateChipText, { color: selectedDate === yesterdayStr ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                Dün ({yesterdayStr.slice(5)})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* GİDER VE GELİR İÇİN: Kategori Seçici */}
        {type !== 'transfer' && (
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: tStyles.titleWeight }]}>
              Kategori Seçin
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8, marginTop: 4 }}>
              {filteredCategories.map(cat => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      { backgroundColor: colors.card, borderRadius: tStyles.roundness },
                      isSelected && { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primary + '15' }
                    ]}
                    onPress={() => {
                      setSelectedCategoryId(cat.id);
                      if (!customIcon) setCustomColor(null);
                    }}
                  >
                    <View style={[styles.catIconCircle, { backgroundColor: cat.color + '25' }]}>
                      <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                    </View>
                    <Text style={[styles.catName, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* TRANSFER İÇİN: Kaynak ve Hedef Hesap Seçimi */}
        {type === 'transfer' ? (
          <View style={[styles.transferBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation, marginBottom: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: tStyles.titleWeight }]}>
              Transfer Akışı
            </Text>

            {/* Kaynak Hesap */}
            <Text style={[styles.transferSubLabel, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              Kaynak Cüzdan (Para Çıkışı):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
              {accounts.map(acc => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.accChip,
                      { backgroundColor: colors.background, borderRadius: tStyles.roundness },
                      isSelected && { borderColor: '#E91E63', borderWidth: 2, backgroundColor: '#E91E63' + '15' }
                    ]}
                    onPress={() => setSelectedAccountId(acc.id)}
                  >
                    <Ionicons name={acc.icon as any} size={16} color={isSelected ? '#E91E63' : acc.color} />
                    <Text style={[styles.accChipText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ alignItems: 'center', marginVertical: 4 }}>
              <View style={[styles.transferArrowCircle, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="arrow-down" size={18} color={colors.primary} />
              </View>
            </View>

            {/* Hedef Hesap */}
            <Text style={[styles.transferSubLabel, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              Hedef Cüzdan (Para Girişi):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
              {accounts.map(acc => {
                const isSelected = targetAccountId === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.accChip,
                      { backgroundColor: colors.background, borderRadius: tStyles.roundness },
                      isSelected && { borderColor: '#4CAF50', borderWidth: 2, backgroundColor: '#4CAF50' + '15' }
                    ]}
                    onPress={() => setTargetAccountId(acc.id)}
                  >
                    <Ionicons name={acc.icon as any} size={16} color={isSelected ? '#4CAF50' : acc.color} />
                    <Text style={[styles.accChipText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          /* NORMAL HESAP SEÇİCİ */
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: tStyles.titleWeight }]}>
              Ödeme Hesabı (Cüzdan)
            </Text>
            <View style={styles.accountRow}>
              {accounts.map(acc => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.accChip,
                      { backgroundColor: colors.card, borderRadius: tStyles.roundness },
                      isSelected && { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primary + '15' }
                    ]}
                    onPress={() => setSelectedAccountId(acc.id)}
                  >
                    <Ionicons name={acc.icon as any} size={18} color={isSelected ? colors.primary : acc.color} />
                    <Text style={[styles.accChipText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Not (İsteğe Bağlı) */}
        <View style={[styles.inputCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation, marginTop: 4 }]}>
          <Text style={[styles.label, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
            NOT / AÇIKLAMA (İSTEĞE BAĞLI)
          </Text>
          <TextInput
            style={[styles.textInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}
            placeholder="Ek açıklama, etiket veya garanti notu..."
            placeholderTextColor={colors.text + '50'}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Kaydet Butonu */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: tStyles.roundness }]}
          onPress={handleSave}
        >
          <Ionicons name="checkmark" size={22} color={colors.onPrimary} style={{ marginRight: 8 }} />
          <Text style={[styles.saveBtnText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 16 * m, fontWeight: tStyles.titleWeight }]}>
            {type === 'transfer' ? 'Transferi Kaydet' : 'İşlemi Kaydet'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 🌟 1. AKILLI FİŞ VE FATURA OCR MODALI */}
      <Modal 
        visible={showReceiptScanner} 
        animationType="slide" 
        transparent 
        statusBarTranslucent={true}
        onRequestClose={() => setShowReceiptScanner(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.backdropDismissArea} 
            activeOpacity={1} 
            onPress={() => setShowReceiptScanner(false)} 
          />

          <View style={[styles.ocrModalCard, { backgroundColor: colors.card, borderTopLeftRadius: tStyles.roundness * 1.5, borderTopRightRadius: tStyles.roundness * 1.5 }]}>
            <View style={styles.calcHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="scan-circle-outline" size={24} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.calcModalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m, fontWeight: 'bold' }]}>
                  Akıllı Fiş & Fatura Tarayıcı (OCR)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowReceiptScanner(false)} style={styles.calcCloseBtn}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
              {/* Lazer Tarama & Canlı Önizleme Kartı */}
              <View style={[styles.ocrScannerBox, { backgroundColor: colors.background, borderRadius: tStyles.roundness }]}>
                {receiptImageUri ? (
                  <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: 110, borderRadius: 8 }} resizeMode="contain" />
                  </View>
                ) : (
                  <>
                    <Animated.View 
                      style={[
                        styles.laserLine, 
                        {
                          transform: [{
                            translateY: scanAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 90],
                            })
                          }]
                        }
                      ]} 
                    />
                    <Ionicons name="receipt-outline" size={40} color={colors.primary} style={{ opacity: 0.7 }} />
                    <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m, fontWeight: '600', marginTop: 6 }}>
                      Kamera & Optik Fiş Tanıma Alanı
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m, fontFamily: tStyles.fontFamily }}>
                      KDV, tutar, tarih ve fiş numarası otomatik algılanır
                    </Text>
                  </>
                )}
              </View>

              {/* Kamera ve Galeri Hızlı Eylem Butonları */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 6 }}>
                <TouchableOpacity
                  style={[styles.cameraModalBtn, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                  onPress={handleCaptureWithCamera}
                >
                  <Ionicons name="camera" size={18} color={colors.onPrimary} />
                  <Text style={{ color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontWeight: 'bold', fontSize: 12 * m, marginLeft: 6 }}>
                    Kamera ile Çek (OCR)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.galleryModalBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                  onPress={handlePickFromGallery}
                >
                  <Ionicons name="images-outline" size={18} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontWeight: 'bold', fontSize: 12 * m, marginLeft: 6 }}>
                    Galeriden Seç
                  </Text>
                </TouchableOpacity>
              </View>

              {isScanningOCR && (
                <View style={styles.ocrLoadingRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 12 * m, marginLeft: 8, fontWeight: 'bold' }}>
                    {ocrStatusText || 'Belge taranıyor ve alanlar ayrıştırılıyor...'}
                  </Text>
                </View>
              )}

              {/* Hızlı Hazır Fiş Şablonları */}
              <Text style={[styles.label, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 11 * m, marginTop: 12, marginBottom: 8 }]}>
                POPÜLER MAĞAZA VE FATURALAR (TEK DOKUNUŞLA TARA)
              </Text>

              {RECEIPT_PRESETS.map((preset, pIdx) => (
                <TouchableOpacity
                  key={pIdx}
                  style={[styles.presetRow, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                  onPress={() => handleApplyReceiptPreset(preset)}
                >
                  <View style={[styles.catIconCircle, { backgroundColor: preset.color + '20' }]}>
                    <Ionicons name={preset.icon as any} size={20} color={preset.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }}>
                      {preset.store}
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
                      {preset.desc}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }}>
                      {currency} {preset.amount}
                    </Text>
                    <Text style={{ color: '#10B981', fontSize: 10 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }}>
                      {preset.receiptNo}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Serbest Metin Ayrıştırıcı */}
              <View style={[styles.customOcrBox, { backgroundColor: colors.background, borderRadius: tStyles.roundness, marginTop: 10 }]}>
                <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m, fontWeight: 'bold', marginBottom: 4 }}>
                  Veya Fiş / Fatura Metnini Yapıştırın
                </Text>
                <TextInput
                  style={[styles.customOcrInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}
                  placeholder="Örn: MİGROS TİC. FİŞ NO: 0219 TOPLAM: 389.90 TL"
                  placeholderTextColor={colors.text + '50'}
                  multiline
                  numberOfLines={2}
                  value={manualOCRInput}
                  onChangeText={setManualOCRInput}
                />
                <TouchableOpacity
                  style={[styles.parseOcrBtn, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
                  onPress={handleParseCustomOCRText}
                >
                  <Ionicons name="flash-outline" size={14} color={colors.onPrimary} />
                  <Text style={{ color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 12 * m, fontWeight: 'bold', marginLeft: 4 }}>
                    Metinden Fiş No ve Tutarı Çıkar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 🌟 2. PAISA BİREBİR VEKTÖREL SİMGE & LOGO SEÇİCİ MODALI */}
      <Modal 
        visible={showIconModal} 
        animationType="slide" 
        transparent 
        statusBarTranslucent={true}
        onRequestClose={() => setShowIconModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.backdropDismissArea} 
            activeOpacity={1} 
            onPress={() => setShowIconModal(false)} 
          />

          <View style={[styles.calcModalCard, { backgroundColor: colors.card, borderTopLeftRadius: tStyles.roundness * 1.5, borderTopRightRadius: tStyles.roundness * 1.5, maxHeight: '90%' }]}>
            {/* Üst Bar: Sol Geri/Kapat, Başlık ('Simge ve Logo Seçimi'), Sağda 'Daha fazla' butonu */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.text + '15' }}>
              <TouchableOpacity 
                onPress={() => setShowIconModal(false)} 
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>

              <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m, fontWeight: 'bold' }}>
                Simge ve Logo Seçimi
              </Text>

              <TouchableOpacity 
                onPress={() => {
                  setShowMoreIcons(!showMoreIcons);
                  if (showMoreIcons) setIconSearchQuery('');
                }} 
                style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, backgroundColor: showMoreIcons ? colors.primary + '20' : 'transparent' }}
              >
                <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, fontWeight: 'bold' }}>
                  {showMoreIcons ? 'Daha az' : 'Daha fazla'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Arama Alanı (Daha Fazla Aktifken ya da Arama Yapılırken) */}
            {showMoreIcons && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7, marginTop: 10, borderWidth: 1, borderColor: colors.text + '20' }}>
                <Ionicons name="search-outline" size={17} color={colors.text} style={{ opacity: 0.5, marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, paddingVertical: 0 }}
                  placeholder="Simge veya marka ara (Netflix, Kahve, Fatura, Taksi)..."
                  placeholderTextColor={colors.text + '50'}
                  value={iconSearchQuery}
                  onChangeText={setIconSearchQuery}
                  autoCorrect={false}
                />
                {iconSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setIconSearchQuery('')} style={{ padding: 2 }}>
                    <Ionicons name="close-circle" size={16} color={colors.text} style={{ opacity: 0.6 }} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Profesyonel İki Sekmeli Seçici: Kurumsal Markalar vs Vektörel Simgeler */}
            <View style={{ flexDirection: 'row', backgroundColor: colors.background, borderRadius: 12, padding: 3, marginVertical: 10 }}>
              <TouchableOpacity
                style={[{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 }, iconModalTab === 'brands' && { backgroundColor: colors.card, elevation: 1 }]}
                onPress={() => setIconModalTab('brands')}
              >
                <Text style={{ color: iconModalTab === 'brands' ? colors.primary : colors.text, opacity: iconModalTab === 'brands' ? 1 : 0.6, fontWeight: 'bold', fontSize: 12.5 * m, fontFamily: tStyles.fontFamily }}>
                  Kurumsal Markalar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 }, iconModalTab === 'icons' && { backgroundColor: colors.card, elevation: 1 }]}
                onPress={() => setIconModalTab('icons')}
              >
                <Text style={{ color: iconModalTab === 'icons' ? colors.primary : colors.text, opacity: iconModalTab === 'icons' ? 1 : 0.6, fontWeight: 'bold', fontSize: 12.5 * m, fontFamily: tStyles.fontFamily }}>
                  Vektörel Simgeler
                </Text>
              </TouchableOpacity>
            </View>

            {iconModalTab === 'brands' ? (
              /* ✨ Kurumsal Markalar Sekmesi */
              <View style={{ flexShrink: 1 }}>
                {/* Kategori Filtre Çipleri */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8, maxHeight: 36 }}>
                  {BRAND_CATEGORIES.map(bCat => (
                    <TouchableOpacity
                      key={bCat}
                      style={[
                        styles.iconCatTab,
                        { backgroundColor: selectedBrandCategory === bCat ? colors.primary : colors.background, borderRadius: 16 }
                      ]}
                      onPress={() => setSelectedBrandCategory(bCat)}
                    >
                      <Text style={{ color: selectedBrandCategory === bCat ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: 'bold' }}>
                        {bCat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Popüler Markalar Izgarası (Sistem Ölçekli, Boşluksuz, Akıllı Fallback Korumalı) */}
                <ScrollView style={{ maxHeight: 290 }} showsVerticalScrollIndicator={false}>
                  <View style={styles.brandGrid}>
                    {POPULAR_BRANDS
                      .filter(b => {
                        const matchesCategory = selectedBrandCategory === 'Tümü' || b.category === selectedBrandCategory;
                        if (!iconSearchQuery.trim()) return matchesCategory;
                        const q = iconSearchQuery.toLowerCase().trim();
                        return (
                          b.name.toLowerCase().includes(q) ||
                          b.category.toLowerCase().includes(q) ||
                          b.keywords.some(k => k.toLowerCase().includes(q))
                        );
                      })
                      .map(brand => {
                        const isSelected = brandLogoUrl === brand.logoUrl;
                        return (
                          <TouchableOpacity
                            key={brand.id}
                            style={[
                              styles.brandGridCard,
                              { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) },
                              isSelected && { borderColor: brand.color, borderWidth: 2, backgroundColor: brand.color + '15' }
                            ]}
                            onPress={() => handleSelectBrand(brand)}
                          >
                            <View style={[styles.brandLogoCircle, { backgroundColor: brand.color + '20' }]}>
                              <BrandLogoImage brand={brand} size={22} color={brand.color} />
                            </View>
                            <Text numberOfLines={1} style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 10 * m, fontWeight: '600', marginTop: 4, textAlign: 'center' }}>
                              {brand.name}
                            </Text>
                            <Text numberOfLines={1} style={{ color: colors.text, opacity: 0.5, fontSize: 8.5 * m, textAlign: 'center', marginTop: 1 }}>
                              {brand.category.split('&')[0].trim()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </ScrollView>
              </View>
            ) : (
              /* 🎨 Paisa Vektörel Simgeler & Renk Paleti Sekmesi */
              <View style={{ flexShrink: 1 }}>
                {/* Vurgu Rengi Paleti */}
                <View style={{ marginBottom: 10 }}>
                  <Text style={[styles.label, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 10.5 * m, marginBottom: 6 }]}>
                    VURGU RENGİ
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {PALETTE_COLORS.map(c => {
                      const isSelected = customColor === c;
                      return (
                        <TouchableOpacity
                          key={c}
                          style={[
                            styles.colorDot, 
                            { backgroundColor: c },
                            isSelected && { borderColor: colors.text, borderWidth: 2, transform: [{ scale: 1.15 }] }
                          ]}
                          onPress={() => setCustomColor(c)}
                        >
                          {isSelected && <Ionicons name="checkmark" size={13} color="#FFF" />}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Vektörel Simge Kategori Filtre Çipleri */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10, maxHeight: 36 }}>
                  {VECTOR_CATEGORY_NAMES.map(vCat => (
                    <TouchableOpacity
                      key={vCat}
                      style={[
                        styles.iconCatTab,
                        { backgroundColor: selectedVectorCategory === vCat ? colors.primary : colors.background, borderRadius: 16 }
                      ]}
                      onPress={() => setSelectedVectorCategory(vCat)}
                    >
                      <Text style={{ color: selectedVectorCategory === vCat ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: 'bold' }}>
                        {vCat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Paisa Tarzı Vektörel İkon Listesi */}
                <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                  {iconSearchQuery.trim() ? (
                    /* Arama Sonuçları */
                    <View>
                      <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m, fontFamily: tStyles.fontFamily, marginBottom: 8 }}>
                        Arama Sonuçları ({searchPaisaIcons(iconSearchQuery).length})
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {searchPaisaIcons(iconSearchQuery).map((item: PaisaIconItem) => {
                          const isSelected = customIcon === item.icon;
                          const activeCol = customColor || item.brandColor || colors.primary;
                          return (
                            <TouchableOpacity
                              key={item.id}
                              style={[
                                styles.paisaIconChip,
                                { backgroundColor: isSelected ? activeCol : (isDark ? '#2A2421' : '#F3EDE8') },
                                isSelected && { borderWidth: 2, borderColor: colors.text }
                              ]}
                              onPress={() => handleSelectPaisaIcon(item)}
                            >
                              {item.monogram ? (
                                <Text style={{ fontFamily: tStyles.fontFamily, fontWeight: 'bold', fontSize: 17 * m, color: isSelected ? colors.onPrimary : (item.brandColor || colors.text) }}>
                                  {item.monogram}
                                </Text>
                              ) : (
                                <Ionicons name={item.icon as any} size={20} color={isSelected ? colors.onPrimary : (item.isBrand && item.brandColor ? item.brandColor : colors.text)} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    /* Paisa Kategorileri (Core Kategori + Show More veya Seçili Kategoriye göre) */
                    (() => {
                      const allCats: PaisaCategoryGroup[] = [...PAISA_CORE_CATEGORIES, ...PAISA_EXTENDED_CATEGORIES];
                      const displayCats: PaisaCategoryGroup[] = selectedVectorCategory === 'Tümü'
                        ? (showMoreIcons ? allCats : PAISA_CORE_CATEGORIES)
                        : allCats.filter((c: PaisaCategoryGroup) => c.name === selectedVectorCategory);

                      return displayCats.map((cat: PaisaCategoryGroup) => (
                        <View key={cat.id} style={{ marginBottom: 14 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                            <Ionicons name={cat.icon as any} size={15} color={colors.primary} />
                            <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, fontWeight: 'bold' }}>
                              {cat.name} <Text style={{ opacity: 0.6, fontWeight: 'normal', fontSize: 11 * m }}>({cat.englishName})</Text>
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {cat.icons.map((item: PaisaIconItem) => {
                              const isSelected = customIcon === item.icon;
                              const activeCol = customColor || item.brandColor || colors.primary;
                              return (
                                <TouchableOpacity
                                  key={item.id}
                                  style={[
                                    styles.paisaIconChip,
                                    { backgroundColor: isSelected ? activeCol : (isDark ? '#2A2421' : '#F3EDE8') },
                                    isSelected && { borderWidth: 2, borderColor: colors.text }
                                  ]}
                                  onPress={() => handleSelectPaisaIcon(item)}
                                >
                                  {item.monogram ? (
                                    <Text style={{ fontFamily: tStyles.fontFamily, fontWeight: 'bold', fontSize: 17 * m, color: isSelected ? colors.onPrimary : (item.brandColor || colors.text) }}>
                                      {item.monogram}
                                    </Text>
                                  ) : (
                                    <Ionicons name={item.icon as any} size={20} color={isSelected ? colors.onPrimary : (item.isBrand && item.brandColor ? item.brandColor : colors.text)} />
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      ));
                    })()
                  )}
                </ScrollView>
              </View>
            )}

            {/* Paisa Tarzı Alt Aksiyonlar: Sıfırla & Tamam */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.text + '15' }}>
              <TouchableOpacity
                style={[styles.resetIconBtn, { backgroundColor: colors.background, borderRadius: tStyles.roundness / 2 }]}
                onPress={() => {
                  setCustomIcon(null);
                  setCustomColor(null);
                  setBrandLogoUrl(null);
                  setShowIconModal(false);
                }}
              >
                <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: '600' }}>
                  Varsayılana Sıfırla
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmIconBtn, { backgroundColor: colors.primary, borderRadius: tStyles.roundness / 2 }]}
                onPress={() => setShowIconModal(false)}
              >
                <Text style={{ color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }}>
                  Tamam
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. ENTEGRE HESAP MAKİNESİ BOTTOM SHEET MODALI */}
      <Modal 
        visible={showCalculator} 
        animationType="slide" 
        transparent 
        statusBarTranslucent={true}
        onRequestClose={() => setShowCalculator(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.backdropDismissArea} 
            activeOpacity={1} 
            onPress={() => setShowCalculator(false)} 
          />

          <View style={[styles.calcModalCard, { backgroundColor: colors.card, borderTopLeftRadius: tStyles.roundness * 1.5, borderTopRightRadius: tStyles.roundness * 1.5 }]}>
            {/* Modal Başlık */}
            <View style={styles.calcHeader}>
              <Text style={[styles.calcModalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m, fontWeight: 'bold' }]}>
                Hızlı Hesap Makinesi
              </Text>
              <TouchableOpacity onPress={() => setShowCalculator(false)} style={styles.calcCloseBtn}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Hesap Ekranı */}
            <View style={[styles.calcDisplayBox, { backgroundColor: colors.background, borderRadius: tStyles.roundness }]}>
              <Text style={[styles.calcExprText, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>
                {calcExpression || '0'}
              </Text>
              <Text style={[styles.calcResultText, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 28 * m, fontWeight: 'bold' }]}>
                = {currency} {calcPreview || '0'}
              </Text>
            </View>

            {/* Tuş Takımı Grid */}
            <View style={styles.calcKeypad}>
              {[
                ['AC', '(', ')', '÷'],
                ['7', '8', '9', '×'],
                ['4', '5', '6', '-'],
                ['1', '2', '3', '+'],
                ['0', '.', 'DEL', '=']
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.calcRow}>
                  {row.map(key => {
                    const isOp = ['÷', '×', '-', '+', '='].includes(key);
                    const isAction = ['AC', 'DEL', '(', ')'].includes(key);
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.calcKey,
                          { 
                            backgroundColor: isOp 
                              ? (key === '=' ? colors.primary : colors.primary + '20') 
                              : isAction 
                                ? (isDark ? '#3F3F46' : '#E4E4E7') 
                                : colors.background,
                            borderRadius: Math.max(tStyles.roundness / 2, 8) 
                          }
                        ]}
                        onPress={() => handleCalcInput(key)}
                      >
                        <Text style={[
                          styles.calcKeyText,
                          { 
                            color: key === '=' ? colors.onPrimary : (isOp ? colors.primary : colors.text),
                            fontFamily: tStyles.fontFamily,
                            fontSize: 18 * m,
                            fontWeight: isOp || isAction ? 'bold' : '600'
                          }
                        ]}>
                          {key}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Tutarı Aktar Butonu */}
            <TouchableOpacity
              style={[styles.applyCalcBtn, { backgroundColor: colors.primary, borderRadius: tStyles.roundness }]}
              onPress={applyCalculatorResult}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.onPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.applyCalcBtnText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 15 * m, fontWeight: 'bold' }]}>
                Hesaplanan Tutarı Uygula
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { padding: 4 },
  calcHeaderBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {},

  typeTabBar: { flexDirection: 'row', padding: 4, marginBottom: 14 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  typeBtnText: { fontWeight: 'bold' },

  amountCard: { padding: 18, marginBottom: 12 },
  amountHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  inlineCalcTrigger: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2 },
  label: { fontWeight: 'bold', letterSpacing: 0.5 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  currencySymbol: { fontWeight: 'bold', marginRight: 8 },
  amountInput: { flex: 1, fontWeight: 'bold' },

  inputCard: { padding: 16, marginBottom: 12 },
  customIconPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4 },
  iconAvatarBox: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  textInput: {},

  // Fiş Hub Stilleri
  receiptHubCard: { padding: 14, marginBottom: 12 },
  receiptHubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptHubIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  receiptHubTitle: {},
  receiptAttachedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  attachedInfoBox: { flexDirection: 'row', alignItems: 'center', padding: 12, marginTop: 10 },
  removeReceiptBtn: { padding: 6 },
  receiptActionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  receiptActionBtn: { flex: 1.2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  receiptActionBtnSec: { flex: 0.8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  receiptActionText: {},

  dateSelectorRow: { marginBottom: 6 },
  dateChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, gap: 6, borderWidth: 1, borderColor: 'transparent' },
  dateChipText: { fontWeight: '600' },

  sectionTitle: { marginBottom: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  catIconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  catName: { fontWeight: '600', marginLeft: 8 },

  accountRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  accChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, gap: 6, borderWidth: 1, borderColor: 'transparent' },
  accChipText: { fontWeight: '600' },

  transferBox: { padding: 16 },
  transferSubLabel: { marginTop: 4, fontWeight: '600' },
  transferArrowCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, marginTop: 10, elevation: 4 },
  saveBtnText: {},

  // OCR Modal Stilleri
  ocrModalCard: { padding: 20, maxHeight: '88%' },
  ocrScannerBox: { height: 120, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: 10 },
  laserLine: { position: 'absolute', top: 10, left: 16, right: 16, height: 2, backgroundColor: '#10B981', elevation: 3 },
  ocrLoadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  cameraModalBtn: { flex: 1.2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  galleryModalBtn: { flex: 0.8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  presetRow: { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 8 },
  customOcrBox: { padding: 12 },
  customOcrInput: { borderWidth: 1, borderColor: 'rgba(150,150,150,0.2)', borderRadius: 8, padding: 8, marginVertical: 6 },
  parseOcrBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 9 },

  // İkon & Marka Kataloğu Stilleri
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 6, justifyContent: 'flex-start' },
  brandGridCard: { width: '23%', paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center', marginBottom: 6, borderWidth: 1.5, borderColor: 'transparent' },
  brandLogoCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  colorDot: { width: 28, height: 28, borderRadius: 14, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  iconCatTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 },
  paisaIconChip: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  resetIconBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  confirmIconBtn: { flex: 1.4, alignItems: 'center', paddingVertical: 12 },

  // Modal Stilleri
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'flex-end' },
  backdropDismissArea: { flex: 1, width: '100%' },
  calcModalCard: { padding: 20, maxHeight: '85%' },
  calcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  calcModalTitle: {},
  calcCloseBtn: { padding: 4 },
  calcDisplayBox: { padding: 16, alignItems: 'flex-end', marginBottom: 16 },
  calcExprText: { minHeight: 24 },
  calcResultText: { marginTop: 4 },
  calcKeypad: { gap: 8 },
  calcRow: { flexDirection: 'row', gap: 8 },
  calcKey: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center' },
  calcKeyText: {},
  applyCalcBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, marginTop: 16 },
  applyCalcBtnText: {}
});
