import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { AVATAR_PRESETS, getAvatarPreset } from '../utils/avatarUtils';
import { FINANCIAL_GOALS, SAVINGS_TARGET_OPTIONS, getFinancialGoal, getSavingsTargetOption } from '../utils/goalUtils';
import { 
  pickBackupFile, 
  readClipboardBackup, 
  getLocalSnapshot, 
  parseAndNormalizeBackup,
  NormalizedBackupResult,
  LocalSnapshotMeta 
} from '../utils/backupService';

const CURRENCIES = [
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası', flag: '🇹🇷' },
  { code: 'USD', symbol: '$', name: 'Amerikan Doları', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini', flag: '🇬🇧' },
  { code: 'XAU', symbol: 'gr', name: 'Gram Altın', flag: '🪙' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin', flag: '⚡' },
  { code: 'JPY', symbol: '¥', name: 'Japon Yeni', flag: '🇯🇵' },
  { code: 'CHF', symbol: 'CHF', name: 'İsviçre Frangı', flag: '🇨🇭' },
  { code: 'CAD', symbol: 'C$', name: 'Kanada Doları', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Avustralya Doları', flag: '🇦🇺' },
  { code: 'CNY', symbol: '¥', name: 'Çin Yuanı', flag: '🇨🇳' },
  { code: 'RUB', symbol: '₽', name: 'Rus Rublesi', flag: '🇷🇺' },
  { code: 'INR', symbol: '₹', name: 'Hindistan Rupisi', flag: '🇮🇳' },
  { code: 'BRL', symbol: 'R$', name: 'Brezilya Reali', flag: '🇧🇷' },
  { code: 'SEK', symbol: 'kr', name: 'İsveç Kronu', flag: '🇸🇪' },
  { code: 'NOK', symbol: 'kr', name: 'Norveç Kronu', flag: '🇳🇴' },
  { code: 'DKK', symbol: 'kr', name: 'Danimarka Kronu', flag: '🇩🇰' },
  { code: 'KRW', symbol: '₩', name: 'Güney Kore Wonu', flag: '🇰🇷' },
  { code: 'SGD', symbol: 'S$', name: 'Singapur Doları', flag: '🇸🇬' },
  { code: 'NZD', symbol: 'NZ$', name: 'Yeni Zelanda Doları', flag: '🇳🇿' },
  { code: 'MXN', symbol: '$', name: 'Meksika Pesosu', flag: '🇲🇽' },
  { code: 'ZAR', symbol: 'R', name: 'Güney Afrika Randı', flag: '🇿🇦' }
];

const POPULAR_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP', 'XAU', 'BTC'];

const ONBOARDING_CATEGORIES = [
  { id: 'cat_market', name: 'Market & Gıda', icon: 'cart-outline', color: '#FF9800' },
  { id: 'cat_dining', name: 'Yemek & Kafe', icon: 'fast-food-outline', color: '#E91E63' },
  { id: 'cat_transport', name: 'Ulaşım & Akaryakıt', icon: 'car-outline', color: '#2196F3' },
  { id: 'cat_bills', name: 'Faturalar & Abonelik', icon: 'receipt-outline', color: '#9C27B0' },
  { id: 'cat_entertainment', name: 'Eğlence & Sosyal', icon: 'film-outline', color: '#4CAF50' },
  { id: 'cat_health', name: 'Sağlık & Eczane', icon: 'medkit-outline', color: '#F44336' },
  { id: 'cat_shopping', name: 'Alışveriş & Giyim', icon: 'bag-handle-outline', color: '#00BCD4' },
  { id: 'cat_salary', name: 'Maaş & Ana Gelir', icon: 'cash-outline', color: '#009688' },
  { id: 'cat_freelance', name: 'Ek & Serbest Gelir', icon: 'laptop-outline', color: '#3F51B5' }
];

const TOTAL_STEPS = 7;

export default function OnboardingScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    colors,
    styles: tStyles,
    themeName,
    setTheme,
    themeMode,
    setThemeMode,
    textSize,
    setTextSize,
    fontChoice,
    setFontChoice,
    setCurrency: setGlobalCurrency,
    isDark
  } = useTheme();

  const { completeOnboarding, importDataFromJSON } = useData();
  const m = tStyles.fontSizeMultiplier;

  const [step, setStep] = useState(0);

  // Step 1: Checklist state (Paisa "Verin, Kontrolün")
  const [agreedLocal, setAgreedLocal] = useState(true);
  const [agreedPrivacy, setAgreedPrivacy] = useState(true);
  const [agreedBackup, setAgreedBackup] = useState(true);

  // Step 2: Personalization & Profile Avatar
  const [name, setName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);

  const avatarPreset = useMemo(() => {
    return getAvatarPreset(avatarUri);
  }, [avatarUri]);

  // Step 3: Currency & Financial Goals
  const [currency, setLocalCurrency] = useState(CURRENCIES[0]);
  const [currencySearch, setCurrencySearch] = useState('');
  const [financialGoal, setLocalFinancialGoal] = useState('daily_pocket');
  const [savingsTargetPercent, setLocalSavingsTargetPercent] = useState(20);
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  const popularCurrenciesList = useMemo(() => {
    return POPULAR_CURRENCIES.map(code => CURRENCIES.find(c => c.code === code)!).filter(Boolean);
  }, []);

  const popularRow1 = useMemo(() => popularCurrenciesList.slice(0, 3), [popularCurrenciesList]);
  const popularRow2 = useMemo(() => popularCurrenciesList.slice(3, 6), [popularCurrenciesList]);

  const selectedSavingsOption = useMemo(() => {
    return getSavingsTargetOption(savingsTargetPercent);
  }, [savingsTargetPercent]);

  const getCurrencyPreviewAmount = (curr: typeof CURRENCIES[0]) => {
    if (curr.code === 'TRY') return '15.450,00 ₺';
    if (curr.code === 'USD') return '$ 1,250.00';
    if (curr.code === 'EUR') return '1.250,00 €';
    if (curr.code === 'GBP') return '£ 1,250.00';
    if (curr.code === 'XAU') return '25,50 gr';
    if (curr.code === 'BTC') return '0.0425 ₿';
    return `1.250,00 ${curr.symbol}`;
  };

  // Step 4: Categories (Zero style selection)
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>(
    ONBOARDING_CATEGORIES.map(c => c.id)
  );

  // Step 5: Financial foundation & Modules
  const [accountName, setAccountName] = useState('Nakit Cüzdanım');
  const [initialBalance, setInitialBalance] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [weekStartMonday, setLocalWeekStartMonday] = useState(true);
  const [budgetCycleDay, setBudgetCycleDay] = useState(1);
  const [enableDebt, setEnableDebt] = useState(true);
  const [enableBudget, setEnableBudget] = useState(true);

  // Step 6: Completing spinner
  const [isFinishing, setIsFinishing] = useState(false);

  // Backup restore modal state (Çok Kanallı: Dosya, Pano, Yerel Snapshot, Manuel)
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'options' | 'manual' | 'preview'>('options');
  const [backupInput, setBackupInput] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<NormalizedBackupResult | null>(null);
  const [localSnapshotMeta, setLocalSnapshotMeta] = useState<LocalSnapshotMeta | null>(null);
  const [localSnapshotContent, setLocalSnapshotContent] = useState<string | null>(null);

  // Filtered currencies
  const filteredCurrencies = useMemo(() => {
    if (!currencySearch.trim()) return CURRENCIES;
    const query = currencySearch.toLowerCase().trim();
    return CURRENCIES.filter(
      c => c.code.toLowerCase().includes(query) ||
           c.name.toLowerCase().includes(query) ||
           c.symbol.toLowerCase().includes(query)
    );
  }, [currencySearch]);

  const toggleCategory = (id: string) => {
    if (selectedCatIds.includes(id)) {
      if (selectedCatIds.length > 1) {
        setSelectedCatIds(selectedCatIds.filter(item => item !== id));
      }
    } else {
      setSelectedCatIds([...selectedCatIds, id]);
    }
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      setGlobalCurrency(currency.symbol);
      const initialBalNum = initialBalance ? parseFloat(initialBalance.replace(',', '.')) : 0;
      const monthlyGoalNum = monthlyGoal ? parseInt(monthlyGoal) : undefined;

      await completeOnboarding({
        name: name.trim() || 'Kullanıcı',
        currency: currency.symbol,
        accountName: accountName.trim() || 'Nakit Cüzdanım',
        initialBalance: isNaN(initialBalNum) ? 0 : initialBalNum,
        monthlyGoal: monthlyGoalNum,
        weekStartMonday,
        budgetCycleDay,
        selectedCategoryIds: selectedCatIds,
        userAvatar: avatarUri,
        financialGoal,
        savingsTargetPercent,
      });

      setIsFinishing(false);
      navigation.replace('Home');
    } catch (e) {
      console.warn(e);
      setIsFinishing(false);
      navigation.replace('Home');
    }
  };

  const handlePickAvatarGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf seçebilmek için galeri erişim izni vermelisiniz.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
        setShowAvatarSheet(false);
      }
    } catch (err: any) {
      Alert.alert('Hata', 'Fotoğraf seçilirken bir sorun oluştu: ' + (err?.message || ''));
    }
  };

  const handleTakeAvatarPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf çekebilmek için kamera erişim izni vermelisiniz.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
        setShowAvatarSheet(false);
      }
    } catch (err: any) {
      Alert.alert('Hata', 'Fotoğraf çekilirken bir sorun oluştu: ' + (err?.message || ''));
    }
  };

  const handleOpenRestoreOptions = async () => {
    setIsRestoring(true);
    try {
      const snap = await getLocalSnapshot();
      if (snap.exists && snap.meta) {
        setLocalSnapshotMeta(snap.meta);
        setLocalSnapshotContent(snap.content || null);
      } else {
        setLocalSnapshotMeta(null);
        setLocalSnapshotContent(null);
      }
    } catch {
      setLocalSnapshotMeta(null);
      setLocalSnapshotContent(null);
    }
    setIsRestoring(false);
    setRestoreMode('options');
    setParsedPreview(null);
    setBackupInput('');
    setShowRestoreModal(true);
  };

  const processBackupContent = (content: string) => {
    const normalized = parseAndNormalizeBackup(content);
    if (!normalized.success) {
      Alert.alert('Geçersiz Yedek Dosyası', normalized.message);
      return;
    }
    setBackupInput(content);
    setParsedPreview(normalized);
    setRestoreMode('preview');
  };

  const handlePickFile = async () => {
    setIsRestoring(true);
    const res = await pickBackupFile();
    setIsRestoring(false);
    if (res.canceled) return;
    if (res.error) {
      Alert.alert('Dosya Hatası', res.error);
      return;
    }
    if (res.content) {
      processBackupContent(res.content);
    }
  };

  const handlePasteClipboard = async () => {
    const text = await readClipboardBackup();
    if (!text || !text.trim()) {
      Alert.alert('Pano Boş', 'Panonuzda kopyalanmış bir yedek verisi bulunamadı.');
      return;
    }
    processBackupContent(text.trim());
  };

  const handleRestoreLocalSnapshot = () => {
    if (localSnapshotContent) {
      processBackupContent(localSnapshotContent);
    }
  };

  const handleExecuteRestore = async () => {
    if (!backupInput.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir yedek verisi seçin veya yapıştırın.');
      return;
    }
    setIsRestoring(true);
    try {
      const res = await importDataFromJSON(backupInput.trim());
      setIsRestoring(false);
      if (res.success) {
        setShowRestoreModal(false);
        Alert.alert('Başarılı 🎉', res.message || 'Yedek başarıyla geri yüklendi!', [
          { text: 'TrioTrack’e Başla', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        Alert.alert('Hata', res.message || 'Yedek dosyası içe aktarılamadı.');
      }
    } catch (err: any) {
      setIsRestoring(false);
      Alert.alert('Hata', 'Yedek geri yüklenirken bir sorun oluştu: ' + (err?.message || ''));
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.indicator,
            {
              backgroundColor: i === step ? colors.primary : colors.text,
              opacity: i === step ? 1 : 0.18,
              width: i === step ? 22 : 6
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 16) + (step === 0 ? 12 : 52),
              paddingBottom: 36,
              justifyContent: (step === 0 || step === 6) ? 'center' : 'flex-start',
            }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* SLIDE 0: Welcome & Hybrid Architecture Showcase */}
          {step === 0 && (
            <View style={styles.slide}>
              {/* TrioTrack Logo & İlham Verici Başlık */}
              <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 4 }}>
                <View style={[styles.logoContainer, { borderColor: colors.primary + '35' }]}>
                  <Image
                    source={require('../../assets/triotrack_logo.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={[styles.brandTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 32 * m, textAlign: 'center', marginTop: 14, marginBottom: 8 }]}>
                  TrioTrack
                </Text>
                <Text style={[styles.manifestoText, { color: colors.text, opacity: 0.75, fontFamily: tStyles.fontFamily, fontSize: 13.5 * m, textAlign: 'center', lineHeight: 20 * m, paddingHorizontal: 12 }]}>
                  Paisa'nın zengin cüzdan estetiği, Zero'nun sıfır tabanlı gizlilik disiplini ve Buckwheat'in akıllı günlük harçlık zekası tek bir kusursuz deneyimde buluştu.
                </Text>
              </View>

              {/* 3 Pillars Cards */}
              <View style={styles.pillarsList}>
                <View style={[styles.pillarCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                  <View style={[styles.pillarIconBox, { backgroundColor: '#6750A4' + '20' }]}>
                    <Ionicons name="wallet-outline" size={20} color="#6750A4" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pillarTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      Paisa: Zengin Cüzdanlar & Bütçeleme
                    </Text>
                    <Text style={[styles.pillarDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                      Kategori limitleri, çoklu cüzdanlar ve modern Material You estetiği.
                    </Text>
                  </View>
                </View>

                <View style={[styles.pillarCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                  <View style={[styles.pillarIconBox, { backgroundColor: (isDark ? '#4ade80' : '#16a34a') + '20' }]}>
                    <Ionicons name="swap-horizontal-outline" size={20} color={isDark ? '#4ade80' : '#16a34a'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pillarTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      Zero: Alacak/Borç & %100 Çevrimdışı
                    </Text>
                    <Text style={[styles.pillarDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                      Sıfır tabanlı bütçe, tam gizlilik ve vadeli borç takip mimarisi.
                    </Text>
                  </View>
                </View>

                <View style={[styles.pillarCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                  <View style={[styles.pillarIconBox, { backgroundColor: '#F29F05' + '20' }]}>
                    <Ionicons name="flame-outline" size={20} color="#F29F05" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pillarTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      Buckwheat: Akıllı Günlük Harçlık
                    </Text>
                    <Text style={[styles.pillarDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                      Maaş gününe kadar her gün ne kadar harcayabileceğinizi hesaplayan canlı motor.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Secondary Option: Restore from Backup */}
              <TouchableOpacity
                style={[styles.restoreBtn, { borderColor: colors.primary + '40', backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
                onPress={handleOpenRestoreOptions}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-download-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.restoreBtnText, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                  Zaten bir yedeğim var (Geri Yükle)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SLIDE 1: Data Responsibility & Privacy (Paisa "Verin, Kontrolün") */}
          {step === 1 && (
            <View style={styles.slide}>
              <View style={[styles.iconCircleBig, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
              </View>
              <Text style={[styles.slideTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 26 * m }]}>
                Verin, Senin Kontrolün
              </Text>
              <Text style={[styles.slideSubtitle, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                TrioTrack gizlilik odaklı mimariye sahiptir. Verilerinizin sahibi sadece sizsiniz.
              </Text>

              <View style={styles.checklistGroup}>
                <TouchableOpacity
                  style={[styles.checkItemCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
                  activeOpacity={0.8}
                  onPress={() => setAgreedLocal(!agreedLocal)}
                >
                  <Ionicons
                    name={agreedLocal ? "checkbox" : "square-outline"}
                    size={24}
                    color={agreedLocal ? colors.primary : colors.text + '60'}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.checkItemTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      %100 Yerel Veritabanı (WatermelonDB)
                    </Text>
                    <Text style={[styles.checkItemDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                      Tüm işlemleriniz ve cüzdanlarınız yalnızca telefonunuzda saklanır. Harici sunucuya veya buluta aktarılmaz.
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.checkItemCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
                  activeOpacity={0.8}
                  onPress={() => setAgreedPrivacy(!agreedPrivacy)}
                >
                  <Ionicons
                    name={agreedPrivacy ? "checkbox" : "square-outline"}
                    size={24}
                    color={agreedPrivacy ? colors.primary : colors.text + '60'}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.checkItemTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      Sıfır Reklam & İzleyici Takibi
                    </Text>
                    <Text style={[styles.checkItemDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                      Hiçbir reklam ağı veya kullanıcı davranış analitiği içermez. Tamamen sessiz ve güvenli.
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.checkItemCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
                  activeOpacity={0.8}
                  onPress={() => setAgreedBackup(!agreedBackup)}
                >
                  <Ionicons
                    name={agreedBackup ? "checkbox" : "square-outline"}
                    size={24}
                    color={agreedBackup ? colors.primary : colors.text + '60'}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.checkItemTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      Yedekleme Sorumluluğu
                    </Text>
                    <Text style={[styles.checkItemDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                      Veriler sadece bu cihazda olduğundan, cihaz değişikliğinde Ayarlar menüsünden JSON yedeği almayı kabul ediyorum.
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SLIDE 2: Personalization & Styling */}
          {step === 2 && (
            <View style={styles.slide}>
              {/* Profil Avatarı & Fotoğraf Seçim Alanı */}
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <TouchableOpacity
                  style={[
                    styles.avatarPreviewCircle,
                    {
                      backgroundColor: avatarPreset ? avatarPreset.bg : colors.primary,
                      borderColor: colors.primary + '40',
                      borderWidth: 2.5,
                    }
                  ]}
                  onPress={() => setShowAvatarSheet(true)}
                  activeOpacity={0.8}
                >
                  {avatarUri && !avatarUri.startsWith('preset:') ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                  ) : avatarPreset ? (
                    <Ionicons name={avatarPreset.icon as any} size={36 * m} color="#FFFFFF" />
                  ) : name.trim() ? (
                    <Text style={[styles.avatarMonogramText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 30 * m }]}>
                      {name.trim().charAt(0).toUpperCase()}
                    </Text>
                  ) : (
                    <Ionicons name="person" size={34 * m} color={colors.onPrimary} />
                  )}

                  {/* Sağ Altta Kamera Rozeti */}
                  <View style={[styles.avatarCameraBadge, { backgroundColor: colors.primary }]}>
                    <Ionicons name="camera" size={13} color={colors.onPrimary} />
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={[styles.slideTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 24 * m }]}>
                Sana Nasıl Hitap Edelim?
              </Text>
              <Text style={[styles.slideSubtitle, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                Uygulama içi deneyiminizi kişiselleştirmek için adınızı girin.
              </Text>

              <View style={[styles.inputBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <Text style={[styles.inputMicroLabel, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                  İSMİNİZ VEYA TAKMA ADINIZ
                </Text>
                <TextInput
                  style={[styles.bigTextInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 20 * m }]}
                  placeholder="Örn: Mehmet"
                  placeholderTextColor={colors.text + '40'}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* TEMA MODU */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m }]}>
                TEMA MODU
              </Text>
              <View style={styles.rowChoices}>
                {[
                  { label: 'Sistem', val: 'system', icon: 'phone-portrait-outline' },
                  { label: 'Aydınlık', val: 'light', icon: 'sunny-outline' },
                  { label: 'Karanlık', val: 'dark', icon: 'moon-outline' }
                ].map(item => (
                  <TouchableOpacity
                    key={item.val}
                    style={[
                      styles.choiceChip,
                      { backgroundColor: colors.card, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                      themeMode === item.val && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setThemeMode(item.val as any)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={16}
                      color={themeMode === item.val ? colors.onPrimary : colors.text}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{ color: themeMode === item.val ? colors.onPrimary : colors.text, fontWeight: 'bold', fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ARAYÜZ TARZI */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, marginTop: 14 }]}>
                ARAYÜZ TARZI
              </Text>
              <View style={styles.rowChoices}>
                {[
                  { id: 'paisa', name: 'Material', desc: 'Paisa', dot: '#6750A4' },
                  { id: 'zero', name: 'Minimal', desc: 'Zero', dot: isDark ? '#FFFFFF' : '#000000' },
                  { id: 'buckwheat', name: 'Dinamik', desc: 'Buckwheat', dot: '#F29F05' }
                ].map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.themeCardItem,
                      { backgroundColor: colors.card, borderRadius: tStyles.roundness },
                      themeName === t.id ? { borderColor: colors.primary, borderWidth: 2 } : { borderColor: 'transparent', borderWidth: 2 }
                    ]}
                    onPress={() => setTheme(t.id as any)}
                  >
                    <View style={[styles.colorDot, { backgroundColor: t.dot }]} />
                    <Text style={[styles.themeCardTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                      {t.name}
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m, fontFamily: tStyles.fontFamily }}>
                      {t.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* YAZI TİPİ (TİPOGRAFİ) */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, marginTop: 14 }]}>
                YAZI TİPİ (TİPOGRAFİ)
              </Text>
              <View style={styles.rowChoices}>
                {[
                  { id: 'modern', label: 'Modern', sub: 'Sans-Serif', sample: 'Aa' },
                  { id: 'classic', label: 'Klasik', sub: 'Serif', sample: 'Aa' },
                  { id: 'code', label: 'Teknik', sub: 'Monospace', sample: 'Aa' },
                ].map(f => (
                  <TouchableOpacity
                    key={f.id}
                    style={[
                      styles.themeCardItem,
                      { backgroundColor: colors.card, borderRadius: tStyles.roundness },
                      fontChoice === f.id ? { borderColor: colors.primary, borderWidth: 2 } : { borderColor: 'transparent', borderWidth: 2 }
                    ]}
                    onPress={() => setFontChoice(f.id as any)}
                  >
                    <Text style={{ 
                      fontSize: 18 * m, 
                      fontWeight: 'bold', 
                      color: colors.primary, 
                      marginBottom: 2,
                      fontFamily: f.id === 'classic' ? (Platform.OS === 'ios' ? 'Georgia' : 'serif') : f.id === 'code' ? (Platform.OS === 'ios' ? 'Menlo' : 'monospace') : (Platform.OS === 'ios' ? 'System' : 'sans-serif')
                    }}>
                      {f.sample}
                    </Text>
                    <Text style={[styles.themeCardTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                      {f.label}
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m, fontFamily: tStyles.fontFamily }}>
                      {f.sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* YAZI BOYUTU (PUNTO) */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, marginTop: 14 }]}>
                YAZI BOYUTU
              </Text>
              <View style={styles.rowChoices}>
                {[
                  { id: 'small', label: 'Kompakt', tag: 'A-' },
                  { id: 'medium', label: 'Standart', tag: 'A' },
                  { id: 'large', label: 'Geniş', tag: 'A+' },
                ].map(sz => (
                  <TouchableOpacity
                    key={sz.id}
                    style={[
                      styles.choiceChip,
                      { backgroundColor: colors.card, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                      textSize === sz.id && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setTextSize(sz.id as any)}
                  >
                    <Text style={{ 
                      color: textSize === sz.id ? colors.onPrimary : colors.primary, 
                      fontWeight: 'bold', 
                      fontSize: sz.id === 'small' ? 11 * m : sz.id === 'large' ? 15 * m : 13 * m,
                      marginRight: 6
                    }}>
                      {sz.tag}
                    </Text>
                    <Text style={{ color: textSize === sz.id ? colors.onPrimary : colors.text, fontWeight: 'bold', fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                      {sz.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* SLIDE 3: Currency Picker & Financial Goals (Step 6 of Roadmap) */}
          {step === 3 && (
            <View style={styles.slide}>
              <View style={[
                styles.slideIconBox, 
                { backgroundColor: isDark ? colors.primary + '25' : (themeName === 'zero' ? '#F4F4F5' : colors.primary + '15') }
              ]}>
                <Ionicons name="compass-outline" size={28 * m} color={colors.primary} />
              </View>
              <Text style={[styles.slideTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 24 * m }]}>
                Para Birimi & Hedefler
              </Text>
              <Text style={[styles.slideSubtitle, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 13 * m, marginBottom: 18 }]}>
                Ana para biriminizi ve finansal yol haritanızı belirleyin.
              </Text>

              {/* SECTION 1: ANA PARA BİRİMİ */}
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, marginBottom: 8 }]}>
                  ANA PARA BİRİMİ
                </Text>

                {/* Hero Currency Live Preview Card */}
                <View style={[
                  styles.currencyHeroCard,
                  { 
                    backgroundColor: colors.card,
                    borderColor: isDark 
                      ? colors.primary + '40' 
                      : (themeName === 'zero' ? '#E4E4E7' : colors.primary + '35'),
                    borderWidth: 1.5,
                    borderRadius: tStyles.roundness 
                  }
                ]}>
                  <View style={[styles.currencyHeroSymbolBadge, { backgroundColor: colors.primary }]}>
                    <Text style={{ fontSize: 20 * m, color: colors.onPrimary, fontWeight: 'bold' }}>
                      {currency.symbol}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 6 }}>
                        <Text style={{ fontSize: 16 * m }}>{currency.flag}</Text>
                        <Text style={[styles.currencyHeroCode, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14.5 * m }]}>
                          {currency.code}
                        </Text>
                        <Text style={[styles.currencyHeroName, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]} numberOfLines={1}>
                          • {currency.name}
                        </Text>
                      </View>
                      <View style={[
                        styles.activeCheckPill, 
                        { 
                          backgroundColor: isDark 
                            ? colors.primary + '25' 
                            : (themeName === 'zero' ? '#F4F4F5' : colors.primary + '15') 
                        }
                      ]}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4, gap: 6 }}>
                      <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
                        Canlı Görünüm:
                      </Text>
                      <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 * m, fontFamily: tStyles.fontFamily }}>
                        {getCurrencyPreviewAmount(currency)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Quick Currency Chips (2 rows of 3, 100% equal width, immune to wrapping bugs) */}
                <View style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    {popularRow1.map(c => {
                      const isSelected = currency.code === c.code;
                      return (
                        <TouchableOpacity
                          key={c.code}
                          style={[
                            styles.quickCurrencyChip,
                            {
                              backgroundColor: isSelected 
                                ? (isDark ? colors.primary + '20' : (themeName === 'zero' ? '#F4F4F5' : colors.primary + '10'))
                                : colors.card,
                              borderColor: isSelected 
                                ? colors.primary 
                                : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                              borderWidth: isSelected ? 2 : 1.5,
                              borderRadius: Math.max(tStyles.roundness / 2, 8),
                            }
                          ]}
                          onPress={() => setLocalCurrency(c)}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 16 * m, marginRight: 5 }}>{c.flag}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[
                              styles.quickCurrencyCode,
                              { 
                                color: isSelected ? colors.primary : colors.text,
                                fontWeight: isSelected ? 'bold' : '600',
                                fontSize: 12.5 * m,
                                fontFamily: tStyles.fontFamily 
                              }
                            ]} numberOfLines={1}>
                              {c.code}
                            </Text>
                            <Text style={[
                              styles.quickCurrencySymbol,
                              { 
                                color: isSelected ? colors.primary : colors.text,
                                opacity: isSelected ? 0.9 : 0.5,
                                fontSize: 11 * m,
                                fontFamily: tStyles.fontFamily 
                              }
                            ]} numberOfLines={1}>
                              {c.symbol}
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark" size={13} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {popularRow2.map(c => {
                      const isSelected = currency.code === c.code;
                      return (
                        <TouchableOpacity
                          key={c.code}
                          style={[
                            styles.quickCurrencyChip,
                            {
                              backgroundColor: isSelected 
                                ? (isDark ? colors.primary + '20' : (themeName === 'zero' ? '#F4F4F5' : colors.primary + '10'))
                                : colors.card,
                              borderColor: isSelected 
                                ? colors.primary 
                                : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                              borderWidth: isSelected ? 2 : 1.5,
                              borderRadius: Math.max(tStyles.roundness / 2, 8),
                            }
                          ]}
                          onPress={() => setLocalCurrency(c)}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 16 * m, marginRight: 5 }}>{c.flag}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[
                              styles.quickCurrencyCode,
                              { 
                                color: isSelected ? colors.primary : colors.text,
                                fontWeight: isSelected ? 'bold' : '600',
                                fontSize: 12.5 * m,
                                fontFamily: tStyles.fontFamily 
                              }
                            ]} numberOfLines={1}>
                              {c.code}
                            </Text>
                            <Text style={[
                              styles.quickCurrencySymbol,
                              { 
                                color: isSelected ? colors.primary : colors.text,
                                opacity: isSelected ? 0.9 : 0.5,
                                fontSize: 11 * m,
                                fontFamily: tStyles.fontFamily 
                              }
                            ]} numberOfLines={1}>
                              {c.symbol}
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark" size={13} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Expand / Collapse All Currencies Button */}
                <TouchableOpacity
                  style={[
                    styles.currencyToggleBtn,
                    { 
                      backgroundColor: colors.card, 
                      borderRadius: Math.max(tStyles.roundness / 2, 8),
                      borderColor: (showAllCurrencies || currencySearch) 
                        ? colors.primary 
                        : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                      borderWidth: 1.5,
                    }
                  ]}
                  onPress={() => setShowAllCurrencies(!showAllCurrencies)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showAllCurrencies ? "globe" : "globe-outline"} 
                    size={16} 
                    color={colors.primary} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={{ flex: 1, color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, fontWeight: '600' }}>
                    {showAllCurrencies ? 'Dünya Para Birimlerini Gizle' : 'Tüm Dünya Para Birimleri (20+)'}
                  </Text>
                  <Ionicons 
                    name={showAllCurrencies ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color={colors.text} 
                    style={{ opacity: 0.5 }} 
                  />
                </TouchableOpacity>

                {/* Collapsible Search & Full Currency Grid */}
                {(showAllCurrencies || currencySearch.length > 0) && (
                  <View style={{ marginTop: 8 }}>
                    <View style={[
                      styles.searchBox, 
                      { 
                        backgroundColor: colors.card, 
                        borderRadius: tStyles.roundness, 
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                      }
                    ]}>
                      <Ionicons name="search" size={17} color={colors.text} style={{ opacity: 0.5, marginRight: 8 }} />
                      <TextInput
                        style={[styles.searchInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13.5 * m }]}
                        placeholder="Para birimi veya ülke ara..."
                        placeholderTextColor={colors.text + '50'}
                        value={currencySearch}
                        onChangeText={setCurrencySearch}
                      />
                      {currencySearch ? (
                        <TouchableOpacity onPress={() => setCurrencySearch('')}>
                          <Ionicons name="close-circle" size={18} color={colors.text} style={{ opacity: 0.5 }} />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <View style={[
                      styles.currencyScrollContainer, 
                      { 
                        backgroundColor: colors.card, 
                        borderRadius: tStyles.roundness,
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                      }
                    ]}>
                      <ScrollView nestedScrollEnabled style={{ maxHeight: 190 }} showsVerticalScrollIndicator={true}>
                        {filteredCurrencies.map(c => {
                          const isSelected = currency.code === c.code;
                          return (
                            <TouchableOpacity
                              key={c.code}
                              style={[
                                styles.currencyRowItem,
                                isSelected && { 
                                  backgroundColor: isDark 
                                    ? colors.primary + '20' 
                                    : (themeName === 'zero' ? '#F4F4F5' : colors.primary + '10') 
                                }
                              ]}
                              onPress={() => {
                                setLocalCurrency(c);
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={[
                                styles.currencySymbolBadge, 
                                { 
                                  backgroundColor: isSelected 
                                    ? colors.primary 
                                    : (isDark ? colors.background : '#F1F5F9') 
                                }
                              ]}>
                                <Text style={{ color: isSelected ? colors.onPrimary : colors.text, fontWeight: 'bold', fontSize: 13 * m }}>
                                  {c.symbol}
                                </Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <Text style={[styles.currencyCode, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13.5 * m }]}>
                                    {c.code}
                                  </Text>
                                  <Text style={{ fontSize: 13 * m }}>{c.flag}</Text>
                                </View>
                                <Text style={[styles.currencyFullName, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                                  {c.name}
                                </Text>
                              </View>
                              {isSelected && (
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </View>

              {/* SECTION 2: ÖNCELİKLİ FİNANSAL HEDEFİNİZ */}
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, marginBottom: 2 }]}>
                  ÖNCELİKLİ FİNANSAL HEDEFİNİZ
                </Text>
                <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11.5 * m, fontFamily: tStyles.fontFamily, marginBottom: 10 }}>
                  TrioTrack, analiz ve limitlerinizi bu hedefe göre optimize eder.
                </Text>

                <View style={styles.financialGoalsList}>
                  {FINANCIAL_GOALS.map(goal => {
                    const isSelected = financialGoal === goal.id;
                    return (
                      <TouchableOpacity
                        key={goal.id}
                        style={[
                          styles.financialGoalCard,
                          {
                            backgroundColor: isSelected
                              ? (isDark ? colors.primary + '20' : (themeName === 'zero' ? '#F4F4F5' : colors.primary + '0A'))
                              : colors.card,
                            borderColor: isSelected
                              ? colors.primary
                              : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                            borderWidth: isSelected ? 2 : 1.5,
                            borderRadius: tStyles.roundness,
                          }
                        ]}
                        onPress={() => setLocalFinancialGoal(goal.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.goalIconBox, 
                          { 
                            backgroundColor: isSelected 
                              ? goal.color 
                              : (isDark ? goal.color + '22' : goal.color + '15'),
                            borderWidth: isSelected ? 0 : 1,
                            borderColor: isSelected ? 'transparent' : (isDark ? goal.color + '40' : goal.color + '25'),
                          }
                        ]}>
                          <Ionicons 
                            name={goal.icon as any} 
                            size={22} 
                            color={isSelected ? '#FFFFFF' : goal.color} 
                          />
                        </View>
                        
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={[
                            styles.goalTitle,
                            { 
                              color: isSelected 
                                ? (themeName === 'zero' ? colors.text : colors.primary) 
                                : colors.text, 
                              fontFamily: tStyles.fontFamily, 
                              fontSize: 14 * m,
                              fontWeight: isSelected ? 'bold' : '600',
                              marginBottom: 3
                            }
                          ]}>
                            {goal.title}
                          </Text>
                          <Text style={[
                            styles.goalSubtitle,
                            { 
                              color: colors.text, 
                              opacity: isSelected ? 0.8 : 0.6, 
                              fontFamily: tStyles.fontFamily, 
                              fontSize: 11.5 * m, 
                              lineHeight: Math.round(17 * m) 
                            }
                          ]}>
                            {goal.subtitle}
                          </Text>
                        </View>

                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                          size={22}
                          color={isSelected ? colors.primary : (isDark ? 'rgba(255,255,255,0.3)' : '#CBD5E1')}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SECTION 3: AYLIK GELİRDEN BİRİKİM ORANI */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, marginBottom: 2 }]}>
                  AYLIK GELİRDEN BİRİKİM ORANI
                </Text>
                <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11.5 * m, fontFamily: tStyles.fontFamily, marginBottom: 10 }}>
                  Aylık gelirinizden birikime veya borç kapatmaya ayırmak istediğiniz hedef oran.
                </Text>

                {/* 4-Pill Segmented Selector Row */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                  {SAVINGS_TARGET_OPTIONS.map(opt => {
                    const isSelected = savingsTargetPercent === opt.percent;
                    return (
                      <TouchableOpacity
                        key={opt.percent}
                        style={[
                          styles.savingsPillBtn,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.card,
                            borderColor: isSelected 
                              ? colors.primary 
                              : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                            borderWidth: isSelected ? 2 : 1.5,
                            borderRadius: Math.max(tStyles.roundness / 2, 8),
                          }
                        ]}
                        onPress={() => setLocalSavingsTargetPercent(opt.percent)}
                        activeOpacity={0.7}
                      >
                        {/* Fixed height badge container for 100% baseline alignment */}
                        <View style={{ height: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 3 }}>
                          {opt.badge ? (
                            <View style={[
                              styles.savingsMicroBadge,
                              { 
                                backgroundColor: isSelected 
                                  ? colors.onPrimary + '30' 
                                  : (isDark ? colors.primary + '25' : (themeName === 'zero' ? '#E4E4E7' : colors.primary + '12')),
                                borderWidth: isSelected ? 0 : 1,
                                borderColor: isSelected ? 'transparent' : (isDark ? colors.primary + '40' : colors.primary + '25'),
                              }
                            ]}>
                              <Text style={[
                                styles.savingsMicroBadgeText,
                                { 
                                  color: isSelected 
                                    ? colors.onPrimary 
                                    : (themeName === 'zero' && !isDark ? '#18181B' : colors.primary), 
                                  fontSize: 8.5 * m 
                                }
                              ]}>
                                {opt.badge}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={[
                          styles.savingsPillText,
                          {
                            color: isSelected ? colors.onPrimary : colors.text,
                            fontFamily: tStyles.fontFamily,
                            fontWeight: 'bold',
                            fontSize: 15 * m
                          }
                        ]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Active Selected Savings Tier Info Card */}
                {selectedSavingsOption && (
                  <View style={[
                    styles.savingsDetailCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isDark 
                        ? colors.primary + '40' 
                        : (themeName === 'zero' ? '#E4E4E7' : colors.primary + '30'),
                      borderWidth: 1.5,
                      borderRadius: tStyles.roundness,
                    }
                  ]}>
                    <View style={[
                      styles.savingsDetailIconBox, 
                      { 
                        backgroundColor: isDark 
                          ? colors.primary + '25' 
                          : (themeName === 'zero' ? '#F4F4F5' : colors.primary + '14'),
                        borderWidth: 1,
                        borderColor: isDark 
                          ? colors.primary + '40' 
                          : (themeName === 'zero' ? '#E4E4E7' : colors.primary + '25'),
                      }
                    ]}>
                      <Ionicons name="sparkles" size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.savingsDetailTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: 'bold', fontSize: 13 * m }]}>
                          {selectedSavingsOption.title}
                        </Text>
                        <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                          ({selectedSavingsOption.label})
                        </Text>
                      </View>
                      <Text style={[styles.savingsDetailDesc, { color: colors.text, opacity: 0.65, fontFamily: tStyles.fontFamily, fontSize: 11.5 * m, marginTop: 2, lineHeight: 16 }]}>
                        {selectedSavingsOption.desc}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

            </View>
          )}

          {/* SLIDE 4: Pick Your Categories (Zero Style) */}
          {step === 4 && (
            <View style={styles.slide}>
              <View style={[styles.iconCircleBig, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name="grid-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.slideTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 26 * m }]}>
                Kategorilerinizi Seçin
              </Text>
              <Text style={[styles.slideSubtitle, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                Takip etmek istediğiniz kategorileri belirleyin. Dilediğinizi açıp kapatabilirsiniz ({selectedCatIds.length} seçildi).
              </Text>

              <View style={styles.categoriesPillWrap}>
                {ONBOARDING_CATEGORIES.map(cat => {
                  const isSelected = selectedCatIds.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryPill,
                        {
                          backgroundColor: isSelected ? cat.color + '22' : colors.card,
                          borderColor: isSelected ? cat.color : 'transparent',
                          borderRadius: Math.max(tStyles.roundness / 2, 8)
                        }
                      ]}
                      onPress={() => toggleCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={18}
                        color={isSelected ? cat.color : colors.text}
                        style={{ marginRight: 8, opacity: isSelected ? 1 : 0.6 }}
                      />
                      <Text style={[
                        styles.categoryPillText,
                        {
                          color: isSelected ? colors.text : colors.text + '80',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          fontFamily: tStyles.fontFamily,
                          fontSize: 12 * m
                        }
                      ]}>
                        {cat.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color={cat.color} style={{ marginLeft: 6 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* SLIDE 5: Financial Foundation & Advanced Modules (User request: Week start + Buckwheat Salary cycle day + Initial 0.00 wallet) */}
          {step === 5 && (
            <View style={styles.slide}>
              <Text style={[styles.slideTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 26 * m }]}>
                Finansal Tercihler
              </Text>
              <Text style={[styles.slideSubtitle, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                Hafta başlangıcı, maaş döngü günü ve ilk cüzdanınızı belirleyin.
              </Text>

              {/* Hafta Başlangıcı (Kullanıcıya özel sunuldu) */}
              <View style={[styles.prefBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.prefBoxTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    Hafta Başlangıcı Günü
                  </Text>
                </View>
                <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m, fontFamily: tStyles.fontFamily, marginBottom: 10 }}>
                  Haftalık harcama grafikleri ve limit döngüleri bu güne göre gruplanır.
                </Text>
                <View style={styles.rowChoices}>
                  {[
                    { label: 'Pazartesi (Varsayılan)', val: true },
                    { label: 'Pazar', val: false }
                  ].map(item => (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.choiceChip,
                        { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                        weekStartMonday === item.val && { backgroundColor: colors.primary }
                      ]}
                      onPress={() => setLocalWeekStartMonday(item.val)}
                    >
                      <Text style={{ color: weekStartMonday === item.val ? colors.onPrimary : colors.text, fontWeight: 'bold', fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Buckwheat Maaş & Bütçe Döngü Başlangıç Günü */}
              <View style={[styles.prefBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="refresh-circle-outline" size={18} color="#F29F05" style={{ marginRight: 8 }} />
                  <Text style={[styles.prefBoxTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    Maaş / Bütçe Döngüsü Başlangıcı (Buckwheat)
                  </Text>
                </View>
                <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m, fontFamily: tStyles.fontFamily, marginBottom: 10 }}>
                  Aylık harçlık limitinizin sıfırlanacağı günü seçin (Örn: Her ayın 1'i veya 15'i):
                </Text>
                <View style={styles.cycleChipsRow}>
                  {[1, 5, 10, 15, 20, 25].map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.cycleChip,
                        { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                        budgetCycleDay === day && { backgroundColor: colors.primary }
                      ]}
                      onPress={() => setBudgetCycleDay(day)}
                    >
                      <Text style={{ color: budgetCycleDay === day ? colors.onPrimary : colors.text, fontWeight: 'bold', fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                        {day}. Gün
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* İlk Cüzdan & Bakiye */}
              <View style={[styles.prefBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <Text style={[styles.inputMicroLabel, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                  İLK CÜZDAN ADI
                </Text>
                <TextInput
                  style={[styles.mediumTextInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m }]}
                  placeholder="Nakit Cüzdanım, Maaş Hesabım vb."
                  placeholderTextColor={colors.text + '40'}
                  value={accountName}
                  onChangeText={setAccountName}
                />

                <Text style={[styles.inputMicroLabel, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m, marginTop: 12 }]}>
                  BAŞLANGIÇ BAKİYESİ (Temiz Sıfır: 0.00 {currency.symbol})
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18 * m, fontWeight: 'bold', color: colors.primary, marginRight: 8 }}>
                    {currency.symbol}
                  </Text>
                  <TextInput
                    style={[styles.mediumTextInput, { color: colors.text, flex: 1, fontFamily: tStyles.fontFamily, fontSize: 16 * m }]}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.text + '40'}
                    value={initialBalance}
                    onChangeText={setInitialBalance}
                  />
                </View>
              </View>

              {/* Gelişmiş Modül Aç/Kapa (Paisa & Zero Toggles) */}
              <View style={[styles.prefBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <View style={styles.toggleRowItem}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.toggleTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                      Borç & Alacak Takip Modülü (Zero)
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
                      Kişilere verilen veya alınan borçları takip et.
                    </Text>
                  </View>
                  <Switch value={enableDebt} onValueChange={setEnableDebt} trackColor={{ true: colors.primary, false: colors.background }} thumbColor="#FFF" />
                </View>

                <View style={[styles.toggleRowItem, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 10, marginTop: 10 }]}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.toggleTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                      Kategori Bütçe Sınırları (Paisa)
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
                      Kategorilere aylık limit koyarak tasarruf sağla.
                    </Text>
                  </View>
                  <Switch value={enableBudget} onValueChange={setEnableBudget} trackColor={{ true: colors.primary, false: colors.background }} thumbColor="#FFF" />
                </View>
              </View>
            </View>
          )}

          {/* SLIDE 6: Ready & Final Transition (Paisa Setup Transition) */}
          {step === 6 && (
            <View style={[styles.slide, { alignItems: 'center', justifyContent: 'center' }]}>
              <View style={[styles.celebrationCircle, { backgroundColor: avatarPreset ? avatarPreset.bg : colors.primary, overflow: 'hidden' }]}>
                {avatarUri && !avatarUri.startsWith('preset:') ? (
                  <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : avatarPreset ? (
                  <Ionicons name={avatarPreset.icon as any} size={44} color="#FFF" />
                ) : (
                  <Ionicons name="sparkles" size={48} color={colors.onPrimary} />
                )}
              </View>

              <Text style={[styles.readyTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 30 * m }]}>
                Her Şey Hazır!
              </Text>
              <Text style={[styles.readySubtitle, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 14 * m, textAlign: 'center' }]}>
                {name ? `Tebrikler ${name}! ` : ''}TrioTrack finansal tercihlerinize göre yapılandırıldı.
              </Text>

              {/* Setup Summary Card */}
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <View style={styles.summaryItemRow}>
                  <Text style={[styles.summaryItemLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                    Profil & Yazı Tipi:
                  </Text>
                  <Text style={[styles.summaryItemVal, { color: colors.text, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    {name || 'Kullanıcı'} • {fontChoice === 'classic' ? 'Klasik (Serif)' : fontChoice === 'code' ? 'Teknik (Mono)' : 'Modern'}
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={[styles.summaryItemLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                    Seçilen Para Birimi:
                  </Text>
                  <Text style={[styles.summaryItemVal, { color: colors.primary, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    {currency.name} ({currency.symbol})
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={[styles.summaryItemLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                    Finansal Hedef:
                  </Text>
                  <Text style={[styles.summaryItemVal, { color: colors.primary, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    {getFinancialGoal(financialGoal).title}
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={[styles.summaryItemLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                    Tasarruf Hedefi:
                  </Text>
                  <Text style={[styles.summaryItemVal, { color: colors.primary, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    %{savingsTargetPercent} ({getSavingsTargetOption(savingsTargetPercent).title})
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={[styles.summaryItemLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                    İlk Cüzdan:
                  </Text>
                  <Text style={[styles.summaryItemVal, { color: colors.text, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    {accountName || 'Nakit Cüzdanım'} ({initialBalance ? parseFloat(initialBalance) : 0} {currency.symbol})
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={[styles.summaryItemLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                    Hafta Başlangıcı:
                  </Text>
                  <Text style={[styles.summaryItemVal, { color: colors.text, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    {weekStartMonday ? 'Pazartesi' : 'Pazar'}
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={[styles.summaryItemLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                    Maaş Döngüsü:
                  </Text>
                  <Text style={[styles.summaryItemVal, { color: colors.text, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    Her ayın {budgetCycleDay}. günü
                  </Text>
                </View>
                <View style={[styles.summaryItemRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.summaryItemLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                    Seçili Kategoriler:
                  </Text>
                  <Text style={[styles.summaryItemVal, { color: colors.text, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                    {selectedCatIds.length} Kategori
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>

        {/* TOP BAR (Floating Completely Transparent) */}
        {step > 0 && (
          <View
            style={[
              styles.topBar,
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                paddingTop: Math.max(insets.top, 14),
                height: Math.max(insets.top, 14) + 48,
                backgroundColor: 'transparent',
                zIndex: 10,
              }
            ]}
            pointerEvents="box-none"
          >
            <TouchableOpacity onPress={prevStep} style={styles.navTextBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
              <Text style={[styles.navText, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>Geri</Text>
            </TouchableOpacity>

            {step < TOTAL_STEPS - 1 ? (
              <TouchableOpacity onPress={handleFinish} style={styles.navTextBtn} activeOpacity={0.7}>
                <Text style={[styles.navText, { color: colors.text, opacity: 0.5, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>Atla →</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>
        )}

        {/* BOTTOM NAV BAR & STEP INDICATOR */}
        <View style={styles.bottomBar}>
          {renderStepIndicator()}

          <TouchableOpacity
            style={[
              styles.primaryActionBtn,
              { backgroundColor: colors.primary, borderRadius: tStyles.roundness },
              (step === 1 && (!agreedLocal || !agreedPrivacy || !agreedBackup)) && { opacity: 0.5 }
            ]}
            disabled={step === 1 && (!agreedLocal || !agreedPrivacy || !agreedBackup)}
            onPress={nextStep}
            activeOpacity={0.8}
          >
            {isFinishing ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.primaryActionBtnText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 15 * m }]}>
                  {step === TOTAL_STEPS - 1 ? 'BAŞLA' : 'İLERİ'}
                </Text>
                <Ionicons
                  name={step === TOTAL_STEPS - 1 ? 'rocket-outline' : 'arrow-forward'}
                  size={16}
                  color={colors.onPrimary}
                  style={{ marginLeft: 8 }}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* ÇOK KANALLI YEDEKTEN GERİ YÜKLEME MODALI (BOTTOM SHEET) */}
      <Modal visible={showRestoreModal} transparent animationType="slide" onRequestClose={() => setShowRestoreModal(false)} statusBarTranslucent={true}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.backdropDismissArea}
            activeOpacity={1}
            onPress={() => setShowRestoreModal(false)}
          />
          <View style={[
            styles.modalCard,
            { 
              backgroundColor: colors.card, 
              borderTopLeftRadius: 28, 
              borderTopRightRadius: 28, 
              paddingBottom: Math.max(insets.bottom + 14, 26) 
            }
          ]}>
            {/* Alt Çekmece Tutamacı (Sheet Handle) */}
            <View style={[styles.sheetHandle, { backgroundColor: colors.text + '25' }]} />

            {/* Modal Başlığı & Kapat Butonu */}
            <View style={styles.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.sheetIconBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 17 * m }]}>
                    {restoreMode === 'preview' ? 'Yedek Önizlemesi' : 'Yedekten Geri Yükle'}
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
                    {restoreMode === 'preview' ? 'İçeriği kontrol edin ve onaylayın' : 'TrioTrack, Paisa veya Zero verileri'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setShowRestoreModal(false)} 
                style={[styles.sheetCloseBtn, { backgroundColor: colors.background }]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {restoreMode === 'options' && (
                <View style={{ gap: 10 }}>
                  <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12.5 * m, fontFamily: tStyles.fontFamily, marginBottom: 4 }}>
                    Daha önce aldığınız yedeği geri yüklemek için bir yöntem seçin:
                  </Text>

                  {/* Seçenek 1: Cihazdan Dosya Seç */}
                  <TouchableOpacity
                    style={[styles.restoreChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 10) }]}
                    onPress={handlePickFile}
                    disabled={isRestoring}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.restoreChannelIconBox, { backgroundColor: colors.primary + '18' }]}>
                      <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.restoreChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                        Cihazdan .json Dosyası Seç
                      </Text>
                      <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                        Google Drive, iCloud, İndirilenler veya Dahili Hafıza
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
                  </TouchableOpacity>

                  {/* Seçenek 2: Panodan Yapıştır */}
                  <TouchableOpacity
                    style={[styles.restoreChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                    onPress={handlePasteClipboard}
                    disabled={isRestoring}
                  >
                    <View style={[styles.restoreChannelIconBox, { backgroundColor: '#00968818' }]}>
                      <Ionicons name="clipboard-outline" size={22} color="#009688" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.restoreChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                        Panodan Yapıştır (Tek Dokunuş)
                      </Text>
                      <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                        Kopyaladığınız JSON yedek metnini otomatik algılar
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
                  </TouchableOpacity>

                  {/* Seçenek 3: Cihazdaki Yerel Snapshot (Varsa) */}
                  {localSnapshotMeta && (
                    <TouchableOpacity
                      style={[styles.restoreChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8), borderColor: colors.primary, borderWidth: 1 }]}
                      onPress={handleRestoreLocalSnapshot}
                      disabled={isRestoring}
                    >
                      <View style={[styles.restoreChannelIconBox, { backgroundColor: '#4CAF5018' }]}>
                        <Ionicons name="save-outline" size={22} color="#4CAF50" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.restoreChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                            Cihazdaki Son Yerel Kayıt
                          </Text>
                          <View style={{ backgroundColor: '#4CAF5020', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                            <Text style={{ color: '#4CAF50', fontSize: 9.5 * m, fontWeight: 'bold' }}>HAZIR</Text>
                          </View>
                        </View>
                        <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                          {new Date(localSnapshotMeta.savedAt).toLocaleDateString('tr-TR')} • {localSnapshotMeta.transactionCount} İşlem, {localSnapshotMeta.accountCount} Cüzdan
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
                    </TouchableOpacity>
                  )}

                  {/* Seçenek 4: Manuel JSON Metni */}
                  <TouchableOpacity
                    style={[styles.restoreChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                    onPress={() => setRestoreMode('manual')}
                  >
                    <View style={[styles.restoreChannelIconBox, { backgroundColor: '#F29F0518' }]}>
                      <Ionicons name="code-slash-outline" size={22} color="#F29F05" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.restoreChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                        Manuel JSON Metni Girin
                      </Text>
                      <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                        Metin kutusuna doğrudan JSON kodu yapıştırın
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
                  </TouchableOpacity>
                </View>
              )}

              {restoreMode === 'manual' && (
                <View>
                  <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, fontFamily: tStyles.fontFamily, marginBottom: 10 }}>
                    JSON yedek metnini aşağıdaki alana yapıştırın:
                  </Text>
                  <TextInput
                    style={[
                      styles.backupInputBox,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderRadius: Math.max(tStyles.roundness / 2, 8),
                        borderColor: 'rgba(0,0,0,0.1)',
                        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                        fontSize: 11 * m
                      }
                    ]}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    value={backupInput}
                    onChangeText={setBackupInput}
                    placeholder='{"app": "TrioTrack", "transactions": [...] }'
                    placeholderTextColor={colors.text + '40'}
                  />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <TouchableOpacity
                      style={[styles.modalCancelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={() => setRestoreMode('options')}
                    >
                      <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: '600' }}>← Geri</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalConfirmBtn, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={() => processBackupContent(backupInput)}
                    >
                      <Text style={{ color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontWeight: 'bold' }}>İncele ve Yükle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {restoreMode === 'preview' && parsedPreview && (
                <View>
                  <View style={[styles.previewCard, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8), padding: 14, marginBottom: 14 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: 'bold', fontSize: 15 * m }}>
                          {parsedPreview.sourceType === 'zero' ? 'Zero Yedeği' : parsedPreview.sourceType === 'paisa' ? 'Paisa Yedeği' : 'TrioTrack Yedeği'}
                        </Text>
                        <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11.5 * m }}>
                          {parsedPreview.message}
                        </Text>
                      </View>
                    </View>

                    {parsedPreview.stats && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }}>
                        <View style={[styles.statBadge, { backgroundColor: colors.card }]}>
                          <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m }}>İşlemler</Text>
                          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 * m }}>{parsedPreview.stats.transactions}</Text>
                        </View>
                        <View style={[styles.statBadge, { backgroundColor: colors.card }]}>
                          <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m }}>Cüzdanlar</Text>
                          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 * m }}>{parsedPreview.stats.accounts}</Text>
                        </View>
                        <View style={[styles.statBadge, { backgroundColor: colors.card }]}>
                          <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m }}>Kategoriler</Text>
                          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 * m }}>{parsedPreview.stats.categories}</Text>
                        </View>
                        {parsedPreview.stats.debtors > 0 && (
                          <View style={[styles.statBadge, { backgroundColor: colors.card }]}>
                            <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m }}>Borçlar</Text>
                            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 * m }}>{parsedPreview.stats.debtors}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={[styles.modalCancelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={() => setRestoreMode('options')}
                    >
                      <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: '600' }}>Farklı Seç</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalConfirmBtn, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={handleExecuteRestore}
                      disabled={isRestoring}
                    >
                      {isRestoring ? (
                        <ActivityIndicator size="small" color={colors.onPrimary} />
                      ) : (
                        <Text style={{ color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontWeight: 'bold' }}>
                          Verileri İçe Aktar ve Başla
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PROFİL FOTOĞRAFI & AVATAR SEÇİM BOTTOM SHEET'İ */}
      <Modal visible={showAvatarSheet} transparent animationType="slide" onRequestClose={() => setShowAvatarSheet(false)} statusBarTranslucent={true}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.backdropDismissArea}
            activeOpacity={1}
            onPress={() => setShowAvatarSheet(false)}
          />
          <View style={[
            styles.modalCard,
            { 
              backgroundColor: colors.card, 
              borderTopLeftRadius: 28, 
              borderTopRightRadius: 28, 
              paddingBottom: Math.max(insets.bottom + 14, 26) 
            }
          ]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.text + '25' }]} />

            <View style={styles.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.sheetIconBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="camera-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 17 * m }]}>
                    Profil Fotoğrafı & Avatar
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
                    Fotoğraf çekin, galeriden yükleyin veya rozet seçin
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowAvatarSheet(false)} style={[styles.sheetCloseBtn, { backgroundColor: colors.background }]} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 10 }}>
                {/* 1. Galeriden Seç */}
                <TouchableOpacity
                  style={[styles.restoreChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 10) }]}
                  onPress={handlePickAvatarGallery}
                  activeOpacity={0.7}
                >
                  <View style={[styles.restoreChannelIconBox, { backgroundColor: colors.primary + '18' }]}>
                    <Ionicons name="images-outline" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.restoreChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      Galeriden Fotoğraf Seç
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                      Telefonunuzdaki albümlerden profil resmi seçin
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
                </TouchableOpacity>

                {/* 2. Kamerayla Çek */}
                <TouchableOpacity
                  style={[styles.restoreChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 10) }]}
                  onPress={handleTakeAvatarPhoto}
                  activeOpacity={0.7}
                >
                  <View style={[styles.restoreChannelIconBox, { backgroundColor: '#00968818' }]}>
                    <Ionicons name="camera-outline" size={22} color="#009688" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.restoreChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      Kamera ile Fotoğraf Çek
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                      Kamerayı açıp anında yeni bir fotoğraf çekin
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
                </TouchableOpacity>

                {/* 3. Hazır Karakter & Rozet Stilleri */}
                <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12.5 * m, marginTop: 8, marginBottom: 2 }]}>
                  VEYA ŞIK BİR AVATAR SEÇİN
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
                  {AVATAR_PRESETS.map(p => {
                    const isSelected = avatarUri === `preset:${p.id}`;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.presetAvatarBtn,
                          {
                            backgroundColor: colors.background,
                            borderColor: isSelected ? colors.primary : 'transparent',
                            borderWidth: 2,
                            borderRadius: Math.max(tStyles.roundness / 2, 10),
                          }
                        ]}
                        onPress={() => {
                          setAvatarUri(`preset:${p.id}`);
                          setShowAvatarSheet(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.presetAvatarCircle, { backgroundColor: p.bg }]}>
                          <Ionicons name={p.icon as any} size={22} color="#FFF" />
                        </View>
                        <Text style={{ color: colors.text, fontSize: 11 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily, marginTop: 4 }}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 4. Fotoğrafı Kaldır (Varsa) */}
                {avatarUri && (
                  <TouchableOpacity
                    style={[styles.removeAvatarBtn, { borderColor: '#EF4444' + '50', backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 10), marginTop: 6 }]}
                    onPress={() => {
                      setAvatarUri(null);
                      setShowAvatarSheet(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#EF4444', fontFamily: tStyles.fontFamily, fontWeight: 'bold', fontSize: 13 * m }}>
                      Fotoğrafı Kaldır (İsim Baş Harfine Dön)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 44
  },
  navTextBtn: { flexDirection: 'row', alignItems: 'center', padding: 6 },
  navText: { fontWeight: '600' },
  scrollContent: { paddingHorizontal: 22, paddingVertical: 12, flexGrow: 1, justifyContent: 'center' },
  slide: { flex: 1, justifyContent: 'center' },

  brandHeaderBadge: {
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 20
  },
  logoIconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  brandTitle: { fontWeight: 'bold' },
  brandSubtitle: { fontWeight: 'bold', marginTop: 4, letterSpacing: 0.5 },

  heroHeadline: { textAlign: 'center', marginBottom: 8, lineHeight: 36 },
  heroLead: { textAlign: 'center', marginBottom: 20 },

  pillarsList: { gap: 10, marginBottom: 20 },
  pillarCard: { flexDirection: 'row', alignItems: 'center', padding: 14, elevation: 1 },
  pillarIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  pillarTitle: { fontWeight: 'bold', marginBottom: 2 },
  pillarDesc: { lineHeight: 16 },

  restoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, marginTop: 4 },
  restoreBtnText: { fontWeight: 'bold' },

  iconCircleBig: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  slideTitle: { textAlign: 'center', marginBottom: 6 },
  slideSubtitle: { textAlign: 'center', marginBottom: 20, lineHeight: 18, paddingHorizontal: 12 },

  checklistGroup: { gap: 12 },
  checkItemCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, elevation: 1 },
  checkItemTitle: { fontWeight: 'bold', marginBottom: 3 },
  checkItemDesc: { lineHeight: 16 },

  avatarPreviewCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarMonogramText: {
    fontWeight: 'bold',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  presetAvatarBtn: {
    width: '31%',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  presetAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
  },
  inputBox: { padding: 14, marginBottom: 20, elevation: 1 },
  inputMicroLabel: { fontWeight: 'bold', letterSpacing: 0.8, marginBottom: 4 },
  bigTextInput: { paddingVertical: 4 },
  mediumTextInput: { paddingVertical: 8 },

  sectionHeading: { fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  rowChoices: { flexDirection: 'row', gap: 8 },
  choiceChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 6 },

  themeCardItem: { flex: 1, padding: 12, alignItems: 'center' },
  colorDot: { width: 22, height: 22, borderRadius: 11, marginBottom: 6 },
  themeCardTitle: { fontWeight: 'bold' },

  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, elevation: 1 },
  searchInput: { flex: 1 },
  currencyScrollContainer: { elevation: 1, overflow: 'hidden' },
  currencyRowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  currencySymbolBadge: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  currencyCode: { fontWeight: 'bold' },
  currencyFullName: { marginTop: 1 },

  categoriesPillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  categoryPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1 },
  categoryPillText: {},

  prefBox: { padding: 14, marginBottom: 12, elevation: 1 },
  prefBoxTitle: { fontWeight: 'bold' },
  cycleChipsRow: { flexDirection: 'row', gap: 6 },
  cycleChip: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  toggleRowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleTitle: { fontWeight: 'bold', marginBottom: 2 },

  celebrationCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  readyTitle: { textAlign: 'center', marginBottom: 8 },
  readySubtitle: { marginBottom: 24, paddingHorizontal: 20 },
  summaryCard: { width: '100%', padding: 16, elevation: 1 },
  summaryItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  summaryItemLabel: {},
  summaryItemVal: {},

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8
  },
  indicatorContainer: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  indicator: { height: 6, borderRadius: 3 },
  primaryActionBtn: { paddingVertical: 14, paddingHorizontal: 26, elevation: 3 },
  primaryActionBtnText: { fontWeight: 'bold', letterSpacing: 0.8 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropDismissArea: {
    flex: 1,
    width: '100%',
  },
  modalCard: {
    width: '100%',
    paddingHorizontal: 22,
    paddingTop: 12,
    maxHeight: '90%',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sheetHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: { fontWeight: 'bold' },
  backupInputBox: { minHeight: 140, padding: 12, borderWidth: 1, marginTop: 4, marginBottom: 16 },
  modalActionsRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  modalCancelBtn: { paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center' },
  modalConfirmBtn: { paddingVertical: 12, paddingHorizontal: 22, alignItems: 'center' },

  // Logo & Manifesto Stilleri
  logoContainer: {
    width: 82,
    height: 82,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: '#09090B',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  manifestoText: {
    letterSpacing: 0.2,
  },

  // Çok Kanallı Yedek Stilleri
  restoreChannelBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 },
  restoreChannelIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  restoreChannelTitle: { fontWeight: 'bold', marginBottom: 2 },
  previewCard: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  statBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', minWidth: 70 },

  // Slide 3: Para Birimi & Finansal Hedef Stilleri
  slideIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  currencyHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  currencyHeroSymbolBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyHeroCode: {
    fontWeight: 'bold',
  },
  currencyHeroName: {
    flexShrink: 1,
  },
  activeCheckPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCurrencyChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderWidth: 1.5,
  },
  quickCurrencyCode: {},
  quickCurrencySymbol: {},
  currencyToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  financialGoalsList: {
    gap: 10,
  },
  financialGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  goalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalTitle: {},
  goalSubtitle: {},
  savingsPillBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  savingsMicroBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  savingsMicroBadgeText: {
    fontWeight: 'bold',
  },
  savingsPillText: {},
  savingsDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  savingsDetailIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  savingsDetailTitle: {},
  savingsDetailDesc: {},
});
