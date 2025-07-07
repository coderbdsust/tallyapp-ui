import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { EmployeeService } from '../../service/employee.service';
import { EmployeeExpenseService } from '../../service/employee-expense.service';
import { OrganizationService } from '../../service/organization.service';
import { Organization } from '../../service/model/organization.model';
import { Employee } from '../../service/model/employee.model';



interface ExpenditureFormData {
  entryDate: string;
  employees: Employee[];
  summary: {
    totalEmployees: number;
    totalExpenses: number;
  };
}

@Component({
  selector: 'app-employee-daily-reporting',
  imports: [FormsModule, ReactiveFormsModule, CommonModule,AngularSvgIconModule],
  templateUrl: './employee-daily-reporting.component.html',
  styleUrl: './employee-daily-reporting.component.scss'
})
export class EmployeeDailyReportingComponent implements OnInit {
  
  expenditureForm: FormGroup;
  organzation:Organization|null = null;
  allEmployees: Employee[] = [];


  constructor(
      private fb: FormBuilder,
      private readonly empService: EmployeeService,
      private readonly empExpenseService: EmployeeExpenseService,
      private readonly orgService: OrganizationService) {

    this.expenditureForm = this.fb.group({
      entryDate: [this.getCurrentDate(), Validators.required],
      employees: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.organzation = org;
        this.loadAllEmployees(org);
      }
    });
  }

  loadAllEmployees(org: Organization) {
    this.empService.getAllEmployeesByOrganization(org.id).subscribe({
      next: (response) => {
        this.allEmployees = response;
      },
      error: (error) => {
        this.empService.showToastErrorResponse(error);
      },
    });
  }

  get employees(): FormArray {
    return this.expenditureForm.get('employees') as FormArray;
  }

  get totalEmployees(): number {
    return this.employees.length;
  }

  get totalExpenses(): number {
    return this.employees.controls.reduce((total, control) => {
      return total + (control.get('expense')?.value || 0);
    }, 0);
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  createEmployeeFormGroup(emp: Employee | null = null): FormGroup {
    return this.fb.group({
      employeeId: [emp?.id || '', Validators.required],
      employeeName: [emp?.fullName || '', Validators.required],
      workUnit: [1, Validators.required],
      isPresent: [true],
      expense: [emp?.dailyAllowance, [Validators.required, Validators.min(0)]]
    });
  }

  addEmployeeRow(emp: Employee | null = null): void {
    this.employees.push(this.createEmployeeFormGroup(emp));
  }

  removeEmployeeRow(index: number): void {
    if (this.employees.length > 1) {
      this.employees.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.expenditureForm.valid) {
      const formData: ExpenditureFormData = {
        entryDate: this.expenditureForm.get('entryDate')?.value,
        employees: this.employees.value,
        summary: {
          totalEmployees: this.totalEmployees,
          totalExpenses: this.totalExpenses
        }
      };

      console.log('Form Data:', formData);
      alert(`Form submitted successfully!\n\nDate: ${formData.entryDate}\nTotal Employees: ${formData.summary.totalEmployees}\nTotal Expenses: ${formData.summary.totalExpenses.toFixed(2)}`);
    } else {
      alert('Please fill in all required fields');
      this.markFormGroupTouched();
    }
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all employee data?')) {
      this.employees.clear();
      this.addEmployeeRow();
    }
  }

  exportData(): void {
    if (this.expenditureForm.valid) {
      const formData: ExpenditureFormData = {
        entryDate: this.expenditureForm.get('entryDate')?.value,
        employees: this.employees.value,
        summary: {
          totalEmployees: this.totalEmployees,
          totalExpenses: this.totalExpenses
        }
      };

      const dataStr = JSON.stringify(formData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-expenditure-${formData.entryDate}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  printForm(): void {
    window.print();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.expenditureForm.controls).forEach(key => {
      const control = this.expenditureForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          Object.keys(arrayControl.value).forEach(arrayKey => {
            arrayControl.get(arrayKey)?.markAsTouched();
          });
        });
      }
    });
  }

}
