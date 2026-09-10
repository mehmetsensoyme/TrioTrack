export interface FinancialGoal {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
}

export const FINANCIAL_GOALS: FinancialGoal[] = [
  {
    id: 'daily_pocket',
    title: 'Günlük Harçlığımı Bilmek',
    subtitle: 'Günü kurtaracak net günlük harcanabilir limiti anlık bilerek stressiz yaşayın.',
    icon: 'cafe-outline',
    color: '#EA580C',
    badge: 'Buckwheat Zekası',
  },
  {
    id: 'saving',
    title: 'Gereksiz Harcamaları Kısıp Birikim Yapmak',
    subtitle: 'Aylık gelirinizden artan tutarla acil durum fonu ve düzenli birikim oluşturun.',
    icon: 'trending-up-outline',
    color: '#4CAF50',
    badge: 'Tasarruf & Varlık',
  },
  {
    id: 'debt_free',
    title: 'Borçları Adım Adım Kapatmak',
    subtitle: 'Kredi kartı ve kişi borçlarınızı adım adım sıfırlayana kadar disiplinli takip.',
    icon: 'shield-checkmark-outline',
    color: '#2196F3',
    badge: 'Sıfır Borç',
  },
  {
    id: 'zero_budget',
    title: 'Gelir-Gider Dengesini Sıfır Tabanlı Tutmak',
    subtitle: 'Her kuruşa bir görev verin, ay sonunda sürpriz açıklarla karşılaşmayın.',
    icon: 'scale-outline',
    color: '#6750A4',
    badge: 'Sıfır Tabanlı (Zero)',
  },
  {
    id: 'investing',
    title: 'Yatırım ve Net Varlık Büyütme',
    subtitle: 'Tüm cüzdan, döviz ve birikimlerinizin toplam net değerini büyütmeye odaklanın.',
    icon: 'rocket-outline',
    color: '#E91E63',
    badge: 'Net Varlık (Paisa)',
  },
];

export const SAVINGS_TARGET_OPTIONS = [
  { percent: 10, label: '%10', desc: 'Rahat Başlangıç' },
  { percent: 20, label: '%20', desc: '50/30/20 Kuralı (Popüler)' },
  { percent: 30, label: '%30', desc: 'Hızlı Birikim' },
  { percent: 50, label: '%50', desc: 'Finansal Özgürlük (FIRE)' },
];

export function getFinancialGoal(id: string | undefined | null): FinancialGoal {
  const found = FINANCIAL_GOALS.find(g => g.id === id);
  return found || FINANCIAL_GOALS[0];
}
