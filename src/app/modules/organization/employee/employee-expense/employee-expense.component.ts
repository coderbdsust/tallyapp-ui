import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Organization } from '../../service/model/organization.model';
import { Router } from '@angular/router';
import { OrganizationService } from '../../service/organization.service';
import { AccountingService } from 'src/app/modules/dashboard/service/accounting.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Employee } from '../../service/model/employee.model';
import { EmployeeService } from '../../service/employee.service';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { EmployeeExpenseService } from '../../service/employee-expense.service';
import { EmployeeExpense } from '../../service/model/employee-expense.model';

@Component({
  selector: 'app-employee-expense',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, WordPipe],
  templateUrl: './employee-expense.component.html',
  styleUrl: './employee-expense.component.scss'
})
export class EmployeeExpenseComponent extends FormError implements OnInit {
   form!: FormGroup;
   org: Organization|null=null;

    public readonly allPaymentMethods = [
      'Cash',
      'Bank Transfer',
      'Mobile Banking',
      'Card',
      'Cheque',
      'Other'
    ];

    public allExpenseTypes:string[] = [];
    public allEmployees:Employee[]=[];
    public employeeExpenses:EmployeeExpense[]=[];
  
    constructor(
      private readonly router: Router,
      private readonly fb: FormBuilder,
      private readonly empService: EmployeeService,
      private readonly empExpenseService: EmployeeExpenseService,
      private readonly orgService: OrganizationService,
      private readonly accService: AccountingService
    ) {
      super();  
      console.log('Expense Component Initialized');
      this.initiatlizeForm(null);
    }
  
    ngOnInit(): void {
      this.orgService.organization$.subscribe((org) => {
        if (org) {
          this.org = org;
          this.initiatlizeForm(this.org);
          this.loadAllExpenseTypes();
          this.loadAllEmployees(org);
          this.loadOrganizationExpenses(org);
        }
      });
    }

    loadAllExpenseTypes(){
      this.empService.getExpenseTypes().subscribe({
        next: (response) => {
          this.allExpenseTypes = response;
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        }
      });
    }

    loadAllEmployees(org:Organization){
      this.empService.getAllEmployeesByOrganization(org.id).subscribe({
        next: (response) => {
          this.allEmployees = response;
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        }
      });
    }
  
    initiatlizeForm(org: Organization|null): void {
      this.form = this.fb.group({
        organizationId: [org?.id, Validators.required],
        expenseDate: ['', Validators.required],
        amount: [0, Validators.required],
        paymentMethod: ['', Validators.required],
        expenseType: ['', Validators.required],
        employeeId: ['', Validators.required],
        description: ['', Validators.required],
      });
    }

    loadOrganizationExpenses(org: Organization) {
      this.empExpenseService.getOrganizationExpenses(org.id).subscribe({
        next: (response) => {
          this.employeeExpenses = response;          
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        }
      });
    }
  
    submit() {
      console.log(this.form.value);
  
      if(this.form.invalid) {
        this.orgService.showToastError('Please fill in all required fields correctly.');
        return;
      }
      
       this.empExpenseService.createExpense(this.form.value).subscribe({
        next: (response) => {
          this.orgService.showToastSuccess('Employee expense created successfully');
          this.initiatlizeForm(this.org)
          this.loadOrganizationExpenses(this.org!);
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        }
  
      });
    }
  
    cancel() {
      this.form.reset();
    }

    approveExpense(expenseId: string) {
      console.log('expenseId', expenseId);
      this.empExpenseService.approveExpense(expenseId, {notes:"Approved by admin"}).subscribe({
        next: (response) => {
          this.orgService.showToastSuccess('Employee expense approved successfully');
          this.loadOrganizationExpenses(this.org!);
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        }
      });
    }

    rejectExpense(expenseId: string) {
      console.log('expenseId', expenseId);
      this.empExpenseService.rejectExpense(expenseId, {reason:"Rejected by admin"}).subscribe({
        next: (response) => {
          this.orgService.showToastSuccess('Employee expense rejected successfully');
          this.loadOrganizationExpenses(this.org!);
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        }
      });
    }
  
}
