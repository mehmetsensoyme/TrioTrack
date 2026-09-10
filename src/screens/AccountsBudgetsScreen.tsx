import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Switch, TouchableWithoutFeedback, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useData, Account, RecurringItem, Category } from '../context/DataContext';

const PALETTE_COLORS = ['#FF9800', '#E91E63', '#2196F3', '#9C27B0', '#4CAF50', '#F44336', '#009688', '#3F51B5'];
const CATEGORY_ICONS = ['cart-outline', 'fast-food-outline', 'car-outline', 'receipt-outline', 'film-outline', 'medkit-outline', 'fitness-outline', 'school-outline', 'gift-outline', 'airplane-outline', 'home-outline', 'cafe-outline'];

export default function AccountsBudgetsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, styles: tStyles, currency, isDark } = useTheme();
  const { 
    accounts, 
    categories, 
    budgets, 
    transactions, 
    monthlyBudgetGoal, 
    setMonthlyBudgetGoal, 
    setCategoryBudget,
    addAccount,
    deleteAccount,
    updateAccountBalance,
    addCategory,
    deleteCategory,
    buckwheatMetrics,
    selectedMonth,
    recurringItems,
    addRecurringItem,
    toggleRecurringItem,
    deleteRecurringItem,
    debtors,
    totalBalance,
    userName,
    isBalanceHidden,
    toggleBalanceHidden,
  } = useData();

  const [activeTab, setActiveTab] = useState<'accounts' | 'budgets' | 'recurring' | 'buckwheat'>('accounts');
  
  // Modal states: Hesap Ekleme
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'cash' | 'bank' | 'card' | 'savings'>('bank');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Modal states: Cüzdan Detay & Bakiye Düzenleme (Paisa)
  const [showAccountDetailModal, setShowAccountDetailModal] = useState(false);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<Account | null>(null);
  const [editBalanceInput, setEditBalanceInput] = useState('');
  const [isEditingBalance, setIsEditingBalance] = useState(false);

  // Modal states: Bütçe Limiti
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedCategoryForBudget, setSelectedCategoryForBudget] = useState(categories[0]?.id || '');
  const [budgetLimitInput, setBudgetLimitInput] = useState('');

  // Modal states: Özel Kategori Ekleme
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState(PALETTE_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState(CATEGORY_ICONS[0]);

  // Modal states: Abonelik / Düzenli İşlem Ekleme (Paisa)
  const [showAddRecurringModal, setShowAddRecurringModal] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recType, setRecType] = useState<'expense' | 'income'>('expense');
  const [recFrequency, setRecFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [recCatId, setRecCatId] = useState(categories[0]?.id || '');
  const [recAccId, setRecAccId] = useState(accounts[0]?.id || '');

  const m = tStyles.fontSizeMultiplier;

  // Net Worth (Net Varlık) KPI Hesaplaması (Paisa & Zero)
  const totalLiabilities = debtors
    .filter(d => !d.settled && d.type === 'i_owe')
    .reduce((s, d) => s + Math.max(0, d.amount - (d.paidAmount || 0)), 0);
  const totalReceivables = debtors
    .filter(d => !d.settled && d.type === 'owe_me')
    .reduce((s, d) => s + Math.max(0, d.amount - (d.paidAmount || 0)), 0);
  const netWorth = totalBalance + totalReceivables - totalLiabilities;

  // Zero-Based Budgeting Hesaplaması (Zero)
  const totalAllocated = budgets.reduce((sum, b) => sum + b.amount, 0);
  const unallocatedBudget = monthlyBudgetGoal - totalAllocated;

  // Hesap ekleme
  const handleCreateAccount = async () => {
    if (!newAccName.trim()) {
      Alert.alert('Hata', 'Lütfen bir hesap adı girin.');
      return;
    }
    const bal = parseFloat(newAccBalance) || 0;
    let icon = 'card-outline';
    let color = '#2196F3';
    if (newAccType === 'cash') { icon = 'wallet-outline'; color = '#4CAF50'; }
    if (newAccType === 'card') { icon = 'card-outline'; color = '#E91E63'; }
    if (newAccType === 'savings') { icon = 'trending-up-outline'; color = '#9C27B0'; }

    await addAccount({
      name: newAccName,
      type: newAccType,
      balance: bal,
      color,
      icon,
    });
    setNewAccName('');
    setNewAccBalance('');
    setShowAddAccountModal(false);
  };

  // Kategori bütçesi kaydetme
  const handleSaveBudget = async () => {
    const limit = parseFloat(budgetLimitInput);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Hata', 'Geçerli bir limit tutarı girin.');
      return;
    }
    await setCategoryBudget(selectedCategoryForBudget, limit);
    setBudgetLimitInput('');
    setShowBudgetModal(false);
  };

  // Her kategori için seçilen aydaki harcama hesaplama
  const getCategorySpent = (catId: string) => {
    return transactions
      .filter(tx => tx.type === 'expense' && tx.categoryId === catId && tx.date.startsWith(selectedMonth))
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  // Cüzdan detayını açma
  const handleOpenAccountDetail = (acc: Account) => {
    setSelectedAccountForDetail(acc);
    setEditBalanceInput(String(acc.balance));
    setIsEditingBalance(false);
    setShowAccountDetailModal(true);
  };

  // Bakiye güncelleme
  const handleSaveBalance = async () => {
    if (!selectedAccountForDetail) return;
    const num = parseFloat(editBalanceInput.replace(',', '.'));
    if (isNaN(num)) {
      Alert.alert('Hata', 'Geçerli bir bakiye tutarı girin.');
      return;
    }
    await updateAccountBalance(selectedAccountForDetail.id, num);
    setSelectedAccountForDetail({ ...selectedAccountForDetail, balance: num });
    setIsEditingBalance(false);
  };

  // Hesap silme
  const handleDeleteAccount = (acc: Account) => {
    Alert.alert(
      'Hesabı Sil',
      `"${acc.name}" hesabını silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive', 
          onPress: async () => {
            await deleteAccount(acc.id);
            setShowAccountDetailModal(false);
            setSelectedAccountForDetail(null);
          } 
        }
      ]
    );
  };

  // Yeni kategori oluşturma
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Eksik Alan', 'Lütfen bir kategori adı girin.');
      return;
    }
    await addCategory({
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
      icon: newCatIcon,
    });
    setNewCatName('');
    setShowAddCatModal(false);
  };

  // Yeni düzenli işlem / abonelik ekleme (Paisa)
  const handleCreateRecurring = async () => {
    if (!recTitle.trim()) {
      Alert.alert('Eksik Alan', 'Lütfen bir başlık girin (Örn: Netflix).');
      return;
    }
    const val = parseFloat(recAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }
    await addRecurringItem({
      title: recTitle.trim(),
      amount: val,
      type: recType,
      frequency: recFrequency,
      categoryId: recCatId || categories[0]?.id || '',
      accountId: recAccId || accounts[0]?.id || '',
      active: true,
    });
    setRecTitle('');
    setRecAmount('');
    setShowAddRecurringModal(false);
  };

  // Toplam aktif abonelik yükü (Aylık bazda)
  const totalMonthlyRecurring = recurringItems
    .filter(r => r.active && r.type === 'expense')
    .reduce((sum, r) => {
      if (r.frequency === 'monthly') return sum + r.amount;
      if (r.frequency === 'weekly') return sum + (r.amount * 4.33);
      if (r.frequency === 'yearly') return sum + (r.amount / 12);
      return sum + r.amount;
    }, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* 🌟 CÜZDAN & BÜTÇE KONTROL MERKEZİ HEADER */}
      <View style={[styles.paisaProfileHeader, { paddingHorizontal: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 46 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View 
              style={[
                styles.moduleIconBadge, 
                { 
                  backgroundColor: colors.primary + '18', 
                  borderColor: colors.primary + '30',
                  borderWidth: 1,
                  borderRadius: Math.max(tStyles.roundness / 2, 12) 
                }
              ]}
            >
              <Ionicons name="wallet-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.screenHeaderTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m, fontWeight: tStyles.titleWeight }]}>
                  Cüzdan & Bütçe
                </Text>
                <View style={[styles.accountCountPill, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 10 * m, fontWeight: 'bold' }}>
                    {accounts.length} Hesap
                  </Text>
                </View>
              </View>
              <Text style={[styles.screenHeaderSubtitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11.5 * m, marginTop: 2 }]}>
                Varlık bakiyeleri, bütçe limitleri & düzenli ödemeler
              </Text>
            </View>
          </View>

          {/* Hızlı Ekle (+) Aksiyon Butonu */}
          <TouchableOpacity 
            style={[styles.profileSettingsBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
            onPress={() => setShowAddAccountModal(true)}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Paisa Hızlı Eylemler Çubuğu */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity 
            style={[styles.quickActionChip, { backgroundColor: colors.card, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
            onPress={() => setShowAddAccountModal(true)}
          >
            <Ionicons name="add-circle-outline" size={15} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: '600', marginLeft: 4 }]}>
              Hesap Ekle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionChip, { backgroundColor: colors.card, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
            onPress={() => navigation?.navigate('Settings')}
          >
            <Ionicons name="options-outline" size={15} color="#7C3AED" />
            <Text style={[styles.quickActionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: '600', marginLeft: 4 }]}>
              Ayarlar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionChip, { backgroundColor: colors.card, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
            onPress={() => setActiveTab('budgets')}
          >
            <Ionicons name="pie-chart-outline" size={15} color="#FF9800" />
            <Text style={[styles.quickActionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: '600', marginLeft: 4 }]}>
              Bütçeler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionChip, { backgroundColor: colors.card, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}
            onPress={() => setActiveTab('recurring')}
          >
            <Ionicons name="repeat-outline" size={15} color="#10B981" />
            <Text style={[styles.quickActionText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: '600', marginLeft: 4 }]}>
              Abonelik
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Üst Sekmeler (4 Modül) */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'accounts' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
          onPress={() => setActiveTab('accounts')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'accounts' ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
            Cüzdanlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'budgets' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
          onPress={() => setActiveTab('budgets')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'budgets' ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
            Bütçeler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'recurring' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
          onPress={() => setActiveTab('recurring')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'recurring' ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
            Abonelikler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'buckwheat' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
          onPress={() => setActiveTab('buckwheat')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'buckwheat' ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
            Akıllı Motor
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* SEKME 1: HESAPLAR */}
        {activeTab === 'accounts' && (
          <View>
            {/* NET DEĞER / NET WORTH KPI KARTI (ZERO & PAISA) */}
            <View style={[styles.netWorthCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
              <View style={styles.netWorthTopRow}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.netWorthLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                      TOPLAM NET FİNANSAL DEĞER
                    </Text>
                    <TouchableOpacity onPress={toggleBalanceHidden} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name={isBalanceHidden ? "eye-off-outline" : "eye-outline"} size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[
                    styles.netWorthAmount, 
                    { 
                      color: netWorth >= 0 ? (isDark ? '#81C784' : '#2E7D32') : '#EF4444', 
                      fontFamily: tStyles.fontFamily, 
                      fontSize: 26 * m,
                      fontWeight: tStyles.titleWeight 
                    }
                  ]}>
                    {isBalanceHidden ? `${currency} ••••••` : `${netWorth < 0 ? '-' : ''}${currency} ${Math.abs(netWorth).toLocaleString('tr-TR')}`}
                  </Text>
                </View>
                <View style={[styles.netWorthBadge, { backgroundColor: (netWorth >= 0 ? '#10B981' : '#EF4444') + '20' }]}>
                  <Text style={{ color: netWorth >= 0 ? '#10B981' : '#EF4444', fontSize: 11 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }}>
                    {netWorth >= 0 ? 'Pozitif Varlık' : 'Net Borçlu'}
                  </Text>
                </View>
              </View>

              <View style={[styles.netWorthStatsRow, { borderTopColor: 'rgba(150,150,150,0.15)' }]}>
                <View style={styles.netWorthStatItem}>
                  <Text style={[styles.netWorthStatLabel, { color: colors.text, opacity: 0.5, fontSize: 10 * m, fontFamily: tStyles.fontFamily }]}>Cüzdan Varlıkları</Text>
                  <Text style={[styles.netWorthStatValue, { color: colors.text, fontSize: 13 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }]}>
                    {isBalanceHidden ? `${currency} ••••` : `${currency} ${totalBalance.toLocaleString('tr-TR')}`}
                  </Text>
                </View>
                <View style={styles.netWorthStatItem}>
                  <Text style={[styles.netWorthStatLabel, { color: colors.text, opacity: 0.5, fontSize: 10 * m, fontFamily: tStyles.fontFamily }]}>Toplam Borç</Text>
                  <Text style={[styles.netWorthStatValue, { color: '#EF4444', fontSize: 13 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }]}>
                    {isBalanceHidden ? `${currency} ••••` : `${currency} ${totalLiabilities.toLocaleString('tr-TR')}`}
                  </Text>
                </View>
                <View style={styles.netWorthStatItem}>
                  <Text style={[styles.netWorthStatLabel, { color: colors.text, opacity: 0.5, fontSize: 10 * m, fontFamily: tStyles.fontFamily }]}>Bekleyen Alacak</Text>
                  <Text style={[styles.netWorthStatValue, { color: '#10B981', fontSize: 13 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }]}>
                    {isBalanceHidden ? `${currency} ••••` : `${currency} ${totalReceivables.toLocaleString('tr-TR')}`}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>
                Cüzdanlar & Banka Hesapları
              </Text>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: tStyles.roundness }]}
                onPress={() => setShowAddAccountModal(true)}
              >
                <Ionicons name="add" size={18} color={colors.onPrimary} />
                <Text style={[styles.addBtnText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>Hesap Ekle</Text>
              </TouchableOpacity>
            </View>

            {accounts.map(acc => (
              <TouchableOpacity 
                key={acc.id} 
                style={[
                  styles.accountCard, 
                  { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }
                ]}
                onPress={() => handleOpenAccountDetail(acc)}
              >
                <View style={[styles.accIconBox, { backgroundColor: acc.color + '20', borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
                  <Ionicons name={acc.icon as any} size={24} color={acc.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.accName, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m }]}>{acc.name}</Text>
                  <Text style={[styles.accType, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                    {acc.type === 'cash' ? 'Nakit' : acc.type === 'bank' ? 'Banka Hesabı' : acc.type === 'card' ? 'Kredi Kartı' : 'Birikim'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text 
                    style={[
                      styles.accBalance, 
                      { 
                        color: acc.balance >= 0 ? (isDark ? '#81C784' : '#2E7D32') : '#E57373', 
                        fontFamily: tStyles.fontFamily,
                        fontSize: 16 * m 
                      }
                    ]}
                  >
                    {isBalanceHidden ? `${currency} ••••` : `${acc.balance < 0 ? '-' : ''}${currency} ${Math.abs(acc.balance).toLocaleString('tr-TR')}`}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.text} style={{ opacity: 0.3, marginTop: 4 }} />
                </View>
              </TouchableOpacity>
            ))}

            {/* 🌟 TÜM AYARLAR VE YAPILANDIRMA MERKEZİ GİRİŞ KARTI (PAISA 003245) */}
            <TouchableOpacity 
              style={[styles.settingsEntryCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
              onPress={() => navigation?.navigate('Settings')}
            >
              <View style={[styles.settingsEntryIconBox, { backgroundColor: colors.primary + '20', borderRadius: 12 }]}>
                <Ionicons name="settings-outline" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.settingsEntryTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m, fontWeight: 'bold' }]}>
                  Uygulama & Sistem Ayarları
                </Text>
                <Text style={[styles.settingsEntrySub, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                  Para birimi, tema, JSON yedekleme, hafta başlangıcı & geliştirici
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text} style={{ opacity: 0.4 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* SEKME 2: KATEGORİ BÜTÇELERİ (ZERO & PAISA) */}
        {activeTab === 'budgets' && (
          <View>
            {/* SIFIR TABANLI BÜTÇE PLANI (ZERO-BASED BUDGETING) */}
            <View style={[styles.zeroBudgetCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
              <View style={styles.zeroBudgetTopRow}>
                <View>
                  <Text style={[styles.zeroBudgetSub, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: 'bold' }]}>
                    SIFIR TABANLI BÜTÇE PLANI (ZERO)
                  </Text>
                  <Text style={[styles.zeroBudgetTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m, fontWeight: 'bold', marginTop: 2 }]}>
                    Aylık Hedef: {currency} {monthlyBudgetGoal.toLocaleString('tr-TR')}
                  </Text>
                </View>
                <View style={[
                  styles.zeroStatusBadge, 
                  { 
                    backgroundColor: unallocatedBudget === 0 
                      ? '#10B98120' 
                      : unallocatedBudget > 0 
                        ? '#F59E0B20' 
                        : '#EF444420' 
                  }
                ]}>
                  <Text style={{ 
                    color: unallocatedBudget === 0 
                      ? '#10B981' 
                      : unallocatedBudget > 0 
                        ? '#F59E0B' 
                        : '#EF4444',
                    fontWeight: 'bold',
                    fontSize: 11 * m,
                    fontFamily: tStyles.fontFamily
                  }}>
                    {unallocatedBudget === 0 ? '✓ Zero-Budgeted' : unallocatedBudget > 0 ? `${currency} ${unallocatedBudget.toLocaleString('tr-TR')} Boşta` : `Aşım: ${currency} ${Math.abs(unallocatedBudget).toLocaleString('tr-TR')}`}
                  </Text>
                </View>
              </View>

              <View style={[styles.zeroProgressBarBg, { backgroundColor: colors.background }]}>
                <View 
                  style={[
                    styles.zeroProgressBarFill, 
                    { 
                      width: `${Math.min(100, monthlyBudgetGoal > 0 ? (totalAllocated / monthlyBudgetGoal) * 100 : 0)}%`,
                      backgroundColor: unallocatedBudget < 0 ? '#EF4444' : unallocatedBudget === 0 ? '#10B981' : colors.primary
                    }
                  ]} 
                />
              </View>

              <View style={styles.zeroFooterRow}>
                <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
                  Tahsis Edilen: {currency} {totalAllocated.toLocaleString('tr-TR')} (%{monthlyBudgetGoal > 0 ? Math.round((totalAllocated / monthlyBudgetGoal) * 100) : 0})
                </Text>
                <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m, fontFamily: tStyles.fontFamily }}>
                  Kalan: {currency} {Math.max(0, unallocatedBudget).toLocaleString('tr-TR')}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>
                Aylık Kategori Sınırları
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: colors.background, borderRadius: tStyles.roundness }]}
                  onPress={() => setShowAddCatModal(true)}
                >
                  <Ionicons name="pricetag-outline" size={16} color={colors.text} />
                  <Text style={[styles.addBtnText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>Yeni Kategori</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: tStyles.roundness }]}
                  onPress={() => setShowBudgetModal(true)}
                >
                  <Ionicons name="add" size={16} color={colors.onPrimary} />
                  <Text style={[styles.addBtnText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>Limit Belirle</Text>
                </TouchableOpacity>
              </View>
            </View>

            {budgets.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <Text style={{ fontSize: 30 }}>📊</Text>
                <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: tStyles.fontFamily }]}>Henüz Bütçe Belirlenmedi</Text>
                <Text style={[styles.emptySubtitle, { color: colors.text, fontFamily: tStyles.fontFamily }]}>
                  Kategorilerinize limit koyarak harcamalarınızı kontrol altına alın.
                </Text>
              </View>
            ) : (
              budgets.map(b => {
                const category = categories.find(c => c.id === b.categoryId);
                const spent = getCategorySpent(b.categoryId);
                const percentage = Math.min(100, Math.round((spent / b.amount) * 100));
                const isOver = spent > b.amount;

                return (
                  <View 
                    key={b.id} 
                    style={[styles.budgetCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
                  >
                    <View style={styles.budgetTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.catCircle, { backgroundColor: (category?.color || colors.primary) + '20' }]}>
                          <Ionicons name={(category?.icon || 'pricetag-outline') as any} size={18} color={category?.color || colors.primary} />
                        </View>
                        <Text style={[styles.budgetCatName, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m }]}>
                          {category?.name || 'Kategori'}
                        </Text>
                      </View>
                      <Text style={[styles.budgetPercent, { color: isOver ? '#F44336' : colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                        %{percentage}
                      </Text>
                    </View>

                    {/* İlerleme Çubuğu */}
                    <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${percentage}%`, 
                            backgroundColor: isOver ? '#F44336' : percentage > 80 ? '#FF9800' : colors.primary 
                          }
                        ]} 
                      />
                    </View>

                    <View style={styles.budgetBottomRow}>
                      <Text style={[styles.budgetSpentText, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                        Harcanan: {currency} {spent.toLocaleString('tr-TR')}
                      </Text>
                      <Text style={[styles.budgetLimitText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                        Limit: {currency} {b.amount.toLocaleString('tr-TR')}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* SEKME 3: DÜZENLİ İŞLEMLER & ABONELİKLER (PAISA) */}
        {activeTab === 'recurring' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>
                  Düzenli İşlemler & Abonelikler
                </Text>
                <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 * m, marginTop: 2 }}>
                  Aylık Taahhüt: {currency} {totalMonthlyRecurring.toLocaleString('tr-TR')} / ay
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: tStyles.roundness }]}
                onPress={() => setShowAddRecurringModal(true)}
              >
                <Ionicons name="add" size={18} color={colors.onPrimary} />
                <Text style={[styles.addBtnText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>Abonelik Ekle</Text>
              </TouchableOpacity>
            </View>

            {recurringItems.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <Ionicons name="repeat-outline" size={36} color={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: tStyles.fontFamily }]}>
                  Henüz Düzenli İşlem Yok
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily }]}>
                  Netflix, Spotify, Kira, İnternet gibi düzenli fatura ve aboneliklerinizi buraya ekleyin.
                </Text>
              </View>
            ) : (
              recurringItems.map(item => {
                const cat = categories.find(c => c.id === item.categoryId);
                const acc = accounts.find(a => a.id === item.accountId);
                const freqText = item.frequency === 'monthly' ? 'Aylık' : item.frequency === 'weekly' ? 'Haftalık' : 'Yıllık';

                return (
                  <View 
                    key={item.id}
                    style={[
                      styles.recurringCard, 
                      { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation, opacity: item.active ? 1 : 0.6 }
                    ]}
                  >
                    <View style={[styles.accIconBox, { backgroundColor: (cat?.color || colors.primary) + '20', borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
                      <Ionicons name={(cat?.icon as any) || 'repeat-outline'} size={22} color={cat?.color || colors.primary} />
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.accName, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m }]}>
                          {item.title}
                        </Text>
                        <View style={[styles.freqBadge, { backgroundColor: colors.background }]}>
                          <Text style={{ color: colors.text, opacity: 0.7, fontSize: 10 * m, fontWeight: 'bold' }}>{freqText}</Text>
                        </View>
                      </View>
                      <Text style={[styles.accType, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                        {cat?.name || 'Kategori'} • {acc?.name || 'Cüzdan'}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                      <Text style={[styles.accBalance, { color: item.type === 'expense' ? '#EF5350' : '#4CAF50', fontFamily: tStyles.fontFamily, fontSize: 15 * m }]}>
                        {currency} {item.amount.toLocaleString('tr-TR')}
                      </Text>
                    </View>

                    <Switch 
                      value={item.active} 
                      onValueChange={() => toggleRecurringItem(item.id)}
                      trackColor={{ false: '#767577', true: colors.primary }}
                      thumbColor={item.active ? colors.onPrimary : '#f4f3f4'}
                    />

                    <TouchableOpacity 
                      style={{ marginLeft: 8, padding: 4 }}
                      onPress={() => deleteRecurringItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.text} style={{ opacity: 0.35 }} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* SEKME 4: BUCKWHEAT AYLIK HEDEF & GÜNLÜK LİMİT */}
        {activeTab === 'buckwheat' && (
          <View>
            <View style={[styles.buckwheatHeroCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
              <View style={[styles.bwIconBubble, { backgroundColor: colors.primary }]}>
                <Ionicons name="calculator-outline" size={32} color={colors.onPrimary} />
              </View>
              <Text style={[styles.bwTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 20 * m }]}>
                TrioTrack Akıllı Bütçe Motoru
              </Text>
              <Text style={[styles.bwSubtitle, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
                Aylık toplam harcama hedefi belirlersiniz. TrioTrack kalan bütçenizi kalan günlere bölerek her sabah size harcayabileceğiniz akıllı limiti sunar.
              </Text>

              <View style={[styles.inputBox, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
                <Text style={[styles.inputLabel, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                  AYLIK TOPLAM BÜTÇE HEDEFİNİZ
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 22 * m, color: colors.text, fontWeight: 'bold', marginRight: 8 }}>{currency}</Text>
                  <TextInput
                    style={[styles.mainInput, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 22 * m }]}
                    keyboardType="numeric"
                    value={String(monthlyBudgetGoal)}
                    onChangeText={val => {
                      const num = parseInt(val) || 0;
                      setMonthlyBudgetGoal(num);
                    }}
                  />
                </View>
              </View>

              {/* Canlı Hesaplama Özeti */}
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
                  <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6, fontSize: 11 * m }]}>Günlük Akıllı Limit</Text>
                  <Text style={[styles.statValue, { color: colors.primary, fontSize: 17 * m, fontWeight: 'bold' }]}>
                    {currency} {buckwheatMetrics.dailyAllowance.toLocaleString('tr-TR')}
                  </Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
                  <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6, fontSize: 11 * m }]}>Bugün Harcanan</Text>
                  <Text style={[styles.statValue, { color: colors.text, fontSize: 17 * m, fontWeight: 'bold' }]}>
                    {currency} {buckwheatMetrics.todaySpent.toLocaleString('tr-TR')}
                  </Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
                  <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6, fontSize: 11 * m }]}>
                    {buckwheatMetrics.todayRemaining < 0 ? 'Bugün Aşım' : 'Bugün Kalan'}
                  </Text>
                  <Text style={[styles.statValue, { 
                    color: buckwheatMetrics.todayRemaining < 0 ? '#EF4444' : (isDark ? '#81C784' : '#2E7D32'), 
                    fontSize: 17 * m, 
                    fontWeight: 'bold' 
                  }]}>
                    {buckwheatMetrics.todayRemaining < 0 ? '-' : ''}{currency} {Math.abs(buckwheatMetrics.todayRemaining).toLocaleString('tr-TR')}
                  </Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
                  <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6, fontSize: 11 * m }]}>Kalan Gün</Text>
                  <Text style={[styles.statValue, { color: colors.text, fontSize: 17 * m, fontWeight: 'bold' }]}>
                    {buckwheatMetrics.daysRemaining} Gün
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Hesap Ekleme Modalı */}
      <Modal 
        visible={showAddAccountModal} 
        transparent 
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowAddAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowAddAccountModal(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>Yeni Hesap / Cüzdan</Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder="Hesap Adı (Örn: Maaş Hesabı)"
              placeholderTextColor={colors.text + '60'}
              value={newAccName}
              onChangeText={setNewAccName}
            />

            <View style={styles.accTypeRow}>
              {[
                { label: 'Nakit', val: 'cash' },
                { label: 'Banka', val: 'bank' },
                { label: 'Kart', val: 'card' },
                { label: 'Birikim', val: 'savings' }
              ].map(t => (
                <TouchableOpacity
                  key={t.val}
                  style={[
                    styles.typeChip,
                    { backgroundColor: colors.background },
                    newAccType === t.val && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setNewAccType(t.val as any)}
                >
                  <Text style={{ color: newAccType === t.val ? colors.onPrimary : colors.text, fontWeight: 'bold', fontSize: 12 }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder="Başlangıç Bakiyesi (0.00)"
              placeholderTextColor={colors.text + '60'}
              keyboardType="numeric"
              value={newAccBalance}
              onChangeText={setNewAccBalance}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowAddAccountModal(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.text, opacity: 0.7 }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateAccount} style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bütçe Belirleme Modalı */}
      <Modal 
        visible={showBudgetModal} 
        transparent 
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowBudgetModal(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m }]}>Kategori Bütçesi Belirle</Text>
            
            <Text style={{ color: colors.text, opacity: 0.7, marginBottom: 8, fontSize: 12 }}>Kategori Seçin</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.catSelectChip,
                    { backgroundColor: colors.background },
                    selectedCategoryForBudget === c.id && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setSelectedCategoryForBudget(c.id)}
                >
                  <Text style={{ color: selectedCategoryForBudget === c.id ? colors.onPrimary : colors.text, fontWeight: 'bold' }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder={`Aylık Limit Tutarı (${currency})`}
              placeholderTextColor={colors.text + '60'}
              keyboardType="numeric"
              value={budgetLimitInput}
              onChangeText={setBudgetLimitInput}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowBudgetModal(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.text, opacity: 0.7 }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveBudget} style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PAISA CÜZDAN DETAY & BAKİYE DÜZENLEME MODALI */}
      <Modal 
        visible={showAccountDetailModal} 
        transparent 
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowAccountDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowAccountDetailModal(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness, maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.accIconBox, { width: 34, height: 34, borderRadius: 17, backgroundColor: (selectedAccountForDetail?.color || colors.primary) + '20' }]}>
                  <Ionicons name={(selectedAccountForDetail?.icon as any) || 'wallet-outline'} size={18} color={selectedAccountForDetail?.color || colors.primary} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m, marginBottom: 0 }]}>
                  {selectedAccountForDetail?.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAccountDetailModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Bakiye Gösterimi ve Düzenleme */}
            <View style={[styles.accountDetailHero, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
              <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m, marginBottom: 4 }}>GÜNCEL BAKİYE</Text>
              {isEditingBalance ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, backgroundColor: colors.card, color: colors.text, marginBottom: 0, paddingVertical: 8 }]}
                    keyboardType="numeric"
                    value={editBalanceInput}
                    onChangeText={setEditBalanceInput}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveBalance} style={[styles.modalSaveBtn, { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 16 }]}>
                    <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>Kaydet</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 24 * m, color: colors.text, fontWeight: 'bold', fontFamily: tStyles.fontFamily }}>
                    {currency} {selectedAccountForDetail?.balance.toLocaleString('tr-TR')}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.smallActionBtn, { backgroundColor: colors.primary + '20', borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
                    onPress={() => setIsEditingBalance(true)}
                  >
                    <Ionicons name="create-outline" size={14} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 11 * m, fontWeight: 'bold', marginLeft: 4 }}>Düzelt</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Giriş & Çıkış İstatistikleri */}
            {selectedAccountForDetail && (
              <View style={styles.detailStatRow}>
                <View style={[styles.detailStatBox, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}>
                  <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m }}>Toplam Giren</Text>
                  <Text style={{ color: isDark ? '#81C784' : '#2E7D32', fontWeight: 'bold', fontSize: 14 * m, marginTop: 2 }}>
                    +{currency} {transactions
                      .filter(t => (t.accountId === selectedAccountForDetail.id && t.type === 'income') || (t.toAccountId === selectedAccountForDetail.id && t.type === 'transfer'))
                      .reduce((s, t) => s + t.amount, 0)
                      .toLocaleString('tr-TR')}
                  </Text>
                </View>

                <View style={[styles.detailStatBox, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}>
                  <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m }}>Toplam Çıkan</Text>
                  <Text style={{ color: '#EF5350', fontWeight: 'bold', fontSize: 14 * m, marginTop: 2 }}>
                    -{currency} {transactions
                      .filter(t => t.accountId === selectedAccountForDetail.id && (t.type === 'expense' || t.type === 'transfer'))
                      .reduce((s, t) => s + t.amount, 0)
                      .toLocaleString('tr-TR')}
                  </Text>
                </View>
              </View>
            )}

            {/* Bu Hesaba Ait Son İşlemler */}
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 13 * m, marginBottom: 8 }}>
              Hesap İşlem Geçmişi
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 180, marginBottom: 12 }}>
              {transactions.filter(t => t.accountId === selectedAccountForDetail?.id || t.toAccountId === selectedAccountForDetail?.id).length === 0 ? (
                <Text style={{ color: colors.text, opacity: 0.5, textAlign: 'center', marginVertical: 16 }}>Bu hesaba ait işlem bulunamadı.</Text>
              ) : (
                transactions
                  .filter(t => t.accountId === selectedAccountForDetail?.id || t.toAccountId === selectedAccountForDetail?.id)
                  .map(tx => (
                    <View key={tx.id} style={[styles.miniTxRow, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}>
                      {tx.brandLogoUrl ? (
                        <Image source={{ uri: tx.brandLogoUrl }} style={{ width: 22, height: 22, borderRadius: 5, marginRight: 8 }} resizeMode="contain" />
                      ) : null}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 * m }}>{tx.title}</Text>
                        <Text style={{ color: colors.text, opacity: 0.5, fontSize: 10 * m }}>{tx.date}</Text>
                      </View>
                      <Text style={{ color: tx.type === 'transfer' ? '#7C3AED' : tx.type === 'income' ? '#4CAF50' : '#EF5350', fontWeight: 'bold', fontSize: 13 * m }}>
                        {tx.type === 'transfer' ? '↔' : tx.type === 'income' ? '+' : '-'}{currency} {tx.amount.toLocaleString('tr-TR')}
                      </Text>
                    </View>
                  ))
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <TouchableOpacity 
                onPress={() => selectedAccountForDetail && handleDeleteAccount(selectedAccountForDetail)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color="#EF5350" />
                <Text style={{ color: '#EF5350', fontSize: 12 * m, marginLeft: 4, fontWeight: 'bold' }}>Hesabı Sil</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setShowAccountDetailModal(false)}
                style={[styles.modalSaveBtn, { backgroundColor: colors.background }]}
              >
                <Text style={{ color: colors.text }}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* YENİ KATEGORİ EKLEME MODALI (PAISA & ZERO) */}
      <Modal 
        visible={showAddCatModal} 
        transparent 
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowAddCatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowAddCatModal(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m, marginBottom: 0 }]}>
                Yeni Kategori Oluştur
              </Text>
              <TouchableOpacity onPress={() => setShowAddCatModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder="Kategori Adı (Örn: Hobiler)"
              placeholderTextColor={colors.text + '60'}
              value={newCatName}
              onChangeText={setNewCatName}
            />

            {/* Tür Seçimi */}
            <View style={styles.accTypeRow}>
              <TouchableOpacity
                style={[styles.typeChip, { backgroundColor: colors.background }, newCatType === 'expense' && { backgroundColor: colors.primary }]}
                onPress={() => setNewCatType('expense')}
              >
                <Text style={{ color: newCatType === 'expense' ? colors.onPrimary : colors.text, fontWeight: 'bold' }}>Gider</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeChip, { backgroundColor: colors.background }, newCatType === 'income' && { backgroundColor: colors.primary }]}
                onPress={() => setNewCatType('income')}
              >
                <Text style={{ color: newCatType === 'income' ? colors.onPrimary : colors.text, fontWeight: 'bold' }}>Gelir</Text>
              </TouchableOpacity>
            </View>

            {/* Renk Paleti */}
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 11 * m, marginBottom: 6, fontWeight: 'bold' }}>RENK SEÇİN</Text>
            <View style={styles.paletteRow}>
              {PALETTE_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorCircle, { backgroundColor: c }, newCatColor === c && { borderWidth: 3, borderColor: colors.text }]}
                  onPress={() => setNewCatColor(c)}
                >
                  {newCatColor === c && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* İkon Seçici */}
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 11 * m, marginBottom: 6, fontWeight: 'bold' }}>İKON SEÇİN</Text>
            <View style={styles.iconGrid}>
              {CATEGORY_ICONS.map(ic => (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconChoiceBox,
                    { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                    newCatIcon === ic && { backgroundColor: newCatColor + '30', borderWidth: 2, borderColor: newCatColor }
                  ]}
                  onPress={() => setNewCatIcon(ic)}
                >
                  <Ionicons name={ic as any} size={20} color={newCatIcon === ic ? newCatColor : colors.text} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowAddCatModal(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.text, opacity: 0.7 }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateCategory} style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>Kategoriyi Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* YENİ DÜZENLİ İŞLEM / ABONELİK MODALI (PAISA) */}
      <Modal 
        visible={showAddRecurringModal} 
        transparent 
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowAddRecurringModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowAddRecurringModal(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness, maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m, marginBottom: 0 }]}>
                Yeni Düzenli İşlem / Abonelik
              </Text>
              <TouchableOpacity onPress={() => setShowAddRecurringModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder="Başlık (Örn: Netflix, Spotify, Ev Kirası)"
              placeholderTextColor={colors.text + '60'}
              value={recTitle}
              onChangeText={setRecTitle}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder={`Tutar (${currency})`}
              placeholderTextColor={colors.text + '60'}
              keyboardType="numeric"
              value={recAmount}
              onChangeText={setRecAmount}
            />

            {/* Periyot Seçimi */}
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 11 * m, marginBottom: 6, fontWeight: 'bold' }}>TEKRAR SIKLIĞI</Text>
            <View style={styles.accTypeRow}>
              {[
                { label: 'Aylık', val: 'monthly' },
                { label: 'Haftalık', val: 'weekly' },
                { label: 'Yıllık', val: 'yearly' }
              ].map(f => (
                <TouchableOpacity
                  key={f.val}
                  style={[styles.typeChip, { backgroundColor: colors.background }, recFrequency === f.val && { backgroundColor: colors.primary }]}
                  onPress={() => setRecFrequency(f.val as any)}
                >
                  <Text style={{ color: recFrequency === f.val ? colors.onPrimary : colors.text, fontWeight: 'bold', fontSize: 12 }}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Kategori Seçimi */}
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 11 * m, marginBottom: 6, fontWeight: 'bold' }}>KATEGORİ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.catSelectChip,
                    { backgroundColor: colors.background },
                    recCatId === c.id && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setRecCatId(c.id)}
                >
                  <Text style={{ color: recCatId === c.id ? colors.onPrimary : colors.text, fontWeight: 'bold', fontSize: 12 }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowAddRecurringModal(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.text, opacity: 0.7 }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateRecurring} style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>Aboneliği Kaydet</Text>
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
  tabBar: { flexDirection: 'row', margin: 16, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontWeight: 'bold' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
  addBtnText: { fontWeight: 'bold' },
  
  accountCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12 },
  accIconBox: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  accName: { fontWeight: 'bold' },
  accType: { opacity: 0.6, marginTop: 2 },
  accBalance: { fontWeight: 'bold' },

  recurringCard: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10 },
  freqBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  accountDetailHero: { padding: 16, marginBottom: 12 },
  detailStatRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  detailStatBox: { flex: 1, padding: 12 },
  smallActionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6 },
  miniTxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, marginBottom: 6 },

  paletteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  colorCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  iconChoiceBox: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

  budgetCard: { padding: 16, marginBottom: 12 },
  budgetTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  budgetCatName: { fontWeight: 'bold' },
  budgetPercent: { fontWeight: 'bold' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  budgetBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetSpentText: {},
  budgetLimitText: { fontWeight: 'bold' },

  buckwheatHeroCard: { padding: 24, alignItems: 'center' },
  bwIconBubble: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  bwTitle: { fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  bwSubtitle: { textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  inputBox: { width: '100%', padding: 16 },
  inputLabel: { fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 8 },
  mainInput: { flex: 1, fontWeight: 'bold' },

  statsGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  statBox: { width: '48%', flexGrow: 1, padding: 14 },
  statLabel: { marginBottom: 4 },
  statValue: {},

  emptyBox: { padding: 32, alignItems: 'center', marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, opacity: 0.6, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontWeight: 'bold', marginBottom: 16 },
  modalInput: { padding: 14, marginBottom: 12, fontSize: 15 },
  accTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeChip: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  catSelectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  modalCancelBtn: { padding: 12 },
  modalSaveBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },

  // Net Worth Kartı Stilleri (Zero & Paisa)
  netWorthCard: { padding: 18, marginBottom: 16 },
  netWorthTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  netWorthLabel: { fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 },
  netWorthAmount: {},
  netWorthBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  netWorthStatsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12 },
  netWorthStatItem: { flex: 1 },
  netWorthStatLabel: { marginBottom: 2 },
  netWorthStatValue: {},

  // Sıfır Tabanlı Bütçe Kartı Stilleri (Zero)
  zeroBudgetCard: { padding: 18, marginBottom: 16 },
  zeroBudgetTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  zeroBudgetSub: { letterSpacing: 0.5 },
  zeroBudgetTitle: {},
  zeroStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  zeroProgressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  zeroProgressBarFill: { height: '100%', borderRadius: 4 },
  zeroFooterRow: { flexDirection: 'row', justifyContent: 'space-between' },

  // Cüzdan & Bütçe Header Stilleri
  paisaProfileHeader: { marginBottom: 14 },
  moduleIconBadge: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  screenHeaderTitle: {},
  screenHeaderSubtitle: {},
  accountCountPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  profileSettingsBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  quickActionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickActionChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, paddingHorizontal: 4 },
  quickActionText: {},

  // Ayarlar Giriş Kartı (Cüzdanlar Sekmesi Altı)
  settingsEntryCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 16 },
  settingsEntryIconBox: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  settingsEntryTitle: {},
  settingsEntrySub: { marginTop: 2 },
});
