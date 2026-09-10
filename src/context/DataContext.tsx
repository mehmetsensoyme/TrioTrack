import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../watermelondb/database';
import { APP_VERSION } from '../constants/version';
import { parseAndNormalizeBackup, saveLocalSnapshot } from '../utils/backupService';

const STORAGE_KEY = '@triotrack_data_v1';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: string; // YYYY-MM-DD
  note?: string;
  receiptImage?: string; // Fiş/fatura görseli (gerçek kamera URI veya base64)
  receiptNo?: string; // Fiş veya fatura numarası (örn: FİŞ NO: #0482)
  customIcon?: string; // Özel logo veya simge
  customColor?: string; // Özel renk
  brandLogoUrl?: string; // CDN Marka Logosu URL'i (örn: Netflix, Spotify, Starbucks)
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'card' | 'savings';
  balance: number;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export interface CategoryBudget {
  id: string;
  categoryId: string;
  amount: number; // Aylık limit
}

export type DebtCategory = 'person' | 'credit_card' | 'emi' | 'loan';

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debtor {
  id: string;
  name: string;
  type: 'owe_me' | 'i_owe'; // owe_me = Alacak (Bana borçlu), i_owe = Borç (Ben borçluyum)
  debtCategory?: DebtCategory;
  amount: number; // Toplam tutar
  paidAmount?: number; // Şu ana kadar ödenen kısmi tutar
  payments?: DebtPayment[]; // Kısmi ödeme geçmişi
  dueDate?: string; // Vade Tarihi (Zero esintisi: YYYY-MM-DD)
  note: string;
  date: string;
  settled: boolean;
}

export interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  accountId: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  active: boolean;
}

export interface BuckwheatMetrics {
  monthlyBudget: number;
  totalSpentThisMonth: number;
  daysInMonth: number;
  currentDay: number;
  daysRemaining: number;
  dailyAllowance: number; // Bugün harcanabilecek limit
  todaySpent: number; // Bugün harcanan
  todayRemaining: number; // Bugün kalan
  averageDailySpent: number;
  budgetStatus: 'healthy' | 'warning' | 'exceeded';
  recalcMode: 'split_to_rest_days' | 'add_to_today';
  cycleStartDay: number; // Buckwheat döngü başlangıç günü (1-28)
  statusText: string;
  statusLevel: 'success' | 'warning' | 'danger';
  projectedMonthEndExpense: number;
}

interface DataContextProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: CategoryBudget[];
  debtors: Debtor[];
  recurringItems: RecurringItem[];
  budgetRecalcMode: 'split_to_rest_days' | 'add_to_today';
  setBudgetRecalcMode: (mode: 'split_to_rest_days' | 'add_to_today') => Promise<void>;
  budgetCycleDay: number;
  setBudgetCycleDay: (day: number) => Promise<void>;
  monthlyBudgetGoal: number;
  totalBalance: number;
  isBalanceHidden: boolean;
  toggleBalanceHidden: () => Promise<void>;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  buckwheatMetrics: BuckwheatMetrics;
  isOnboarded: boolean;
  isLoaded: boolean;
  userName: string;
  setUserName: (name: string) => void;
  weekStartMonday: boolean;
  setWeekStartMonday: (val: boolean) => Promise<void>;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  completeOnboarding: (params: {
    name: string;
    currency: string;
    accountName?: string;
    initialBalance?: number;
    monthlyGoal?: number;
    weekStartMonday?: boolean;
    budgetCycleDay?: number;
    selectedCategoryIds?: string[];
  }) => Promise<void>;
  
  // Eylemler
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  editTransaction: (id: string, updated: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (acc: Omit<Account, 'id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  updateAccountBalance: (id: string, newBalance: number) => Promise<void>;
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setCategoryBudget: (categoryId: string, amount: number) => Promise<void>;
  setMonthlyBudgetGoal: (amount: number) => void;
  addDebtor: (debtor: Omit<Debtor, 'id' | 'settled'>) => Promise<void>;
  settleDebtor: (id: string) => Promise<void>;
  recordDebtPayment: (debtorId: string, paymentAmount: number, note?: string) => Promise<void>;
  deleteDebtor: (id: string) => Promise<void>;
  addRecurringItem: (item: Omit<RecurringItem, 'id'>) => Promise<void>;
  toggleRecurringItem: (id: string) => Promise<void>;
  deleteRecurringItem: (id: string) => Promise<void>;
  exportDataAsJSON: () => string;
  importDataFromJSON: (jsonString: string) => Promise<{ success: boolean; message: string }>;
  resetAllData: () => Promise<void>;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_market', name: 'Market & Gıda', icon: 'cart-outline', color: '#FF9800', type: 'expense' },
  { id: 'cat_dining', name: 'Yemek & Kafe', icon: 'fast-food-outline', color: '#E91E63', type: 'expense' },
  { id: 'cat_transport', name: 'Ulaşım & Akaryakıt', icon: 'car-outline', color: '#2196F3', type: 'expense' },
  { id: 'cat_bills', name: 'Faturalar & Abonelik', icon: 'receipt-outline', color: '#9C27B0', type: 'expense' },
  { id: 'cat_entertainment', name: 'Eğlence & Hobi', icon: 'film-outline', color: '#4CAF50', type: 'expense' },
  { id: 'cat_health', name: 'Sağlık & Eczane', icon: 'medkit-outline', color: '#F44336', type: 'expense' },
  { id: 'cat_transfer', name: 'Hesap Transferi', icon: 'swap-horizontal-outline', color: '#7C3AED', type: 'expense' },
  { id: 'cat_salary', name: 'Maaş & Gelir', icon: 'cash-outline', color: '#009688', type: 'income' },
  { id: 'cat_freelance', name: 'Ek Gelir', icon: 'laptop-outline', color: '#3F51B5', type: 'income' },
];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_cash', name: 'Nakit Cüzdan', type: 'cash', balance: 0, color: '#4CAF50', icon: 'wallet-outline' },
];

const DEFAULT_BUDGETS: CategoryBudget[] = [];
const DEFAULT_DEBTORS: Debtor[] = [];
const DEFAULT_RECURRING: RecurringItem[] = [];

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const DEFAULT_TRANSACTIONS: Transaction[] = [];

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(DEFAULT_BUDGETS);
  const [debtors, setDebtors] = useState<Debtor[]>(DEFAULT_DEBTORS);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>(DEFAULT_RECURRING);
  const [budgetRecalcMode, setBudgetRecalcModeState] = useState<'split_to_rest_days' | 'add_to_today'>('split_to_rest_days');
  const [budgetCycleDay, setBudgetCycleDayState] = useState<number>(1);
  const [monthlyBudgetGoal, setMonthlyBudgetGoal] = useState<number>(0); // Varsayılan temiz bütçe
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Mehmet Şensoy');
  const [weekStartMonday, setWeekStartMondayState] = useState<boolean>(true);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // AsyncStorage'dan verileri yükle (Açılışta)
  useEffect(() => {
    (async () => {
      try {
        const storedOnboarded = await AsyncStorage.getItem('@triotrack_onboarded');
        if (storedOnboarded === 'true') {
          setIsOnboarded(true);
        }
        const storedUser = await AsyncStorage.getItem('@triotrack_username');
        if (storedUser) {
          setUserName(storedUser);
        }
        const storedWeekStart = await AsyncStorage.getItem('@triotrack_week_start');
        if (storedWeekStart !== null) {
          setWeekStartMondayState(storedWeekStart === 'true');
        }
        const storedHideBalance = await AsyncStorage.getItem('@triotrack_hide_balance');
        if (storedHideBalance === 'true') {
          setIsBalanceHidden(true);
        }
        const storedCycleDay = await AsyncStorage.getItem('@triotrack_cycle_day');
        if (storedCycleDay) {
          const cDay = parseInt(storedCycleDay, 10);
          if (!isNaN(cDay) && cDay >= 1 && cDay <= 28) {
            setBudgetCycleDayState(cDay);
          }
        }

        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
          if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
          if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
          if (Array.isArray(parsed.budgets)) setBudgets(parsed.budgets);
          if (Array.isArray(parsed.debtors)) setDebtors(parsed.debtors);
          if (Array.isArray(parsed.recurringItems)) setRecurringItems(parsed.recurringItems);
          if (parsed.budgetRecalcMode === 'split_to_rest_days' || parsed.budgetRecalcMode === 'add_to_today') {
            setBudgetRecalcModeState(parsed.budgetRecalcMode);
          }
          if (typeof parsed.budgetCycleDay === 'number') setBudgetCycleDayState(parsed.budgetCycleDay);
          if (typeof parsed.monthlyBudgetGoal === 'number') setMonthlyBudgetGoal(parsed.monthlyBudgetGoal);
        }
      } catch (err) {
        console.warn('TrioTrack AsyncStorage yüklenirken hata:', err);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Veriler değiştikçe otomatik kaydet
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        transactions,
        accounts,
        categories,
        budgets,
        debtors,
        recurringItems,
        budgetRecalcMode,
        budgetCycleDay,
        monthlyBudgetGoal,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (err) {
      console.warn('TrioTrack AsyncStorage kaydedilirken hata:', err);
    }
  }, [transactions, accounts, categories, budgets, debtors, recurringItems, budgetRecalcMode, budgetCycleDay, monthlyBudgetGoal, isLoaded]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Toplam Bakiye (Hesapların Toplamı)
  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, a) => acc + a.balance, 0);
  }, [accounts]);

  // Seçilen ay bazlı harcamalar ve gelirler (Zero & Paisa tarzı)
  const currentMonthPrefix = selectedMonth;

  const totalExpenseThisMonth = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonthPrefix))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, currentMonthPrefix]);

  const totalIncomeThisMonth = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'income' && tx.date.startsWith(currentMonthPrefix))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, currentMonthPrefix]);

  // Buckwheat Günlük Harcama Limiti Hesaplayıcı Motoru
  const buckwheatMetrics: BuckwheatMetrics = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentDay = now.getDate();
    
    let daysInCycle = new Date(year, month + 1, 0).getDate();
    let daysRemaining = Math.max(1, daysInCycle - currentDay + 1);
    let cycleElapsedDays = currentDay;

    if (budgetCycleDay > 1) {
      if (currentDay >= budgetCycleDay) {
        // Döngü bu ayın budgetCycleDay'inde başladı, sonraki ayın budgetCycleDay'inde bitecek
        const nextMonthCycle = new Date(year, month + 1, budgetCycleDay);
        const thisCycleStart = new Date(year, month, budgetCycleDay);
        daysInCycle = Math.round((nextMonthCycle.getTime() - thisCycleStart.getTime()) / (1000 * 60 * 60 * 24));
        cycleElapsedDays = currentDay - budgetCycleDay + 1;
        daysRemaining = Math.max(1, daysInCycle - cycleElapsedDays + 1);
      } else {
        // Döngü geçen ayın budgetCycleDay'inde başladı, bu ayın budgetCycleDay'inde bitecek
        const thisCycleEnd = new Date(year, month, budgetCycleDay);
        const prevCycleStart = new Date(year, month - 1, budgetCycleDay);
        daysInCycle = Math.round((thisCycleEnd.getTime() - prevCycleStart.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(1, budgetCycleDay - currentDay);
        cycleElapsedDays = daysInCycle - daysRemaining + 1;
      }
    }

    // Kalan Bütçe = Toplam Hedef Bütçe - Şimdiye Kadar Harcanan
    const remainingBudget = Math.max(0, monthlyBudgetGoal - totalExpenseThisMonth);
    
    // Günlük İzin Verilen Limit (Daily Allowance)
    const baseDailyAllowance = Math.round(monthlyBudgetGoal / daysInCycle);
    let dailyAllowance = Math.round(remainingBudget / daysRemaining);

    // Bugün Yapılan Harcamalar
    const todayStr = getTodayString();
    const todaySpent = transactions
      .filter(tx => tx.type === 'expense' && tx.date === todayStr)
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (budgetRecalcMode === 'add_to_today') {
      const expectedSpentUntilYesterday = baseDailyAllowance * Math.max(0, cycleElapsedDays - 1);
      const actualSpentUntilYesterday = Math.max(0, totalExpenseThisMonth - todaySpent);
      const unspentSaved = Math.max(0, expectedSpentUntilYesterday - actualSpentUntilYesterday);
      dailyAllowance = baseDailyAllowance + unspentSaved;
    }

    const todayRemaining = dailyAllowance - todaySpent;
    const averageDailySpent = cycleElapsedDays > 0 ? Math.round(totalExpenseThisMonth / cycleElapsedDays) : 0;
    const projectedMonthEndExpense = averageDailySpent * daysInCycle;

    let budgetStatus: 'healthy' | 'warning' | 'exceeded' = 'healthy';
    let statusLevel: 'success' | 'warning' | 'danger' = 'success';
    let statusText = 'Mükemmel! Harcamalarınız güvenli sınırın altında.';

    if (totalExpenseThisMonth > monthlyBudgetGoal) {
      budgetStatus = 'exceeded';
      statusLevel = 'danger';
      statusText = 'Aylık bütçe hedefiniz aşıldı! Harcamalarınızı kısmanız önerilir.';
    } else if (todayRemaining < 0) {
      budgetStatus = 'warning';
      statusLevel = 'danger';
      statusText = 'Bugünkü limitinizi aştınız. Kalan günlerde tasarrufa dikkat edin.';
    } else if (todaySpent > dailyAllowance * 0.8) {
      budgetStatus = 'warning';
      statusLevel = 'warning';
      statusText = 'Bugünkü limite yaklaştınız. Kalan tutarı dikkatli harcayın.';
    } else if (todaySpent === 0) {
      statusLevel = 'success';
      statusText = 'Bugün henüz harcama yapılmadı. Harika bir tasarruf başlangıcı!';
    }

    return {
      monthlyBudget: monthlyBudgetGoal,
      totalSpentThisMonth: totalExpenseThisMonth,
      daysInMonth: daysInCycle,
      currentDay: cycleElapsedDays,
      daysRemaining,
      dailyAllowance,
      todaySpent,
      todayRemaining,
      averageDailySpent,
      budgetStatus,
      recalcMode: budgetRecalcMode,
      cycleStartDay: budgetCycleDay,
      statusText,
      statusLevel,
      projectedMonthEndExpense,
    };
  }, [monthlyBudgetGoal, totalExpenseThisMonth, transactions, budgetRecalcMode, budgetCycleDay]);

  // Mahremiyet (Privacy) Modu: Bakiyeleri Gizle / Göster
  const toggleBalanceHidden = async () => {
    setIsBalanceHidden(prev => {
      const nextVal = !prev;
      AsyncStorage.setItem('@triotrack_hide_balance', nextVal ? 'true' : 'false').catch(err => {
        console.warn('TrioTrack hide balance kaydedilirken hata:', err);
      });
      return nextVal;
    });
  };

  // Eylemler
  const addTransaction = async (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    setTransactions(prev => [newTx, ...prev]);

    // İlgili hesabın bakiyesini güncelle (Paisa & Buckwheat özelliği)
    setAccounts(prev =>
      prev.map(acc => {
        if (txData.type === 'transfer') {
          if (acc.id === txData.accountId) {
            return { ...acc, balance: acc.balance - txData.amount };
          }
          if (acc.id === txData.toAccountId) {
            return { ...acc, balance: acc.balance + txData.amount };
          }
        } else if (acc.id === txData.accountId) {
          const delta = txData.type === 'expense' ? -txData.amount : txData.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );

    // WatermelonDB yedek kaydı (Native ise)
    try {
      if (database?.write) {
        await database.write(async () => {
          await database.collections.get('expenses').create((exp: any) => {
            exp.title = txData.title;
            exp.amount = txData.amount;
            exp.categoryId = txData.categoryId;
            exp.date = new Date(txData.date).getTime();
          });
        });
      }
    } catch (e) {
      console.warn('DB Kaydı atlandı:', e);
    }
  };

  const editTransaction = async (id: string, updated: Partial<Omit<Transaction, 'id'>>) => {
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) return;

    const newTx: Transaction = {
      ...oldTx,
      ...updated,
    };

    // Eski işlemin hesap bakiyesi etkisini geri al
    let currentAccounts = [...accounts];
    if (oldTx.type === 'transfer') {
      currentAccounts = currentAccounts.map(acc => {
        if (acc.id === oldTx.accountId) return { ...acc, balance: acc.balance + oldTx.amount };
        if (acc.id === oldTx.toAccountId) return { ...acc, balance: acc.balance - oldTx.amount };
        return acc;
      });
    } else {
      currentAccounts = currentAccounts.map(acc => {
        if (acc.id === oldTx.accountId) {
          const delta = oldTx.type === 'expense' ? oldTx.amount : -oldTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      });
    }

    // Yeni işlemin hesap bakiyesi etkisini uygula
    if (newTx.type === 'transfer') {
      currentAccounts = currentAccounts.map(acc => {
        if (acc.id === newTx.accountId) return { ...acc, balance: acc.balance - newTx.amount };
        if (acc.id === newTx.toAccountId) return { ...acc, balance: acc.balance + newTx.amount };
        return acc;
      });
    } else {
      currentAccounts = currentAccounts.map(acc => {
        if (acc.id === newTx.accountId) {
          const delta = newTx.type === 'expense' ? -newTx.amount : newTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      });
    }

    setAccounts(currentAccounts);
    setTransactions(prev => prev.map(t => (t.id === id ? newTx : t)));
  };

  const deleteTransaction = async (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    // Hesap bakiyesini geri al
    setAccounts(prev =>
      prev.map(acc => {
        if (txToDelete.type === 'transfer') {
          if (acc.id === txToDelete.accountId) {
            return { ...acc, balance: acc.balance + txToDelete.amount };
          }
          if (acc.id === txToDelete.toAccountId) {
            return { ...acc, balance: acc.balance - txToDelete.amount };
          }
        } else if (acc.id === txToDelete.accountId) {
          const delta = txToDelete.type === 'expense' ? txToDelete.amount : -txToDelete.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );
  };

  const addAccount = async (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}`,
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const deleteAccount = async (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const updateAccountBalance = async (id: string, newBalance: number) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, balance: newBalance } : a)));
  };

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const setCategoryBudget = async (categoryId: string, amount: number) => {
    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === categoryId);
      if (existing) {
        return prev.map(b => (b.categoryId === categoryId ? { ...b, amount } : b));
      }
      return [...prev, { id: `bud_${Date.now()}`, categoryId, amount }];
    });
  };

  // Zero Borç Takip Eylemleri
  const addDebtor = async (debtorData: Omit<Debtor, 'id' | 'settled'>) => {
    const newDebtor: Debtor = {
      ...debtorData,
      id: `deb_${Date.now()}`,
      settled: false,
      paidAmount: debtorData.paidAmount || 0,
      payments: debtorData.payments || [],
    };
    setDebtors(prev => [newDebtor, ...prev]);
  };

  const settleDebtor = async (id: string) => {
    setDebtors(prev =>
      prev.map(d => (d.id === id ? { ...d, settled: !d.settled } : d))
    );
  };

  const recordDebtPayment = async (debtorId: string, paymentAmount: number, note?: string) => {
    const today = getTodayString();
    setDebtors(prev =>
      prev.map(d => {
        if (d.id !== debtorId) return d;
        const currentPaid = d.paidAmount || 0;
        const newPaid = currentPaid + paymentAmount;
        const newPayment: DebtPayment = {
          id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          amount: paymentAmount,
          date: today,
          note: note?.trim() || undefined,
        };
        const updatedPayments = [newPayment, ...(d.payments || [])];
        const isSettled = newPaid >= d.amount;
        return {
          ...d,
          paidAmount: newPaid,
          payments: updatedPayments,
          settled: isSettled,
        };
      })
    );
  };

  const deleteDebtor = async (id: string) => {
    setDebtors(prev => prev.filter(d => d.id !== id));
  };

  // Paisa Düzenli İşlemler & Abonelikler Eylemleri
  const addRecurringItem = async (itemData: Omit<RecurringItem, 'id'>) => {
    const newItem: RecurringItem = {
      ...itemData,
      id: `rec_${Date.now()}`,
    };
    setRecurringItems(prev => [newItem, ...prev]);
  };

  const toggleRecurringItem = async (id: string) => {
    setRecurringItems(prev =>
      prev.map(item => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const deleteRecurringItem = async (id: string) => {
    setRecurringItems(prev => prev.filter(item => item.id !== id));
  };

  // Buckwheat Bütçe Dağıtım Modu
  const setBudgetRecalcMode = async (mode: 'split_to_rest_days' | 'add_to_today') => {
    setBudgetRecalcModeState(mode);
    await AsyncStorage.setItem('@triotrack_recalc_mode', mode);
  };

  const setBudgetCycleDay = async (day: number) => {
    const cleanDay = Math.max(1, Math.min(28, Math.round(day)));
    setBudgetCycleDayState(cleanDay);
    await AsyncStorage.setItem('@triotrack_cycle_day', String(cleanDay));
  };

  // Veri Dışa ve İçe Aktarma (JSON Full Backup & Restore)
  const exportDataAsJSON = (): string => {
    const exportObject = {
      app: 'TrioTrack',
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      transactions,
      accounts,
      categories,
      budgets,
      debtors,
      recurringItems,
      budgetRecalcMode,
      budgetCycleDay,
      monthlyBudgetGoal,
      userName,
    };
    return JSON.stringify(exportObject, null, 2);
  };

  const importDataFromJSON = async (jsonString: string): Promise<{ success: boolean; message: string }> => {
    try {
      const normalized = parseAndNormalizeBackup(jsonString);
      if (!normalized.success || !normalized.data) {
        return { success: false, message: normalized.message || 'Geçersiz veri dosyası.' };
      }
      const parsed = normalized.data;
      if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
      if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
      if (Array.isArray(parsed.budgets)) setBudgets(parsed.budgets);
      if (Array.isArray(parsed.debtors)) setDebtors(parsed.debtors);
      if (Array.isArray(parsed.recurringItems)) setRecurringItems(parsed.recurringItems);
      if (parsed.budgetRecalcMode === 'split_to_rest_days' || parsed.budgetRecalcMode === 'add_to_today') {
        setBudgetRecalcModeState(parsed.budgetRecalcMode);
      }
      if (typeof parsed.budgetCycleDay === 'number') setBudgetCycleDayState(parsed.budgetCycleDay);
      if (typeof parsed.monthlyBudgetGoal === 'number') setMonthlyBudgetGoal(parsed.monthlyBudgetGoal);
      if (typeof parsed.userName === 'string') {
        setUserName(parsed.userName);
        await AsyncStorage.setItem('@triotrack_username', parsed.userName);
      }

      // Anlık yerel cihaz snapshot'ını güncelle
      await saveLocalSnapshot(jsonString, {
        transactionCount: parsed.transactions?.length || 0,
        accountCount: parsed.accounts?.length || 0,
        userName: parsed.userName || 'Kullanıcı',
      });

      return { success: true, message: normalized.message || 'Veriler başarıyla içe aktarıldı.' };
    } catch (e: any) {
      return { success: false, message: 'İçe aktarma hatası: ' + (e?.message || 'Bilinmeyen hata') };
    }
  };

  const completeOnboarding = async (params: {
    name: string;
    currency: string;
    accountName?: string;
    initialBalance?: number;
    monthlyGoal?: number;
    weekStartMonday?: boolean;
    budgetCycleDay?: number;
    selectedCategoryIds?: string[];
  }) => {
    if (params.name?.trim()) {
      setUserName(params.name.trim());
      await AsyncStorage.setItem('@triotrack_username', params.name.trim());
    }
    const goal = typeof params.monthlyGoal === 'number' && params.monthlyGoal > 0 ? params.monthlyGoal : 0;
    setMonthlyBudgetGoal(goal);

    const bal = typeof params.initialBalance === 'number' ? params.initialBalance : 0;
    const initialAccount: Account = {
      id: `acc_${Date.now()}`,
      name: params.accountName?.trim() || 'Nakit Cüzdanım',
      type: 'cash',
      balance: bal,
      color: '#4CAF50',
      icon: 'wallet-outline',
    };
    // Sıfırdan temiz başlangıç: Sadece kullanıcının hesabı ve sıfır/belirlenen bakiye, tüm işlemler ve borçlar boş
    setAccounts([initialAccount]);
    setTransactions([]);
    setDebtors([]);
    setRecurringItems([]);
    setBudgets([]);

    if (params.selectedCategoryIds && params.selectedCategoryIds.length > 0) {
      const filtered = DEFAULT_CATEGORIES.filter(c => params.selectedCategoryIds?.includes(c.id));
      if (filtered.length > 0) {
        setCategories(filtered);
      }
    }

    if (typeof params.budgetCycleDay === 'number' && params.budgetCycleDay >= 1 && params.budgetCycleDay <= 28) {
      setBudgetCycleDayState(params.budgetCycleDay);
      await AsyncStorage.setItem('@triotrack_cycle_day', String(params.budgetCycleDay));
    }

    if (typeof params.weekStartMonday === 'boolean') {
      setWeekStartMondayState(params.weekStartMonday);
      await AsyncStorage.setItem('@triotrack_week_start', String(params.weekStartMonday));
    }
    setIsOnboarded(true);
    await AsyncStorage.setItem('@triotrack_onboarded', 'true');
  };

  const setWeekStartMonday = async (val: boolean) => {
    setWeekStartMondayState(val);
    await AsyncStorage.setItem('@triotrack_week_start', String(val));
  };

  const resetAllData = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY, '@triotrack_onboarded', '@triotrack_username', '@triotrack_week_start', '@triotrack_recalc_mode', '@triotrack_cycle_day']);
      setTransactions([]);
      setAccounts([
        { id: 'acc_cash', name: 'Nakit Cüzdan', type: 'cash', balance: 0, color: '#4CAF50', icon: 'wallet-outline' }
      ]);
      setCategories(DEFAULT_CATEGORIES);
      setBudgets([]);
      setDebtors([]);
      setRecurringItems([]);
      setMonthlyBudgetGoal(0);
      setIsOnboarded(false);
      setUserName('Kullanıcı');
      setWeekStartMondayState(true);
      setBudgetRecalcModeState('split_to_rest_days');
      setBudgetCycleDayState(1);
    } catch (err) {
      console.warn('Veriler sıfırlanırken hata:', err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        accounts,
        categories,
        budgets,
        debtors,
        recurringItems,
        budgetRecalcMode,
        setBudgetRecalcMode,
        budgetCycleDay,
        setBudgetCycleDay,
        monthlyBudgetGoal,
        totalBalance,
        isBalanceHidden,
        toggleBalanceHidden,
        totalIncomeThisMonth,
        totalExpenseThisMonth,
        buckwheatMetrics,
        isOnboarded,
        isLoaded,
        userName,
        setUserName,
        weekStartMonday,
        setWeekStartMonday,
        selectedMonth,
        setSelectedMonth,
        completeOnboarding,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addAccount,
        deleteAccount,
        updateAccountBalance,
        addCategory,
        deleteCategory,
        setCategoryBudget,
        setMonthlyBudgetGoal,
        addDebtor,
        settleDebtor,
        recordDebtPayment,
        deleteDebtor,
        addRecurringItem,
        toggleRecurringItem,
        deleteRecurringItem,
        exportDataAsJSON,
        importDataFromJSON,
        resetAllData,
      }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
