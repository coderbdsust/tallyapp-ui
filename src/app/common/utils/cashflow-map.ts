import { FlowTypeStyle } from "src/app/core/models/organization-balance.model";

export function isInflowType(flowType: string): boolean {
  const inflowTypes = new Set([
    'CASH_IN',
    'CASH_IN_INVESTMENT',
    'CASH_IN_LOAN', 
    'CASH_IN_GRANT',
    'CASH_IN_ASSET_SALE',
    'CASH_IN_OTHER',
    'SALE',
    'PAYMENT_RECEIVED',
    'REFUND_RECEIVED',
    'EQUITY_INVESTMENT'
  ]);
  
  return inflowTypes.has(flowType);
}

export function getFlowTypeStyle(flowType: string): FlowTypeStyle{
  // Configuration maps for better maintainability
  const INFLOW_TYPES = new Set([
    'CASH_IN',
    'CASH_IN_INVESTMENT',
    'CASH_IN_LOAN', 
    'CASH_IN_GRANT',
    'CASH_IN_ASSET_SALE',
    'CASH_IN_OTHER',
    'SALE',
    'PAYMENT_RECEIVED',
    'REFUND_RECEIVED',
    'EQUITY_INVESTMENT'
  ]);
  
  const OUTFLOW_TYPES = new Set([
    'CASH_OUT',
    'CASH_OUT_WITHDRAWAL',
    'CASH_OUT_LOAN_REPAYMENT',
    'CASH_OUT_ASSET_PURCHASE',
    'CASH_OUT_OTHER',
    'PURCHASE',
    'PAYMENT_MADE',
    'EXPENSE',
    'EMPLOYEE_EXPENSE',
    'REFUND_GIVEN',
    'DEPRECIATION'
  ]);

  const ICONS: Record<string, string> = {
    // Cash In Types
    CASH_IN_INVESTMENT: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
    CASH_IN_LOAN: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    CASH_IN_GRANT: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h1v4H5z',
    CASH_IN_ASSET_SALE: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    CASH_IN_OTHER: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
    CASH_IN: 'M12 6v6m0 0v6m0-6h6m-6 0H6',

    // Cash Out Types
    CASH_OUT_WITHDRAWAL: 'M18 12H6',
    CASH_OUT_LOAN_REPAYMENT: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    CASH_OUT_ASSET_PURCHASE: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    CASH_OUT_OTHER: 'M18 12H6',
    CASH_OUT: 'M18 12H6',
    
    // Business Operations
    SALE: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    PURCHASE: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    PAYMENT_RECEIVED: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    PAYMENT_MADE: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    
    // Expenses
    EXPENSE: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    EMPLOYEE_EXPENSE: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    
    // Adjustments
    ACCOUNTS_RECEIVABLE_ADJUSTMENT: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    ACCOUNTS_PAYABLE_ADJUSTMENT: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    INVENTORY_ADJUSTMENT: 'M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H15a2 2 0 012 2v0a2 2 0 01-2 2H5a2 2 0 01-2-2v0a2 2 0 012-2z',
    ACCRUAL_ADJUSTMENT: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    DEPRECIATION: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
    
    // Corrections and Reversals
    CORRECTION: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    REVERSAL: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    REFUND_GIVEN: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
    REFUND_RECEIVED: 'M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6',
    
    // Equity
    EQUITY_INVESTMENT: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    RETAINED_EARNINGS_ADJUSTMENT: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
  };

  const LABELS: Record<string, string> = {
    // Cash In Types
    CASH_IN_INVESTMENT: 'Cash In - Investment',
    CASH_IN_LOAN: 'Cash In - Loan',
    CASH_IN_GRANT: 'Cash In - Grant',
    CASH_IN_ASSET_SALE: 'Cash In - Asset Sale',
    CASH_IN_OTHER: 'Cash In - Other',
    CASH_IN: 'Cash In',
    
    // Cash Out Types
    CASH_OUT_WITHDRAWAL: 'Cash Out - Withdrawal',
    CASH_OUT_LOAN_REPAYMENT: 'Cash Out - Loan Payment',
    CASH_OUT_ASSET_PURCHASE: 'Cash Out - Asset Purchase',
    CASH_OUT_OTHER: 'Cash Out - Other',
    CASH_OUT: 'Cash Out',

    // Business Operations
    SALE: 'Sale',
    PURCHASE: 'Purchase',
    PAYMENT_RECEIVED: 'Payment Received',
    PAYMENT_MADE: 'Payment Made',
    
    // Expenses
    EXPENSE: 'Expense',
    EMPLOYEE_EXPENSE: 'Employee Expense',
    
    // Adjustments
    ACCOUNTS_RECEIVABLE_ADJUSTMENT: 'A/R Adjustment',
    ACCOUNTS_PAYABLE_ADJUSTMENT: 'A/P Adjustment',
    INVENTORY_ADJUSTMENT: 'Inventory Adjustment',
    ACCRUAL_ADJUSTMENT: 'Accrual Adjustment',
    DEPRECIATION: 'Depreciation',
    
    // Corrections and Reversals
    CORRECTION: 'Correction',
    REVERSAL: 'Reversal',
    REFUND_GIVEN: 'Refund Given',
    REFUND_RECEIVED: 'Refund Received',
    
    // Equity
    EQUITY_INVESTMENT: 'Equity Investment',
    RETAINED_EARNINGS_ADJUSTMENT: 'Retained Earnings Adjustment'
  };

  const isInflow = INFLOW_TYPES.has(flowType);
  const isOutflow = OUTFLOW_TYPES.has(flowType);
  const iconPath = ICONS[flowType] || 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
  const label = LABELS[flowType] || flowType.replace(/_/g, ' ');

  // Determine colors based on transaction type
  let bgColor, textColor, iconColor;
  
  if (isInflow) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    iconColor = 'text-green-600';
  } else if (isOutflow) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    iconColor = 'text-red-600';
  } else {
    bgColor = 'bg-gray-100';
    textColor = 'text-gray-800';
    iconColor = 'text-gray-600';
  }

  return {
    iconSvg: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}" /></svg>`,
    bgColor,
    textColor,
    iconColor,
    label,
  };
}