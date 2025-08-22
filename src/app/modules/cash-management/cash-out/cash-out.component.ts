import { Component, OnInit } from '@angular/core';
import { Organization } from '../../../core/models/organization.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../core/services/organization.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { AccountingService } from '../../../core/services/accounting.service';
import { CashFlowBalanceSummary, OrganizationBalance } from 'src/app/core/models/organization-balance.model';
import { HeaderStatsComponent } from '../../dashboard/components/header-stats/header-stats.component';
import { TransactionViewComponent } from '../../dashboard/components/transaction-view/transaction-view.component';
import { CashBalanceViewerComponent } from '../cash-balance-viewer/cash-balance-viewer.component';

@Component({
  selector: 'app-cash-out',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, CashBalanceViewerComponent, TransactionViewComponent],
  templateUrl: './cash-out.component.html',
  styleUrl: './cash-out.component.scss'
})
export class CashOutComponent extends FormError implements OnInit{
 form!: FormGroup;
 org: Organization|null=null;
 public organizationBalance: OrganizationBalance | null = null;
 balanceSummary: CashFlowBalanceSummary | null = null;

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
       console.log('Expense Component Initialized');
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
     }
   
     initiatlizeForm(org: Organization|null): void {
       this.form = this.fb.group({
         organizationId: [org?.id, Validators.required],
         transactionDate: ['', Validators.required],
         amount: [0, Validators.required],
         paymentMethod: ['', Validators.required],
         reference: ['', Validators.required],
         description: ['', Validators.required],
       });
     }
   
     submit() {
       console.log(this.form.value);
   
       if(this.form.invalid) {
         this.orgService.showToastError('Please fill in all required fields correctly.');
         return;
       }
       
        this.accService.recordCashOut(this.form.value).subscribe({
         next: (response) => {
           this.orgService.showToastSuccess(response.message || 'Cash Out recorded successfully');
           this.initiatlizeForm(this.org);
           this.loadOrganizationBalance(this.org);
           this.loadBalanceSummary(this.org);
         },
         error: (error) => {
           this.orgService.showToastErrorResponse(error);
         }
   
       });
     }
   
     cancel() {
       this.form.reset();
     }

  loadOrganizationBalance(org: Organization | null): void {
    if (org) {
      this.accService.getOrganizationBalance(org.id, 'CASH_OUT').subscribe({
        next: (response) => {
          this.organizationBalance = response;
        },
        error: (error) => {
          this.accService.showToastErrorResponse(error);
        },
      });
    }
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
