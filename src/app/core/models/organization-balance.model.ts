import { PageResponse } from "src/app/common/models/page-response"

export interface OrganizationBalance {
  organizationId: string
  organizationName: string
  reportDate: string
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  cashBalance: number
  accountsReceivable: number
  accountsPayable: number
}

export interface RecentTransactionReport {
  organizationId: string
  organizationName: string
  orgLogo: string
  reportTime: string
  recentTransactions: Transaction[]
}

export interface Transaction {
  id: string
  transactionNumber: string
  transactionDate: string
  transactionType: string
  amount: number
  description: string
  customerName: string
  supplierName: string
  employeeName: string
  accountName: string
  accountCode: string
  accountType: string
  reference: string
  isReversed: boolean
}

export interface CashFlow {
  flowDate: string;
  flowType: string;
  amount: number;
  description: string;
  category: string | null;
}

export interface CashFlowReport {
  reportDate: string;
  totalCashIn: number;
  totalCashOut: number;
  netCashFlow: number;
  cashFlows: CashFlow[];
}

export interface PageCashFlowReport {
  reportDate: string;
  balanceSummary: CashFlowBalanceSummary;
  pageCashFlowResponse: PageResponse<CashFlow>;
}

export interface CashFlowBalanceSummary{
  totalCashIn: number;
  totalCashOut: number;
  netCashBalance: number;
}

export interface FlowTypeStyle {
  iconSvg: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
  label: string;
}
