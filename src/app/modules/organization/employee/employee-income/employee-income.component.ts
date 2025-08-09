import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { Organization } from '../../../../core/models/organization.model';
import { EmployeeService } from '../../../../core/services/employee.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { Employee } from '../../../../core/models/employee.model';
import { CardStatsComponent } from 'src/app/modules/dashboard/components/cards/card-stats/card-stats.component';
import { formatCurrency } from 'src/app/common/utils/common';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { EmployeeEarningSummary, MonthlyIncomeData } from 'src/app/core/models/employee-expense.model';
import { EmployeeExpenseService } from 'src/app/core/services/employee-expense.service';

@Component({
  selector: 'app-employee-income',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, CardStatsComponent, NgIf, NgFor, WordPipe],
  templateUrl: './employee-income.component.html',
  styleUrl: './employee-income.component.scss',
})
export class EmployeeIncomeComponent extends FormError implements OnInit {
  form!: FormGroup;
  org: Organization | null = null;
  allEmployees: Employee[] = [];
  monthlyIncomeData: MonthlyIncomeData | null = null;
  employeeData: EmployeeEarningSummary | null = null;
  selectedEmployee: Employee | null = null;
  formatCurrency = formatCurrency;
  calendarWeeks: any[][] = [];
  loading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly empService: EmployeeService,
    private readonly empExpenseService: EmployeeExpenseService,
    private readonly orgService: OrganizationService,
  ) {
    super();
    this.initializeForm();
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.org = org;
        this.loadAllEmployees(org);
      }
    });
  }

  initializeForm(): void {
    this.form = this.fb.group({
      employeeId: ['', Validators.required],
      year: [],
      month: [],
    });
  }

  resetDatePicker(): void {
    this.form.patchValue({
      year: null,
      month: null,
    });
  }

  loadAllEmployees(org: Organization): void {
    this.empService.getAllEmployeesByOrganization(org.id).subscribe({
      next: (response) => {
        // Filter only MONTHLY billing type employees
        this.allEmployees = response;
      },
      error: (error) => {
        this.orgService.showToastErrorResponse(error);
      },
    });
  }

  onEmployeeSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedId = selectElement.value;
    this.selectedEmployee = this.allEmployees.find(emp => emp.id === selectedId) ?? null;
    this.monthlyIncomeData = null;
    this.employeeData = null;
    this.resetDatePicker();
  }

  submit(): void {
  if (!this.form.valid) {
    this.orgService.showToastError('Please fill all required fields correctly.');
    return;
  }

  const formData = this.form.value;
  this.loading = true;
  
  // Reset previous data
  this.monthlyIncomeData = null;
  this.employeeData = null;
  
  // Find the selected employee
  this.selectedEmployee = this.allEmployees.find(emp => emp.id === formData.employeeId) ?? null;
  
  if (!this.selectedEmployee) {
    this.orgService.showToastError('Selected employee not found.');
    this.loading = false;
    return;
  }

  // Check employee billing type and call appropriate API
  if (this.selectedEmployee.employeeBillingType === 'MONTHLY') {
    
    if(!formData.year || !formData.month){
      this.orgService.showToastError('Please select year and month.');
      this.loading = false;
      return;
    }

    this.empExpenseService.getEmployeeMonthlyIncome(formData.employeeId, formData.year, formData.month).subscribe({
      next: (data) => {
        this.monthlyIncomeData = data;
        this.buildCalendarView();
        this.loading = false;
      },
      error: (error) => {
        this.orgService.showToastErrorResponse(error);
        this.loading = false;
      },
    });
  } else {
    let startDate='';
    let endDate='';

    if(formData.year && formData.month){
      startDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-01`;
      const lastDay = new Date(formData.year, formData.month, 0).getDate();
      endDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }
    
    this.empExpenseService.getEmployeeIncomeSummary(formData.employeeId, startDate, endDate).subscribe({
      next: (data) => {
        this.employeeData = data;
        this.loading = false;
      },
      error: (error) => {
        this.orgService.showToastErrorResponse(error);
        this.loading = false;
      },
    });
  }
}

  private buildCalendarView(): void {
    if (!this.monthlyIncomeData) return;

    const dailyAttendance = this.monthlyIncomeData.dailyAttendance;
    const firstDay = new Date(this.monthlyIncomeData.year, this.monthlyIncomeData.month - 1, 1);
    const lastDay = new Date(this.monthlyIncomeData.year, this.monthlyIncomeData.month, 0);

    // Create attendance map for quick lookup
    const attendanceMap = new Map();
    dailyAttendance.forEach((day) => {
      attendanceMap.set(day.date, day);
    });

    // Build calendar weeks
    this.calendarWeeks = [];
    let currentWeek: any[] = [];

    // Add empty cells for days before the first day of the month
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${this.monthlyIncomeData.year}-${String(this.monthlyIncomeData.month).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`;
      const attendanceData = attendanceMap.get(dateStr);

      currentWeek.push({
        day,
        date: dateStr,
        attendance: attendanceData || null,
      });

      if (currentWeek.length === 7) {
        this.calendarWeeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    // Add remaining cells to complete the last week
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      this.calendarWeeks.push(currentWeek);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  }

  getAttendanceStatusClass(attendance: any): string {
    if (!attendance) return '';
    if (attendance.isWeekend) return 'weekend';
    return attendance.isPresent ? 'present' : 'absent';
  }

  getAttendanceRate(): number {
    if (!this.monthlyIncomeData) return 0;
    return this.monthlyIncomeData.attendanceMetrics.attendancePercentage;
  }

  getWorkEfficiency(): number {
    if (!this.monthlyIncomeData) return 0;
    const metrics = this.monthlyIncomeData.attendanceMetrics;
    if (metrics.daysPresent === 0) return 0;
    return (metrics.totalWorkUnits / metrics.daysPresent) * 100;
  }

  exportToCSV(): void {
    if (!this.monthlyIncomeData) return;

    const csvData = this.monthlyIncomeData.dailyAttendance.map((day) => ({
      Date: day.date,
      Day: day.dayOfWeek,
      Present: day.isPresent ? 1 : 0,
      'Work Units': day.workUnits,
      Expense: day.expense
    }));

    const csv = this.convertToCSV(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-income-${this.monthlyIncomeData.employeeName}-${this.monthlyIncomeData.year}-${this.monthlyIncomeData.month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        })
        .join(','),
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  formatExpenseType(type: string): string {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  getExpensePercentage(amount: number): string {

    let expenses = this.employeeData?.totalExpenses || 1;

    if (expenses === 0) {
      return '0.0';
    }

    if (amount === 0) {
      return '0.0';
    }

    return ((amount / expenses) * 100).toFixed(1);
  }

  generateReport(){
    
    if (!this.form.valid) {
      this.empExpenseService.showToastInfo('Please select an employee');
      return;
    }

    const formData = this.form.value;
    let startDate='';
    let endDate='';

    if(formData.year && formData.month){
      startDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-01`;
      const lastDay = new Date(formData.year, formData.month, 0).getDate();
      endDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    this.empExpenseService.getIncomeReports(formData.employeeId, startDate, endDate).subscribe({
      next: (pdfRes:Blob) => {
        this.handleBlobDownload(pdfRes, formData.employeeId);
      },
      error: (error) => {
        this.empExpenseService.showToastErrorResponse(error);
      }
    });
  }

  private handleBlobDownload(blob: Blob, empId:string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `income-report-${empId}.pdf`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the blob URL
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
    
  }
}
