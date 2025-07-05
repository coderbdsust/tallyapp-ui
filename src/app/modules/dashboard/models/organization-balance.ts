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
  recentTransactions: RecentTransaction[]
}

export interface RecentTransaction {
  id: string
  transactionNumber: string
  transactionDate: string
  transactionType: string
  amount: number
  description: string
  customerName: string
  supplierName: any
  reference: string
  isReversed: boolean
}
