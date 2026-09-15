import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, Alert, Image, TouchableWithoutFeedback } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { DataProvider, useData } from './src/context/DataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_VERSION } from './src/constants/version';
import { WhatsNewModal } from './src/components/WhatsNewModal';
import { BiometricLockOverlay } from './src/components/BiometricLockOverlay';
import { getAvatarPreset } from './src/utils/avatarUtils';
import { formatCurrency, formatNumber } from './src/utils/formatUtils';

import OnboardingScreen from './src/screens/OnboardingScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import AccountsBudgetsScreen from './src/screens/AccountsBudgetsScreen';
import DebtsScreen from './src/screens/DebtsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// ----------------------------------------------------
// ----------------------------------------------------
// ANA SAYFA (HOME SCREEN - TRIOTRACK DASHBOARD)
// ----------------------------------------------------
const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const MONTH_ABBR = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
];

const HomeScreen = ({ navigation }: any) => {
  const { colors, styles: tStyles, currency, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const { 
    totalBalance, 
    isBalanceHidden,
    toggleBalanceHidden,
    totalIncomeThisMonth, 
    totalExpenseThisMonth, 
    buckwheatMetrics, 
    transactions, 
    categories, 
    accounts,
    debtors,
    userName,
    userAvatar,
    selectedMonth,
    setSelectedMonth,
    monthlyBudgetGoal,
    budgetRecalcMode,
    deleteTransaction,
    editTransaction,
    setBudgetRecalcMode
  } = useData();

  const avatarPreset = getAvatarPreset(userAvatar);

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);
  const [hasUnseenUpdate, setHasUnseenUpdate] = useState(false);

  // Akıllı Sürüm Bildirim Rozeti (Seen / Unseen Kontrolü)
  React.useEffect(() => {
    const checkVersionSeen = async () => {
      try {
        const lastSeen = await AsyncStorage.getItem('@triotrack_last_seen_version');
        if (lastSeen !== APP_VERSION) {
          setHasUnseenUpdate(true);
        } else {
          setHasUnseenUpdate(false);
        }
      } catch {
        setHasUnseenUpdate(false);
      }
    };
    checkVersionSeen();
  }, []);

  const handleOpenWhatsNew = async () => {
    setShowWhatsNewModal(true);
    try {
      await AsyncStorage.setItem('@triotrack_last_seen_version', APP_VERSION);
      setHasUnseenUpdate(false);
    } catch {}
  };
  const [currentYear, currentMonthStr] = selectedMonth.split('-');
  const selectedMonthIndex = parseInt(currentMonthStr, 10) - 1;
  const [pickerYear, setPickerYear] = useState(parseInt(currentYear, 10));

  // Arama & Filtreleme Durumları (Paisa)
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterType, setSearchFilterType] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [searchAccountId, setSearchAccountId] = useState<string>('all');

  // İşlem Detay & Düzenleme Modalı (Zero & Paisa esintisi)
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<any | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteEditInput, setNoteEditInput] = useState('');

  const handleOpenTxDetail = (tx: any) => {
    setSelectedTxForDetail(tx);
    setNoteEditInput(tx.note || '');
    setIsEditingNote(false);
  };

  const handleSaveTxNote = async () => {
    if (!selectedTxForDetail) return;
    await editTransaction(selectedTxForDetail.id, { note: noteEditInput.trim() });
    setSelectedTxForDetail((prev: any) => (prev ? { ...prev, note: noteEditInput.trim() } : null));
    setIsEditingNote(false);
    Alert.alert('Başarılı', 'İşlem notu güncellendi.');
  };

  const handleDeleteTxFromDetail = async () => {
    if (!selectedTxForDetail) return;
    Alert.alert(
      'İşlemi Sil',
      'Bu işlemi silmek istediğinizden emin misiniz? Hesap bakiyesi geri yüklenecektir.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Evet, Sil', 
          style: 'destructive', 
          onPress: async () => {
            await deleteTransaction(selectedTxForDetail.id);
            setSelectedTxForDetail(null);
          }
        }
      ]
    );
  };

  const m = tStyles.fontSizeMultiplier;

  // Filtrelenmiş işlemler (Aktif Ay - useMemo ile optimize edildi)
  const monthTransactions = useMemo(() => {
    return transactions.filter(tx => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Arama Modalı İçin Filtrelenmiş İşlemler
  const filteredSearchTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (searchFilterType !== 'all' && tx.type !== searchFilterType) return false;
      if (searchAccountId !== 'all' && tx.accountId !== searchAccountId && tx.toAccountId !== searchAccountId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = categories.find(c => c.id === tx.categoryId);
        const titleMatch = tx.title.toLowerCase().includes(q);
        const noteMatch = tx.note?.toLowerCase().includes(q);
        const catMatch = cat?.name.toLowerCase().includes(q);
        return titleMatch || noteMatch || catMatch;
      }
      return true;
    });
  }, [transactions, categories, searchFilterType, searchAccountId, searchQuery]);

  // Bekleyen net borç/alacak (useMemo ile optimize edildi)
  const { oweMeCount, iOweCount } = useMemo(() => {
    let oweMe = 0;
    let iOwe = 0;
    for (const d of debtors) {
      if (!d.settled) {
        if (d.type === 'owe_me') oweMe++;
        else if (d.type === 'i_owe') iOwe++;
      }
    }
    return { oweMeCount: oweMe, iOweCount: iOwe };
  }, [debtors]);

  const handleSelectMonth = (mIndex: number) => {
    const monthFormatted = String(mIndex + 1).padStart(2, '0');
    setSelectedMonth(`${pickerYear}-${monthFormatted}`);
    setShowMonthModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingTop: Math.max(insets.top, 16), 
          paddingBottom: 120 
        }}
      >
        
        {/* Karşılama, Profil Avatarı, Nizami Ay Seçici ve Aksiyon Butonları */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minHeight: 46 }}>
            {/* Kullanıcı Profil Avatarı (Dokunulduğunda Ayarlar / Profile gider) */}
            <TouchableOpacity 
              style={[
                styles.homeAvatarCircle, 
                { 
                  backgroundColor: avatarPreset ? avatarPreset.bg : colors.primary,
                  borderColor: colors.primary + '35',
                }
              ]}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.8}
            >
              {userAvatar && !userAvatar.startsWith('preset:') ? (
                <Image source={{ uri: userAvatar }} style={{ width: 44, height: 44, borderRadius: 22 }} resizeMode="cover" />
              ) : avatarPreset ? (
                <Ionicons name={avatarPreset.icon as any} size={22} color="#FFF" />
              ) : userName?.trim() ? (
                <Text style={[styles.homeAvatarLetter, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 18 * m, fontWeight: 'bold' }]}>
                  {userName.trim().charAt(0).toUpperCase()}
                </Text>
              ) : (
                <Ionicons name="person" size={20} color={colors.onPrimary} />
              )}
            </TouchableOpacity>

            <View style={{ marginLeft: 12, flex: 1, justifyContent: 'center' }}>
              <Text 
                style={[styles.greeting, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 17 * m, fontWeight: tStyles.titleWeight }]}
                numberOfLines={1}
              >
                Merhaba, {userName} 👋
              </Text>
              
              {/* Nizami Zero Ay Seçici Hap Buton */}
              <TouchableOpacity 
                style={[
                  styles.zeroMonthBadge, 
                  { 
                    backgroundColor: colors.card, 
                    borderColor: isDark ? '#374151' : '#E2E8F0', 
                    borderWidth: 1, 
                    borderRadius: 8 
                  }
                ]}
                onPress={() => {
                  setPickerYear(parseInt(currentYear, 10));
                  setShowMonthModal(true);
                }}
              >
                <Ionicons name="calendar-outline" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: '600' }}>
                  {MONTH_NAMES[selectedMonthIndex]} {currentYear}
                </Text>
                <Ionicons name="chevron-down" size={11} color={colors.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* 🌟 NELER YENİ? SÜRÜM YENİLİKLERİ ROZETİ (Yalnızca yeni sürüm olduğunda görünür) */}
            {hasUnseenUpdate && (
              <TouchableOpacity 
                style={[styles.whatsNewPillBtn, { backgroundColor: colors.card, borderColor: '#F59E0B60', borderRadius: tStyles.roundness }]}
                onPress={handleOpenWhatsNew}
              >
                <Ionicons name="sparkles" size={13} color="#F59E0B" />
                <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: 'bold', marginLeft: 4 }}>
                  v{APP_VERSION}
                </Text>
                <View style={[styles.pulsingDot, { backgroundColor: '#F59E0B' }]} />
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.settingsBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
              onPress={() => setShowSearchModal(true)}
            >
              <Ionicons name="search-outline" size={19} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingsBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={19} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. BUCKWHEAT: AKILLI GÜNLÜK HARCAMA LİMİTİ KARTI */}
        <View style={[styles.buckwheatCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={styles.bwTopLine}>
            <View style={styles.bwTagRow}>
              <View style={[styles.bwDot, { backgroundColor: '#F29F05' }]} />
              <Text style={[styles.bwTagText, { color: '#F29F05', fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                AKILLI GÜNLÜK LİMİT (BUCKWHEAT)
              </Text>
            </View>
            <View style={[styles.statusBadge, { 
              backgroundColor: buckwheatMetrics.todayRemaining < 0 
                ? (isDark ? '#450a0a' : '#FFEBEE') 
                : buckwheatMetrics.budgetStatus === 'healthy' 
                  ? (isDark ? '#052e16' : '#E8F5E9') 
                  : (isDark ? '#422006' : '#FFF3E0') 
            }]}>
              <Text style={{ 
                color: buckwheatMetrics.todayRemaining < 0 
                  ? '#EF4444' 
                  : buckwheatMetrics.budgetStatus === 'healthy' 
                    ? '#22C55E' 
                    : '#F59E0B', 
                fontSize: 11 * m, 
                fontWeight: 'bold' 
              }}>
                {buckwheatMetrics.todayRemaining < 0 ? 'Limit Aşıldı!' : buckwheatMetrics.budgetStatus === 'healthy' ? 'Dengeli' : 'Dikkat'}
              </Text>
            </View>
          </View>

          <Text style={[styles.bwAmountLabel, { 
            color: buckwheatMetrics.todayRemaining < 0 ? '#EF4444' : colors.text, 
            opacity: buckwheatMetrics.todayRemaining < 0 ? 0.9 : 0.6, 
            fontFamily: tStyles.fontFamily, 
            fontSize: 12 * m, 
            marginTop: 8,
            fontWeight: buckwheatMetrics.todayRemaining < 0 ? '600' : 'normal'
          }]}>
            {buckwheatMetrics.todayRemaining < 0 
              ? 'Bugün Limit Aşımı (Kalan Günlere Yansıtıldı):' 
              : 'Bugün Harcayabileceğiniz Kalan Limit:'}
          </Text>
          
          <Text style={[
            styles.bwMainAmount, 
            { 
              color: buckwheatMetrics.todayRemaining < 0 ? '#EF4444' : colors.text, 
              fontFamily: tStyles.fontFamily, 
              fontSize: 32 * m, 
              fontWeight: tStyles.titleWeight 
            }
          ]}>
            {isBalanceHidden 
              ? `${currency} ••••` 
              : formatCurrency(buckwheatMetrics.todayRemaining, currency)}
          </Text>

          <View style={[styles.bwProgressContainer, { backgroundColor: colors.background }]}>
            <View 
              style={[
                styles.bwProgressBar, 
                { 
                  width: `${Math.min(100, buckwheatMetrics.dailyAllowance > 0 ? (buckwheatMetrics.todaySpent / buckwheatMetrics.dailyAllowance) * 100 : 0)}%`,
                  backgroundColor: buckwheatMetrics.todayRemaining < 0 ? '#EF4444' : buckwheatMetrics.todaySpent > buckwheatMetrics.dailyAllowance * 0.8 ? '#F59E0B' : (isDark ? '#81C784' : '#2E7D32')
                }
              ]} 
            />
          </View>

          <View style={styles.bwFooterRow}>
            <Text style={[styles.bwFooterText, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              Bugün: {isBalanceHidden ? `${currency} ••••` : formatCurrency(buckwheatMetrics.todaySpent, currency)} / Hedef: {isBalanceHidden ? `${currency} ••••` : formatCurrency(buckwheatMetrics.dailyAllowance, currency)}
            </Text>
            <Text style={[styles.bwFooterText, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              {buckwheatMetrics.daysRemaining} Gün Kaldı
            </Text>
          </View>

          {/* Buckwheat Canlı Durum Bildirim Rozeti */}
          <View style={[
            styles.statusBanner, 
            { 
              backgroundColor: buckwheatMetrics.statusLevel === 'danger' 
                ? '#EF444415' 
                : buckwheatMetrics.statusLevel === 'warning' 
                  ? '#F59E0B15' 
                  : '#10B98115',
              borderColor: buckwheatMetrics.statusLevel === 'danger' 
                ? '#EF444440' 
                : buckwheatMetrics.statusLevel === 'warning' 
                  ? '#F59E0B40' 
                  : '#10B98140',
              borderRadius: Math.max(tStyles.roundness / 2, 6)
            }
          ]}>
            <Ionicons 
              name={buckwheatMetrics.statusLevel === 'danger' ? 'alert-circle' : buckwheatMetrics.statusLevel === 'warning' ? 'warning-outline' : 'checkmark-circle'} 
              size={14} 
              color={buckwheatMetrics.statusLevel === 'danger' ? '#EF4444' : buckwheatMetrics.statusLevel === 'warning' ? '#F59E0B' : '#10B981'} 
              style={{ marginRight: 6 }}
            />
            <Text style={{ 
              color: buckwheatMetrics.statusLevel === 'danger' ? '#EF4444' : buckwheatMetrics.statusLevel === 'warning' ? '#F59E0B' : '#10B981',
              fontSize: 11 * m,
              fontFamily: tStyles.fontFamily,
              fontWeight: '600',
              flex: 1,
            }}>
              {buckwheatMetrics.statusText}
            </Text>
          </View>

          {/* Buckwheat Akıllı Dağıtım Modu (Kalan Günlere Böl / Bugüne Aktar) */}
          <View style={styles.recalcModeContainer}>
            <Text style={[styles.recalcTitle, { color: colors.text, opacity: 0.5, fontFamily: tStyles.fontFamily, fontSize: 10 * m }]}>
              DAĞITIM STRATEJİSİ:
            </Text>
            <View style={styles.recalcModeRow}>
              <TouchableOpacity
                style={[
                  styles.recalcModeBtn,
                  { 
                    backgroundColor: buckwheatMetrics.recalcMode === 'split_to_rest_days' ? colors.primary : colors.background, 
                    borderRadius: Math.max(tStyles.roundness / 2, 6) 
                  }
                ]}
                onPress={() => setBudgetRecalcMode('split_to_rest_days')}
              >
                <Ionicons 
                  name="git-branch-outline" 
                  size={13} 
                  color={buckwheatMetrics.recalcMode === 'split_to_rest_days' ? colors.onPrimary : colors.text} 
                />
                <Text style={{ 
                  color: buckwheatMetrics.recalcMode === 'split_to_rest_days' ? colors.onPrimary : colors.text, 
                  fontFamily: tStyles.fontFamily, 
                  fontSize: 10 * m, 
                  fontWeight: 'bold', 
                  marginLeft: 4 
                }}>
                  Kalan Günlere Böl
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.recalcModeBtn,
                  { 
                    backgroundColor: buckwheatMetrics.recalcMode === 'add_to_today' ? colors.primary : colors.background, 
                    borderRadius: Math.max(tStyles.roundness / 2, 6) 
                  }
                ]}
                onPress={() => setBudgetRecalcMode('add_to_today')}
              >
                <Ionicons 
                  name="today-outline" 
                  size={13} 
                  color={buckwheatMetrics.recalcMode === 'add_to_today' ? colors.onPrimary : colors.text} 
                />
                <Text style={{ 
                  color: buckwheatMetrics.recalcMode === 'add_to_today' ? colors.onPrimary : colors.text, 
                  fontFamily: tStyles.fontFamily, 
                  fontSize: 10 * m, 
                  fontWeight: 'bold', 
                  marginLeft: 4 
                }}>
                  Bugüne Aktar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. TOPLAM NET VARLIK KARTI (onPrimary ile Kusursuz Kontrast) */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary, borderRadius: tStyles.roundness }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Text style={[styles.balanceLabel, { color: colors.onPrimary, opacity: 0.85, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              TOPLAM NET BAKİYE
            </Text>
            <TouchableOpacity 
              onPress={toggleBalanceHidden}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.privacyEyeBtn, { backgroundColor: colors.onPrimary + '25', borderRadius: 14 }]}
            >
              <Ionicons name={isBalanceHidden ? "eye-off-outline" : "eye-outline"} size={16} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.balanceAmount, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 28 * m, fontWeight: tStyles.titleWeight, marginTop: 4 }]}>
            {isBalanceHidden ? `${currency} ••••••` : formatCurrency(totalBalance, currency)}
          </Text>
          
          <View style={[styles.balanceRow, { borderTopColor: colors.onPrimary + '30' }]}>
            <View style={styles.flowBox}>
              <Text style={[styles.flowSubLabel, { color: colors.onPrimary, opacity: 0.75, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>Bu Ay Gelir</Text>
              <Text style={[styles.flowIncome, { color: isDark ? '#A7F3D0' : '#DCFCE7', fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
                {isBalanceHidden ? `+${currency} ••••` : formatCurrency(totalIncomeThisMonth, currency, { sign: '+' })}
              </Text>
            </View>
            <View style={[styles.flowBox, { alignItems: 'flex-end' }]}>
              <Text style={[styles.flowSubLabel, { color: colors.onPrimary, opacity: 0.75, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>Bu Ay Gider</Text>
              <Text style={[styles.flowExpense, { color: isDark ? '#FECDD3' : '#FEE2E2', fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
                {isBalanceHidden ? `-${currency} ••••` : formatCurrency(totalExpenseThisMonth, currency, { sign: '-' })}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. PAISA 2X2 "GENEL BAKIŞ" (OVERVIEW) MODÜLER KARTLARI */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m, fontWeight: tStyles.titleWeight, marginBottom: 10 }]}>
          Genel Bakış & Modüller (Paisa)
        </Text>

        <View style={styles.paisaOverviewGrid}>
          {/* Kart 1: Bütçeler */}
          <TouchableOpacity 
            style={[styles.paisaOverviewCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
            onPress={() => navigation.navigate('Hesaplar')}
          >
            <View style={[styles.paisaCardIconBox, { backgroundColor: '#FF9800' + '20' }]}>
              <Ionicons name="pie-chart-outline" size={20} color="#FF9800" />
            </View>
            <Text style={[styles.paisaCardTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
              Bütçeler
            </Text>
            <Text style={[styles.paisaCardSubtitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              Kategori Limitleri
            </Text>
          </TouchableOpacity>

          {/* Kart 2: Cüzdanlar & Varlıklar */}
          <TouchableOpacity 
            style={[styles.paisaOverviewCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
            onPress={() => navigation.navigate('Hesaplar')}
          >
            <View style={[styles.paisaCardIconBox, { backgroundColor: '#2196F3' + '20' }]}>
              <Ionicons name="wallet-outline" size={20} color="#2196F3" />
            </View>
            <Text style={[styles.paisaCardTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
              Varlıklar
            </Text>
            <Text style={[styles.paisaCardSubtitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              {accounts.length} Aktif Cüzdan
            </Text>
          </TouchableOpacity>

          {/* Kart 3: Borçlar & Alacaklar (Zero) */}
          <TouchableOpacity 
            style={[styles.paisaOverviewCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
            onPress={() => navigation.navigate('Borçlar')}
          >
            <View style={[styles.paisaCardIconBox, { backgroundColor: '#4CAF50' + '20' }]}>
              <Ionicons name="people-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={[styles.paisaCardTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
              Borçlar (Zero)
            </Text>
            <Text style={[styles.paisaCardSubtitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              {oweMeCount} Alacak • {iOweCount} Borç
            </Text>
          </TouchableOpacity>

          {/* Kart 4: Analiz & Raporlar */}
          <TouchableOpacity 
            style={[styles.paisaOverviewCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
            onPress={() => navigation.navigate('Raporlar')}
          >
            <View style={[styles.paisaCardIconBox, { backgroundColor: '#9C27B0' + '20' }]}>
              <Ionicons name="trending-up-outline" size={20} color="#9C27B0" />
            </View>
            <Text style={[styles.paisaCardTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
              Finansal Rapor
            </Text>
            <Text style={[styles.paisaCardSubtitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              Tasarruf & Trend
            </Text>
          </TouchableOpacity>
        </View>

        {/* HIZLI İŞLEM BUTONLARI (Transfer Dahil) */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#E91E63' + '20' }]}>
              <Ionicons name="remove-circle-outline" size={20} color="#E91E63" />
            </View>
            <Text style={[styles.actionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              Harcama
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#4CAF50' + '20' }]}>
              <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={[styles.actionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              Gelir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#7C3AED' + '20' }]}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={[styles.actionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              Transfer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
            onPress={() => navigation.navigate('Borçlar')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.actionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
              Borçlar
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. SON İŞLEMLER LİSTESİ */}
        <View style={styles.transactionsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m, fontWeight: tStyles.titleWeight }]}>
            Son İşlemler ({monthTransactions.length})
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Raporlar')}>
            <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontWeight: 'bold', fontSize: 13 * m }}>
              Tümünü Gör
            </Text>
          </TouchableOpacity>
        </View>

        {monthTransactions.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
            <Text style={{ fontSize: 28 }}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.text, fontFamily: tStyles.fontFamily }]}>
              Bu dönemde henüz işlem eklenmedi.
            </Text>
          </View>
        ) : (
          monthTransactions.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            const acc = accounts.find(a => a.id === tx.accountId);
            const destAcc = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null;
            const isTransfer = tx.type === 'transfer';
            const iconToUse = tx.customIcon || (isTransfer ? 'swap-horizontal' : (cat?.icon || 'receipt-outline'));
            const colorToUse = tx.customColor || (isTransfer ? '#7C3AED' : (cat?.color || colors.primary));

            return (
              <TouchableOpacity 
                key={tx.id} 
                activeOpacity={0.7}
                onPress={() => handleOpenTxDetail(tx)}
                style={[styles.txCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
              >
                <View style={[styles.txIconBox, { backgroundColor: colorToUse + '20', overflow: 'hidden' }]}>
                  {tx.brandLogoUrl ? (
                    <Image source={{ uri: tx.brandLogoUrl }} style={{ width: 24, height: 24, borderRadius: 6 }} resizeMode="contain" />
                  ) : (
                    <Ionicons 
                      name={iconToUse as any} 
                      size={20} 
                      color={colorToUse} 
                    />
                  )}
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <Text style={[styles.txTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
                      {tx.title}
                    </Text>
                    {tx.receiptNo && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B98118', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                        <Ionicons name="receipt-outline" size={10} color="#10B981" />
                        <Text style={{ color: '#10B981', fontSize: 9 * m, fontWeight: 'bold', marginLeft: 2 }}>{tx.receiptNo}</Text>
                      </View>
                    )}
                    {tx.receiptImage && (tx.receiptImage.startsWith('file:') || tx.receiptImage.startsWith('data:') || tx.receiptImage.startsWith('http')) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F618', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
                        <Ionicons name="camera-outline" size={10} color="#3B82F6" />
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={[styles.txMeta, { color: colors.text, opacity: 0.5, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                      {isTransfer 
                        ? `${acc?.name || 'Hesap'} ➔ ${destAcc?.name || 'Hesap'}`
                        : `${acc?.name || 'Cüzdan'} • ${tx.date}`
                      }
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                  <Text 
                    style={[
                      styles.txAmount, 
                      { 
                        color: isTransfer 
                          ? '#7C3AED' 
                          : tx.type === 'income' 
                            ? (isDark ? '#81C784' : '#2E7D32') 
                            : '#E57373',
                        fontFamily: tStyles.fontFamily,
                        fontSize: 15 * m,
                        fontWeight: 'bold'
                      }
                    ]}
                  >
                    {isBalanceHidden 
                      ? '••••' 
                      : formatCurrency(tx.amount, currency, { type: isTransfer ? 'transfer' : tx.type })}
                  </Text>
                </View>

                {/* Hızlı Silme Butonu */}
                <TouchableOpacity 
                  style={{ marginLeft: 10, padding: 4 }} 
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteTransaction(tx.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.text} style={{ opacity: 0.35 }} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* PAISA & ZERO TARZI ARAMA VE FİLTRELEME MODALI */}
      <Modal 
        visible={showSearchModal} 
        animationType="slide" 
        transparent 
        statusBarTranslucent={true}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.backdropDismissArea} 
            activeOpacity={1} 
            onPress={() => setShowSearchModal(false)} 
          />

          <View style={[styles.searchModalCard, { backgroundColor: colors.card, borderTopLeftRadius: tStyles.roundness * 1.5, borderTopRightRadius: tStyles.roundness * 1.5 }]}>
            <View style={styles.sheetPill} />
            
            <View style={styles.monthHeaderRow}>
              <Text style={[styles.monthModalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m, fontWeight: 'bold' }]}>
                İşlem Arama & Filtre (Paisa)
              </Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Arama Girişi */}
            <View style={[styles.searchInputBox, { backgroundColor: colors.background, borderRadius: tStyles.roundness }]}>
              <Ionicons name="search-outline" size={18} color={colors.text} style={{ opacity: 0.5, marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m }]}
                placeholder="Açıklama, not veya kategori ara..."
                placeholderTextColor={isDark ? '#888' : '#AAA'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.text} style={{ opacity: 0.5 }} />
                </TouchableOpacity>
              )}
            </View>

            {/* Tür Filtreleme Hapları */}
            <View style={styles.filterPillsRow}>
              {(['all', 'expense', 'income', 'transfer'] as const).map(fType => {
                const isSelected = searchFilterType === fType;
                const label = fType === 'all' ? 'Tümü' : fType === 'expense' ? 'Gider' : fType === 'income' ? 'Gelir' : 'Transfer';
                return (
                  <TouchableOpacity
                    key={fType}
                    style={[
                      styles.filterChip,
                      { backgroundColor: isSelected ? colors.primary : colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) }
                    ]}
                    onPress={() => setSearchFilterType(fType)}
                  >
                    <Text style={{ 
                      color: isSelected ? colors.onPrimary : colors.text, 
                      fontFamily: tStyles.fontFamily, 
                      fontSize: 12 * m, 
                      fontWeight: isSelected ? 'bold' : 'normal' 
                    }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sonuç Özeti */}
            <View style={styles.searchSummaryRow}>
              <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                {filteredSearchTransactions.length} işlem bulundu
              </Text>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 13 * m, fontFamily: tStyles.fontFamily }}>
                Toplam: {formatCurrency(filteredSearchTransactions.reduce((s, t) => s + t.amount, 0), currency)}
              </Text>
            </View>

            {/* Sonuç Listesi */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {filteredSearchTransactions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="search-outline" size={36} color={colors.text} style={{ opacity: 0.3 }} />
                  <Text style={[styles.emptyText, { color: colors.text, fontFamily: tStyles.fontFamily }]}>
                    Eşleşen işlem bulunamadı
                  </Text>
                </View>
              ) : (
                filteredSearchTransactions.map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const isExpense = tx.type === 'expense';
                  const isTransfer = tx.type === 'transfer';
                  return (
                    <TouchableOpacity 
                      key={tx.id} 
                      activeOpacity={0.7}
                      onPress={() => {
                        setShowSearchModal(false);
                        handleOpenTxDetail(tx);
                      }}
                      style={[styles.txCard, { backgroundColor: colors.background, borderRadius: tStyles.roundness }]}
                    >
                      <View style={[styles.txIconBox, { backgroundColor: (cat?.color || colors.primary) + '20', overflow: 'hidden' }]}>
                        {tx.brandLogoUrl ? (
                          <Image source={{ uri: tx.brandLogoUrl }} style={{ width: 22, height: 22, borderRadius: 5 }} resizeMode="contain" />
                        ) : (
                          <Ionicons 
                            name={isTransfer ? 'swap-horizontal' : (cat?.icon as any) || 'pricetag-outline'} 
                            size={18} 
                            color={cat?.color || colors.primary} 
                          />
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.txTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                          {tx.title}
                        </Text>
                        <Text style={[styles.txMeta, { color: colors.text, opacity: 0.6, fontSize: 11 * m }]}>
                          {tx.date} • {acc?.name || 'Cüzdan'}{tx.note ? ` • ${tx.note}` : ''}
                        </Text>
                      </View>
                      <Text style={[
                        styles.txAmount, 
                        { 
                          color: isTransfer ? '#7C3AED' : isExpense ? '#EF5350' : '#4CAF50', 
                          fontFamily: tStyles.fontFamily, 
                          fontSize: 14 * m 
                        }
                      ]}>
                        {formatCurrency(tx.amount, currency, { type: isTransfer ? 'transfer' : isExpense ? 'expense' : 'income' })}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* İŞLEM DETAY & DÜZENLEME MODALI (PAISA & ZERO) */}
      <Modal 
        visible={selectedTxForDetail !== null} 
        transparent 
        animationType="fade" 
        statusBarTranslucent={true}
        onRequestClose={() => setSelectedTxForDetail(null)}
      >
        <View style={styles.centeredModalBackdrop}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setSelectedTxForDetail(null)} 
          />

          <View style={[styles.txDetailCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness * 1.2 }]}>
            {selectedTxForDetail && (() => {
              const cat = categories.find(c => c.id === selectedTxForDetail.categoryId);
              const acc = accounts.find(a => a.id === selectedTxForDetail.accountId);
              const destAcc = selectedTxForDetail.toAccountId ? accounts.find(a => a.id === selectedTxForDetail.toAccountId) : null;
              const isTransfer = selectedTxForDetail.type === 'transfer';
              const isIncome = selectedTxForDetail.type === 'income';

              return (
                <View>
                  {/* Başlık ve Kapat Butonu */}
                  <View style={styles.txDetailHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.txIconBox, { backgroundColor: (isTransfer ? '#7C3AED' : (cat?.color || colors.primary)) + '20', marginRight: 10, overflow: 'hidden' }]}>
                        {selectedTxForDetail.brandLogoUrl ? (
                          <Image source={{ uri: selectedTxForDetail.brandLogoUrl }} style={{ width: 24, height: 24, borderRadius: 6 }} resizeMode="contain" />
                        ) : (
                          <Ionicons 
                            name={isTransfer ? 'swap-horizontal' : ((cat?.icon || 'receipt-outline') as any)} 
                            size={22} 
                            color={isTransfer ? '#7C3AED' : (cat?.color || colors.primary)} 
                          />
                        )}
                      </View>
                      <View>
                        <Text style={[styles.txDetailCategory, { color: isTransfer ? '#7C3AED' : (cat?.color || colors.primary), fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }]}>
                          {isTransfer ? 'Hesaplar Arası Transfer' : (cat?.name || 'Kategori')}
                        </Text>
                        <Text style={[styles.txDetailDate, { color: colors.text, opacity: 0.5, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                          {selectedTxForDetail.date}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedTxForDetail(null)}>
                      <Ionicons name="close-circle-outline" size={26} color={colors.text} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>
                  </View>

                  {/* Tutar Büyük Kart */}
                  <View style={[styles.txDetailAmountCard, { backgroundColor: colors.background, borderRadius: tStyles.roundness }]}>
                    <Text style={[styles.txDetailTypeLabel, { color: colors.text, opacity: 0.6, fontSize: 11 * m, fontFamily: tStyles.fontFamily }]}>
                      {isTransfer ? 'TRANSFER TUTARI' : isIncome ? 'GELİR TUTARI' : 'GİDER TUTARI'}
                    </Text>
                    <Text style={[
                      styles.txDetailAmountText,
                      { 
                        color: isTransfer ? '#7C3AED' : isIncome ? (isDark ? '#81C784' : '#2E7D32') : '#E57373',
                        fontFamily: tStyles.fontFamily,
                        fontSize: 28 * m,
                        fontWeight: 'bold',
                        marginVertical: 4
                      }
                    ]}>
                      {formatCurrency(selectedTxForDetail.amount, currency, { type: isTransfer ? 'transfer' : isIncome ? 'income' : 'expense' })}
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.8, fontSize: 13 * m, fontWeight: '600', fontFamily: tStyles.fontFamily }}>
                      {selectedTxForDetail.title}
                    </Text>
                  </View>

                  {/* Hesap ve Rota Bilgisi */}
                  <View style={[styles.txDetailInfoRow, { borderColor: 'rgba(0,0,0,0.06)' }]}>
                    <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                      {isTransfer ? 'Kaynak Cüzdan:' : 'Ödeme Hesabı:'}
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 13 * m, fontFamily: tStyles.fontFamily }}>
                      {acc?.name || 'Hesap'}
                    </Text>
                  </View>

                  {isTransfer && destAcc && (
                    <View style={[styles.txDetailInfoRow, { borderColor: 'rgba(0,0,0,0.06)' }]}>
                      <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                        Hedef Cüzdan:
                      </Text>
                      <Text style={{ color: '#7C3AED', fontWeight: 'bold', fontSize: 13 * m, fontFamily: tStyles.fontFamily }}>
                        {destAcc.name}
                      </Text>
                    </View>
                  )}

                  {/* Fiş / Fatura Belgesi Varsa Göster (Paisa) */}
                  {selectedTxForDetail.receiptNo && (
                    <View style={[styles.txDetailInfoRow, { borderColor: 'rgba(0,0,0,0.06)', backgroundColor: '#10B98115', padding: 10, borderRadius: 8, marginTop: 8 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="receipt-outline" size={16} color="#10B981" style={{ marginRight: 6 }} />
                        <Text style={{ color: colors.text, opacity: 0.8, fontSize: 12 * m, fontFamily: tStyles.fontFamily, fontWeight: '600' }}>
                          Kayıtlı Fiş / Belge No:
                        </Text>
                      </View>
                      <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 13 * m, fontFamily: tStyles.fontFamily }}>
                        {selectedTxForDetail.receiptNo}
                      </Text>
                    </View>
                  )}

                  {/* Gerçek Fiş Fotoğrafı Varsa Göster */}
                  {selectedTxForDetail.receiptImage && (selectedTxForDetail.receiptImage.startsWith('file:') || selectedTxForDetail.receiptImage.startsWith('data:') || selectedTxForDetail.receiptImage.startsWith('http')) && (
                    <View style={{ marginTop: 8, padding: 10, borderRadius: 8, backgroundColor: colors.background }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="camera-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                        <Text style={{ color: colors.text, opacity: 0.7, fontSize: 11 * m, fontFamily: tStyles.fontFamily, fontWeight: 'bold' }}>
                          Fiş / Fatura Fotoğrafı (OCR Belgesi)
                        </Text>
                      </View>
                      <Image 
                        source={{ uri: selectedTxForDetail.receiptImage }} 
                        style={{ width: '100%', height: 130, borderRadius: 6 }} 
                        resizeMode="cover" 
                      />
                    </View>
                  )}

                  {/* Not Alanı & Düzenleme */}
                  <View style={{ marginTop: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                        İşlem Notu / Açıklama:
                      </Text>
                      {!isEditingNote && (
                        <TouchableOpacity onPress={() => setIsEditingNote(true)}>
                          <Text style={{ color: colors.primary, fontSize: 11 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }}>
                            {selectedTxForDetail.note ? 'Düzenle' : '+ Not Ekle'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {isEditingNote ? (
                      <View>
                        <TextInput
                          style={[styles.txDetailNoteInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
                          value={noteEditInput}
                          onChangeText={setNoteEditInput}
                          placeholder="Bu işlemle ilgili notunuzu yazın..."
                          placeholderTextColor={colors.text + '50'}
                          multiline
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                          <TouchableOpacity 
                            style={[styles.smallBtn, { backgroundColor: colors.background }]} 
                            onPress={() => setIsEditingNote(false)}
                          >
                            <Text style={{ color: colors.text, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>İptal</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.smallBtn, { backgroundColor: colors.primary }]} 
                            onPress={handleSaveTxNote}
                          >
                            <Text style={{ color: colors.onPrimary, fontSize: 11 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }}>Kaydet</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={{ color: colors.text, fontSize: 13 * m, fontFamily: tStyles.fontFamily, fontStyle: selectedTxForDetail.note ? 'normal' : 'italic', opacity: selectedTxForDetail.note ? 1 : 0.4 }}>
                        {selectedTxForDetail.note || 'Bu işleme ait bir açıklama eklenmemiş.'}
                      </Text>
                    )}
                  </View>

                  {/* Aksiyon Butonları (Sil / Kapat) */}
                  <View style={styles.txDetailActionRow}>
                    <TouchableOpacity 
                      style={[styles.txDetailDeleteBtn, { borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={handleDeleteTxFromDetail}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 13 * m, fontFamily: tStyles.fontFamily }}>İşlemi Sil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.txDetailCloseBtn, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
                      onPress={() => setSelectedTxForDetail(null)}
                    >
                      <Text style={{ color: colors.onPrimary, fontWeight: 'bold', fontSize: 13 * m, fontFamily: tStyles.fontFamily }}>Tamam</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* ZERO TARZI AY VE YIL SEÇİCİ MODALI */}
      <Modal 
        visible={showMonthModal} 
        transparent 
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowMonthModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.backdropDismissArea} 
            activeOpacity={1} 
            onPress={() => setShowMonthModal(false)} 
          />

          <View style={[styles.monthModalCard, { backgroundColor: colors.card, borderTopLeftRadius: tStyles.roundness * 1.5, borderTopRightRadius: tStyles.roundness * 1.5 }]}>
            <View style={styles.sheetPill} />

            <View style={styles.monthHeaderRow}>
              <Text style={[styles.monthModalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m, fontWeight: 'bold' }]}>
                Dönem Seçin (Zero)
              </Text>
              <TouchableOpacity onPress={() => setShowMonthModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Yıl Değiştirici */}
            <View style={styles.yearRow}>
              <TouchableOpacity 
                style={[styles.yearArrowBtn, { backgroundColor: colors.background }]} 
                onPress={() => setPickerYear((prev: number) => prev - 1)}
              >
                <Ionicons name="chevron-back" size={18} color={colors.text} />
              </TouchableOpacity>

              <View style={[styles.yearBadge, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.onPrimary, fontWeight: 'bold', fontSize: 16 * m }}>
                  {pickerYear}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.yearArrowBtn, { backgroundColor: colors.background }]} 
                onPress={() => setPickerYear((prev: number) => prev + 1)}
              >
                <Ionicons name="chevron-forward" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* 3x4 Ay Matrisi */}
            <View style={styles.monthGrid}>
              {MONTH_ABBR.map((abbr, idx) => {
                const isSelected = selectedMonthIndex === idx && parseInt(currentYear, 10) === pickerYear;
                return (
                  <TouchableOpacity
                    key={abbr}
                    style={[
                      styles.monthGridItem,
                      { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                      isSelected && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleSelectMonth(idx)}
                  >
                    <Text 
                      style={[
                        styles.monthGridItemText, 
                        { 
                          color: isSelected ? colors.onPrimary : colors.text, 
                          fontFamily: tStyles.fontFamily,
                          fontSize: 14 * m,
                          fontWeight: isSelected ? 'bold' : '600'
                        }
                      ]}
                    >
                      {abbr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* 🌟 NELER YENİ? / SÜRÜM YENİLİKLERİ MERKEZİ */}
      <WhatsNewModal
        visible={showWhatsNewModal}
        onClose={() => setShowWhatsNewModal(false)}
      />
    </View>
  );
};

// ----------------------------------------------------
// TAB NAVIGATOR (4 ANA MODÜL - AYARLAR HESAPLAR İLE BİRLEŞTİRİLDİ)
// ----------------------------------------------------
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  const { colors, styles: tStyles, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Android tek şeritli (gesture pill) veya navigasyon tuşları için güvenli alt boşluk
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA',
          borderTopWidth: 1,
          height: 60 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text + '70',
        tabBarLabelStyle: {
          fontFamily: tStyles.fontFamily,
          fontSize: 10,
          fontWeight: 'bold',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Ana Sayfa') iconName = 'home-outline';
          else if (route.name === 'Hesaplar') iconName = 'wallet-outline';
          else if (route.name === 'Borçlar') iconName = 'people-outline';
          else if (route.name === 'Raporlar') iconName = 'pie-chart-outline';

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Hesaplar" component={AccountsBudgetsScreen} />
      <Tab.Screen name="Borçlar" component={DebtsScreen} />
      <Tab.Screen name="Raporlar" component={ReportsScreen} />
    </Tab.Navigator>
  );
};

// ----------------------------------------------------
// ANA UYGULAMA GİRİŞİ
const AppContent = () => {
  const { isDark, colors } = useTheme();
  const { isOnboarded, isLoaded, isBiometricEnabled, isAppLocked, setIsAppLocked } = useData();

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar 
          barStyle={isDark ? "light-content" : "dark-content"} 
          backgroundColor={colors.background} 
          translucent={false} 
        />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={isOnboarded ? "Home" : "Onboarding"}>
          {!isOnboarded && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="Home" component={MainTabs} />
          <Stack.Screen 
            name="AddExpense" 
            component={AddExpenseScreen} 
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Ayarlar" component={SettingsScreen} />
          {isOnboarded && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <BiometricLockOverlay
        visible={isBiometricEnabled && isAppLocked}
        onUnlock={() => setIsAppLocked(false)}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, minHeight: 48 },
  homeAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  homeAvatarLetter: {},
  greeting: {},
  dateSubtitle: { marginTop: 2 },
  settingsBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  buckwheatCard: { padding: 18, marginBottom: 14 },
  bwTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bwTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bwDot: { width: 8, height: 8, borderRadius: 4 },
  bwTagText: { fontWeight: 'bold', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  bwAmountLabel: {},
  bwMainAmount: { marginTop: 4, marginBottom: 12 },
  bwProgressContainer: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  bwProgressBar: { height: '100%', borderRadius: 3 },
  bwFooterRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bwFooterText: {},

  balanceCard: { padding: 20, marginBottom: 16 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', letterSpacing: 0.5 },
  balanceAmount: { color: '#FFF', marginVertical: 8 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 10, marginTop: 4 },
  flowBox: {},
  flowSubLabel: { color: 'rgba(255,255,255,0.7)' },
  flowIncome: { color: '#A5D6A7', fontWeight: 'bold', marginTop: 2 },
  flowExpense: { color: '#FFCDD2', fontWeight: 'bold', marginTop: 2 },

  quickActionRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  actionIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionText: { fontWeight: 'bold' },

  transactionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontWeight: 'bold' },
  txCard: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10 },
  txIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  txTitle: { fontWeight: 'bold' },
  txMeta: {},
  txAmount: { fontWeight: 'bold' },

  emptyBox: { padding: 32, alignItems: 'center', marginTop: 10 },
  emptyText: { marginTop: 8, opacity: 0.6 },

  // Zero Month Picker Badge
  zeroMonthBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    marginTop: 3 
  },

  // Paisa 2x2 Overview Grid
  paisaOverviewGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginBottom: 16 
  },
  paisaOverviewCard: { 
    width: '48.5%', 
    padding: 14 
  },
  paisaCardIconBox: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  paisaCardTitle: { 
    marginBottom: 2 
  },
  paisaCardSubtitle: {},

  // Zero Month/Year Picker Modal
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.65)', 
    justifyContent: 'flex-end',
  },
  backdropDismissArea: {
    flex: 1,
    width: '100%',
  },
  centeredModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  monthModalCard: { 
    padding: 20, 
    paddingBottom: 36 
  },
  sheetPill: { 
    width: 40, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#888', 
    alignSelf: 'center', 
    marginBottom: 16, 
    opacity: 0.4 
  },
  monthHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  monthModalTitle: {},
  yearRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 20, 
    marginBottom: 20 
  },
  yearArrowBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  yearBadge: { 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  monthGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    justifyContent: 'space-between' 
  },
  monthGridItem: { 
    width: '23%', 
    paddingVertical: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  monthGridItemText: {},

  // Buckwheat Dağıtım Modu Stilleri
  recalcModeContainer: { 
    marginTop: 10, 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(150,150,150,0.15)' 
  },
  recalcTitle: { 
    letterSpacing: 0.5, 
    marginBottom: 6, 
    fontWeight: 'bold' 
  },
  recalcModeRow: { 
    flexDirection: 'row', 
    gap: 8 
  },
  recalcModeBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 6, 
    paddingHorizontal: 8 
  },

  // Paisa Arama & Filtreleme Stilleri
  searchModalCard: { 
    padding: 20, 
    paddingBottom: 36, 
    height: '85%' 
  },
  searchInputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    marginBottom: 12 
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: 4 
  },
  filterPillsRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 12 
  },
  filterChip: { 
    paddingHorizontal: 12, 
    paddingVertical: 6 
  },
  searchSummaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },

  // Buckwheat Canlı Durum Banner Stili
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
  },

  // İşlem Detay Modalı Stilleri (Zero & Paisa)
  txDetailCard: {
    width: '92%',
    maxWidth: 420,
    padding: 20,
    alignSelf: 'center',
  },
  txDetailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  txDetailCategory: {
    letterSpacing: 0.3,
  },
  txDetailDate: {
    marginTop: 2,
  },
  txDetailAmountCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  txDetailTypeLabel: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  txDetailAmountText: {},
  txDetailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  txDetailNoteInput: {
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  txDetailActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  txDetailDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#EF444415',
  },
  txDetailCloseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
  },

  // 🌟 Neler Yeni & Mahremiyet Modu Stilleri (v1.5.8)
  whatsNewPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  privacyEyeBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsNewCard: {
    padding: 20,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  whatsNewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  whatsNewIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsNewTitle: {},
  whatsNewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  whatsNewItemTitle: {},
  whatsNewItemDesc: {
    marginTop: 3,
    lineHeight: 16,
  },
  whatsNewDismissBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 10,
  },
});
