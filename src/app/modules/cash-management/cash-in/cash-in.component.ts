import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Organization } from '../../../core/models/organization.model';
import { OrganizationService } from '../../../core/services/organization.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { AccountingService } from '../../../core/services/accounting.service';
import { CashFlowBalanceSummary, OrganizationBalance } from 'src/app/core/models/organization-balance.model';
import { CashBalanceViewerComponent } from '../cash-balance-viewer/cash-balance-viewer.component';
import { CashType } from 'src/app/core/services/cashtype.model';
import { TransactionViewComponent } from "../transaction-view/transaction-view.component";

@Component({
  selector: 'app-cash-in',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, CashBalanceViewerComponent, TransactionViewComponent],
  templateUrl: './cash-in.component.html',
  styleUrl: './cash-in.component.scss',
})
export class CashInComponent extends FormError implements OnInit {
  form!: FormGroup;
  org: Organization|null = null;
  public organizationBalance: OrganizationBalance | null = null;
  balanceSummary: CashFlowBalanceSummary | null = null;
  refreshTime: Date = new Date();
  cashTypes: CashType[] = [];

  public readonly allPaymentMethods = [
    'Cash',
    'Bank Transfer',
    'Mobile Banking',
    'Card',
    'Cheque',
    'Other'
  ];

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly orgService: OrganizationService,
    private readonly accService: AccountingService
  ) {
    super();  
    this.initiatlizeForm(null)
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.org = org;
        this.loadCashInTypes();
        this.initiatlizeForm(this.org);
        this.loadBalanceSummary(this.org);
      }
    });
  }

  loadCashInTypes() {
    this.accService.getCashInTypes().subscribe({
      next: (response) => {
        this.cashTypes = response;
      },
      error: (error) => {
        this.accService.showToastErrorResponse(error);
      },
    });
  }

  initiatlizeForm(org: Organization|null): void {
    this.form = this.fb.group({
      organizationId: [org?.id, Validators.required],
      transactionDate: ['', Validators.required],
      amount: [0, Validators.required],
      cashInType: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      reference: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  submit() {
    if(this.form.invalid) {
      this.orgService.showToastError('Please fill in all required fields correctly.');
      return;
    }
    
     this.accService.recordCashIn(this.form.value).subscribe({
      next: (response) => {
        this.orgService.showToastSuccess(response.message || 'Cash In recorded successfully');
        this.initiatlizeForm(this.org);
        this.loadBalanceSummary(this.org);
        this.refreshTime = new Date();
      },
      error: (error) => {
        this.orgService.showToastErrorResponse(error);
      }

    });
  }

  cancel() {
    this.form.reset();
  }

  loadBalanceSummary(org:Organization | null){
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
