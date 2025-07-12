import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { Organization } from '../../service/model/organization.model';
import { Router } from '@angular/router';
import { EmployeeService } from '../../service/employee.service';
import { EmployeeExpenseService } from '../../service/employee-expense.service';
import { OrganizationService } from '../../service/organization.service';
import { Employee } from '../../service/model/employee.model';
import { EmployeeEarningSummary } from '../../service/model/employee-expense.model';
import { CardStatsComponent } from 'src/app/modules/dashboard/components/cards/card-stats/card-stats.component';
import { formatCurrency } from 'src/app/common/utils/common';
import { WordPipe } from 'src/app/common/pipes/word.pipe';

@Component({
  selector: 'app-employee-income',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, CardStatsComponent, WordPipe],
  templateUrl: './employee-income.component.html',
  styleUrl: './employee-income.component.scss',
})
export class EmployeeIncomeComponent extends FormError implements OnInit {
  form!: FormGroup;
  org: Organization | null = null;
  allEmployees: Employee[] = [];
  employeeData: EmployeeEarningSummary | null = null;
  formatCurrency = formatCurrency;

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly empService: EmployeeService,
    private readonly empExpenseService: EmployeeExpenseService,
    private readonly orgService: OrganizationService
  ) {
    super();
    console.log('Employee Income Component Initialized');
    this.initiatlizeForm(null);
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.org = org;
        this.loadAllEmployees(org);
      }
    });
  }

  initiatlizeForm(org: Organization | null): void {
    this.form = this.fb.group({
      employeeId: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    });
  }

  loadAllEmployees(org: Organization) {
    this.empService.getAllEmployeesByOrganization(org.id).subscribe({
      next: (response) => {
        this.allEmployees = response;
      },
      error: (error) => {
        this.orgService.showToastErrorResponse(error);
      },
    });
  }

  submit() {
    if (!this.form.valid) {
      this.empExpenseService.showToastError('Please fill all required fields correctly.');
      return;
    }

    const formData = this.form.value;
    console.log('Form Data:', formData);
    this.empExpenseService.getEmployeeIncomeSummary(formData.employeeId, formData.fromDate, formData.toDate).subscribe({
      next: (response) => {
        this.employeeData = response;
        console.log('Employee Income Summary:', this.employeeData);
      },
      error: (error) => {
        this.empExpenseService.showToastErrorResponse(error);
      }
    });

  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

}
