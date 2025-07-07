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
  reference: string
  isReversed: boolean
}
