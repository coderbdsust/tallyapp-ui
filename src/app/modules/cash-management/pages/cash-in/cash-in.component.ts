import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CashFlowBalanceSummary, OrganizationBalance } from 'src/app/core/models/organization-balance.model';
import { CashType, CashTypeName } from 'src/app/core/models/cashtype.model';
import { CashBalanceViewerComponent } from '../../components/cash-balance-viewer/cash-balance-viewer.component';
import { TransactionViewComponent } from '../../components/transaction-view/transaction-view.component';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { Organization } from 'src/app/core/models/organization.model';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { ToWords } from 'to-words';
import { CashtypeService } from 'src/app/core/services/cashtype.service';
import { DropdownComponent, DropdownOption } from 'src/app/common/components/dropdown/dropdown.component';
import { CashinTypeDrawerComponent } from './cashin-type-drawer/cashin-type-drawer.component';


@Component({
  selector: 'app-cash-in',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CashBalanceViewerComponent,
    TransactionViewComponent,
    DropdownComponent,
    CashinTypeDrawerComponent
  ],
  templateUrl: './cash-in.component.html',
  styleUrl: './cash-in.component.scss',
})
export class CashInComponent extends FormError implements OnInit {
  form!: FormGroup;
  org: Organization | null = null;
  public organizationBalance: OrganizationBalance | null = null;
  balanceSummary: CashFlowBalanceSummary | null = null;
  refreshTime: Date = new Date();
  cashTypes: CashType[] = [];
  cashInCategories: DropdownOption[] = [];
  selectedCashInType: DropdownOption | null = null;
  public amountLabel: string | null = null;
  readonly toWords = new ToWords({
    localeCode: 'en-BD',
    converterOptions: {
      currency: true,
      ignoreDecimal: true
    },
  });

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
    private readonly accService: AccountingService,
    private readonly cashTypeService: CashtypeService
  ) {
    super();
    this.initiatlizeForm(null)
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.org = org;
        this.loadCashInTypes(this.org);
        this.initiatlizeForm(this.org);
        this.loadBalanceSummary(this.org);
      }
    });
  }

  loadCashInTypes(org: Organization) {
    this.cashTypeService.getAllCashTypeByType(org.id, CashTypeName.CASH_IN_TYPE).subscribe({
      next: (response) => {
        this.cashTypes = response;
        response.forEach((type) => {
          this.cashInCategories.push({
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

  initiatlizeForm(org: Organization | null): void {
    this.form = this.fb.group({
      organizationId: [org?.id, Validators.required],
      transactionDate: ['', Validators.required],
      amount: [0, Validators.required],
      cashInType: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      reference: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.amountLabel = null;

    this.form.get('amount')?.valueChanges.subscribe(value => {
      const amountNumber = Number(value);
      if (!isNaN(amountNumber) && amountNumber > 0) {
        this.amountLabel = this.toWords.convert(amountNumber);
      } else {
        this.amountLabel = null;
      }
    });

  }

  onCategorySelect(category: DropdownOption): void {
    this.form.patchValue({ cashInType: category.value });
  }

  onAddCategory(): void {
    console.log('Opening category drawer...');
  }

  submit() {
    if (this.form.invalid) {
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
