import { CashType } from "./cashtype.model"
import { Employee } from "./employee.model"
import { FileUploadResponse } from "./file-upload-response.model"
import { Organization } from "./organization.model"

export interface EmployeeExpense {
  id: string
  amount: number
  expenseDate: string
  description: string
  category: string
  status: string
  expenseType: CashType
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
  percentage: number | 0.0;
  count: number;
}

export interface EmployeeEarningSummary {
  employeeId: string;
  employeeName: string;
  employeeBillingType: string;
  employeeProfileImage: FileUploadResponse;
  accountOpened: string;
  joiningDate: string;
  fromDate: string;
  toDate: string;
  lifeTimeEarnings:boolean;
  totalUnitEarnings: number;
  totalUnits: number;
  expenseTypeSummaries: ExpenseTypeSummary[];
  totalExpenses: number;
  totalFoodAllowanceExpenses: number;
  totalSalaryExpenses: number;
  netEarnings: number;
}

// Monthly Income interfaces
export interface AttendanceMetrics {
  totalWorkingDays: number;
  daysPresent: number;
  daysAbsent: number;
  attendancePercentage: number;
  totalWorkUnits: number;
  averageWorkUnitsPerDay: number;
}

export interface DailyAttendance {
  date: string;
  dayOfWeek: string;
  isWeekend: boolean;
  isPresent: boolean;
  workUnits: number;
  expense: number;
  workUnitRate: number;
  dailyIncome: number;
}

export interface MonthlyIncomeData {
  employeeId: string;
  employeeName: string;
  joiningDate: string;
  year: number;
  month: number;
  monthName: string;
  startDate: string;
  endDate: string;
  monthlySalary: number;
  baseSalary: number;
  totalIncome:number;
  attendanceMetrics: AttendanceMetrics;
  dailyAttendance: DailyAttendance[];
  totalExpenses: number;
  netIncome: number;
  expenseCount: number;
}