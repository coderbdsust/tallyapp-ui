import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { formatCurrency } from 'src/app/common/utils/common';
import { DailyWorkCalendarEntry, MonthlyCalendar } from 'src/app/core/models/calendar.model';
import { Organization } from 'src/app/core/models/organization.model';
import { DailyWorkCalendarService } from 'src/app/core/services/daily-work-calendar-service.service';
import { OrganizationService } from 'src/app/core/services/organization.service';

@Component({
  selector: 'app-employee-daily-reporting-calendar',
  imports: [NgClass, NgIf, NgFor, WordPipe],
  templateUrl: './employee-daily-reporting-calendar.component.html',
  styleUrl: './employee-daily-reporting-calendar.component.scss'
})
export class EmployeeDailyReportingCalendarComponent {
  monthlyCalendar: MonthlyCalendar | null = null;
  organization: Organization | null = null;
  currentDate = new Date();
  selectedYear = this.currentDate.getFullYear();
  selectedMonth = this.currentDate.getMonth() + 1;
  formatCurrency = formatCurrency;
  loading = false;
  

  // Calendar grid helpers
  calendarWeeks: DailyWorkCalendarEntry[][] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Expense breakdown properties
  showDetailedView: boolean = false;

  // Color scheme for different expense types based on your enum
  private expenseTypeColors: { [key: string]: string } = {
    'DAILY_ALLOWANCE': '#3B82F6',    // Blue
    'FOOD_ALLOWANCE': '#10B981',     // Green  
    'HOUSE_RENT': '#F59E0B',         // Amber
    'TRANSPORT': '#EF4444',          // Red
    'TRAINING': '#8B5CF6',           // Purple
    'ENTERTAINMENT': '#EC4899',      // Pink
    'MEDICAL': '#06B6D4',            // Cyan
    'SALARY': '#84CC16',             // Lime
    'UTILITIES': '#F97316',          // Orange
    'OTHER': '#6B7280'               // Gray
  };

  // Display names for expense types
  private expenseTypeDisplayNames: { [key: string]: string } = {
    'DAILY_ALLOWANCE': 'Daily Allowance',
    'FOOD_ALLOWANCE': 'Food Allowance',
    'HOUSE_RENT': 'House Rent',
    'TRANSPORT': 'Transport',
    'TRAINING': 'Training',
    'ENTERTAINMENT': 'Entertainment',
    'MEDICAL': 'Medical',
    'SALARY': 'Salary',
    'UTILITIES': 'Utilities',
    'OTHER': 'Other'
  };

  constructor(
    private calendarService: DailyWorkCalendarService,
    private organizationService: OrganizationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.organizationService.organization$.subscribe(org => {
      if (org) {
        this.organization = org;
        this.loadCurrentMonthCalendar();
      }
    });
  }

  loadCurrentMonthCalendar(): void {
    if (!this.organization) return;

    this.loading = true;
    this.calendarService.getCurrentMonthCalendar(this.organization.id).subscribe({
      next: (calendar) => {
        this.monthlyCalendar = calendar;
        this.buildCalendarGrid();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading calendar:', error);
        this.loading = false;
      }
    });
  }

  loadMonthlyCalendar(year: number, month: number): void {
    if (!this.organization) return;

    this.loading = true;
    this.selectedYear = year;
    this.selectedMonth = month;

    this.calendarService.getMonthlyCalendar(this.organization.id, year, month).subscribe({
      next: (calendar) => {
        this.monthlyCalendar = calendar;
        this.buildCalendarGrid();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading calendar:', error);
        this.loading = false;
      }
    });
  }

  buildCalendarGrid(): void {
  if (!this.monthlyCalendar) return;

  const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth - 1, 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // To start from Sunday:
  const daysToGoBack = dayOfWeek;

  // If you want to start from Monday:
  // const daysToGoBack = (dayOfWeek + 6) % 7;

  this.calendarWeeks = [];
  let currentWeek: DailyWorkCalendarEntry[] = [];

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(this.selectedYear, this.selectedMonth - 1, 1 - daysToGoBack + i);

    // Format date to YYYY-MM-DD (safe for comparison)
    const dateString = currentDate.toLocaleDateString('sv-SE', { timeZone: 'Asia/Dhaka' });

    const entry = this.monthlyCalendar.dailyEntries.find(e => e.entryDate === dateString);

    const calendarEntry: DailyWorkCalendarEntry = entry || {
      entryDate: dateString,
      hasEntry: false,
      totalExpenseAmount: 0,
      totalEmployees: 0,
      presentEmployees: 0,
      totalWorkUnits: 0,
      totalIncome: 0
    };

    currentWeek.push(calendarEntry);

    if (currentWeek.length === 7) {
      this.calendarWeeks.push(currentWeek);
      currentWeek = [];
    }
  }
}

  previousMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadMonthlyCalendar(this.selectedYear, this.selectedMonth);
  }

  nextMonth(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadMonthlyCalendar(this.selectedYear, this.selectedMonth);
  }

  goToCurrentMonth(): void {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    this.loadCurrentMonthCalendar();
  }

  onDateClick(entry: DailyWorkCalendarEntry): void {
    const selectedDate = entry.entryDate;
    this.router.navigate(['/organization/employee'], {
        queryParams: {
          tab: 'daily-reporting',
          date: selectedDate
         
        }
      });
  }


  isCurrentMonth(dateString: string): boolean {
    const date = new Date(dateString);
    return date.getMonth() === this.selectedMonth - 1 && date.getFullYear() === this.selectedYear;
  }

  isToday(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-200 text-yellow-800';
      case 'APPROVED': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  // Helper methods for template
  getDayNumber(dateString: string): number {
    return new Date(dateString).getDate();
  }

  formatDate(dateString: string, format: 'day' | 'full' | 'short' = 'day'): string {
    const date = new Date(dateString);
    switch (format) {
      case 'day': return date.getDate().toString();
      case 'short': return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'full': return date.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
      default: return date.getDate().toString();
    }
  }

  /**
   * Check if expense breakdown data exists
   */
  hasExpenseBreakdown(): boolean {
    return !!(this.monthlyCalendar?.orgMonthlyExpenseReport?.expenseBreakdown?.length);
  }

  /**
   * Get color for expense type
   */
  getExpenseTypeColor(expenseType: string): string {
    return this.expenseTypeColors[expenseType] || this.expenseTypeColors['OTHER'];
  }
  
}