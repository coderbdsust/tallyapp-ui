import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { CashFlowBalanceSummary, OrganizationBalance } from 'src/app/core/models/organization-balance.model';
import { CashType } from 'src/app/core/models/cashtype.model';
import { DropdownComponent, DropdownOption } from 'src/app/common/components/dropdown/dropdown.component';
import { CashoutTypeDrawerComponent } from './cashout-type-drawer/cashout-type-drawer.component';
import { CashBalanceViewerComponent } from '../../components/cash-balance-viewer/cash-balance-viewer.component';
import { TransactionViewComponent } from '../../components/transaction-view/transaction-view.component';
import { Organization } from 'src/app/core/models/organization.model';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { AccountingService } from 'src/app/core/services/accounting.service';


@Component({
  selector: 'app-cash-out',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, CashBalanceViewerComponent, TransactionViewComponent, DropdownComponent, CashoutTypeDrawerComponent],
  templateUrl: './cash-out.component.html',
  styleUrl: './cash-out.component.scss'
})
export class CashOutComponent extends FormError implements OnInit {
  form!: FormGroup;
  org: Organization | null = null;
  public organizationBalance: OrganizationBalance | null = null;
  balanceSummary: CashFlowBalanceSummary | null = null;
  refreshTime: Date = new Date();
  cashOutTypes: CashType[] = [];
  cashOutCategories: DropdownOption[] = [];
  selectedCashOutType: DropdownOption | null = null;


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
    this.initiatlizeForm(null);
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.org = org;
        this.loadCashOutTypes();
        this.initiatlizeForm(this.org);
        this.loadBalanceSummary(this.org);
      }
    });
  }

  loadCashOutTypes(): void {
    this.accService.getCashOutTypes().subscribe({
      next: (response) => {
        this.cashOutTypes = response;
        response.forEach((type) => {
          this.cashOutCategories.push({
            label: type.displayName,
            value: type.name,
            description: type.description
          });
        });
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
      cashOutType: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      reference: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.selectedCashOutType = null;
  }

  submit() {

    if (this.form.invalid) {
      this.orgService.showToastError('Please fill in all required fields correctly.');
      return;
    }

    this.accService.recordCashOut(this.form.value).subscribe({
      next: (response) => {
        this.orgService.showToastSuccess(response.message || 'Cash Out recorded successfully');
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

  onCategorySelect(category: DropdownOption): void {
    this.form.patchValue({ cashOutType: category.value });
  }

  onAddCategory(): void {
    console.log('Opening category drawer...');
  }

  loadBalanceSummary(org: Organization | null) {
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
