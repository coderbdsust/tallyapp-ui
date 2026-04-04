import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';
import { Invoice, Customer } from '../../invoice.model';
import { Organization } from 'src/app/core/models/organization.model';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { CustomerService } from 'src/app/core/services/customer.service';

@Component({
  selector: 'app-invoice-list',
  imports: [AngularSvgIconModule, CommonModule, FormsModule, ReactiveFormsModule, WordPipe, TranslateModule, NgSelectComponent],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent extends PaginatedComponent<Invoice> implements OnInit, OnDestroy {
  search: string = '';
  searchCriteria: string = '';
  loading: boolean = false;
  submitted = false;
  organization!: Organization;
  formatCurrency = formatCurrency;

  // Create invoice drawer state
  showCreateDrawer = false;
  invoiceForm!: FormGroup;
  submitting = false;

  // Customer selection for drawer
  drawerCustomers: any[] = [];
  drawerCustomerPage = 0;
  drawerCustomerHasMore = true;
  drawerCustomerLoading = false;
  selectedCustomer: Customer | null = null;

  // Inline customer creation
  showCustomerForm = false;
  customerForm!: FormGroup;
  customerSubmitted = false;
  savingCustomer = false;
  existingCustomer: Customer | null = null;
  checkingCustomer = false;

  get isPaymentOnInvoice(): boolean {
    return this.organization?.paymentOnInvoice !== false;
  }

  get isExistingBlock(): boolean {
    return !!this.existingCustomer;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private _router: Router,
    private invoiceService: InvoiceService,
    private orgService: OrganizationService,
    private customerService: CustomerService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    super();
    this.initInvoiceForm();
    this.initCustomerForm();
  }

  ngOnInit(): void {
    this.subscribeToOrganization();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Abstract method implementation
  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.invoiceService
      .getInvoiceByOrganization(
        this.organization.id,
        this.currentPage,
        this.selectedRows,
        this.search,
        this.searchCriteria
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.invoiceService.showToastErrorResponse(error);
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

  // Event handlers
  onSearchChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  // Invoice actions
  viewInvoice(invoice: Invoice): void {
    console.log('Viewing invoice:', invoice);
    this._router.navigate(['/invoice/detail'], {
      queryParams: { orgId: this.organization.id, invoiceId: invoice.id }
    });
  }

  editInvoice(invoice: Invoice): void {
    console.log('Editing invoice:', invoice);
    this._router.navigate(['/invoice/add'], {
      queryParams: { orgId: this.organization.id, invoiceId: invoice.id }
    });
  }

  deleteInvoice(invoice: Invoice): void {
    console.log('Deleting invoice:', invoice);
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete ${invoice.invoiceNumber} ${invoice.customer?.name || ''}?`
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.invoiceService
          .deleteInvoice(invoice.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.invoiceService.showToastSuccessKey('INVOICE.TOAST.DELETED');
              this.loadData();
            },
            error: (errRes) => {
               console.log(errRes);
              this.invoiceService.showToastErrorResponse(errRes);
            },
          });
      }
    });
  }

  // ── Create Invoice Drawer ────────────────────────────────────────

  private initInvoiceForm(): void {
    this.invoiceForm = this.fb.group({
      taxPercent: [0],
      vatPercent: [0]
    });
  }

  openCreateDrawer(): void {
    this.showCreateDrawer = true;
    this.showCustomerForm = false;
    this.initInvoiceForm();
    if (this.organization) {
      this.invoiceForm.patchValue({
        taxPercent: this.organization.tax || 0,
        vatPercent: this.organization.vat || 0
      });
    }
    this.selectedCustomer = null;
    this.drawerCustomers = [];
    this.drawerCustomerPage = 0;
    this.drawerCustomerHasMore = true;
    this.loadDrawerCustomers();
  }

  closeCreateDrawer(): void {
    this.showCreateDrawer = false;
    this.showCustomerForm = false;
    this.selectedCustomer = null;
    this.drawerCustomers = [];
    this.existingCustomer = null;
  }

  loadDrawerCustomers(search: string = ''): void {
    if (!this.organization) return;
    this.drawerCustomerLoading = true;
    this.customerService
      .getCustomerByOrganization(this.organization.id, this.drawerCustomerPage, 5, search)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const mapped = response.content.map(c => ({
            ...c,
            label: `${c.name} — ${c.mobile}`
          }));
          if (this.drawerCustomerPage === 0) {
            this.drawerCustomers = mapped;
          } else {
            this.drawerCustomers = [...this.drawerCustomers, ...mapped];
          }
          this.drawerCustomerHasMore = !response.last;
          this.drawerCustomerLoading = false;
        },
        error: () => {
          this.drawerCustomerHasMore = false;
          this.drawerCustomerLoading = false;
        }
      });
  }

  onDrawerCustomerSearch(event: { term: string }): void {
    this.drawerCustomerPage = 0;
    this.drawerCustomerHasMore = true;
    this.loadDrawerCustomers(event.term);
  }

  onDrawerCustomerScrollEnd(): void {
    if (!this.drawerCustomerHasMore || this.drawerCustomerLoading) return;
    this.drawerCustomerPage++;
    this.loadDrawerCustomers();
  }

  onDrawerCustomerSelect(customer: Customer | null): void {
    this.selectedCustomer = customer || null;
  }

  // ── Inline Customer Creation ────────────────────────────────────

  private initCustomerForm(): void {
    const formConfig: any = {
      name: ['', Validators.required],
      mobile: ['', [
        Validators.required,
        Validators.pattern(/^01[3-9]\d{8}$/),
        Validators.minLength(11),
        Validators.maxLength(11)
      ]],
      email: [''],
      billingAddressLine: [''],
      billingCity: [''],
      billingPostcode: [''],
      billingCountry: [''],
      deliveryAddressLine: [''],
      deliveryCity: [''],
      deliveryPostcode: [''],
      deliveryCountry: ['']
    };

    if (!this.isPaymentOnInvoice) {
      formConfig.openingDue = [0];
    }

    this.customerForm = this.fb.group(formConfig);
  }

  toggleCustomerForm(): void {
    this.showCustomerForm = !this.showCustomerForm;
    if (this.showCustomerForm) {
      this.customerSubmitted = false;
      this.existingCustomer = null;
      this.initCustomerForm();
    }
  }

  isCustomerFieldInvalid(controlName: string): boolean {
    const control = this.customerForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  checkExistingCustomer(): void {
    if (!this.organization) return;

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

  saveNewCustomer(): void {
    this.customerSubmitted = true;
    if (this.customerForm.invalid || !this.organization || this.isExistingBlock) return;
    this.savingCustomer = true;

    this.customerService
      .createCustomer(this.organization.id, this.customerForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.customerService.showToastSuccessKey('INVOICE.CUSTOMER_LIST.TOAST.CREATED');
          this.selectedCustomer = created;
          this.drawerCustomers = [{ ...created, label: `${created.name} — ${created.mobile}` }, ...this.drawerCustomers];
          this.savingCustomer = false;
          this.showCustomerForm = false;
        },
        error: (err) => {
          this.savingCustomer = false;
          this.customerService.showToastErrorResponse(err);
        }
      });
  }

  // ── Invoice Submission ──────────────────────────────────────────

  get isDrawerValid(): boolean {
    return this.invoiceForm.valid;
  }

  submitCreateInvoice(): void {
    if (!this.invoiceForm.valid || !this.organization) return;
    this.submitting = true;

    const request: { customerId?: string; tax?: number; vat?: number } = {
      tax: this.invoiceForm.value.taxPercent,
      vat: this.invoiceForm.value.vatPercent
    };

    if (this.selectedCustomer) {
      request.customerId = this.selectedCustomer.id;
    }

    this.invoiceService
      .createInvoiceWithDetails(this.organization.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invoice) => {
          this.invoiceService.showToastSuccessKey('INVOICE.TOAST.INVOICE_CREATED');
          this.submitting = false;
          this.closeCreateDrawer();
          this._router.navigate(['/invoice/add'], {
            queryParams: { orgId: this.organization.id, invoiceId: invoice.id }
          });
        },
        error: (err) => {
          this.submitting = false;
          this.invoiceService.showToastErrorResponse(err);
        }
      });
  }

  createInvoice(): void {
    this.openCreateDrawer();
  }

  downloadInvoice(invoice: Invoice): void {
    this.invoiceService
      .downloadInvoice(this.organization.id, invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfRes: Blob) => this.handleBlobDownload(pdfRes, invoice),
        error: (err) => this.invoiceService.showToastErrorResponse(err),
      });
  }

  downloadReceipt(invoice: Invoice): void {
    this.invoiceService
      .downloadInvoiceReceipt(this.organization.id, invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfRes: Blob) => this.handleBlobDownload(pdfRes, invoice),
        error: (err) => this.invoiceService.showToastErrorResponse(err),
      });
  }

  private handleBlobDownload(blob: Blob, invoice: Invoice): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber || invoice.id}.pdf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
    this.invoiceService.showToastSuccessKey('TOAST.DOWNLOADED_SUCCESSFULLY');
  }

  // Utility methods
  getInvoiceIndex(index: number): number {
    return index + this.startIndex;
  }

  getStatusColor(status: string): { bg: string; text: string } {
    const statusMap: Record<string, { bg: string; text: string }> = {
      'PAID': { bg: 'bg-green-100', text: 'text-green-800' },
      'UNPAID': { bg: 'bg-red-100', text: 'text-red-800' },
      'PARTIALLY_PAID': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'OVERDUE': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'ISSUED': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'DRAFT': { bg: 'bg-blue-100', text: 'text-blue-800' }
    };

    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  getAmountColor(amount: number, type: 'due' | 'paid' | 'total'): string {
    switch (type) {
      case 'due':
        if (amount > 0) return 'text-red-600 font-semibold';
        return 'text-green-600';
      case 'paid':
        return amount > 0 ? 'text-green-600 font-semibold' : 'text-gray-500';
      case 'total':
        return 'text-blue-600 font-semibold';
      default:
        return 'text-gray-900';
    }
  }

  formatCustomerInfo(invoice: Invoice): string {
    if (!invoice.customer) return 'No customer';
    const name = invoice.customer.name || 'Unknown';
    const mobile = invoice.customer.mobile;
    return mobile ? `${name} (${mobile})` : name;
  }

  isOverdue(invoice: Invoice): boolean {
    if (!invoice.invoiceDate || invoice.invoiceStatus === 'PAID') return false;
    const invoiceDate = new Date(invoice.invoiceDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24));
    return daysDiff > 30 && invoice.remainingAmount > 0; // Assuming 30 days payment term
  }
}