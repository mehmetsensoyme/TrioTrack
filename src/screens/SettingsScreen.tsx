import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Platform, Share, Modal, Linking, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { APP_VERSION, APP_BUILD } from '../constants/version';
import { AVATAR_PRESETS, getAvatarPreset } from '../utils/avatarUtils';
import { 
  pickBackupFile, 
  readClipboardBackup, 
  copyToClipboard, 
  shareBackupAsFile, 
  saveLocalSnapshot, 
  getLocalSnapshot, 
  parseAndNormalizeBackup,
  NormalizedBackupResult,
  LocalSnapshotMeta 
} from '../utils/backupService';

const CURRENCIES = [
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası' },
  { code: 'USD', symbol: '$', name: 'Amerikan Doları' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini' },
  { code: 'JPY', symbol: '¥', name: 'Japon Yeni' },
  { code: 'AUD', symbol: 'A$', name: 'Avustralya Doları' },
  { code: 'CAD', symbol: 'C$', name: 'Kanada Doları' },
  { code: 'CHF', symbol: 'CHF', name: 'İsviçre Frangı' },
  { code: 'CNY', symbol: '¥', name: 'Çin Yuanı' },
  { code: 'RUB', symbol: '₽', name: 'Rus Rublesi' },
  { code: 'INR', symbol: '₹', name: 'Hindistan Rupisi' },
  { code: 'BRL', symbol: 'R$', name: 'Brezilya Reali' },
];

export default function SettingsScreen({ navigation }: any) {
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
    currency, 
    setCurrency, 
    isDark 
  } = useTheme();

  const { 
    transactions, 
    accounts,
    monthlyBudgetGoal, 
    setMonthlyBudgetGoal, 
    budgetCycleDay,
    setBudgetCycleDay,
    exportDataAsJSON,
    importDataFromJSON,
    resetAllData,
    userName,
    setUserName,
    userAvatar,
    setUserAvatar,
    weekStartMonday,
    setWeekStartMonday
  } = useData();

  const [dailyReminder, setDailyReminder] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState(String(monthlyBudgetGoal));
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [importMode, setImportMode] = useState<'options' | 'manual' | 'preview'>('options');
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<NormalizedBackupResult | null>(null);
  const [localSnapshotMeta, setLocalSnapshotMeta] = useState<LocalSnapshotMeta | null>(null);
  const [localSnapshotContent, setLocalSnapshotContent] = useState<string | null>(null);

  const avatarPreset = useMemo(() => getAvatarPreset(userAvatar), [userAvatar]);

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
        await setUserAvatar(result.assets[0].uri);
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
        await setUserAvatar(result.assets[0].uri);
        setShowAvatarSheet(false);
      }
    } catch (err: any) {
      Alert.alert('Hata', 'Fotoğraf çekilirken bir sorun oluştu: ' + (err?.message || ''));
    }
  };

  const m = tStyles.fontSizeMultiplier;

  useEffect(() => {
    (async () => {
      const bio = await AsyncStorage.getItem('@triotrack_biometrics_enabled');
      if (bio !== null) setBiometricsEnabled(bio === 'true');
    })();
  }, []);

  const handleToggleBiometrics = async (val: boolean) => {
    setBiometricsEnabled(val);
    await AsyncStorage.setItem('@triotrack_biometrics_enabled', String(val));
  };

  const handleSaveGoal = () => {
    const parsed = parseInt(newGoalInput, 10);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir bütçe tutarı girin.');
      return;
    }
    setMonthlyBudgetGoal(parsed);
    setShowGoalModal(false);
    Alert.alert('Başarılı', `Aylık bütçe hedefiniz ${currency} ${parsed.toLocaleString('tr-TR')} olarak güncellendi.`);
  };

  // Çok Kanallı Dışa Aktarma
  const handleShareAsFile = async () => {
    setShowExportModal(false);
    const json = exportDataAsJSON();
    const res = await shareBackupAsFile(json);
    if (!res.success && res.message) {
      Alert.alert('Paylaşım Hatası', res.message);
    }
  };

  const handleSaveSnapshot = async () => {
    const json = exportDataAsJSON();
    const ok = await saveLocalSnapshot(json, {
      transactionCount: transactions.length,
      accountCount: accounts.length,
      userName: userName || 'Kullanıcı',
    });
    if (ok) {
      setShowExportModal(false);
      Alert.alert('Yerel Snapshot Kaydedildi 💾', 'Yedek cihazınızın güvenli yerel hafızasına başarıyla kaydedildi.');
    } else {
      Alert.alert('Hata', 'Yerel yedek kaydedilemedi.');
    }
  };

  const handleCopyJsonToClipboard = async () => {
    const json = exportDataAsJSON();
    const ok = await copyToClipboard(json);
    if (ok) {
      setShowExportModal(false);
      Alert.alert('Panoya Kopyalandı 📋', 'TrioTrack yedek JSON metni panoya kopyalandı.');
    } else {
      Alert.alert('Hata', 'Panoya kopyalanamadı.');
    }
  };

  // Çok Kanallı İçe Aktarma
  const handleOpenImportOptions = async () => {
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
    setImportMode('options');
    setParsedPreview(null);
    setImportJsonText('');
    setShowImportModal(true);
  };

  const processImportContent = (content: string) => {
    const normalized = parseAndNormalizeBackup(content);
    if (!normalized.success) {
      Alert.alert('Geçersiz Yedek Dosyası', normalized.message);
      return;
    }
    setImportJsonText(content);
    setParsedPreview(normalized);
    setImportMode('preview');
  };

  const handlePickImportFile = async () => {
    setIsImporting(true);
    const res = await pickBackupFile();
    setIsImporting(false);
    if (res.canceled) return;
    if (res.error) {
      Alert.alert('Dosya Hatası', res.error);
      return;
    }
    if (res.content) {
      processImportContent(res.content);
    }
  };

  const handlePasteImportClipboard = async () => {
    const text = await readClipboardBackup();
    if (!text || !text.trim()) {
      Alert.alert('Pano Boş', 'Panonuzda kopyalanmış bir yedek verisi bulunamadı.');
      return;
    }
    processImportContent(text.trim());
  };

  const handleRestoreImportSnapshot = () => {
    if (localSnapshotContent) {
      processImportContent(localSnapshotContent);
    }
  };

  const handleExecuteImport = async () => {
    if (!importJsonText.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir yedek verisi yapıştırın veya seçin.');
      return;
    }
    setIsImporting(true);
    try {
      const result = await importDataFromJSON(importJsonText.trim());
      setIsImporting(false);
      if (result.success) {
        setShowImportModal(false);
        setImportJsonText('');
        Alert.alert('Tebrikler 🎉', result.message);
      } else {
        Alert.alert('İçe Aktarma Başarısız', result.message);
      }
    } catch (e: any) {
      setIsImporting(false);
      Alert.alert('Hata', 'Geri yükleme hatası: ' + (e?.message || ''));
    }
  };

  // CSV Dışa Aktarma (Zero & Paisa esintisi)
  const handleExportCSV = async () => {
    try {
      let csvContent = 'ID,Tarih,Baslik,Tutar,Tur,Kategori\n';
      transactions.forEach(tx => {
        csvContent += `"${tx.id}","${tx.date}","${tx.title}",${tx.amount},"${tx.type}","${tx.categoryId}"\n`;
      });

      await Share.share({
        title: 'TrioTrack Veri Dökümü (CSV)',
        message: csvContent,
      });
    } catch (e) {
      Alert.alert('Dışa Aktarma', 'CSV verisi paylaşılamadı.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Tüm Verileri Sıfırla',
      'Bu işlem tüm işlemlerinizi, hesap bakiyelerinizi ve borç kayıtlarınızı silecektir. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Evet, Sıfırla', 
          style: 'destructive', 
          onPress: async () => {
            await resetAllData();
            Alert.alert('Başarılı', 'Tüm uygulama verileri başarıyla sıfırlandı.');
          } 
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* BAŞLIK */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {navigation?.canGoBack && navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12, padding: 4 }}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={[styles.pageTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 22 * m, fontWeight: tStyles.titleWeight }]}>
                TrioTrack Ayarları
              </Text>
              <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                Kişiselleştirme, Bütçe, Veri & Sistem
              </Text>
            </View>
          </View>
        </View>

        {/* 1. KULLANICI PROFİL KARTI */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <TouchableOpacity 
            style={[
              styles.avatarCircle, 
              { 
                backgroundColor: avatarPreset ? avatarPreset.bg : colors.primary,
                borderWidth: 2,
                borderColor: colors.primary + '35',
              }
            ]}
            onPress={() => setShowAvatarSheet(true)}
            activeOpacity={0.8}
          >
            {userAvatar && !userAvatar.startsWith('preset:') ? (
              <Image source={{ uri: userAvatar }} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="cover" />
            ) : avatarPreset ? (
              <Ionicons name={avatarPreset.icon as any} size={24 * m} color="#FFFFFF" />
            ) : userName?.trim() ? (
              <Text style={[styles.avatarText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily }]}>
                {userName.trim().charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={22 * m} color={colors.onPrimary} />
            )}
            <View style={[styles.miniCameraBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={10} color={colors.onPrimary} />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <TextInput
              style={[styles.profileNameInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m }]}
              value={userName}
              onChangeText={setUserName}
              placeholder="Adınız"
              placeholderTextColor={colors.text + '50'}
            />
            <TouchableOpacity onPress={() => setShowAvatarSheet(true)} style={{ marginTop: 2 }}>
              <Text style={[styles.profileRole, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                {userAvatar ? 'Fotoğrafı / Stili Değiştir' : '+ Profil Fotoğrafı Ekle'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowAvatarSheet(true)} style={{ padding: 6 }}>
            <Ionicons name="camera-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 2. GÖRÜNÜM & TEMA (Sistem / Açık / Koyu) */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              GÖRÜNÜM MODU
            </Text>
          </View>
          
          <View style={styles.buttonGroup}>
            {[
              { label: 'Sistem', val: 'system', icon: 'phone-portrait-outline' },
              { label: 'Aydınlık', val: 'light', icon: 'sunny-outline' },
              { label: 'Karanlık', val: 'dark', icon: 'moon-outline' },
            ].map(item => (
              <TouchableOpacity
                key={item.val}
                style={[
                  styles.optionBtn,
                  { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                  themeMode === item.val && { backgroundColor: colors.primary }
                ]}
                onPress={() => setThemeMode(item.val as any)}
              >
                <Ionicons name={item.icon as any} size={18} color={themeMode === item.val ? colors.onPrimary : colors.text} style={{ marginBottom: 4 }} />
                <Text style={{ color: themeMode === item.val ? colors.onPrimary : colors.text, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 12 * m }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. TRIOTRACK TASARIM KARAKTERİ */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="shapes-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              ARAYÜZ TASARIM KARAKTERİ
            </Text>
          </View>

          <View style={styles.themeGrid}>
            {[
              { id: 'paisa', name: 'TrioTrack Material', desc: 'Modern Material You, yumuşak hatlar ve zengin kartlar', color: '#6750A4' },
              { id: 'zero', name: 'TrioTrack Minimalist', desc: 'Keskin hatlar, sade ve sıfır dikkat dağınıklığı', color: isDark ? '#FFFFFF' : '#000000' },
              { id: 'buckwheat', name: 'TrioTrack Enerjik', desc: 'Dinamik turuncu vurgular ve motive edici çizgiler', color: '#F29F05' },
            ].map(t => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeItem,
                  { backgroundColor: colors.background, borderRadius: tStyles.roundness },
                  themeName === t.id && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setTheme(t.id as any)}
              >
                <View style={[styles.themeColorDot, { backgroundColor: t.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.themeItemName, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                    {t.name}
                  </Text>
                  <Text style={[styles.themeItemDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                    {t.desc}
                  </Text>
                </View>
                {themeName === t.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. TİPOGRAFİ & YAZI BOYUTU */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="text-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              TİPOGRAFİ VE YAZI BOYUTU
            </Text>
          </View>

          {/* Boyut */}
          <Text style={{ color: colors.text, opacity: 0.7, marginBottom: 8, fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
            Yazı Boyutu Seçimi:
          </Text>
          <View style={[styles.buttonGroup, { marginBottom: 16 }]}>
            {[
              { label: 'Küçük', val: 'small' },
              { label: 'Normal', val: 'medium' },
              { label: 'Büyük', val: 'large' },
            ].map(item => (
              <TouchableOpacity
                key={item.val}
                style={[
                  styles.optionBtn,
                  { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                  textSize === item.val && { backgroundColor: colors.primary }
                ]}
                onPress={() => setTextSize(item.val as any)}
              >
                <Text style={{ color: textSize === item.val ? colors.onPrimary : colors.text, fontWeight: 'bold', fontFamily: tStyles.fontFamily, fontSize: 12 * m }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Font Ailesi */}
          <Text style={{ color: colors.text, opacity: 0.7, marginBottom: 8, fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
            Yazı Tipi Ailesi:
          </Text>
          <View style={styles.buttonGroup}>
            {[
              { label: 'Modern (Sans)', val: 'modern', fam: Platform.OS === 'ios' ? 'System' : 'sans-serif' },
              { label: 'Klasik (Serif)', val: 'classic', fam: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
              { label: 'Dijital (Kod)', val: 'code', fam: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
            ].map(item => (
              <TouchableOpacity
                key={item.val}
                style={[
                  styles.optionBtn,
                  { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                  fontChoice === item.val && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFontChoice(item.val as any)}
              >
                <Text style={{ color: fontChoice === item.val ? colors.onPrimary : colors.text, fontWeight: 'bold', fontFamily: item.fam, fontSize: 12 * m }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. PARA BİRİMİ SEÇİMİ */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="cash-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              ANA PARA BİRİMİ
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CURRENCIES.map(c => {
              const isSelected = currency === c.symbol;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.currencyChip,
                    { backgroundColor: colors.background, borderRadius: tStyles.roundness },
                    isSelected && { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => setCurrency(c.symbol)}
                >
                  <Text style={[styles.currSymbol, { color: isSelected ? colors.primary : colors.text, fontWeight: 'bold', fontSize: 16 * m }]}>
                    {c.symbol}
                  </Text>
                  <Text style={[styles.currCode, { color: colors.text, opacity: 0.7, fontSize: 11 * m }]}>
                    {c.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 6. FİNANSAL ALIŞKANLIKLAR & TERCİHLER */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="options-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              FİNANSAL TERCİHLER
            </Text>
          </View>

          {/* Aylık Bütçe Hedefi Düzenleme (Buckwheat) */}
          <View style={[styles.toggleRow, { marginBottom: 12 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                Aylık Bütçe Hedefi: {currency} {monthlyBudgetGoal.toLocaleString('tr-TR')}
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                Akıllı günlük limit bu hedef tutara göre dağıtılır.
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.smallActionBtn, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              onPress={() => {
                setNewGoalInput(String(monthlyBudgetGoal));
                setShowGoalModal(true);
              }}
            >
              <Ionicons name="pencil" size={14} color={colors.onPrimary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.onPrimary, fontWeight: 'bold', fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>Ayarla</Text>
            </TouchableOpacity>
          </View>

          {/* Maaş / Bütçe Döngü Başlangıç Günü (Buckwheat) */}
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12, marginTop: 4 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                Döngü Başlangıcı: Her Ayın {budgetCycleDay}. Günü
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m, marginBottom: 8 }]}>
                Maaş aldığınız veya harcama döneminizin başladığı günü seçin.
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {[1, 5, 10, 15, 20, 25].map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.cycleDayChip,
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
          </View>

          {/* Günlük Limit Bildirimi (Buckwheat) */}
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12, marginTop: 12 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                Akıllı Günlük Limit Bildirimi
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                Her sabah o gün harcayabileceğiniz akıllı limiti hatırlatır.
              </Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ true: colors.primary, false: colors.background }}
              thumbColor="#FFF"
            />
          </View>

          {/* Hafta Başlangıcı (Zero) */}
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12, marginTop: 12 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                Hafta Başlangıcı: {weekStartMonday ? 'Pazartesi' : 'Pazar'}
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                Raporlar ve grafikler bu güne göre gruplanır.
              </Text>
            </View>
            <Switch
              value={weekStartMonday}
              onValueChange={setWeekStartMonday}
              trackColor={{ true: colors.primary, false: colors.background }}
              thumbColor="#FFF"
            />
          </View>

          {/* Uygulama Kilidi & Biyometrik (Paisa) */}
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12, marginTop: 12 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                Uygulama Güvenlik Kilidi
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                TrioTrack açılışında biyometrik doğrulama ister.
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ true: colors.primary, false: colors.background }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* 7. VERİ YÖNETİMİ & GÜVENLİK (PAISA & ZERO) */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              VERİ YÖNETİMİ & YEDEKLEME
            </Text>
          </View>

          {/* JSON Tam Yedekleme (Dışa Aktar) */}
          <TouchableOpacity style={styles.menuActionRow} onPress={() => setShowExportModal(true)}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuActionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                Yedek Al (Dışa Aktar & Kaydet)
              </Text>
              <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m }}>
                Yerel cihaz snapshot'ı, .json dosyası veya pano ile yedekleyin
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.4 }} />
          </TouchableOpacity>

          {/* JSON Yedekten Geri Yükle (İçe Aktar) */}
          <TouchableOpacity 
            style={[styles.menuActionRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', marginTop: 10, paddingTop: 10 }]}
            onPress={handleOpenImportOptions}
          >
            <Ionicons name="cloud-download-outline" size={20} color="#009688" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuActionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                Yedek Geri Yükle (İçe Aktar)
              </Text>
              <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m }}>
                Cihaz dosyası, pano veya yerel snapshot'tan geri yükleyin
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.4 }} />
          </TouchableOpacity>

          {/* CSV Dışa Aktarma */}
          <TouchableOpacity 
            style={[styles.menuActionRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', marginTop: 10, paddingTop: 10 }]}
            onPress={handleExportCSV}
          >
            <Ionicons name="download-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuActionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                Verileri CSV Olarak Dışa Aktar
              </Text>
              <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m }}>
                Excel veya tablolama programları için döküm alın
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.4 }} />
          </TouchableOpacity>

          {/* Sıfırlama */}
          <TouchableOpacity 
            style={[styles.menuActionRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', marginTop: 10, paddingTop: 10 }]}
            onPress={handleResetData}
          >
            <Ionicons name="trash-outline" size={20} color="#E57373" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuActionText, { color: '#E57373', fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
                Tüm Verileri Temizle
              </Text>
              <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m }}>
                Uygulama kayıtlarını sıfırlayın
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#E57373" style={{ opacity: 0.4 }} />
          </TouchableOpacity>
        </View>

        {/* 8. CREDITS & AÇIK KAYNAK TEŞEKKÜRLERİ */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="heart-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              TEŞEKKÜRLER & AÇIK KAYNAK İLHAMI
            </Text>
          </View>
          
          <Text style={[styles.creditsIntro, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 12 * m, lineHeight: 18 }]}>
            TrioTrack, açık kaynak dünyasının en beğenilen üç finans uygulamasının en güçlü yönlerini harmanlayarak geliştirilmiştir:
          </Text>

          <View style={styles.creditItem}>
            <Text style={[styles.creditTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }]}>
              • Paisa
            </Text>
            <Text style={[styles.creditDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              Çoklu hesap ve cüzdan yönetimi, kategori bütçeleme sınırları ve Material You estetiği.
            </Text>
          </View>

          <View style={styles.creditItem}>
            <Text style={[styles.creditTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }]}>
              • Zero
            </Text>
            <Text style={[styles.creditDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              Alacak ve borç takibi mimarisi, keskin minimalist tasarım ve yüksek performanslı veri tabanı.
            </Text>
          </View>

          <View style={styles.creditItem}>
            <Text style={[styles.creditTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }]}>
              • Buckwheat
            </Text>
            <Text style={[styles.creditDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              Akıllı günlük harcama limiti motoru ve dinamik tasarruf hedefi formülü.
            </Text>
          </View>

          <View style={[styles.versionBox, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 10, marginTop: 10 }]}>
            <Text style={{ color: colors.text, opacity: 0.4, fontSize: 11 * m, textAlign: 'center', fontFamily: tStyles.fontFamily }}>
              TrioTrack Mobil Sürüm v{APP_VERSION} (Derleme {APP_BUILD}) • Hibrit Mimari
            </Text>
          </View>
        </View>

        {/* 9. GELİŞTİRİCİ & MARKA İMZASI */}
        <View style={[styles.brandCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.brandTopRow}>
            <View style={[styles.brandLogoBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="pie-chart" size={26} color={colors.onPrimary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.brandAppName, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>
                  TrioTrack
                </Text>
                <View style={[styles.brandVersionTag, { backgroundColor: colors.primary + '18', borderRadius: 6 }]}>
                  <Text style={[styles.brandVersionText, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: 'bold' }]}>
                    v{APP_VERSION}
                  </Text>
                </View>
              </View>
              <Text style={[styles.brandAppDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m, marginTop: 2 }]}>
                Paisa • Zero • Buckwheat Hibrit Gücü
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.developerLinkRow, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
            activeOpacity={0.7}
            onPress={() => Linking.openURL('https://github.com/mehmetsensoyme')}
          >
            <View style={[styles.githubIconBadge, { backgroundColor: isDark ? '#374151' : '#24292e' }]}>
              <Ionicons name="logo-github" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.developerLabel, { color: colors.text, opacity: 0.55, fontSize: 11 * m, fontFamily: tStyles.fontFamily }]}>
                Geliştirici
              </Text>
              <Text style={[styles.developerName, { color: colors.text, fontWeight: 'bold', fontSize: 14 * m, fontFamily: tStyles.fontFamily }]}>
                Mehmet Şensoy
              </Text>
            </View>
            <View style={styles.githubLinkBadge}>
              <Text style={[styles.githubLinkText, { color: colors.primary, fontWeight: '700', fontSize: 12 * m, fontFamily: tStyles.fontFamily, marginRight: 4 }]}>
                GitHub
              </Text>
              <Ionicons name="open-outline" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* AYLIK BÜTÇE HEDEFİ AYARLAMA MODALI (BUCKWHEAT) */}
      <Modal visible={showGoalModal} transparent animationType="slide" onRequestClose={() => setShowGoalModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowGoalModal(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: Math.max(insets.bottom + 14, 26) }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.text + '25' }]} />
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.modalHeaderIconBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="flag-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 17 * m }]}>
                  Aylık Bütçe Hedefi Belirle
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowGoalModal(false)} style={[styles.sheetCloseBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, fontFamily: tStyles.fontFamily, marginBottom: 16 }}>
              Buckwheat akıllı motoru, bu hedef tutardan ay içinde yaptığınız harcamaları çıkarıp kalan günlere akıllıca paylaştırır.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8), paddingHorizontal: 12, marginBottom: 18 }}>
              <Text style={{ fontSize: 20 * m, fontWeight: 'bold', color: colors.primary, marginRight: 8 }}>{currency}</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, flex: 1, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}
                keyboardType="numeric"
                value={newGoalInput}
                onChangeText={setNewGoalInput}
                placeholder="Örn: 20000"
                placeholderTextColor={colors.text + '50'}
                autoFocus
              />
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: '600' }}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={handleSaveGoal}
              >
                <Text style={{ color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontWeight: 'bold' }}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ÇOK KANALLI YEDEK ALMA (DIŞA AKTARMA) MODALI */}
      <Modal visible={showExportModal} transparent animationType="slide" onRequestClose={() => setShowExportModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowExportModal(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: Math.max(insets.bottom + 14, 26), maxHeight: '88%' }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.text + '25' }]} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.modalHeaderIconBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 17 * m }]}>
                    Yedekleme Seçenekleri
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                    Tüm verilerinizi güvenle dışa aktarın
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowExportModal(false)} style={[styles.sheetCloseBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12.5 * m, fontFamily: tStyles.fontFamily, marginBottom: 12 }}>
              Verilerinizi saklamak için tercih ettiğiniz yöntemi seçin:
            </Text>

            <View style={{ gap: 10 }}>
              {/* Seçenek 1: .json Dosyası Olarak Kaydet / Paylaş */}
              <TouchableOpacity
                style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={handleShareAsFile}
              >
                <View style={[styles.backupChannelIconBox, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="share-outline" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                    .json Dosyası Olarak Kaydet / Paylaş
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                    Telefon hafızasına indirin, Google Drive veya WhatsApp ile paylaşın
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
              </TouchableOpacity>

              {/* Seçenek 2: Cihaz Hafızasına Hızlı Snapshot */}
              <TouchableOpacity
                style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={handleSaveSnapshot}
              >
                <View style={[styles.backupChannelIconBox, { backgroundColor: '#4CAF5018' }]}>
                  <Ionicons name="save-outline" size={22} color="#4CAF50" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                    Cihaz Hafızasına Yerel Snapshot Kaydet
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                    Cihazınızda tek dokunuşla geri çağrılabilecek güvenli yerel kopya
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
              </TouchableOpacity>

              {/* Seçenek 3: JSON Metnini Panoya Kopyala */}
              <TouchableOpacity
                style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={handleCopyJsonToClipboard}
              >
                <View style={[styles.backupChannelIconBox, { backgroundColor: '#00968818' }]}>
                  <Ionicons name="copy-outline" size={22} color="#009688" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                    JSON Metnini Panoya Kopyala
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                    Metin olarak kopyalayıp notlarınıza veya e-postanıza yapıştırın
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
              </TouchableOpacity>

              {/* Seçenek 4: Excel / CSV Tablosu Olarak Dışa Aktar */}
              <TouchableOpacity
                style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={() => {
                  setShowExportModal(false);
                  handleExportCSV();
                }}
              >
                <View style={[styles.backupChannelIconBox, { backgroundColor: '#F29F0518' }]}>
                  <Ionicons name="grid-outline" size={22} color="#F29F05" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                    Excel / CSV Tablosu Olarak Dışa Aktar
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                    Tablolama programlarında açmak için CSV dökümü alın
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ÇOK KANALLI YEDEKTEN GERİ YÜKLEME (İÇE AKTARMA) MODALI */}
      <Modal visible={showImportModal} transparent animationType="slide" onRequestClose={() => setShowImportModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowImportModal(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: Math.max(insets.bottom + 14, 26), maxHeight: '88%' }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.text + '25' }]} />
            
            {/* Başlık */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.modalHeaderIconBadge, { backgroundColor: '#00968818' }]}>
                  <Ionicons name="cloud-download-outline" size={20} color="#009688" />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 17 * m }]}>
                    {importMode === 'preview' ? 'Yedek Önizlemesi' : 'Yedekten Geri Yükle'}
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                    {importMode === 'preview' ? 'Verileri kontrol edip onaylayın' : 'TrioTrack, Paisa veya Zero'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowImportModal(false)} style={[styles.sheetCloseBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {importMode === 'options' && (
                <View style={{ gap: 10 }}>
                  <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12.5 * m, fontFamily: tStyles.fontFamily, marginBottom: 4 }}>
                    Daha önce aldığınız yedeği geri yüklemek için bir yöntem seçin:
                  </Text>

                  {/* Seçenek 1: Cihazdan Dosya Seç */}
                  <TouchableOpacity
                    style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                    onPress={handlePickImportFile}
                    disabled={isImporting}
                  >
                    <View style={[styles.backupChannelIconBox, { backgroundColor: colors.primary + '18' }]}>
                      <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                        Cihazdan .json Dosyası Seç
                      </Text>
                      <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                        İndirilenler veya dosya yöneticisinden yedek dosyasını açın
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
                  </TouchableOpacity>

                  {/* Seçenek 2: Panodan Yapıştır */}
                  <TouchableOpacity
                    style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                    onPress={handlePasteImportClipboard}
                    disabled={isImporting}
                  >
                    <View style={[styles.backupChannelIconBox, { backgroundColor: '#00968818' }]}>
                      <Ionicons name="clipboard-outline" size={22} color="#009688" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
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
                      style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8), borderColor: colors.primary, borderWidth: 1 }]}
                      onPress={handleRestoreImportSnapshot}
                      disabled={isImporting}
                    >
                      <View style={[styles.backupChannelIconBox, { backgroundColor: '#4CAF5018' }]}>
                        <Ionicons name="save-outline" size={22} color="#4CAF50" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
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
                    style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                    onPress={() => setImportMode('manual')}
                  >
                    <View style={[styles.backupChannelIconBox, { backgroundColor: '#F29F0518' }]}>
                      <Ionicons name="code-slash-outline" size={22} color="#F29F05" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
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

              {importMode === 'manual' && (
                <View>
                  <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, fontFamily: tStyles.fontFamily, marginBottom: 10 }}>
                    JSON yedek metnini aşağıdaki kutuya yapıştırın:
                  </Text>
                  <TextInput
                    style={[
                      styles.jsonImportInput,
                      { 
                        backgroundColor: colors.background, 
                        color: colors.text, 
                        borderColor: 'rgba(0,0,0,0.1)', 
                        borderWidth: 1, 
                        borderRadius: Math.max(tStyles.roundness / 2, 8),
                        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                        fontSize: 11 * m
                      }
                    ]}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    value={importJsonText}
                    onChangeText={setImportJsonText}
                    placeholder='{"app": "TrioTrack", "transactions": [...] }'
                    placeholderTextColor={colors.text + '40'}
                  />
                  <View style={[styles.modalBtnRow, { marginTop: 14 }]}>
                    <TouchableOpacity
                      style={[styles.modalCancelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={() => setImportMode('options')}
                    >
                      <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: '600' }}>← Geri</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalSaveBtn, { backgroundColor: '#009688', borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={() => processImportContent(importJsonText)}
                    >
                      <Text style={{ color: '#FFF', fontFamily: tStyles.fontFamily, fontWeight: 'bold' }}>İncele ve Yükle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {importMode === 'preview' && parsedPreview && (
                <View>
                  <View style={{ backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8), padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }}>
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
                        <View style={{ backgroundColor: colors.card, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', minWidth: 70 }}>
                          <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m }}>İşlemler</Text>
                          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 * m }}>{parsedPreview.stats.transactions}</Text>
                        </View>
                        <View style={{ backgroundColor: colors.card, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', minWidth: 70 }}>
                          <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m }}>Cüzdanlar</Text>
                          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 * m }}>{parsedPreview.stats.accounts}</Text>
                        </View>
                        <View style={{ backgroundColor: colors.card, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', minWidth: 70 }}>
                          <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m }}>Kategoriler</Text>
                          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 * m }}>{parsedPreview.stats.categories}</Text>
                        </View>
                        {parsedPreview.stats.debtors > 0 && (
                          <View style={{ backgroundColor: colors.card, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', minWidth: 70 }}>
                            <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m }}>Borçlar</Text>
                            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 * m }}>{parsedPreview.stats.debtors}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity
                      style={[styles.modalCancelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={() => setImportMode('options')}
                    >
                      <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: '600' }}>Farklı Seç</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalSaveBtn, { backgroundColor: '#009688', borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={handleExecuteImport}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={{ color: '#FFF', fontFamily: tStyles.fontFamily, fontWeight: 'bold' }}>
                          Verileri İçe Aktar
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
      <Modal visible={showAvatarSheet} transparent animationType="slide" onRequestClose={() => setShowAvatarSheet(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowAvatarSheet(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: Math.max(insets.bottom + 14, 26), maxHeight: '88%' }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.text + '25' }]} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.modalHeaderIconBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="camera-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 17 * m }]}>
                    Profil Fotoğrafı & Avatar
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
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
                  style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 10) }]}
                  onPress={handlePickAvatarGallery}
                  activeOpacity={0.7}
                >
                  <View style={[styles.backupChannelIconBox, { backgroundColor: colors.primary + '18' }]}>
                    <Ionicons name="images-outline" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      Galeriden Fotoğraf Seç
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                      Albümünüzden bir profil resmi yükleyin
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
                </TouchableOpacity>

                {/* 2. Kamera ile Çek */}
                <TouchableOpacity
                  style={[styles.backupChannelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 10) }]}
                  onPress={handleTakeAvatarPhoto}
                  activeOpacity={0.7}
                >
                  <View style={[styles.backupChannelIconBox, { backgroundColor: '#00968818' }]}>
                    <Ionicons name="camera-outline" size={22} color="#009688" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.backupChannelTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                      Kamera ile Fotoğraf Çek
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.55, fontSize: 11 * m }}>
                      Kamerayı açıp anında yeni bir fotoğraf çekin
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.3 }} />
                </TouchableOpacity>

                {/* 3. Hazır Karakter & Rozet Stilleri */}
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12.5 * m, fontFamily: tStyles.fontFamily, marginTop: 8, marginBottom: 2 }}>
                  VEYA ŞIK BİR AVATAR SEÇİN
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
                  {AVATAR_PRESETS.map(p => {
                    const isSelected = userAvatar === `preset:${p.id}`;
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
                        onPress={async () => {
                          await setUserAvatar(`preset:${p.id}`);
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
                {userAvatar && (
                  <TouchableOpacity
                    style={[styles.removeAvatarBtn, { borderColor: '#EF4444' + '50', backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 10), marginTop: 6 }]}
                    onPress={async () => {
                      await setUserAvatar(null);
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
  header: { marginBottom: 16 },
  pageTitle: { fontWeight: 'bold', marginBottom: 4 },
  pageSubtitle: {},

  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 16 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  miniCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
    marginBottom: 4,
  },
  removeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  profileNameInput: { fontWeight: 'bold' },
  profileRole: { marginTop: 2, fontWeight: '600' },

  card: { padding: 18, marginBottom: 16 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontWeight: 'bold', letterSpacing: 0.5 },
  buttonGroup: { flexDirection: 'row', gap: 8 },
  optionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },

  themeGrid: { gap: 10 },
  themeItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: 'transparent' },
  themeColorDot: { width: 24, height: 24, borderRadius: 12, marginRight: 12 },
  themeItemName: { fontWeight: 'bold' },
  themeItemDesc: { marginTop: 2 },

  currencyChip: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  currSymbol: { marginBottom: 2 },
  currCode: {},

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontWeight: 'bold', marginBottom: 2 },
  toggleDesc: { lineHeight: 16 },

  smallActionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6 },
  cycleDayChip: { paddingHorizontal: 10, paddingVertical: 6, marginRight: 4, marginTop: 4 },

  menuActionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  menuActionText: { fontWeight: 'bold' },

  creditsIntro: { marginBottom: 10 },
  creditItem: { marginBottom: 8 },
  creditTitle: {},
  creditDesc: { marginTop: 1 },
  versionBox: {},

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 22,
    paddingTop: 12,
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
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalTitle: { fontWeight: 'bold' },
  modalInput: { paddingVertical: 10 },
  modalBtnRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  modalCancelBtn: { paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center' },
  modalSaveBtn: { paddingVertical: 12, paddingHorizontal: 22, alignItems: 'center' },
  jsonImportInput: { minHeight: 130, padding: 12, textAlignVertical: 'top' },
  brandCard: { padding: 18, marginBottom: 28, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  brandTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  brandLogoBadge: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  brandAppName: { fontWeight: 'bold' },
  brandVersionTag: { paddingHorizontal: 7, paddingVertical: 2 },
  brandVersionText: {},
  brandAppDesc: {},
  developerLinkRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  githubIconBadge: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  developerLabel: {},
  developerName: {},
  githubLinkBadge: { flexDirection: 'row', alignItems: 'center' },
  githubLinkText: {},

  // Çok Kanallı Yedek Stilleri
  backupChannelBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 },
  backupChannelIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  backupChannelTitle: { fontWeight: 'bold', marginBottom: 2 },
});
