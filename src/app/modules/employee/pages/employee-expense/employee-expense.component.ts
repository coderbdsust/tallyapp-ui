import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CashBalanceViewerComponent } from 'src/app/modules/cash-management/components/cash-balance-viewer/cash-balance-viewer.component';
import { CashFlowBalanceSummary } from 'src/app/core/models/organization-balance.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { Organization } from 'src/app/core/models/organization.model';
import { Employee } from 'src/app/core/models/employee.model';
import { EmployeeExpense } from 'src/app/core/models/employee-expense.model';
import { Router } from '@angular/router';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { EmployeeExpenseService } from 'src/app/core/services/employee-expense.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { ExpenseTypeDrawerComponent } from "../../drawer/expense-type-drawer/expense-type-drawer.component";
import { DropdownComponent, DropdownOption } from 'src/app/common/components/dropdown/dropdown.component';
import { CashType, CashTypeName } from 'src/app/core/models/cashtype.model';
import { CashtypeService } from 'src/app/core/services/cashtype.service';

@Component({
  selector: 'app-employee-expense',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CashBalanceViewerComponent,
    ExpenseTypeDrawerComponent,
    DropdownComponent
  ],
  templateUrl: './employee-expense.component.html',
  styleUrl: './employee-expense.component.scss'
})
export class EmployeeExpenseComponent extends FormError implements OnInit {
   form!: FormGroup;
   org: Organization|null=null;
   balanceSummary:CashFlowBalanceSummary|null=null;

    public readonly allPaymentMethods = [
      'Cash',
      'Bank Transfer',
      'Mobile Banking',
      'Card',
      'Cheque',
      'Other'
    ];

    public allExpenseTypes:DropdownOption[] = [];
    public expenseType: DropdownOption|null=null;
    public allEmployees:Employee[]=[];
    public employeeExpenses:EmployeeExpense[]=[];
  
    constructor(
      private readonly router: Router,
      private readonly fb: FormBuilder,
      private readonly empService: EmployeeService,
      private readonly empExpenseService: EmployeeExpenseService,
      private readonly orgService: OrganizationService,
      private readonly accService: AccountingService,
      private readonly cashTypeService: CashtypeService
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
          this.loadAllExpenseTypes(org);
          this.loadAllEmployees(org);
          this.loadOrganizationExpenses(org);
          this.loadBalanceSummary(org);
        }
      });
    }

    loadAllExpenseTypes(org:Organization){
      this.cashTypeService.getAllCashTypeByType(org.id, CashTypeName.EMPLOYEE_EXPENSE_TYPE).subscribe({
            next: (response) => {
              response.forEach((type) => {
                this.allExpenseTypes.push({
                  label: type.displayName,
                  value: type.id,
                  description: type.description,
                  default: type.isSystemDefault,
                  type: type.accountType
                });
              });
            },
            error: (error) => {
              this.cashTypeService.showToastErrorResponse(error);
            },
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

    onCategorySelect(category: DropdownOption): void {
        this.form.patchValue({ expenseType: category.value });
    }
    
    onAddCategory(): void {
        console.log('Opening category drawer...');
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
          this.loadBalanceSummary(this.org!);
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

    loadBalanceSummary(org: Organization) {
      this.accService.getCashFlowBalanceSummary(org.id).subscribe({
        next: (response) => {
          this.balanceSummary = response;
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        }
      });
    }

}
