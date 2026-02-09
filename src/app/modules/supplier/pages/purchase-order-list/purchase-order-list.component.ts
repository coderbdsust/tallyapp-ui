import { Component, OnInit, OnDestroy } from '@angular/core';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';
import { PurchaseOrderListItem } from '../../supplier.model';
import { Organization } from 'src/app/core/models/organization.model';
import { PurchaseOrderService } from 'src/app/core/services/purchase-order.service';
import { OrganizationService } from 'src/app/core/services/organization.service';

@Component({
  selector: 'app-purchase-order-list',
  imports: [AngularSvgIconModule, CommonModule, WordPipe],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.scss'
})
export class PurchaseOrderListComponent extends PaginatedComponent<PurchaseOrderListItem> implements OnInit, OnDestroy {
  search: string = '';
  statusFilter: string = 'ALL';
  loading: boolean = false;
  organization!: Organization;
  formatCurrency = formatCurrency;

  statusOptions = ['ALL', 'DRAFT', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private poService: PurchaseOrderService,
    private orgService: OrganizationService
  ) {
    super();
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
    this.poService
      .listPurchaseOrders(this.organization.id, this.statusFilter, this.search, this.currentPage, this.selectedRows)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.poService.showToastErrorResponse(error);
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

  onSearchChange(event: Event): void {
    this.search = (event.target as HTMLInputElement).value;
    this.onFilterChange();
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  createPurchaseOrder(): void {
    this.router.navigate(['/supplier/purchase-order/create'], {
      queryParams: { orgId: this.organization.id }
    });
  }

  viewPurchaseOrder(po: PurchaseOrderListItem): void {
    this.router.navigate(['/supplier/purchase-order/detail'], {
      queryParams: { orgId: this.organization.id, poId: po.id }
    });
  }

  editPurchaseOrder(po: PurchaseOrderListItem): void {
    this.router.navigate(['/supplier/purchase-order/create'], {
      queryParams: { orgId: this.organization.id, poId: po.id }
    });
  }

  getStatusColor(status: string): { bg: string; text: string } {
    const statusMap: Record<string, { bg: string; text: string }> = {
      'DRAFT': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'APPROVED': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      'PARTIALLY_PAID': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'PAID': { bg: 'bg-green-100', text: 'text-green-800' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800' },
    };
    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  getAmountColor(amount: number, type: 'due' | 'paid' | 'total'): string {
    switch (type) {
      case 'due':
        return amount > 0 ? 'text-red-600 font-semibold' : 'text-green-600';
      case 'paid':
        return amount > 0 ? 'text-green-600 font-semibold' : 'text-gray-500';
      case 'total':
        return 'text-blue-600 font-semibold';
      default:
        return 'text-gray-900';
    }
  }

  isDraft(po: PurchaseOrderListItem): boolean {
    return po.status === 'DRAFT';
  }

  isOverdue(po: PurchaseOrderListItem): boolean {
    if (!po.dueDate || po.status === 'PAID' || po.status === 'CANCELLED') return false;
    const dueDate = new Date(po.dueDate);
    const today = new Date();
    return dueDate < today && po.dueAmount > 0;
  }
}
