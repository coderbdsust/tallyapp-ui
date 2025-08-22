export interface Account {
  accountCode: string;
  accountName: string;
  accountType: string;
  description: string;
  balance: number;
}

export interface FinancialData {
  organizationId: string;
  organizationName: string;
  asOfDate: string;
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  revenue: Account[];
  expenses: Account[];
  netIncome: number;
  totalAssets: number;
  totalEquity: number;
  totalExpenses: number;
  totalRevenue: number;
  totalLiabilities: number;
}