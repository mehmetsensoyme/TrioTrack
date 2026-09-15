import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useData, DebtCategory, Debtor, DebtPayment } from '../context/DataContext';
import { formatCurrency, formatNumber, parseCurrencyInput } from '../utils/formatUtils';
import CurrencyInputField from '../components/CurrencyInputField';

const DEBT_CATEGORIES: { id: DebtCategory; label: string; icon: any }[] = [
  { id: 'person', label: 'Kişi', icon: 'person-outline' },
  { id: 'credit_card', label: 'Kredi Kartı', icon: 'card-outline' },
  { id: 'emi', label: 'Taksit (EMI)', icon: 'receipt-outline' },
  { id: 'loan', label: 'Banka Kredisi', icon: 'business-outline' },
];

export default function DebtsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, styles: tStyles, currency, isDark } = useTheme();
  const { debtors, addDebtor, settleDebtor, deleteDebtor, recordDebtPayment } = useData();

  const [activeTab, setActiveTab] = useState<'owe_me' | 'i_owe' | 'settled'>('owe_me');
  const [showAddModal, setShowAddModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [typeInput, setTypeInput] = useState<'owe_me' | 'i_owe'>('owe_me');
  const [selectedCategory, setSelectedCategory] = useState<DebtCategory>('person');
  const [dueDateInput, setDueDateInput] = useState('');

  // Zero Kısmi Ödeme Modal Durumları
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebtorForPay, setSelectedDebtorForPay] = useState<Debtor | null>(null);
  const [payAmountInput, setPayAmountInput] = useState('');
  const [payNoteInput, setPayNoteInput] = useState('');

  // Ödeme Geçmişi Modal Durumu
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedDebtorForHistory, setSelectedDebtorForHistory] = useState<Debtor | null>(null);

  const m = tStyles.fontSizeMultiplier;

  const setQuickDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDateInput(d.toISOString().split('T')[0]);
  };

  // Toplam Alacak & Borç Hesaplama (useMemo ile optimize edildi)
  const { totalOweMe, totalIOwe } = useMemo(() => {
    let oweMe = 0;
    let iOwe = 0;
    for (const d of debtors) {
      if (!d.settled) {
        const rem = Math.max(0, d.amount - (d.paidAmount || 0));
        if (d.type === 'owe_me') oweMe += rem;
        else if (d.type === 'i_owe') iOwe += rem;
      }
    }
    return { totalOweMe: oweMe, totalIOwe: iOwe };
  }, [debtors]);

  const handleCreate = async () => {
    if (!nameInput.trim() || !amountInput.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen isim ve tutar girin.');
      return;
    }
    const val = parseCurrencyInput(amountInput);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Geçersiz Tutar', 'Lütfen pozitif bir tutar girin.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    await addDebtor({
      name: nameInput,
      type: typeInput,
      debtCategory: selectedCategory,
      amount: val,
      dueDate: dueDateInput.trim() || undefined,
      note: noteInput,
      date: todayStr,
    });

    setNameInput('');
    setAmountInput('');
    setNoteInput('');
    setDueDateInput('');
    setShowAddModal(false);
  };

  const handleMakePayment = async () => {
    if (!selectedDebtorForPay) return;
    const val = parseCurrencyInput(payAmountInput);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Geçersiz Tutar', 'Lütfen geçerli bir ödeme tutarı girin.');
      return;
    }
    const currentRemaining = selectedDebtorForPay.amount - (selectedDebtorForPay.paidAmount || 0);
    if (val > currentRemaining) {
      Alert.alert('Uyarı', `Ödeme tutarı kalan borçtan (${formatCurrency(currentRemaining, currency)}) fazla olamaz.`);
      return;
    }

    await recordDebtPayment(selectedDebtorForPay.id, val, payNoteInput);
    setPayAmountInput('');
    setPayNoteInput('');
    setShowPayModal(false);
    setSelectedDebtorForPay(null);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Kaydı Sil',
      `"${name}" kaydını silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteDebtor(id) }
      ]
    );
  };

  const filteredDebtors = useMemo(() => {
    return debtors.filter(d => {
      if (activeTab === 'settled') return d.settled;
      return !d.settled && d.type === activeTab;
    });
  }, [debtors, activeTab]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* 🌟 BORÇ & ALACAK STANDART MODÜL HEADER */}
      <View style={styles.headerRow}>
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
            <Ionicons name="people-outline" size={24} color={colors.primary} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text 
                style={[
                  styles.screenHeaderTitle, 
                  { 
                    color: colors.text, 
                    fontFamily: tStyles.fontFamily, 
                    fontSize: 18 * m, 
                    fontWeight: tStyles.titleWeight 
                  }
                ]}
                numberOfLines={1}
              >
                Borç & Alacak
              </Text>
              <View style={[styles.countBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 10 * m, fontWeight: 'bold' }}>
                  {debtors.filter(d => !d.settled).length} Aktif
                </Text>
              </View>
            </View>
            <Text 
              style={[
                styles.screenHeaderSubtitle, 
                { 
                  color: colors.text, 
                  opacity: 0.6, 
                  fontFamily: tStyles.fontFamily, 
                  fontSize: 11.5 * m, 
                  marginTop: 2 
                }
              ]}
              numberOfLines={1}
            >
              Kişi bazlı borç ve alacak defteri
            </Text>
          </View>
        </View>

        {/* Hızlı Ekle (+) Aksiyon Butonu */}
        <TouchableOpacity 
          style={[styles.headerActionBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Zero Tarzı Özet Kartları */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={[styles.badgeCircle, { backgroundColor: isDark ? '#2E7D32' : '#E8F5E9' }]}>
            <Ionicons name="arrow-down" size={16} color={isDark ? '#81C784' : '#2E7D32'} />
          </View>
          <Text style={[styles.summaryLabel, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
            ALACAKLARIM (BANA)
          </Text>
          <Text style={[styles.summaryAmount, { color: isDark ? '#81C784' : '#2E7D32', fontFamily: tStyles.fontFamily, fontSize: 18 * m, fontWeight: tStyles.titleWeight }]}>
            {formatCurrency(totalOweMe, currency, { sign: '+' })}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <View style={[styles.badgeCircle, { backgroundColor: isDark ? '#C62828' : '#FFEBEE' }]}>
            <Ionicons name="arrow-up" size={16} color={isDark ? '#EF5350' : '#C62828'} />
          </View>
          <Text style={[styles.summaryLabel, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
            BORÇLARIM (BENİM)
          </Text>
          <Text style={[styles.summaryAmount, { color: isDark ? '#EF5350' : '#C62828', fontFamily: tStyles.fontFamily, fontSize: 18 * m, fontWeight: tStyles.titleWeight }]}>
            {formatCurrency(totalIOwe, currency, { sign: '-' })}
          </Text>
        </View>
      </View>

      {/* Sekmeler */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'owe_me' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
          onPress={() => setActiveTab('owe_me')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'owe_me' ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
            Alacaklarım
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'i_owe' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
          onPress={() => setActiveTab('i_owe')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'i_owe' ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
            Borçlarım
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'settled' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
          onPress={() => setActiveTab('settled')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'settled' ? colors.onPrimary : colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
            Kapananlar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerActionRow}>
          <Text style={[styles.listTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m, fontWeight: tStyles.titleWeight }]}>
            {activeTab === 'owe_me' ? 'Bana Borcu Olan Kişiler' : activeTab === 'i_owe' ? 'Benim Ödeyeceğim Borçlar' : 'Geçmiş / Kapatılan Borçlar'}
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: tStyles.roundness }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={18} color={colors.onPrimary} />
            <Text style={[styles.addBtnText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>Kayıt Ekle</Text>
          </TouchableOpacity>
        </View>

        {filteredDebtors.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
            <Text style={{ fontSize: 32 }}>🤝</Text>
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: tStyles.fontFamily }]}>Kayıt Bulunamadı</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily }]}>
              {activeTab === 'owe_me' ? 'Kimseye ödünç para vermemiş görünüyorsunuz.' : activeTab === 'i_owe' ? 'Tebrikler, kimseye borcunuz yok!' : 'Henüz kapatılmış bir borç geçmişi yok.'}
            </Text>
          </View>
        ) : (
          filteredDebtors.map(d => {
            const catInfo = DEBT_CATEGORIES.find(c => c.id === d.debtCategory) || DEBT_CATEGORIES[0];
            const paid = d.paidAmount || 0;
            const remaining = Math.max(0, d.amount - paid);
            const percentage = d.amount > 0 ? Math.min(100, Math.round((paid / d.amount) * 100)) : 0;
            const paymentCount = d.payments?.length || 0;

            return (
              <View 
                key={d.id} 
                style={[styles.debtCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.avatarCircle, { backgroundColor: (d.type === 'owe_me' ? '#4CAF50' : '#E91E63') + '20' }]}>
                    <Ionicons 
                      name={d.settled ? 'checkmark-done' : catInfo.icon} 
                      size={20} 
                      color={d.settled ? colors.primary : d.type === 'owe_me' ? '#4CAF50' : '#E91E63'} 
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={[styles.debtName, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m }]}>
                        {d.name}
                      </Text>
                      <View style={[styles.categoryBadge, { backgroundColor: colors.background }]}>
                        <Text style={{ color: colors.text, opacity: 0.6, fontSize: 10 * m, fontWeight: '600' }}>
                          {catInfo.label}
                        </Text>
                      </View>
                      {d.dueDate && !d.settled && (() => {
                        const today = new Date().toISOString().split('T')[0];
                        const isOverdue = today > d.dueDate;
                        const diffDays = Math.round((new Date(d.dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <View style={[styles.dueDateBadge, { backgroundColor: isOverdue ? '#EF444420' : '#3B82F615' }]}>
                            <Text style={{ color: isOverdue ? '#EF4444' : '#3B82F6', fontSize: 10 * m, fontWeight: 'bold' }}>
                              {isOverdue ? `Vadesi Geçti (${d.dueDate})` : `Vade: ${d.dueDate} (${diffDays}g)`}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>
                    {d.note ? (
                      <Text style={[styles.debtNote, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 12 * m }]}>
                        {d.note}
                      </Text>
                    ) : null}
                    <Text style={[styles.debtDate, { color: colors.text, opacity: 0.4, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                      {d.date}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                    <Text 
                      style={[
                        styles.debtAmount, 
                        { 
                          color: d.settled ? colors.text : d.type === 'owe_me' ? (isDark ? '#81C784' : '#2E7D32') : '#E57373',
                          textDecorationLine: d.settled ? 'line-through' : 'none',
                          fontFamily: tStyles.fontFamily,
                          fontSize: 16 * m
                        }
                      ]}
                    >
                      {formatCurrency(remaining, currency)}
                    </Text>
                    {paid > 0 && !d.settled && (
                      <Text style={{ fontSize: 10 * m, color: colors.text, opacity: 0.5 }}>
                        (Top: {formatCurrency(d.amount, currency)})
                      </Text>
                    )}
                  </View>

                  {/* Settle (Kapat / Tahsil Et) Butonu */}
                  <TouchableOpacity 
                    style={[
                      styles.settleBtn, 
                      { backgroundColor: d.settled ? colors.background : (colors.primary + '20'), borderRadius: 18 }
                    ]}
                    onPress={() => settleDebtor(d.id)}
                  >
                    <Ionicons 
                      name={d.settled ? 'refresh-outline' : 'checkmark'} 
                      size={18} 
                      color={d.settled ? colors.text : colors.primary} 
                    />
                  </TouchableOpacity>

                  {/* Sil Butonu */}
                  <TouchableOpacity 
                    style={[styles.deleteBtn, { marginLeft: 4 }]}
                    onPress={() => handleDelete(d.id, d.name)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.text} style={{ opacity: 0.35 }} />
                  </TouchableOpacity>
                </View>

                {/* Zero Kısmi Ödeme İlerleme Çubuğu & Butonları */}
                {!d.settled && (
                  <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.background }}>
                    {paid > 0 && (
                      <View style={{ marginBottom: 8 }}>
                        <View style={[styles.debtProgressBarBg, { backgroundColor: colors.background }]}>
                          <View 
                            style={[
                              styles.debtProgressBarFill, 
                              { width: `${percentage}%`, backgroundColor: d.type === 'owe_me' ? '#4CAF50' : '#E91E63' }
                            ]} 
                          />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                          <Text style={{ fontSize: 10 * m, color: colors.text, opacity: 0.6 }}>
                            Ödenen: {formatCurrency(paid, currency)} (%{percentage})
                          </Text>
                          <Text style={{ fontSize: 10 * m, color: colors.text, opacity: 0.6 }}>
                            Kalan: {formatCurrency(remaining, currency)}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      {paymentCount > 0 && (
                        <TouchableOpacity
                          style={[styles.debtActionChip, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
                          onPress={() => {
                            setSelectedDebtorForHistory(d);
                            setShowHistoryModal(true);
                          }}
                        >
                          <Ionicons name="time-outline" size={13} color={colors.text} />
                          <Text style={{ fontSize: 11 * m, color: colors.text, marginLeft: 4 }}>
                            Geçmiş ({paymentCount})
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.debtActionChip, { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
                        onPress={() => {
                          setSelectedDebtorForPay(d);
                          setPayAmountInput('');
                          setPayNoteInput('');
                          setShowPayModal(true);
                        }}
                      >
                        <Ionicons name="cash-outline" size={13} color={colors.onPrimary} />
                        <Text style={{ fontSize: 11 * m, color: colors.onPrimary, fontWeight: 'bold', marginLeft: 4 }}>
                          Kısmi Ödeme Yap
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Zero Borç Ekleme Modalı (Kategori Seçicili) */}
      <Modal 
        visible={showAddModal} 
        transparent 
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowAddModal(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 18 * m, fontWeight: tStyles.titleWeight }]}>
                Yeni Borç / Alacak Kaydı
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Zero Borç Türü Çipleri: Kişi / Kredi Kartı / Taksit / Kredi */}
            <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 12 * m, marginBottom: 8 }]}>
              KAYIT TÜRÜ (ZERO STİLİ)
            </Text>
            <View style={styles.catSelectRow}>
              {DEBT_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catSelectChip,
                    { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) },
                    selectedCategory === cat.id && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons 
                    name={cat.icon} 
                    size={14} 
                    color={selectedCategory === cat.id ? colors.onPrimary : colors.text} 
                  />
                  <Text style={{ 
                    color: selectedCategory === cat.id ? colors.onPrimary : colors.text, 
                    fontSize: 11 * m, 
                    fontWeight: 'bold' 
                  }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Alacak / Borç Yönü */}
            <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 12 * m, marginBottom: 8 }]}>
              İŞLEM YÖNÜ
            </Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeBtn, 
                  { backgroundColor: colors.background },
                  typeInput === 'owe_me' && { backgroundColor: '#4CAF50' }
                ]}
                onPress={() => setTypeInput('owe_me')}
              >
                <Text style={{ color: typeInput === 'owe_me' ? '#FFF' : colors.text, fontWeight: 'bold', fontSize: 12 * m }}>Alacak (Bana Borçlu)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn, 
                  { backgroundColor: colors.background },
                  typeInput === 'i_owe' && { backgroundColor: '#E91E63' }
                ]}
                onPress={() => setTypeInput('i_owe')}
              >
                <Text style={{ color: typeInput === 'i_owe' ? '#FFF' : colors.text, fontWeight: 'bold', fontSize: 12 * m }}>Borç (Ben Borçluyum)</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder="Kişi veya Kurum Adı (Örn: Ahmet Yılmaz, Banka)"
              placeholderTextColor={colors.text + '60'}
              value={nameInput}
              onChangeText={setNameInput}
            />

            <CurrencyInputField
              containerStyle={{
                backgroundColor: colors.background,
                borderRadius: Math.max(tStyles.roundness / 2, 6),
                padding: 14,
                marginBottom: 12,
              }}
              style={{ color: colors.text, fontSize: 15 }}
              placeholder={`0,00`}
              placeholderTextColor={colors.text + '60'}
              value={amountInput}
              onChangeText={(formatted) => setAmountInput(formatted)}
              cursorColor={colors.primary}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder="Not / Açıklama (İsteğe Bağlı)"
              placeholderTextColor={colors.text + '60'}
              value={noteInput}
              onChangeText={setNoteInput}
            />

            {/* Vade Tarihi Seçimi (Zero Özelliği) */}
            <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 12 * m, marginBottom: 6 }]}>
              VADE / ÖDEME TARİHİ (İSTEĞE BAĞLI)
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {[
                { label: '+15 Gün', days: 15 },
                { label: '+30 Gün', days: 30 },
                { label: '+60 Gün', days: 60 },
                { label: '+90 Gün', days: 90 },
              ].map(item => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.quickDateChip, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
                  onPress={() => setQuickDueDate(item.days)}
                >
                  <Text style={{ color: colors.primary, fontSize: 11 * m, fontWeight: 'bold' }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder="Vade Tarihi (YYYY-AA-GG, Örn: 2026-10-15)"
              placeholderTextColor={colors.text + '60'}
              value={dueDateInput}
              onChangeText={setDueDateInput}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.text, opacity: 0.7 }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ZERO KISMİ ÖDEME MODALI */}
      <Modal 
        visible={showPayModal} 
        transparent 
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowPayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowPayModal(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 17 * m, fontWeight: tStyles.titleWeight }]}>
                Kısmi Ödeme: {selectedDebtorForPay?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowPayModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedDebtorForPay && (
              <View style={[styles.paymentInfoBox, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}>
                <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m }}>
                  Toplam: {formatCurrency(selectedDebtorForPay.amount, currency)} • Kalan: {formatCurrency(selectedDebtorForPay.amount - (selectedDebtorForPay.paidAmount || 0), currency)}
                </Text>
              </View>
            )}

            <CurrencyInputField
              containerStyle={{
                backgroundColor: colors.background,
                borderRadius: Math.max(tStyles.roundness / 2, 6),
                padding: 14,
                marginBottom: 12,
              }}
              style={{ color: colors.text, fontSize: 15 }}
              placeholder={`0,00`}
              placeholderTextColor={colors.text + '60'}
              value={payAmountInput}
              onChangeText={(formatted) => setPayAmountInput(formatted)}
              cursorColor={colors.primary}
              autoFocus
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              placeholder="Ödeme Notu (Örn: Havale yapıldı, 1. taksit)"
              placeholderTextColor={colors.text + '60'}
              value={payNoteInput}
              onChangeText={setPayNoteInput}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowPayModal(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.text, opacity: 0.7 }}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMakePayment} style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>Ödemeyi Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ÖDEME GEÇMİŞİ MODALI */}
      <Modal 
        visible={showHistoryModal} 
        transparent 
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowHistoryModal(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: tStyles.roundness, maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 17 * m, fontWeight: tStyles.titleWeight }]}>
                Ödeme Geçmişi: {selectedDebtorForHistory?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.paymentInfoBox, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 * m }}>
                Toplam Yapılan Ödeme: {formatCurrency(selectedDebtorForHistory?.paidAmount || 0, currency)}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 10 }}>
              {(!selectedDebtorForHistory?.payments || selectedDebtorForHistory.payments.length === 0) ? (
                <Text style={{ textAlign: 'center', opacity: 0.6, marginVertical: 20 }}>Ödeme kaydı bulunamadı.</Text>
              ) : (
                selectedDebtorForHistory.payments.map((p: DebtPayment, idx: number) => (
                  <View key={p.id || String(idx)} style={[styles.paymentItemCard, { backgroundColor: colors.background, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 13 * m }}>
                        {formatCurrency(p.amount, currency, { sign: '+' })}
                      </Text>
                      {p.note ? (
                        <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11 * m, marginTop: 2 }}>{p.note}</Text>
                      ) : null}
                    </View>
                    <Text style={{ color: colors.text, opacity: 0.4, fontSize: 11 * m }}>{p.date}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity 
              onPress={() => setShowHistoryModal(false)}
              style={[styles.modalSaveBtn, { backgroundColor: colors.background, alignItems: 'center' }]}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 14, 
    minHeight: 46 
  },
  moduleIconBadge: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  screenHeaderTitle: {},
  screenHeaderSubtitle: {},
  countBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 8 
  },
  headerActionBtn: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 4 },
  summaryCard: { flex: 1, padding: 16 },
  badgeCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { letterSpacing: 0.5, marginBottom: 4 },
  summaryAmount: {},

  tabBar: { flexDirection: 'row', margin: 16, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontWeight: 'bold' },

  headerActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: {},
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
  addBtnText: { fontWeight: 'bold' },

  debtCard: { padding: 14, marginBottom: 10 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  debtName: { fontWeight: 'bold' },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  debtNote: { marginTop: 2 },
  debtDate: { marginTop: 4 },
  debtAmount: { fontWeight: 'bold' },
  settleBtn: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { padding: 4 },

  debtProgressBarBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  debtProgressBarFill: { height: '100%', borderRadius: 2 },
  debtActionChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 },
  dueDateBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  quickDateChip: { paddingHorizontal: 10, paddingVertical: 6 },

  paymentInfoBox: { padding: 10, marginBottom: 12 },
  paymentItemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, marginBottom: 8 },

  emptyBox: { padding: 32, alignItems: 'center', marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: {},
  modalLabel: { fontWeight: 'bold', letterSpacing: 0.5 },
  catSelectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catSelectChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  modalInput: { padding: 14, marginBottom: 12, fontSize: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  modalCancelBtn: { padding: 12 },
  modalSaveBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 }
});
