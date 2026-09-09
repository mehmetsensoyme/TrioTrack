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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';

const CURRENCIES = [
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası', flag: '🇹🇷' },
  { code: 'USD', symbol: '$', name: 'Amerikan Doları', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini', flag: '🇬🇧' },
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

  // Step 2: Personalization
  const [name, setName] = useState('');

  // Step 3: Currency
  const [currency, setLocalCurrency] = useState(CURRENCIES[0]);
  const [currencySearch, setCurrencySearch] = useState('');

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

  // Backup restore modal state (Zero/Paisa)
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [backupInput, setBackupInput] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

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
        selectedCategoryIds: selectedCatIds
      });

      setTimeout(() => {
        setIsFinishing(false);
        navigation.replace('Home');
      }, 600);
    } catch (e) {
      console.warn(e);
      setIsFinishing(false);
      navigation.replace('Home');
    }
  };

  const handleRestoreBackup = async () => {
    if (!backupInput.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen JSON yedek içeriğini yapıştırın.');
      return;
    }
    setIsRestoring(true);
    try {
      const res = await importDataFromJSON(backupInput.trim());
      setIsRestoring(false);
      if (res.success) {
        setShowRestoreModal(false);
        Alert.alert('Başarılı', 'Yedek başarıyla geri yüklendi! TrioTrack açılıyor.', [
          { text: 'Tamam', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        Alert.alert('Hata', res.message || 'Yedek dosyası okunamadı.');
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
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 12) }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* TOP BAR */}
        <View style={styles.topBar}>
          {step > 0 ? (
            <TouchableOpacity onPress={prevStep} style={styles.navTextBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
              <Text style={[styles.navText, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>Geri</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}

          {step > 0 && step < TOTAL_STEPS - 1 && (
            <TouchableOpacity onPress={handleFinish} style={styles.navTextBtn} activeOpacity={0.7}>
              <Text style={[styles.navText, { color: colors.text, opacity: 0.5, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>Atla →</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* SLIDE 0: Welcome & Hybrid Architecture Showcase */}
          {step === 0 && (
            <View style={styles.slide}>
              <View style={[styles.brandHeaderBadge, { backgroundColor: colors.primary + '18' }]}>
                <View style={[styles.logoIconCircle, { backgroundColor: colors.primary }]}>
                  <Ionicons name="pie-chart" size={28} color={colors.onPrimary} />
                </View>
                <Text style={[styles.brandTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 26 * m }]}>
                  TrioTrack
                </Text>
                <Text style={[styles.brandSubtitle, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                  Paisa • Zero • Buckwheat Hibrit Mimarisi
                </Text>
              </View>

              <Text style={[styles.heroHeadline, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 28 * m }]}>
                Kişisel Finansında{'\n'}Kontrol Sende.
              </Text>
              <Text style={[styles.heroLead, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                Üç güçlü felsefenin en iyi yönleri tek bir uygulamada buluştu.
              </Text>

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
                style={[styles.restoreBtn, { borderColor: colors.primary + '50', borderRadius: tStyles.roundness }]}
                onPress={() => setShowRestoreModal(true)}
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

          {/* SLIDE 2: Personalization (Zero "What should we call you?") */}
          {step === 2 && (
            <View style={styles.slide}>
              <View style={[styles.avatarPreviewCircle, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.onPrimary, fontSize: 32 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }}>
                  {name.trim() ? name.trim().charAt(0).toUpperCase() : '👤'}
                </Text>
              </View>

              <Text style={[styles.slideTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 26 * m }]}>
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
                  style={[styles.bigTextInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 22 * m }]}
                  placeholder="Örn: Mehmet"
                  placeholderTextColor={colors.text + '40'}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>

              {/* Appearance Toggles */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
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

              <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, marginTop: 16 }]}>
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
            </View>
          )}

          {/* SLIDE 3: Currency Picker (Paisa & Zero Multi-currency Search & Grid) */}
          {step === 3 && (
            <View style={styles.slide}>
              <View style={[styles.iconCircleBig, { backgroundColor: colors.primary + '18' }]}>
                <Text style={{ fontSize: 28 * m, color: colors.primary, fontWeight: 'bold' }}>
                  {currency.symbol}
                </Text>
              </View>
              <Text style={[styles.slideTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 26 * m }]}>
                Ana Para Biriminiz
              </Text>
              <Text style={[styles.slideSubtitle, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                Günlük harcamalarınız ve cüzdan bakiyeleriniz bu para biriminde gösterilir.
              </Text>

              {/* Search Bar */}
              <View style={[styles.searchBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <Ionicons name="search" size={18} color={colors.text} style={{ opacity: 0.5, marginRight: 10 }} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}
                  placeholder="Para birimi ara (TRY, USD, EUR...)"
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

              {/* Currency Grid Scroll */}
              <View style={[styles.currencyScrollContainer, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 250 }} showsVerticalScrollIndicator={true}>
                  {filteredCurrencies.map(c => {
                    const isSelected = currency.code === c.code;
                    return (
                      <TouchableOpacity
                        key={c.code}
                        style={[
                          styles.currencyRowItem,
                          isSelected && { backgroundColor: colors.primary + '18' }
                        ]}
                        onPress={() => setLocalCurrency(c)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.currencySymbolBadge, { backgroundColor: isSelected ? colors.primary : colors.background }]}>
                          <Text style={{ color: isSelected ? colors.onPrimary : colors.text, fontWeight: 'bold', fontSize: 14 * m }}>
                            {c.symbol}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.currencyCode, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
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
              <View style={[styles.celebrationCircle, { backgroundColor: colors.primary }]}>
                {isFinishing ? (
                  <ActivityIndicator size="large" color={colors.onPrimary} />
                ) : (
                  <Ionicons name="sparkles" size={48} color={colors.onPrimary} />
                )}
              </View>

              <Text style={[styles.readyTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: tStyles.titleWeight, fontSize: 30 * m }]}>
                {isFinishing ? 'TrioTrack Kuruluyor...' : 'Her Şey Hazır!'}
              </Text>
              <Text style={[styles.readySubtitle, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 14 * m, textAlign: 'center' }]}>
                {name ? `Tebrikler ${name}! ` : ''}TrioTrack finansal tercihlerinize göre yapılandırıldı.
              </Text>

              {/* Setup Summary Card */}
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
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

      {/* YEDEKTEN GERİ YÜKLEME MODALI (Zero / Paisa) */}
      <Modal visible={showRestoreModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="cloud-download-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>
                Yedekten Geri Yükle
              </Text>
            </View>
            <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, fontFamily: tStyles.fontFamily, marginBottom: 12 }}>
              Daha önce dışa aktardığınız TrioTrack JSON yedek metnini aşağıdaki kutuya yapıştırın:
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
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={() => setShowRestoreModal(false)}
              >
                <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: '600' }}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={handleRestoreBackup}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Text style={{ color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontWeight: 'bold' }}>
                    Yükle ve Başla
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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

  avatarPreviewCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
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

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 440, padding: 20 },
  modalTitle: { fontWeight: 'bold' },
  backupInputBox: { minHeight: 140, padding: 12, borderWidth: 1, marginTop: 4, marginBottom: 16 },
  modalActionsRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  modalConfirmBtn: { paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center' },
});
