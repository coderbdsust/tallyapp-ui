import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { formatCurrency } from 'src/app/common/utils/common';
import { MatDialog } from '@angular/material/dialog';
import { ReasonModalComponent } from 'src/app/common/components/reason-modal/reason-modal.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Organization } from 'src/app/core/models/organization.model';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { CustomerService } from 'src/app/core/services/customer.service';
import { ProductReturnService } from 'src/app/core/services/product-return.service';
import { ProductReturnResponse, CreateReturnRequest, AddReturnItemRequest, ReturnItem, ProductCondition } from '../../product-return.model';
import { Customer } from '../../invoice.model';

@Component({
  selector: 'app-product-return-list',
  imports: [AngularSvgIconModule, CommonModule, FormsModule, ReactiveFormsModule, WordPipe, TranslateModule, NgSelectComponent],
  templateUrl: './product-return-list.component.html',
  styleUrl: './product-return-list.component.scss'
})
export class ProductReturnListComponent extends PaginatedComponent<ProductReturnResponse> implements OnInit, OnDestroy {
  loading = false;
  organization!: Organization;
  formatCurrency = formatCurrency;

  // Expanded row
  expandedReturnId: string | null = null;

  // Add-item form for expanded DRAFT
  showAddItemForm = false;
  addItemForm!: FormGroup;
  addingItem = false;

  // Create drawer state
  showCreateDrawer = false;
  returnForm!: FormGroup;
  submitting = false;

  // Customer selection for drawer
  drawerCustomers: any[] = [];
  drawerCustomerPage = 0;
  drawerCustomerHasMore = true;
  drawerCustomerLoading = false;
  selectedCustomer: Customer | null = null;

  get isPaymentOnInvoice(): boolean {
    return this.organization?.paymentOnInvoice !== false;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private productReturnService: ProductReturnService,
    private orgService: OrganizationService,
    private customerService: CustomerService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    super();
    this.initReturnForm();
    this.initAddItemForm();
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
    this.productReturnService
      .getReturnsByOrganization(this.organization.id, this.currentPage, this.selectedRows)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.productReturnService.showToastErrorResponse(error);
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

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  // ── Expand / Collapse Row ─────────────────────────────────────────

  toggleExpand(ret: ProductReturnResponse): void {
    if (this.expandedReturnId === ret.id) {
      this.expandedReturnId = null;
      this.showAddItemForm = false;
    } else {
      this.expandedReturnId = ret.id;
      this.showAddItemForm = false;
    }
  }

  getExpandedReturn(): ProductReturnResponse | null {
    return this.pageResponse?.content.find(r => r.id === this.expandedReturnId) || null;
  }

  // ── Add Item (inline in expanded row) ─────────────────────────────

  private initAddItemForm(): void {
    this.addItemForm = this.fb.group({
      productCode: ['', Validators.required],
      quantityReturned: [1, [Validators.required, Validators.min(1)]],
      pricePerUnit: ['', [Validators.required, Validators.min(0)]],
      discountPercent: [0],
      productCondition: ['RESTORABLE', Validators.required]
    });
  }

  toggleAddItemForm(): void {
    this.showAddItemForm = !this.showAddItemForm;
    if (this.showAddItemForm) {
      this.initAddItemForm();
    }
  }

  submitAddItem(returnId: string): void {
    if (this.addItemForm.invalid || !this.organization) return;
    this.addingItem = true;

    const request: AddReturnItemRequest = {
      productCode: this.addItemForm.value.productCode,
      quantityReturned: this.addItemForm.value.quantityReturned,
      pricePerUnit: this.addItemForm.value.pricePerUnit,
      discountPercent: this.addItemForm.value.discountPercent || 0,
      productCondition: this.addItemForm.value.productCondition as ProductCondition
    };

    this.productReturnService
      .addItem(this.organization.id, returnId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.addingItem = false;
          this.showAddItemForm = false;
          this.initAddItemForm();
          this.updateInPage(updated, 'id');
          this.productReturnService.showToastSuccessKey('PRODUCT_RETURN.TOAST.ITEM_ADDED');
        },
        error: (err) => {
          this.addingItem = false;
          this.productReturnService.showToastErrorResponse(err);
        }
      });
  }

  removeItem(returnId: string, item: ReturnItem): void {
    this.productReturnService
      .removeItem(this.organization.id, returnId, item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.updateInPage(updated, 'id');
          this.productReturnService.showToastSuccessKey('PRODUCT_RETURN.TOAST.ITEM_REMOVED');
        },
        error: (err) => this.productReturnService.showToastErrorResponse(err)
      });
  }

  // ── Approve Return ────────────────────────────────────────────────

  approveReturn(ret: ProductReturnResponse): void {
    this.productReturnService
      .approveReturn(this.organization.id, ret.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.updateInPage(updated, 'id');
          this.productReturnService.showToastSuccessKey('PRODUCT_RETURN.TOAST.APPROVED');
        },
        error: (err) => this.productReturnService.showToastErrorResponse(err)
      });
  }

  // ── Delete Return ─────────────────────────────────────────────────

  deleteReturn(ret: ProductReturnResponse): void {
    const dialogRef = this.dialog.open(ReasonModalComponent, {
      width: '400px',
      data: { message: `Are you sure you want to delete return ${ret.returnNumber}?` }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.productReturnService
          .deleteReturn(this.organization.id, ret.id, result.reason)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.productReturnService.showToastSuccessKey('PRODUCT_RETURN.TOAST.DELETED');
              if (this.expandedReturnId === ret.id) {
                this.expandedReturnId = null;
              }
              this.loadData();
            },
            error: (err) => this.productReturnService.showToastErrorResponse(err)
          });
      }
    });
  }

  // ── Create Drawer (DRAFT header) ──────────────────────────────────

  private initReturnForm(): void {
    this.returnForm = this.fb.group({
      reason: [''],
      refundType: ['CASH_REFUND', Validators.required],
      taxPercent: [0],
      vatPercent: [0]
    });
  }

  openCreateDrawer(): void {
    this.showCreateDrawer = true;
    this.initReturnForm();
    if (this.organization) {
      this.returnForm.patchValue({
        refundType: this.isPaymentOnInvoice ? 'CASH_REFUND' : 'CREDIT_TO_BALANCE',
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
    this.selectedCustomer = null;
    this.drawerCustomers = [];
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

  get isDrawerValid(): boolean {
    return this.returnForm.valid && !!this.selectedCustomer;
  }

  submitDraftReturn(): void {
    if (!this.isDrawerValid || !this.selectedCustomer) return;
    this.submitting = true;

    const request: CreateReturnRequest = {
      reason: this.returnForm.value.reason,
      refundType: this.returnForm.value.refundType,
      taxPercent: this.returnForm.value.taxPercent,
      vatPercent: this.returnForm.value.vatPercent
    };

    this.productReturnService
      .createDraftReturn(this.organization.id, this.selectedCustomer.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.productReturnService.showToastSuccessKey('PRODUCT_RETURN.TOAST.CREATED');
          this.submitting = false;
          this.closeCreateDrawer();
          this.loadData();
          // Auto-expand the newly created draft so user can add items
          setTimeout(() => {
            this.expandedReturnId = created.id;
          }, 300);
        },
        error: (err) => {
          this.submitting = false;
          this.productReturnService.showToastErrorResponse(err);
        }
      });
  }

  // ── Utility ───────────────────────────────────────────────────────

  getStatusBadge(status: string): { bg: string; text: string } {
    const map: Record<string, { bg: string; text: string }> = {
      'DRAFT': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'APPROVED': { bg: 'bg-green-100', text: 'text-green-800' },
      'DELETED': { bg: 'bg-red-100', text: 'text-red-800' }
    };
    return map[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  getRefundTypeBadge(type: string): { bg: string; text: string } {
    const map: Record<string, { bg: string; text: string }> = {
      'CASH_REFUND': { bg: 'bg-green-100', text: 'text-green-800' },
      'CREDIT_TO_BALANCE': { bg: 'bg-blue-100', text: 'text-blue-800' }
    };
    return map[type] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  getConditionBadge(condition: string): { bg: string; text: string } {
    const map: Record<string, { bg: string; text: string }> = {
      'RESTORABLE': { bg: 'bg-green-100', text: 'text-green-800' },
      'BROKEN': { bg: 'bg-red-100', text: 'text-red-800' }
    };
    return map[condition] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}
