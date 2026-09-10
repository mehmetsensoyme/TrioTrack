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
    title: 'Günlük Harçlık',
    subtitle: 'Günü kurtaracak net günlük limiti anlık bilerek stressiz harcayın.',
    icon: 'cafe-outline',
    color: '#EA580C',
    badge: 'Buckwheat',
  },
  {
    id: 'saving',
    title: 'Tasarruf & Birikim',
    subtitle: 'Gereksiz harcamaları kısıp acil durum fonu ve düzenli birikim yapın.',
    icon: 'trending-up-outline',
    color: '#4CAF50',
    badge: 'Varlık',
  },
  {
    id: 'debt_free',
    title: 'Borçları Kapatma',
    subtitle: 'Kredi kartı ve kişi borçlarınızı adım adım sıfırlayana kadar takip edin.',
    icon: 'shield-checkmark-outline',
    color: '#2196F3',
    badge: 'Sıfır Borç',
  },
  {
    id: 'zero_budget',
    title: 'Sıfır Tabanlı Bütçe',
    subtitle: 'Her kuruşa bir görev verin, ay sonunda sürpriz açıklarla karşılaşmayın.',
    icon: 'scale-outline',
    color: '#6750A4',
    badge: 'Zero',
  },
  {
    id: 'investing',
    title: 'Net Varlık & Yatırım',
    subtitle: 'Tüm cüzdan, döviz ve birikimlerinizin toplam değerini büyütün.',
    icon: 'rocket-outline',
    color: '#E91E63',
    badge: 'Paisa',
  },
];

export interface SavingsTargetOption {
  percent: number;
  label: string;
  badge?: string;
  title: string;
  desc: string;
}

export const SAVINGS_TARGET_OPTIONS: SavingsTargetOption[] = [
  {
    percent: 10,
    label: '%10',
    title: 'Rahat Başlangıç',
    desc: 'Bütçenizi hiç zorlamadan düzenli birikim alışkanlığı kazandırır.',
  },
  {
    percent: 20,
    label: '%20',
    badge: 'Önerilen',
    title: '50/30/20 Altın Kuralı',
    desc: 'Gelirinizin %50’si ihtiyaçlara, %30’u isteklere, %20’si birikime ayrılır.',
  },
  {
    percent: 30,
    label: '%30',
    title: 'Hızlı Birikim',
    desc: 'Hedeflerinize ve acil durum fonunuza daha çabuk ulaşmak için yüksek disiplin.',
  },
  {
    percent: 50,
    label: '%50',
    badge: 'FIRE',
    title: 'Finansal Özgürlük',
    desc: 'Maksimum tasarruf ve yatırımla erken finansal bağımsızlık stratejisi.',
  },
];

export function getFinancialGoal(id: string | undefined | null): FinancialGoal {
  const found = FINANCIAL_GOALS.find(g => g.id === id);
  return found || FINANCIAL_GOALS[0];
}

export function getSavingsTargetOption(percent: number | undefined | null): SavingsTargetOption {
  const found = SAVINGS_TARGET_OPTIONS.find(o => o.percent === percent);
  return found || SAVINGS_TARGET_OPTIONS[1];
}
