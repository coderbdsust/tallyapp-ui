import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Subject, takeUntil } from 'rxjs';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { getAmountColor, getTransactionTypeColor } from 'src/app/common/utils/colormap';
import { formatCurrency } from 'src/app/common/utils/common';
import { Transaction } from 'src/app/core/models/organization-balance.model';
import { Organization } from 'src/app/core/models/organization.model';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { OrganizationService } from 'src/app/core/services/organization.service';

@Component({
  selector: 'app-transaction-view',
  imports: [CommonModule, AngularSvgIconModule, WordPipe],
  templateUrl: './transaction-view.component.html',
  styleUrl: './transaction-view.component.scss'
})
export class TransactionViewComponent extends PaginatedComponent<Transaction> implements OnInit, OnDestroy {
  organization: Organization | null = null;
  search: string = '';
  allTransactionTypes: string[] = [];
  startDate: string | null = null;
  endDate: string | null = null;
  transactionType: string = '';
  loading: boolean = false;
  @Input()
  refreshTime: Date = new Date();
  formatCurrency = formatCurrency;
  getAmountColor = getAmountColor;
  getTransactionTypeColor = getTransactionTypeColor;

  private destroy$ = new Subject<void>();

  constructor(
    private orgService: OrganizationService,
    private accService: AccountingService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    this.loadData();
  }

  // Abstract method implementation
  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.accService
      .getTransactionSummaryByPage(
        this.organization.id,
        this.transactionType,
        this.startDate,
        this.endDate,
        this.currentPage,
        this.selectedRows
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error fetching transaction summary:', error);
        },
      });
  }

  private initializeComponent(): void {
    this.loadTransactionTypes();
    this.subscribeToOrganization();
  }

  private loadTransactionTypes(): void {
    this.accService.getTransactionType()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: string[]) => this.allTransactionTypes = data,
        error: (error) => {
          console.error('Error fetching transaction types:', error);
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
  onSelectTxnTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.transactionType = selectedValue || '';
    this.onFilterChange();
  }

  onStartDateChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.startDate = input || null;
    this.onFilterChange();
  }

  onEndDateChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.endDate = input || null;
    this.onFilterChange();
  }

  onSearchChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (input.length < 4 && input.length > 0) {
      this.orgService.showToastInfo('Search term must be at least 4 characters long.');
      return;
    }
    this.search = input;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  // Utility methods
  getTransactionIndex(index: number): number {
    return index + this.startIndex;
  }

  getTransactionParty(txn: Transaction): { name: string; type: string } {
    if (txn.supplierName) {
      return { name: txn.supplierName, type: 'Supplier' };
    }
    if (txn.customerName) {
      return { name: txn.customerName, type: 'Customer' };
    }
    if (txn.employeeName) {
      return { name: txn.employeeName, type: 'Employee' };
    }
    return { name: 'N/A', type: '' };
  }

  // Clear filters
  clearFilters(): void {
    this.search = '';
    this.transactionType = '';
    this.startDate = null;
    this.endDate = null;
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return !!(this.search || this.transactionType || this.startDate || this.endDate);
  }

  getFilterSummary(): string {
    const filters: string[] = [];
    if (this.transactionType) filters.push(`Type: ${this.transactionType}`);
    if (this.startDate) filters.push(`From: ${this.startDate}`);
    if (this.endDate) filters.push(`To: ${this.endDate}`);
    if (this.search) filters.push(`Search: "${this.search}"`);
    return filters.join(', ');
  }

  downloadReport() {
    if (this.organization) {
      const orgId = this.organization.id;
      this.accService.getTransactionStatementReport(
        this.organization.id,
        this.transactionType,
        this.startDate, this.endDate, this.currentPage, this.selectedRows)
        .subscribe({
          next: (blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transaction-statement-${orgId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            this.accService.showToastErrorResponse(error);
          }
        });
    }

  }

}
