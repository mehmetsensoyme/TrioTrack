import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const MONTH_ABBR = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, styles: tStyles, currency, isDark } = useTheme();
  const { 
    transactions, 
    categories, 
    totalIncomeThisMonth, 
    totalExpenseThisMonth, 
    buckwheatMetrics,
    selectedMonth,
    setSelectedMonth
  } = useData();

  const [chartMode, setChartMode] = useState<'categories' | 'trend'>('categories');
  const [showMonthModal, setShowMonthModal] = useState(false);

  // Seçili Yıl ve Ay Ayrıştırması
  const [currentYear, currentMonthStr] = selectedMonth.split('-');
  const selectedMonthIndex = parseInt(currentMonthStr, 10) - 1;
  const [pickerYear, setPickerYear] = useState(parseInt(currentYear, 10));

  const m = tStyles.fontSizeMultiplier;

  // Seçili ay için işlemler
  const monthTransactions = transactions.filter(tx => tx.date.startsWith(selectedMonth));
  const monthExpenses = monthTransactions.filter(tx => tx.type === 'expense');

  // Kategori bazlı harcama dağılımı
  const categoryBreakdown = categories
    .filter(cat => cat.type === 'expense')
    .map(cat => {
      const spent = monthExpenses
        .filter(tx => tx.categoryId === cat.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const count = monthExpenses.filter(tx => tx.categoryId === cat.id).length;
      const percentage = totalExpenseThisMonth > 0 ? Math.round((spent / totalExpenseThisMonth) * 100) : 0;
      return { ...cat, spent, count, percentage };
    })
    .filter(cat => cat.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // 1. Paisa Hızlı Bakış Metrikleri
  const netSavings = totalIncomeThisMonth - totalExpenseThisMonth;
  const savingsRate = totalIncomeThisMonth > 0 
    ? Math.max(0, Math.round((netSavings / totalIncomeThisMonth) * 100)) 
    : 0;

  const topCategory = categoryBreakdown[0];
  const maxExpense = monthExpenses.reduce((max, tx) => (tx.amount > (max?.amount || 0) ? tx : max), monthExpenses[0]);

  // Son 7 günlük harcama trendi
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('tr-TR', { weekday: 'short' });
    const spent = transactions
      .filter(tx => tx.type === 'expense' && tx.date === dateStr)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { dateStr, dayLabel, spent };
  });

  const maxDaySpend = Math.max(...last7Days.map(d => d.spent), 1);

  const handleSelectMonth = (mIndex: number) => {
    const monthFormatted = String(mIndex + 1).padStart(2, '0');
    setSelectedMonth(`${pickerYear}-${monthFormatted}`);
    setShowMonthModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        
        {/* Üst Başlık & Zero Tarzı Ay Seçici Butonu */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 22 * m, fontWeight: tStyles.titleWeight }]}>
              Finansal Analiz & Rapor
            </Text>
            <Text style={[styles.subtitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
              Detaylı Nakit Akışı & Harcama Dağılımı
            </Text>
          </View>

          {/* Zero Ay Seçici Hap Buton */}
          <TouchableOpacity 
            style={[styles.monthPill, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
            onPress={() => {
              setPickerYear(parseInt(currentYear, 10));
              setShowMonthModal(true);
            }}
          >
            <Text style={[styles.monthPillText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m, fontWeight: 'bold' }]}>
              {MONTH_NAMES[selectedMonthIndex]} {currentYear}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Net Tasarruf & Nakit Akışı Kartı */}
        <View style={[styles.flowCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
          <Text style={[styles.flowLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
            {MONTH_NAMES[selectedMonthIndex].toUpperCase()} AYI NET TASARRUF
          </Text>
          <Text 
            style={[
              styles.flowAmount, 
              { 
                color: netSavings >= 0 ? (isDark ? '#81C784' : '#2E7D32') : '#E57373', 
                fontFamily: tStyles.fontFamily,
                fontSize: 26 * m,
                fontWeight: tStyles.titleWeight
              }
            ]}
          >
            {netSavings >= 0 ? '+' : ''}{currency} {netSavings.toLocaleString('tr-TR')}
          </Text>

          <View style={styles.incomeExpenseRow}>
            <View style={styles.rowItem}>
              <View style={[styles.smallBadge, { backgroundColor: isDark ? '#2E7D32' : '#E8F5E9' }]}>
                <Ionicons name="arrow-down" size={12} color={isDark ? '#81C784' : '#2E7D32'} />
              </View>
              <View>
                <Text style={[styles.subLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>Toplam Gelir</Text>
                <Text style={[styles.subVal, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }]}>
                  +{currency} {totalIncomeThisMonth.toLocaleString('tr-TR')}
                </Text>
              </View>
            </View>

            <View style={styles.rowItem}>
              <View style={[styles.smallBadge, { backgroundColor: isDark ? '#C62828' : '#FFEBEE' }]}>
                <Ionicons name="arrow-up" size={12} color={isDark ? '#EF5350' : '#C62828'} />
              </View>
              <View>
                <Text style={[styles.subLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>Toplam Gider</Text>
                <Text style={[styles.subVal, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }]}>
                  -{currency} {totalExpenseThisMonth.toLocaleString('tr-TR')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. PAISA HIZLI BAKIŞ (QUICK GLANCE) 2X2 + 1 METRİK GRIDİ */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m, fontWeight: tStyles.titleWeight, marginTop: 14 }]}>
          Hızlı Bakış & Performans (Paisa)
        </Text>

        <View style={styles.quickGlanceGrid}>
          {/* Tasarruf Oranı */}
          <View style={[styles.glanceBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
            <View style={styles.glanceIconRow}>
              <Ionicons name="pie-chart-outline" size={18} color="#4CAF50" />
              <Text style={[styles.glanceBadgeText, { color: '#4CAF50', fontFamily: tStyles.fontFamily, fontSize: 10 * m }]}>TASARRUF</Text>
            </View>
            <Text style={[styles.glanceMainVal, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 20 * m, fontWeight: 'bold' }]}>
              %{savingsRate}
            </Text>
            <Text style={[styles.glanceDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              Gelir Koruma Oranı
            </Text>
          </View>

          {/* Günlük Ortalama Harcama */}
          <View style={[styles.glanceBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
            <View style={styles.glanceIconRow}>
              <Ionicons name="speedometer-outline" size={18} color="#2196F3" />
              <Text style={[styles.glanceBadgeText, { color: '#2196F3', fontFamily: tStyles.fontFamily, fontSize: 10 * m }]}>ORTALAMA</Text>
            </View>
            <Text style={[styles.glanceMainVal, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 20 * m, fontWeight: 'bold' }]}>
              {currency} {buckwheatMetrics.averageDailySpent.toLocaleString('tr-TR')}
            </Text>
            <Text style={[styles.glanceDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              Günlük Tüketim Hızı
            </Text>
          </View>

          {/* Toplam İşlem Sayısı */}
          <View style={[styles.glanceBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
            <View style={styles.glanceIconRow}>
              <Ionicons name="receipt-outline" size={18} color="#9C27B0" />
              <Text style={[styles.glanceBadgeText, { color: '#9C27B0', fontFamily: tStyles.fontFamily, fontSize: 10 * m }]}>İŞLEMLER</Text>
            </View>
            <Text style={[styles.glanceMainVal, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 20 * m, fontWeight: 'bold' }]}>
              {monthTransactions.length} Adet
            </Text>
            <Text style={[styles.glanceDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              Aylık Kayıt Sayısı
            </Text>
          </View>

          {/* En Çok Harcanan Kategori */}
          <View style={[styles.glanceBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
            <View style={styles.glanceIconRow}>
              <Ionicons name="flame-outline" size={18} color="#F59E0B" />
              <Text style={[styles.glanceBadgeText, { color: '#F59E0B', fontFamily: tStyles.fontFamily, fontSize: 10 * m }]}>LİDER KATEGORİ</Text>
            </View>
            <Text numberOfLines={1} style={[styles.glanceMainVal, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 16 * m, fontWeight: 'bold' }]}>
              {topCategory ? topCategory.name : 'Yok'}
            </Text>
            <Text style={[styles.glanceDesc, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
              {topCategory ? `${currency} ${topCategory.spent.toLocaleString('tr-TR')}` : '-'}
            </Text>
          </View>
        </View>

        {/* En Büyük Tekil Harcama Bannerı */}
        {maxExpense && (
          <View style={[styles.maxExpenseBanner, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
            <View style={[styles.bannerIconBox, { backgroundColor: '#EF4444' + '20' }]}>
              {maxExpense.brandLogoUrl ? (
                <Image source={{ uri: maxExpense.brandLogoUrl }} style={{ width: 22, height: 22, borderRadius: 5 }} resizeMode="contain" />
              ) : (
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.bannerTitle, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                AYIN EN BÜYÜK TEKİL GİDERİ
              </Text>
              <Text style={[styles.bannerSubtitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
                {maxExpense.title}
              </Text>
            </View>
            <Text style={{ color: '#EF4444', fontFamily: tStyles.fontFamily, fontSize: 15 * m, fontWeight: 'bold' }}>
              -{currency} {maxExpense.amount.toLocaleString('tr-TR')}
            </Text>
          </View>
        )}

        {/* 3. GRAFİK & GÖRÜNÜM MODU SEÇİCİ (Kategori vs Trend) */}
        <View style={styles.viewModeRow}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m, fontWeight: tStyles.titleWeight }]}>
            Görsel Dağılım
          </Text>
          <View style={[styles.chartSwitcher, { backgroundColor: colors.card, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
            <TouchableOpacity 
              style={[styles.chartSwitchBtn, chartMode === 'categories' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              onPress={() => setChartMode('categories')}
            >
              <Ionicons name="pie-chart-outline" size={14} color={chartMode === 'categories' ? colors.onPrimary : colors.text} />
              <Text style={{ color: chartMode === 'categories' ? colors.onPrimary : colors.text, fontSize: 11 * m, fontWeight: 'bold', marginLeft: 4 }}>
                Kategori
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.chartSwitchBtn, chartMode === 'trend' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              onPress={() => setChartMode('trend')}
            >
              <Ionicons name="trending-up-outline" size={14} color={chartMode === 'trend' ? colors.onPrimary : colors.text} />
              <Text style={{ color: chartMode === 'trend' ? colors.onPrimary : colors.text, fontSize: 11 * m, fontWeight: 'bold', marginLeft: 4 }}>
                Haftalık Trend
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MOD 1: KATEGORİ DAĞILIMI ÇUBUKLARI */}
        {chartMode === 'categories' && (
          <View>
            {categoryBreakdown.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <Text style={{ fontSize: 28 }}>📊</Text>
                <Text style={[styles.emptyText, { color: colors.text, fontFamily: tStyles.fontFamily }]}>
                  Seçilen dönemde henüz bir harcama kaydı yok.
                </Text>
              </View>
            ) : (
              categoryBreakdown.map(cat => (
                <View 
                  key={cat.id} 
                  style={[styles.categoryRowCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}
                >
                  <View style={styles.catTopLine}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.catIconBox, { backgroundColor: cat.color + '20' }]}>
                        <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                      </View>
                      <Text style={[styles.catName, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: '600' }]}>
                        {cat.name}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.catAmount, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
                        {currency} {cat.spent.toLocaleString('tr-TR')}
                      </Text>
                      <Text style={[styles.catPercent, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>
                        %{cat.percentage} ({cat.count} işlem)
                      </Text>
                    </View>
                  </View>

                  {/* Dağılım Çubuğu */}
                  <View style={[styles.catBarBg, { backgroundColor: colors.background }]}>
                    <View style={[styles.catBarFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* MOD 2: SON 7 GÜN TREND SÜTUNLARI */}
        {chartMode === 'trend' && (
          <View style={[styles.trendCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
            <Text style={[styles.trendCardTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold', marginBottom: 14 }]}>
              Son 7 Günlük Harcama Akışı
            </Text>
            <View style={styles.trendBarsRow}>
              {last7Days.map((d, i) => {
                const heightPercent = Math.max(8, Math.round((d.spent / maxDaySpend) * 100));
                return (
                  <View key={i} style={styles.trendCol}>
                    <Text style={[styles.trendSpentText, { color: colors.text, opacity: 0.6, fontSize: 9 * m }]}>
                      {d.spent > 0 ? `${Math.round(d.spent)}` : ''}
                    </Text>
                    <View style={[styles.trendBarTrack, { backgroundColor: colors.background }]}>
                      <View 
                        style={[
                          styles.trendBarFill, 
                          { 
                            height: `${heightPercent}%`, 
                            backgroundColor: d.spent > 0 ? colors.primary : 'transparent' 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.trendDayText, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 11 * m, marginTop: 6 }]}>
                      {d.dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>

      {/* ZERO TARZI AY VE YIL SEÇİCİ BOTTOM SHEET MODALI */}
      <Modal visible={showMonthModal} transparent animationType="slide" onRequestClose={() => setShowMonthModal(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={() => setShowMonthModal(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
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
                onPress={() => setPickerYear(prev => prev - 1)}
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
                onPress={() => setPickerYear(prev => prev + 1)}
              >
                <Ionicons name="chevron-forward" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* 3x4 Ay Matrisi (Zero Screenshot 212948) */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: {},
  subtitle: { marginTop: 2 },
  monthPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  monthPillText: {},

  flowCard: { padding: 18, marginBottom: 14 },
  flowLabel: { fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 },
  flowAmount: { marginBottom: 14 },
  incomeExpenseRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 10 },
  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  subLabel: {},
  subVal: { marginTop: 2 },

  sectionTitle: { marginBottom: 10 },

  // Hızlı Bakış Grid
  quickGlanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  glanceBox: { width: '48%', padding: 14 },
  glanceIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  glanceBadgeText: { fontWeight: 'bold', letterSpacing: 0.5 },
  glanceMainVal: {},
  glanceDesc: { marginTop: 2 },

  maxExpenseBanner: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 16 },
  bannerIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  bannerTitle: { fontWeight: 'bold', letterSpacing: 0.5 },
  bannerSubtitle: { marginTop: 2 },

  viewModeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 6 },
  chartSwitcher: { flexDirection: 'row', padding: 3 },
  chartSwitchBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10 },

  categoryRowCard: { padding: 14, marginBottom: 10 },
  catTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catIconBox: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  catName: {},
  catAmount: {},
  catPercent: {},
  catBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3 },

  trendCard: { padding: 16, marginBottom: 14 },
  trendCardTitle: {},
  trendBarsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, paddingTop: 10 },
  trendCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  trendSpentText: { marginBottom: 4 },
  trendBarTrack: { width: 14, height: 90, borderRadius: 7, justifyContent: 'flex-end', overflow: 'hidden' },
  trendBarFill: { width: '100%', borderRadius: 7 },
  trendDayText: {},

  emptyBox: { padding: 32, alignItems: 'center', marginTop: 10 },
  emptyText: { marginTop: 8, opacity: 0.6 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  monthModalCard: { padding: 20, paddingBottom: 40 },
  sheetPill: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.4)', alignSelf: 'center', marginBottom: 16 },
  monthHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthModalTitle: {},
  yearRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 20 },
  yearArrowBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  yearBadge: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 16 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  monthGridItem: { width: '22%', paddingVertical: 14, alignItems: 'center' },
  monthGridItemText: {}
});
