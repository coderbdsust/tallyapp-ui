import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Organization } from '../../../core/models/organization.model';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../core/services/organization.service';
import { AccountingService } from '../../../core/services/accounting.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { CashFlowBalanceSummary, OrganizationBalance } from 'src/app/core/models/organization-balance.model';
import { CashBalanceViewerComponent } from '../cash-balance-viewer/cash-balance-viewer.component';
import { TransactionRecentViewComponent } from '../transaction-recent-view/transaction-recent-view.component';

@Component({
  selector: 'app-expense',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, WordPipe, CashBalanceViewerComponent, TransactionRecentViewComponent],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss',
})
export class ExpenseComponent extends FormError implements OnInit {
  form!: FormGroup;
  org: Organization | null = null;
  public organizationBalance: OrganizationBalance | null = null;
  balanceSummary: CashFlowBalanceSummary| null = null;
  refreshTime: Date = new Date();

  public readonly allPaymentMethods = ['Cash', 'Bank Transfer', 'Mobile Banking', 'Card', 'Cheque', 'Other'];

  public allExpenseTypes: string[] = [];

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly orgService: OrganizationService,
    private readonly accService: AccountingService,
  ) {
    super();
    this.initiatlizeForm(null);
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.org = org;
        this.initiatlizeForm(this.org);
        this.loadOrganizationBalance(this.org);
        this.loadBalanceSummary(this.org);
      }
    });

    this.accService.getExpenseType().subscribe({
      next: (types) => {
        this.allExpenseTypes = types;
      },
      error: (error) => {
        this.accService.showToastErrorResponse(error);
      },
    });
  }

  initiatlizeForm(org: Organization | null): void {
    this.form = this.fb.group({
      organizationId: [org?.id, Validators.required],
      transactionDate: ['', Validators.required],
      amount: [0, Validators.required],
      paymentMethod: ['', Validators.required],
      expenseType: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  submit() {

    if (this.form.invalid) {
      this.orgService.showToastError('Please fill in all required fields correctly.');
      return;
    }

    this.accService.recordExpense(this.form.value).subscribe({
      next: (response) => {
        this.orgService.showToastSuccess(response.message || 'Expense recorded successfully');
        this.initiatlizeForm(this.org);
        this.loadOrganizationBalance(this.org);
        this.loadBalanceSummary(this.org);
        this.refreshTime = new Date();
      },
      error: (error) => {
        this.orgService.showToastErrorResponse(error);
      },
    });
  }

  cancel() {
    this.form.reset();
  }

  loadOrganizationBalance(org: Organization | null): void {
    if (org) {
      this.accService.getOrganizationBalance(org.id, 'EXPENSE').subscribe({
        next: (response) => {
          this.organizationBalance = response;
        },
        error: (error) => {
          this.accService.showToastErrorResponse(error);
        },
      });
    }
  }

  loadBalanceSummary(org:Organization| null){
    if (org) {
      this.accService.getCashFlowBalanceSummary(org.id).subscribe({
        next: (response) => {
          this.balanceSummary = response;
        },
        error: (error) => {
          this.accService.showToastErrorResponse(error);
        },
      });
    }
  }
}
