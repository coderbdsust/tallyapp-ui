export function getAmountColor(type: string, amount: number): string {
  // Incoming/Positive cash flow types
  const incomingTypes = [
    'CASH_IN',
    'CASH_IN_INVESTMENT',
    'CASH_IN_LOAN',
    'CASH_IN_GRANT',
    'CASH_IN_ASSET_SALE',
    'CASH_IN_OTHER',
    'SALE',
    'PAYMENT_RECEIVED',
    'REFUND_RECEIVED',
    'EQUITY_INVESTMENT',
  ];

  // Outgoing/Negative cash flow types
  const outgoingTypes = [
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
    'DEPRECIATION',
  ];

  if (incomingTypes.includes(type)) {
    return 'text-green-600 font-semibold';
  }
  if (outgoingTypes.includes(type)) {
    return 'text-red-600 font-semibold';
  }
  // Neutral types (adjustments, corrections, etc.)
  return 'text-gray-900 font-medium';
}

// Transaction type styling
export function getTransactionTypeColor(type: string): { bg: string; text: string } {
  const colorMap: Record<string, { bg: string; text: string }> = {
    // Cash In Types
    CASH_IN: { bg: 'bg-green-100', text: 'text-green-800' },
    CASH_IN_INVESTMENT: { bg: 'bg-green-100', text: 'text-green-800' },
    CASH_IN_LOAN: { bg: 'bg-green-100', text: 'text-green-800' },
    CASH_IN_GRANT: { bg: 'bg-green-100', text: 'text-green-800' },
    CASH_IN_ASSET_SALE: { bg: 'bg-green-100', text: 'text-green-800' },
    CASH_IN_OTHER: { bg: 'bg-green-100', text: 'text-green-800' },

    // Cash Out Types
    CASH_OUT: { bg: 'bg-red-100', text: 'text-red-800' },
    CASH_OUT_WITHDRAWAL: { bg: 'bg-red-100', text: 'text-red-800' },
    CASH_OUT_LOAN_REPAYMENT: { bg: 'bg-red-100', text: 'text-red-800' },
    CASH_OUT_ASSET_PURCHASE: { bg: 'bg-red-100', text: 'text-red-800' },
    CASH_OUT_OTHER: { bg: 'bg-red-100', text: 'text-red-800' },

    // Business Operations
    SALE: { bg: 'bg-blue-100', text: 'text-blue-800' },
    PURCHASE: { bg: 'bg-purple-100', text: 'text-purple-800' },
    PAYMENT_RECEIVED: { bg: 'bg-green-200', text: 'text-green-900' },
    PAYMENT_MADE: { bg: 'bg-red-200', text: 'text-red-900' },

    // Expenses
    EXPENSE: { bg: 'bg-orange-100', text: 'text-orange-800' },
    EMPLOYEE_EXPENSE: { bg: 'bg-rose-100', text: 'text-rose-800' },

    // Adjustments
    ACCOUNTS_RECEIVABLE_ADJUSTMENT: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    ACCOUNTS_PAYABLE_ADJUSTMENT: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    INVENTORY_ADJUSTMENT: { bg: 'bg-gray-100', text: 'text-gray-800' },
    ACCRUAL_ADJUSTMENT: { bg: 'bg-gray-100', text: 'text-gray-800' },
    DEPRECIATION: { bg: 'bg-amber-100', text: 'text-amber-800' },

    // Corrections and Reversals
    CORRECTION: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    REVERSAL: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    REFUND_GIVEN: { bg: 'bg-pink-100', text: 'text-pink-800' },
    REFUND_RECEIVED: { bg: 'bg-pink-100', text: 'text-pink-800' },

    // Equity
    EQUITY_INVESTMENT: { bg: 'bg-teal-100', text: 'text-teal-800' },
    RETAINED_EARNINGS_ADJUSTMENT: { bg: 'bg-teal-100', text: 'text-teal-800' },
  };

  return colorMap[type] || { bg: 'bg-gray-100', text: 'text-gray-800' };
}
