import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Platform, Share, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { APP_VERSION, APP_BUILD } from '../constants/version';

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
    monthlyBudgetGoal, 
    setMonthlyBudgetGoal, 
    budgetCycleDay,
    setBudgetCycleDay,
    exportDataAsJSON,
    importDataFromJSON,
    resetAllData,
    userName,
    setUserName,
    weekStartMonday,
    setWeekStartMonday
  } = useData();

  const [dailyReminder, setDailyReminder] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState(String(monthlyBudgetGoal));
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

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

  // JSON Dışa Aktarma (Paisa esintisi)
  const handleExportJSON = async () => {
    try {
      const jsonContent = exportDataAsJSON();
      await Share.share({
        title: `TrioTrack_Yedek_${new Date().toISOString().split('T')[0]}.json`,
        message: jsonContent,
      });
    } catch (e) {
      Alert.alert('Dışa Aktarma', 'Yedek verisi paylaşılamadı.');
    }
  };

  // JSON İçe Aktarma (Paisa esintisi)
  const handleImportJSON = async () => {
    if (!importJsonText.trim()) {
      Alert.alert('Hata', 'Lütfen geçerli bir JSON yedek verisi yapıştırın.');
      return;
    }
    const result = await importDataFromJSON(importJsonText.trim());
    if (result.success) {
      setShowImportModal(false);
      setImportJsonText('');
      Alert.alert('Tebrikler', result.message);
    } else {
      Alert.alert('İçe Aktarma Başarısız', result.message);
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
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily }]}>
              {userName.substring(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <TextInput
              style={[styles.profileNameInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m }]}
              value={userName}
              onChangeText={setUserName}
              placeholder="Adınız"
              placeholderTextColor={colors.text + '50'}
            />
            <Text style={[styles.profileRole, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              TrioTrack Pro Üye
            </Text>
          </View>
          <Ionicons name="pencil-outline" size={18} color={colors.text} style={{ opacity: 0.4 }} />
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
          <TouchableOpacity style={styles.menuActionRow} onPress={handleExportJSON}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuActionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                JSON Tam Yedekleme (Dışa Aktar)
              </Text>
              <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m }}>
                Tüm işlemlerinizi, hesaplarınızı ve bütçelerinizi tek dosyada yedekleyin
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.4 }} />
          </TouchableOpacity>

          {/* JSON Yedekten Geri Yükle (İçe Aktar) */}
          <TouchableOpacity 
            style={[styles.menuActionRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', marginTop: 10, paddingTop: 10 }]}
            onPress={() => {
              setImportJsonText('');
              setShowImportModal(true);
            }}
          >
            <Ionicons name="cloud-download-outline" size={20} color="#009688" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuActionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}>
                JSON Yedekten Geri Yükle (İçe Aktar)
              </Text>
              <Text style={{ color: colors.text, opacity: 0.5, fontSize: 11 * m }}>
                Daha önce aldığınız yedek dosyasını uygulamaya geri yükleyin
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
      <Modal visible={showGoalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="flag-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>
                Aylık Bütçe Hedefi Belirle
              </Text>
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

      {/* JSON YEDEKTEN GERİ YÜKLEME MODALI (PAISA) */}
      <Modal visible={showImportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness, maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="cloud-download-outline" size={22} color="#009688" style={{ marginRight: 8 }} />
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>
                JSON Yedek Geri Yükle
              </Text>
            </View>
            <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, fontFamily: tStyles.fontFamily, marginBottom: 12 }}>
              Daha önce dışa aktardığınız TrioTrack JSON yedek metnini aşağıdaki alana yapıştırın:
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
            <View style={[styles.modalBtnRow, { marginTop: 16 }]}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontWeight: '600' }}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: '#009688', borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                onPress={handleImportJSON}
              >
                <Text style={{ color: '#FFF', fontFamily: tStyles.fontFamily, fontWeight: 'bold' }}>Geri Yükle</Text>
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
  header: { marginBottom: 16 },
  pageTitle: { fontWeight: 'bold', marginBottom: 4 },
  pageSubtitle: {},

  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 16 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 440, padding: 20 },
  modalTitle: { fontWeight: 'bold' },
  modalInput: { paddingVertical: 10 },
  modalBtnRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  modalSaveBtn: { paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center' },
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
});
