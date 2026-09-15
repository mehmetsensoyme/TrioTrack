import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useData, Category, Transaction } from '../context/DataContext';
import { formatCurrency, formatNumber, parseCurrencyInput } from '../utils/formatUtils';
import CurrencyInputField from '../components/CurrencyInputField';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const MONTH_ABBR = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
];

export default function ReportsScreen({ navigation }: any) {
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

  const [chartMode, setChartMode] = useState<'categories' | 'trend' | 'salary'>('categories');
  const [categoryViewMode, setCategoryViewMode] = useState<'bars' | 'pie'>('bars');
  const [showMonthModal, setShowMonthModal] = useState(false);

  // Maaş ve Ekonomik Projeksiyon Simülatör Durumları
  const [baseSalaryInput, setBaseSalaryInput] = useState<string>('');
  const [raisePercent, setRaisePercent] = useState<number>(30); // Varsayılan %30 zam
  const [customRaiseInput, setCustomRaiseInput] = useState<string>('30');
  const [expenseInflationPercent, setExpenseInflationPercent] = useState<number>(15); // Varsayılan %15 gider artışı
  const [projectionMonths, setProjectionMonths] = useState<6 | 12>(6);

  // Seçili Yıl ve Ay Ayrıştırması
  const [currentYear, currentMonthStr] = selectedMonth.split('-');
  const selectedMonthIndex = parseInt(currentMonthStr, 10) - 1;
  const [pickerYear, setPickerYear] = useState(parseInt(currentYear, 10));

  const m = tStyles.fontSizeMultiplier;

  // Otomatik tespit edilen baz maaş (Eğer kullanıcı elle girmediyse bu ayki gelirlerden alır)
  const effectiveBaseSalary = useMemo(() => {
    const manual = parseCurrencyInput(baseSalaryInput);
    if (!isNaN(manual) && manual > 0) return manual;
    return totalIncomeThisMonth > 0 ? totalIncomeThisMonth : 45000;
  }, [baseSalaryInput, totalIncomeThisMonth]);

  // Maaş Zam Simülasyonu & 6-12 Aylık Ekonomik Projeksiyon
  const salarySimulation = useMemo(() => {
    const raiseRate = (raisePercent || 0) / 100;
    const inflationRate = (expenseInflationPercent || 0) / 100;

    const newSalary = effectiveBaseSalary * (1 + raiseRate);
    const salaryIncreaseAmount = newSalary - effectiveBaseSalary;

    // Mevcut aylık gider ve zam sonrası enflasyonlu aylık gider
    const baseMonthlyExpense = totalExpenseThisMonth > 0 ? totalExpenseThisMonth : (effectiveBaseSalary * 0.7);
    const newMonthlyExpense = baseMonthlyExpense * (1 + inflationRate);

    // Aylık net nakit akışı (Zam öncesi vs Zam sonrası)
    const currentMonthlySaving = effectiveBaseSalary - baseMonthlyExpense;
    const newMonthlySaving = newSalary - newMonthlyExpense;
    const monthlySavingDiff = newMonthlySaving - currentMonthlySaving;

    // Ay ay projeksiyon simülasyonu
    const monthlyProjections: Array<{
      monthIndex: number;
      monthName: string;
      currentScenarioCumulative: number;
      newScenarioCumulative: number;
    }> = [];

    const now = new Date();
    let currentCumulative = 0;
    let newCumulative = 0;

    for (let i = 1; i <= projectionMonths; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const mName = MONTH_ABBR[futureDate.getMonth()];
      currentCumulative += currentMonthlySaving;
      newCumulative += newMonthlySaving;

      monthlyProjections.push({
        monthIndex: i,
        monthName: `${mName}`,
        currentScenarioCumulative: Math.round(currentCumulative),
        newScenarioCumulative: Math.round(newCumulative),
      });
    }

    const maxSimCumulative = Math.max(
      ...monthlyProjections.map(p => Math.max(Math.abs(p.currentScenarioCumulative), Math.abs(p.newScenarioCumulative))),
      1
    );

    return {
      effectiveBaseSalary,
      newSalary,
      salaryIncreaseAmount,
      baseMonthlyExpense,
      newMonthlyExpense,
      currentMonthlySaving,
      newMonthlySaving,
      monthlySavingDiff,
      monthlyProjections,
      maxSimCumulative,
    };
  }, [effectiveBaseSalary, raisePercent, expenseInflationPercent, totalExpenseThisMonth, projectionMonths]);

  // Seçili ay için işlemler (useMemo ile optimize edildi)
  const { monthTransactions, monthExpenses } = useMemo(() => {
    const txs = transactions.filter((tx: Transaction) => tx.date.startsWith(selectedMonth));
    const exp = txs.filter((tx: Transaction) => tx.type === 'expense');
    return { monthTransactions: txs, monthExpenses: exp };
  }, [transactions, selectedMonth]);

  // Kategori bazlı harcama dağılımı (useMemo ile optimize edildi)
  const categoryBreakdown = useMemo(() => {
    return categories
      .filter((cat: Category) => cat.type === 'expense')
      .map((cat: Category) => {
        const spent = monthExpenses
          .filter((tx: Transaction) => tx.categoryId === cat.id)
          .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
        const count = monthExpenses.filter((tx: Transaction) => tx.categoryId === cat.id).length;
        const percentage = totalExpenseThisMonth > 0 ? Math.round((spent / totalExpenseThisMonth) * 100) : 0;
        return { ...cat, spent, count, percentage };
      })
      .filter(cat => cat.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categories, monthExpenses, totalExpenseThisMonth]);

  // 1. Paisa Hızlı Bakış Metrikleri
  const { netSavings, savingsRate, topCategory, maxExpense } = useMemo(() => {
    const net = totalIncomeThisMonth - totalExpenseThisMonth;
    const rate = totalIncomeThisMonth > 0 
      ? Math.max(0, Math.round((net / totalIncomeThisMonth) * 100)) 
      : 0;
    const top = categoryBreakdown[0];
    const max = monthExpenses.reduce((m: Transaction, tx: Transaction) => (tx.amount > (m?.amount || 0) ? tx : m), monthExpenses[0]);
    return { netSavings: net, savingsRate: rate, topCategory: top, maxExpense: max };
  }, [totalIncomeThisMonth, totalExpenseThisMonth, categoryBreakdown, monthExpenses]);

  // Son 7 günlük harcama trendi (useMemo ile optimize edildi)
  const { last7Days, maxDaySpend } = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('tr-TR', { weekday: 'short' });
      const spent = transactions
        .filter((tx: Transaction) => tx.type === 'expense' && tx.date === dateStr)
        .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
      return { dateStr, dayLabel, spent };
    });
    const maxSpend = Math.max(...days.map(d => d.spent), 1);
    return { last7Days: days, maxDaySpend: maxSpend };
  }, [transactions]);

  const handleSelectMonth = (mIndex: number) => {
    const monthFormatted = String(mIndex + 1).padStart(2, '0');
    setSelectedMonth(`${pickerYear}-${monthFormatted}`);
    setShowMonthModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* 🌟 FİNANSAL ANALİZ STANDART MODÜL HEADER */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minHeight: 46 }}>
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
            <Ionicons name="pie-chart-outline" size={24} color={colors.primary} />
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
                Finansal Analiz
              </Text>
              <TouchableOpacity 
                style={[styles.countBadge, { backgroundColor: colors.primary + '15' }]}
                onPress={() => {
                  setPickerYear(parseInt(currentYear, 10));
                  setShowMonthModal(true);
                }}
              >
                <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 10 * m, fontWeight: 'bold' }}>
                  {MONTH_NAMES[selectedMonthIndex]} {currentYear}
                </Text>
              </TouchableOpacity>
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
              Aylık nakit akışı ve harcama dağılımı
            </Text>
          </View>
        </View>

        {/* Ay Seçici (📅) Aksiyon Butonu - Çark (⚙️) kaldırıldı */}
        <TouchableOpacity 
          style={[styles.headerActionBtn, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}
          onPress={() => {
            setPickerYear(parseInt(currentYear, 10));
            setShowMonthModal(true);
          }}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
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
            {formatCurrency(netSavings, currency, { showSign: true })}
          </Text>

          <View style={styles.incomeExpenseRow}>
            <View style={styles.rowItem}>
              <View style={[styles.smallBadge, { backgroundColor: isDark ? '#2E7D32' : '#E8F5E9' }]}>
                <Ionicons name="arrow-down" size={12} color={isDark ? '#81C784' : '#2E7D32'} />
              </View>
              <View>
                <Text style={[styles.subLabel, { color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }]}>Toplam Gelir</Text>
                <Text style={[styles.subVal, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: 'bold' }]}>
                  {formatCurrency(totalIncomeThisMonth, currency, { sign: '+' })}
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
                  {formatCurrency(totalExpenseThisMonth, currency, { sign: '-' })}
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
              {formatCurrency(buckwheatMetrics.averageDailySpent, currency)}
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
              {topCategory ? formatCurrency(topCategory.spent, currency) : '-'}
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
              {formatCurrency(maxExpense.amount, currency, { sign: '-' })}
            </Text>
          </View>
        )}

        {/* 3. GRAFİK & GÖRÜNÜM MODU SEÇİCİ (Kategori vs Trend vs Maaş & Projeksiyon) */}
        <View style={styles.viewModeRow}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 15 * m, fontWeight: tStyles.titleWeight }]}>
            {chartMode === 'salary' ? 'Maaş & Projeksiyon' : 'Görsel Dağılım'}
          </Text>
          <View style={[styles.chartSwitcher, { backgroundColor: colors.card, borderRadius: Math.max(tStyles.roundness / 2, 8) }]}>
            <TouchableOpacity 
              style={[styles.chartSwitchBtn, chartMode === 'categories' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              onPress={() => setChartMode('categories')}
            >
              <Ionicons name="pie-chart-outline" size={13} color={chartMode === 'categories' ? colors.onPrimary : colors.text} />
              <Text style={{ color: chartMode === 'categories' ? colors.onPrimary : colors.text, fontSize: 10.5 * m, fontWeight: 'bold', marginLeft: 3 }}>
                Kategori
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.chartSwitchBtn, chartMode === 'trend' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              onPress={() => setChartMode('trend')}
            >
              <Ionicons name="trending-up-outline" size={13} color={chartMode === 'trend' ? colors.onPrimary : colors.text} />
              <Text style={{ color: chartMode === 'trend' ? colors.onPrimary : colors.text, fontSize: 10.5 * m, fontWeight: 'bold', marginLeft: 3 }}>
                Trend
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.chartSwitchBtn, chartMode === 'salary' && { backgroundColor: colors.primary, borderRadius: Math.max(tStyles.roundness / 2, 6) }]}
              onPress={() => setChartMode('salary')}
            >
              <Ionicons name="calculator-outline" size={13} color={chartMode === 'salary' ? colors.onPrimary : colors.text} />
              <Text style={{ color: chartMode === 'salary' ? colors.onPrimary : colors.text, fontSize: 10.5 * m, fontWeight: 'bold', marginLeft: 3 }}>
                Maaş Simülatörü
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MOD 1: KATEGORİ DAĞILIMI (PASTA DİLİMLERİ & ÇUBUK SEÇENEKLİ) */}
        {chartMode === 'categories' && (
          <View>
            {categoryBreakdown.length > 0 && (
              <View style={styles.categorySubToggleRow}>
                <TouchableOpacity 
                  style={[styles.categorySubBtn, categoryViewMode === 'bars' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                  onPress={() => setCategoryViewMode('bars')}
                >
                  <Ionicons name="stats-chart-outline" size={13} color={categoryViewMode === 'bars' ? colors.primary : colors.text} />
                  <Text style={{ color: categoryViewMode === 'bars' ? colors.primary : colors.text, fontSize: 11 * m, fontWeight: '600', marginLeft: 4 }}>
                    Çubuk Dağılımı
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.categorySubBtn, categoryViewMode === 'pie' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                  onPress={() => setCategoryViewMode('pie')}
                >
                  <Ionicons name="pie-chart" size={13} color={categoryViewMode === 'pie' ? colors.primary : colors.text} />
                  <Text style={{ color: categoryViewMode === 'pie' ? colors.primary : colors.text, fontSize: 11 * m, fontWeight: '600', marginLeft: 4 }}>
                    Pasta Dağılımı
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {categoryBreakdown.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderRadius: tStyles.roundness }]}>
                <Text style={{ fontSize: 28 }}>📊</Text>
                <Text style={[styles.emptyText, { color: colors.text, fontFamily: tStyles.fontFamily }]}>
                  Seçilen dönemde henüz bir harcama kaydı yok.
                </Text>
              </View>
            ) : categoryViewMode === 'pie' ? (
              /* PASTA GRAFİĞİ (PIE & SEGMENTED DONUT) */
              <View style={[styles.pieCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
                <Text style={[styles.pieTitle, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
                  Kategori Harcama Payı (Pasta Görünümü)
                </Text>
                
                {/* Segmentli Halka / Donut Göstergesi */}
                <View style={styles.donutContainer}>
                  <View style={[styles.donutRing, { borderColor: isDark ? '#374151' : '#E2E8F0' }]}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 11 * m, color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily }}>TOPLAM</Text>
                      <Text style={{ fontSize: 15 * m, color: colors.text, fontWeight: 'bold', fontFamily: tStyles.fontFamily, marginTop: 2 }}>
                        {formatCurrency(totalExpenseThisMonth, currency)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Yüzdesel Renkli Segment Çubuğu */}
                <View style={styles.segmentedProgressBar}>
                  {categoryBreakdown.map(cat => (
                    <View 
                      key={cat.id} 
                      style={{ 
                        flex: Math.max(cat.percentage, 2), 
                        height: 12, 
                        backgroundColor: cat.color,
                        marginHorizontal: 1,
                        borderRadius: 2
                      }} 
                    />
                  ))}
                </View>

                {/* Pasta Açıklamaları (Legend) */}
                <View style={styles.pieLegendGrid}>
                  {categoryBreakdown.map(cat => (
                    <View key={cat.id} style={styles.pieLegendItem}>
                      <View style={[styles.pieLegendDot, { backgroundColor: cat.color }]} />
                      <Text style={[styles.pieLegendName, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 11.5 * m }]} numberOfLines={1}>
                        {cat.name}
                      </Text>
                      <Text style={[styles.pieLegendPercent, { color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 11 * m, fontWeight: 'bold' }]}>
                        %{cat.percentage}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              /* STANDART ÇUBUK KARTLARI */
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
                        {formatCurrency(cat.spent, currency)}
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

        {/* MOD 3: MAAŞ HESAPLAMA SİSTEMİ & GELECEK EKONOMİK GRAFİK PROJEKSİYONU */}
        {chartMode === 'salary' && (
          <View>
            {/* 1. Maaş Girdi & Parametre Kartı */}
            <View style={[styles.salaryConfigCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.salaryIconBadge, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="cash-outline" size={20} color="#10B981" />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }}>
                    Mevcut Net Maaş / Gelir
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.6, fontFamily: tStyles.fontFamily, fontSize: 11 * m }}>
                    {baseSalaryInput ? 'Elle girildi' : 'Bu ayki gelirlerden otomatik çekildi'}
                  </Text>
                </View>
              </View>

              {/* Para Giriş Alanı */}
              <View style={[styles.salaryInputBox, { backgroundColor: colors.background, borderColor: colors.primary + '35' }]}>
                <Text style={{ fontSize: 18 * m, fontWeight: 'bold', color: colors.text, marginRight: 6 }}>
                  {currency}
                </Text>
                <CurrencyInputField 
                  value={baseSalaryInput || formatNumber(salarySimulation.effectiveBaseSalary)}
                  onChangeText={(formatted) => setBaseSalaryInput(formatted)}
                  placeholder="0,00"
                  style={{ fontSize: 18 * m, fontWeight: 'bold', color: colors.text, flex: 1, fontFamily: tStyles.fontFamily }}
                  cursorColor={colors.primary}
                />
              </View>

              {/* Zam Yüzdesi Seçici Çipleri */}
              <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 12 * m, fontWeight: 'bold', marginTop: 14, marginBottom: 8 }}>
                BEKLENEN ZAM ORANI (%)
              </Text>
              <View style={styles.percentChipsRow}>
                {[15, 25, 30, 40, 50].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    style={[
                      styles.percentChip,
                      { backgroundColor: raisePercent === pct ? colors.primary : colors.background },
                      raisePercent === pct && { borderColor: colors.primary }
                    ]}
                    onPress={() => {
                      setRaisePercent(pct);
                      setCustomRaiseInput(String(pct));
                    }}
                  >
                    <Text style={{ 
                      color: raisePercent === pct ? colors.onPrimary : colors.text, 
                      fontSize: 11.5 * m, 
                      fontWeight: 'bold',
                      fontFamily: tStyles.fontFamily 
                    }}>
                      %{pct}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {/* Özel Yüzde Giriş Kutucuğu */}
                <View style={[styles.customPercentInputBox, { backgroundColor: colors.background, borderColor: colors.primary + '30' }]}>
                  <Text style={{ fontSize: 11 * m, color: colors.text, opacity: 0.6 }}>%</Text>
                  <TextInput 
                    keyboardType="numeric"
                    value={customRaiseInput}
                    onChangeText={(txt) => {
                      const num = parseInt(txt.replace(/\D/g, ''), 10);
                      setCustomRaiseInput(txt);
                      setRaisePercent(isNaN(num) ? 0 : num);
                    }}
                    placeholder="Özel"
                    placeholderTextColor={colors.text + '40'}
                    style={{ fontSize: 11.5 * m, fontWeight: 'bold', color: colors.text, width: 36, textAlign: 'center', padding: 0 }}
                  />
                </View>
              </View>

              {/* Enflasyon / Gider Artış Oranı */}
              <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.text, opacity: 0.7, fontFamily: tStyles.fontFamily, fontSize: 11.5 * m }}>
                    Beklenen Gider / Enflasyon Artışı:
                  </Text>
                  <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 12 * m, fontFamily: tStyles.fontFamily }}>
                    %{expenseInflationPercent}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                  {[0, 10, 15, 25, 35].map(inf => (
                    <TouchableOpacity
                      key={inf}
                      style={[
                        styles.miniInfChip,
                        { backgroundColor: expenseInflationPercent === inf ? '#EF4444' : colors.background }
                      ]}
                      onPress={() => setExpenseInflationPercent(inf)}
                    >
                      <Text style={{ 
                        color: expenseInflationPercent === inf ? '#FFF' : colors.text, 
                        fontSize: 10 * m, 
                        fontWeight: 'bold' 
                      }}>
                        %{inf}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* 2. Sonraki Maaş ve Net Fark Karşılaştırma Kartı */}
            <View style={[styles.salaryResultCard, { backgroundColor: colors.primary, borderRadius: tStyles.roundness }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.onPrimary, opacity: 0.8, fontSize: 11.5 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily }}>
                  ZAMLI YENİ MAAŞ TAHMİNİ (+%{raisePercent})
                </Text>
                <View style={{ backgroundColor: colors.onPrimary + '25', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                  <Text style={{ color: colors.onPrimary, fontSize: 10 * m, fontWeight: 'bold' }}>ÖN GÖSTERİM</Text>
                </View>
              </View>

              <Text style={{ color: colors.onPrimary, fontSize: 26 * m, fontWeight: 'bold', fontFamily: tStyles.fontFamily, marginTop: 4 }}>
                {formatCurrency(salarySimulation.newSalary, currency)}
              </Text>

              <View style={styles.salaryDiffRow}>
                <View>
                  <Text style={{ color: colors.onPrimary, opacity: 0.75, fontSize: 10.5 * m }}>Aylık Net Maaş Artışı</Text>
                  <Text style={{ color: isDark ? '#A7F3D0' : '#DCFCE7', fontSize: 14 * m, fontWeight: 'bold' }}>
                    +{formatCurrency(salarySimulation.salaryIncreaseAmount, currency)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.onPrimary, opacity: 0.75, fontSize: 10.5 * m }}>Aylık Net Tasarruf Farkı</Text>
                  <Text style={{ color: salarySimulation.monthlySavingDiff >= 0 ? (isDark ? '#A7F3D0' : '#DCFCE7') : '#FECDD3', fontSize: 14 * m, fontWeight: 'bold' }}>
                    {formatCurrency(salarySimulation.monthlySavingDiff, currency, { showSign: true })}
                  </Text>
                </View>
              </View>
            </View>

            {/* 3. GELECEK EKONOMİK GRAFİK PROJEKSİYONU (KÜMÜLATİF TASARRUF & BÜYÜME) */}
            <View style={[styles.projectionGraphCard, { backgroundColor: colors.card, borderRadius: tStyles.roundness, elevation: tStyles.elevation }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View>
                  <Text style={{ color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }}>
                    Gelecek Ekonomik Projeksiyon Grafiği
                  </Text>
                  <Text style={{ color: colors.text, opacity: 0.6, fontSize: 10.5 * m, fontFamily: tStyles.fontFamily }}>
                    Mevcut durum vs Zamlı yeni durum kümülatif birikim
                  </Text>
                </View>

                {/* 6 Ay / 12 Ay Geçiş Hapı */}
                <View style={[styles.periodToggleBox, { backgroundColor: colors.background }]}>
                  <TouchableOpacity 
                    style={[styles.periodToggleBtn, projectionMonths === 6 && { backgroundColor: colors.primary }]}
                    onPress={() => setProjectionMonths(6)}
                  >
                    <Text style={{ color: projectionMonths === 6 ? colors.onPrimary : colors.text, fontSize: 10 * m, fontWeight: 'bold' }}>6 Ay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodToggleBtn, projectionMonths === 12 && { backgroundColor: colors.primary }]}
                    onPress={() => setProjectionMonths(12)}
                  >
                    <Text style={{ color: projectionMonths === 12 ? colors.onPrimary : colors.text, fontSize: 10 * m, fontWeight: 'bold' }}>12 Ay</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sütun Karşılaştırma Grafiği */}
              <View style={styles.projectionChartContainer}>
                {salarySimulation.monthlyProjections.map((proj) => {
                  const currentHeight = Math.max(6, Math.min(100, Math.round((Math.max(0, proj.currentScenarioCumulative) / salarySimulation.maxSimCumulative) * 90)));
                  const newHeight = Math.max(6, Math.min(100, Math.round((Math.max(0, proj.newScenarioCumulative) / salarySimulation.maxSimCumulative) * 90)));

                  return (
                    <View key={proj.monthIndex} style={styles.projectionMonthCol}>
                      <View style={styles.dualBarsWrapper}>
                        {/* Mevcut Durum Sütunu */}
                        <View style={[styles.projSingleBar, { height: `${currentHeight}%`, backgroundColor: isDark ? '#4B5563' : '#CBD5E1' }]} />
                        {/* Zamlı Yeni Durum Sütunu */}
                        <View style={[styles.projSingleBar, { height: `${newHeight}%`, backgroundColor: colors.primary }]} />
                      </View>
                      <Text style={{ color: colors.text, opacity: 0.8, fontSize: 9.5 * m, fontFamily: tStyles.fontFamily, marginTop: 6 }}>
                        {proj.monthName}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Grafik Lejantı */}
              <View style={styles.chartLegendRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.legendBoxIndicator, { backgroundColor: isDark ? '#4B5563' : '#CBD5E1' }]} />
                  <Text style={{ color: colors.text, opacity: 0.7, fontSize: 10.5 * m, fontFamily: tStyles.fontFamily }}>Mevcut Seyir</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.legendBoxIndicator, { backgroundColor: colors.primary }]} />
                  <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 10.5 * m, fontFamily: tStyles.fontFamily }}>Zamlı Yeni Seyir</Text>
                </View>
              </View>

              {/* Projeksiyon Sonu Toplam Fark Özeti */}
              <View style={[styles.projectionSummaryBox, { backgroundColor: colors.background, borderRadius: 10 }]}>
                <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 11.5 * m, fontFamily: tStyles.fontFamily, flex: 1, marginLeft: 8 }}>
                  {projectionMonths} ayın sonunda kasanızda fazladan{' '}
                  <Text style={{ fontWeight: 'bold', color: colors.primary }}>
                    {formatCurrency(
                      (salarySimulation.monthlyProjections[salarySimulation.monthlyProjections.length - 1]?.newScenarioCumulative || 0) -
                      (salarySimulation.monthlyProjections[salarySimulation.monthlyProjections.length - 1]?.currentScenarioCumulative || 0),
                      currency
                    )}
                  </Text>
                  {' '}net birikim oluşacağı öngörülüyor.
                </Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* ZERO TARZI AY VE YIL SEÇİCİ BOTTOM SHEET MODALI */}
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

  // Kategori Alt Görünüm Seçici (Çubuk / Pasta)
  categorySubToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  categorySubBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },

  // Pasta Grafiği Görünümü (Pie / Donut)
  pieCard: { padding: 18, marginBottom: 14 },
  pieTitle: { marginBottom: 14 },
  donutContainer: { alignItems: 'center', marginVertical: 12 },
  donutRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 12, justifyContent: 'center', alignItems: 'center' },
  segmentedProgressBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginVertical: 12, width: '100%' },
  pieLegendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  pieLegendItem: { flexDirection: 'row', alignItems: 'center', width: '48%', paddingVertical: 4 },
  pieLegendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  pieLegendName: { flex: 1 },
  pieLegendPercent: { marginLeft: 4 },

  // Maaş Simülatörü ve Ekonomik Projeksiyon Stilleri
  salaryConfigCard: { padding: 16, marginBottom: 14 },
  salaryIconBadge: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  salaryInputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 4 },
  percentChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  percentChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  customPercentInputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  miniInfChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },

  salaryResultCard: { padding: 18, marginBottom: 14 },
  salaryDiffRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)', paddingTop: 12, marginTop: 12 },

  projectionGraphCard: { padding: 16, marginBottom: 14 },
  periodToggleBox: { flexDirection: 'row', borderRadius: 8, padding: 2 },
  periodToggleBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  projectionChartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingTop: 16, paddingBottom: 6 },
  projectionMonthCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  dualBarsWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 120, width: '100%', justifyContent: 'center' },
  projSingleBar: { width: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLegendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  legendBoxIndicator: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
  projectionSummaryBox: { flexDirection: 'row', alignItems: 'center', padding: 12, marginTop: 12 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'flex-end' },
  backdropDismissArea: { flex: 1, width: '100%' },
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
