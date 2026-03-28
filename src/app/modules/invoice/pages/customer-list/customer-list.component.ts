import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Customer, CustomerDetail, CustomerPayment } from '../../invoice.model';
import { Organization } from 'src/app/core/models/organization.model';
import { CustomerService } from 'src/app/core/services/customer.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { formatCurrency } from 'src/app/common/utils/common';
import { CustomerPaymentService } from 'src/app/core/services/customer-payment.service';
import { MatDialog } from '@angular/material/dialog';
import { ReasonModalComponent } from 'src/app/common/components/reason-modal/reason-modal.component';

@Component({
  selector: 'app-customer-list',
  imports: [AngularSvgIconModule, CommonModule, FormsModule, ReactiveFormsModule, WordPipe, TranslateModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent extends PaginatedComponent<Customer> implements OnInit, OnDestroy {
  search: string = '';
  loading: boolean = false;
  organization!: Organization;
  showDrawer = false;
  isEditMode = false;
  customerForm!: FormGroup;
  expandedCustomerId: string | null = null;
  customerDetail: CustomerDetail | null = null;
  detailLoading = false;
  formatCurrency = formatCurrency;
  customerPaymentForm!: FormGroup;
  showCustomerPaymentForm = false;
  existingCustomer: Customer | null = null;
  checkingCustomer = false;

  readonly allPaymentMethods = [
    'Cash',
    'Bank Transfer',
    'Mobile Banking',
    'Card',
    'Cheque',
    'Other'
  ];

  get isPaymentOnInvoice(): boolean {
    return this.organization?.paymentOnInvoice !== false;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private customerService: CustomerService,
    private orgService: OrganizationService,
    private customerPaymentService: CustomerPaymentService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    super();
    this.initForm();
    this.initCustomerPaymentForm();
  }

  ngOnInit(): void {
    this.subscribeToOrganization();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.customerService
      .getCustomerByOrganization(
        this.organization.id,
        this.currentPage,
        this.selectedRows,
        this.search
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.customerService.showToastErrorResponse(error);
        },
      });
  }

  private subscribeToOrganization(): void {
    this.orgService.organization$
      .pipe(takeUntil(this.destroy$))
      .subscribe((org) => {
        if (org) {
          this.organization = org;
          this.loadData();
        }
      });
  }

  private initForm(customer: Customer | null = null): void {
    const formConfig: any = {
      id: [customer?.id || ''],
      name: [customer?.name || '', Validators.required],
      mobile: [customer?.mobile || '', Validators.required],
      email: [customer?.email || ''],
      billingAddressLine: [customer?.billingAddressLine || ''],
      billingCity: [customer?.billingCity || ''],
      billingPostcode: [customer?.billingPostcode || ''],
      billingCountry: [customer?.billingCountry || ''],
      deliveryAddressLine: [customer?.deliveryAddressLine || ''],
      deliveryCity: [customer?.deliveryCity || ''],
      deliveryPostcode: [customer?.deliveryPostcode || ''],
      deliveryCountry: [customer?.deliveryCountry || '']
    };

    if (!this.isPaymentOnInvoice) {
      formConfig.openingDue = [customer?.openingDue ?? 0];
    }

    this.customerForm = this.fb.group(formConfig);
  }

  onSearchChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  openCreateDrawer(): void {
    this.isEditMode = false;
    this.initForm();
    this.existingCustomer = null;
    this.showDrawer = true;
  }

  openEditDrawer(customer: Customer): void {
    this.isEditMode = true;
    this.initForm(customer);
    this.existingCustomer = null;
    this.showDrawer = true;
  }

  closeDrawer(): void {
    this.showDrawer = false;
    this.existingCustomer = null;
    this.initForm();
  }

  checkExistingCustomer(): void {
    if (!this.organization || this.isEditMode) return;

    const email = this.customerForm.get('email')?.value?.trim() || '';
    const mobile = this.customerForm.get('mobile')?.value?.trim() || '';

    if (!email && !mobile) {
      this.existingCustomer = null;
      return;
    }

    this.checkingCustomer = true;
    this.customerService
      .checkCustomerExists(this.organization.id, email, mobile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          this.existingCustomer = customer ?? null;
          this.checkingCustomer = false;
        },
        error: () => {
          this.existingCustomer = null;
          this.checkingCustomer = false;
        }
      });
  }

  saveCustomer(): void {
    if (this.customerForm.invalid) return;

    const formData = this.customerForm.value;

    if (this.isEditMode && formData.id) {
      this.customerService
        .editCustomer(this.organization.id, formData.id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.customerService.showToastSuccessKey('INVOICE.CUSTOMER_LIST.TOAST.UPDATED');
            this.closeDrawer();
            this.loadData();
          },
          error: (err) => this.customerService.showToastErrorResponse(err)
        });
    } else {
      this.customerService
        .createCustomer(this.organization.id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.customerService.showToastSuccessKey('INVOICE.CUSTOMER_LIST.TOAST.CREATED');
            this.closeDrawer();
            this.loadData();
          },
          error: (err) => this.customerService.showToastErrorResponse(err)
        });
    }
  }

  getCustomerIndex(index: number): number {
    return index + this.startIndex;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.customerForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  viewCustomerDetail(customer: Customer): void {
    if (this.expandedCustomerId === customer.id) {
      this.expandedCustomerId = null;
      this.customerDetail = null;
      return;
    }

    this.expandedCustomerId = customer.id;
    this.detailLoading = true;
    this.customerDetail = null;

    this.customerService
      .getCustomerDetail(this.organization.id, customer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          this.customerDetail = detail;
          this.detailLoading = false;
        },
        error: (err) => {
          this.detailLoading = false;
          this.expandedCustomerId = null;
          this.customerService.showToastErrorResponse(err);
        }
      });
  }

  downloadCustomerReport(customerId: string, customerName: string): void {
    this.customerService
      .downloadCustomerReport(this.organization.id, customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfRes: Blob) => {
          const blob = new Blob([pdfRes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `customer-${customerName}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => this.customerService.showToastErrorResponse(err)
      });
  }

  getStatusColor(status: string): { bg: string; text: string } {
    const statusMap: Record<string, { bg: string; text: string }> = {
      'PAID': { bg: 'bg-green-100', text: 'text-green-800' },
      'UNPAID': { bg: 'bg-red-100', text: 'text-red-800' },
      'PARTIALLY_PAID': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'ISSUED': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'DRAFT': { bg: 'bg-blue-100', text: 'text-blue-800' }
    };
    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  private initCustomerPaymentForm(): void {
    this.customerPaymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      paymentDate: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      reference: [''],
      notes: ['']
    });
  }

  toggleCustomerPaymentForm(): void {
    this.showCustomerPaymentForm = !this.showCustomerPaymentForm;
    if (this.showCustomerPaymentForm) {
      this.initCustomerPaymentForm();
    }
  }

  submitCustomerPayment(customerId: string): void {
    if (this.customerPaymentForm.invalid || !this.organization) return;

    const payment = this.customerPaymentForm.value;
    this.customerPaymentService
      .receivePayment(this.organization.id, customerId, payment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.customerPaymentService.showToastSuccessKey('INVOICE.TOAST.PAYMENT_ADDED');
          this.initCustomerPaymentForm();
          this.showCustomerPaymentForm = false;
          this.refreshCustomerDetail(customerId);
        },
        error: (err) => this.customerPaymentService.showToastErrorResponse(err)
      });
  }

  deleteCustomerPayment(paymentId: string, customerId: string): void {
    const dialogRef = this.dialog.open(ReasonModalComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to delete this payment?' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.customerPaymentService
          .deletePayment(this.organization.id, paymentId, result.reason)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.customerPaymentService.showToastSuccessKey('INVOICE.TOAST.PAYMENT_DELETED');
              this.refreshCustomerDetail(customerId);
            },
            error: (err) => this.customerPaymentService.showToastErrorResponse(err)
          });
      }
    });
  }

  private refreshCustomerDetail(customerId: string): void {
    this.customerService
      .getCustomerDetail(this.organization.id, customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          this.customerDetail = detail;
        },
        error: (err) => this.customerService.showToastErrorResponse(err)
      });
    this.loadData();
  }

  downloadAllCustomerReport(){
    this.customerService.downloadAllCustomerReport(this.organization.id).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'all-customer-report.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => this.customerService.showToastErrorResponse(err)
    });
  }
}
