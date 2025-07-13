import { Employee } from "./employee.model"
import { Organization } from "./organization.model"

export interface EmployeeExpense {
  id: string
  amount: number
  expenseDate: string
  description: string
  category: string
  status: string
  expenseType: string
  receiptNumber: any
  notes: any
  isReimbursable: boolean
  reimbursedAmount: number
  reimbursedDate: any
  createdDate: string
  updatedDate: any
  employee: Employee,
  organiation:Organization,
  transaction: any
}

export interface ExpenseTypeSummary {
  expenseType: string;
  totalAmount: number;
}

export interface EmployeeEarningSummary {
  employeeId: string;
  employeeName: string;
  employeeBillingType: string;
  employeeProfileImage: string;
  accountOpened: string;
  fromDate: string;
  toDate: string;
  totalUnitEarnings: number;
  totalUnits: number;
  expenseTypeSummaries: ExpenseTypeSummary[];
  totalExpenses: number;
  totalFoodAllowanceExpenses: number;
  totalSalaryExpenses: number;
  netEarnings: number;
}