// --- Profit & Loss ---
export interface ProfitAndLossLineItem {
  accountCode: number;
  accountName: string;
  amount: number;
}

export interface ProfitAndLossReport {
  organizationId: string;
  organizationName: string;
  startDate: string;
  endDate: string;
  revenueItems: ProfitAndLossLineItem[];
  totalRevenue: number;
  expenseItems: ProfitAndLossLineItem[];
  totalExpenses: number;
  netIncome: number;
}

// --- Trial Balance ---
export interface TrialBalanceAccount {
  accountCode: number;
  accountName: string;
  accountType: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface TrialBalanceReport {
  organizationId: string;
  organizationName: string;
  startDate: string;
  endDate: string;
  accounts: TrialBalanceAccount[];
  totalDebits: number;
  totalCredits: number;
}

// --- Tax / VAT ---
export interface TaxVatEntry {
  month: string;
  accountCode: number;
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  netMovement: number;
}

export interface TaxVatReport {
  organizationId: string;
  organizationName: string;
  startDate: string;
  endDate: string;
  entries: TaxVatEntry[];
  totalTaxCollected: number;
  totalVatOutput: number;
  totalVatInput: number;
  netVatPayable: number;
}

// --- AR Aging ---
export interface ArAgingBucket {
  bucket: string;
  invoiceCount: number;
  totalOutstanding: number;
}

export interface ArAgingReport {
  organizationId: string;
  organizationName: string;
  reportDate: string;
  buckets: ArAgingBucket[];
  totalOutstanding: number;
}
