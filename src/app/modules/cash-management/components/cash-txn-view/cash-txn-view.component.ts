import { Component, Input } from '@angular/core';
import { Organization } from 'src/app/core/models/organization.model';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { CashTxnSummaryDTO } from 'src/app/core/models/cashtype.model';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { formatCurrency } from 'src/app/common/utils/common';
import { getAmountColor, getTransactionTypeColor } from 'src/app/common/utils/colormap';
import { Subject, takeUntil } from 'rxjs';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule, NgIf } from '@angular/common';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cash-txn-view',
  imports: [CommonModule, AngularSvgIconModule, WordPipe, FormsModule, NgIf],
  templateUrl: './cash-txn-view.component.html',
  styleUrl: './cash-txn-view.component.scss'
})
export class CashTxnViewComponent extends PaginatedComponent<CashTxnSummaryDTO> {

  organization: Organization | null = null;
  loading: boolean = false;

  @Input() cashType: string | null = null;
  @Input() cashTxnStatus: string | null = null;
  @Input() refreshTime: Date = new Date();

  formatCurrency = formatCurrency;
  getAmountColor = getAmountColor;
  getTransactionTypeColor = getTransactionTypeColor;

  // Modal state
  showRejectModal = false;
  rejectReason = '';
  pendingRejectId: string | null = null;

  txnStatusList: string[] = ['PENDING', 'APPROVED', 'REJECTED'];

  private destroy$ = new Subject<void>();

  constructor(
    private orgService: OrganizationService,
    private accService: AccountingService
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

  ngOnChanges(): void {
    this.loadData();
  }

  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.accService
      .getCashTransactionSummary(
        this.organization.id,
        this.currentPage,
        this.selectedRows,
        this.cashType,
        this.cashTxnStatus
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error fetching cash transaction summary:', error);
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

  onSelectTxnStatusChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.cashTxnStatus = selectedValue || null;
    this.onFilterChange();
  }

  clearStatusFilter(): void {
    this.cashTxnStatus = null;
    this.onFilterChange();
  }

  getTransactionIndex(index: number): number {
    return index + this.startIndex;
  }

  approveTxn(id: string): void {
    this.accService.approveCashTransaction(id).subscribe({
      next: () => {
        this.accService.showToastSuccess('Transaction approved successfully');
        this.loadData();
      },
      error: (error) => {
        this.accService.showToastErrorResponse(error);
      },
    });
  }

  rejectTxn(id: string, reason: string): void {
    this.accService.rejectCashTransaction(id, reason).subscribe({
      next: () => {
        this.accService.showToastSuccess('Transaction rejected successfully');
        this.loadData();
      },
      error: (error) => {
        this.accService.showToastErrorResponse(error);
      },
    });
  }

  openRejectModal(id: string): void {
    this.pendingRejectId = id;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.pendingRejectId = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.pendingRejectId) return;
    this.rejectTxn(this.pendingRejectId, this.rejectReason);
    this.closeRejectModal();
  }
}