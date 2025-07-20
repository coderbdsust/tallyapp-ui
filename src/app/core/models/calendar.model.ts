import { ExpenseTypeSummary } from "./employee-expense.model";

export interface DailyWorkCalendarEntry {
  dailyWorkId?: string;
  entryDate: string;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED';
  totalExpenseAmount: number;
  totalEmployees: number;
  presentEmployees: number;
  totalWorkUnits: number;
  totalIncome: number;
  hasEntry: boolean;
}

export interface MonthlyCalendarSummary {
  totalWorkingDays: number;
  daysWithEntries: number;
  draftEntries: number;
  pendingEntries: number;
  approvedEntries: number;
}

export interface MonthlyCalendar {
  year: number;
  month: number;
  monthName: string;
  firstDayOfMonth: string;
  lastDayOfMonth: string;
  dailyEntries: DailyWorkCalendarEntry[];
  summary: MonthlyCalendarSummary;
  orgMonthlyExpenseReport: OrganizationMonthlyExpenseReport;
}

export interface OrganizationMonthlyExpenseReport {
  organizationId: string;
  organizationName: string;
  year: number;
  month: number;
  monthName: string;
  totalApprovedExpenses: number;
  expenseBreakdown: ExpenseTypeSummary[];
}