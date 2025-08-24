import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Subject, takeUntil } from 'rxjs';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { getAmountColor, getTransactionTypeColor } from 'src/app/common/utils/colormap';
import { formatCurrency } from 'src/app/common/utils/common';
import { RecentTransactionReport, Transaction } from 'src/app/core/models/organization-balance.model';
import { Organization } from 'src/app/core/models/organization.model';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { OrganizationService } from 'src/app/core/services/organization.service';

@Component({
  selector: 'app-transaction-recent-view',
  imports: [CommonModule, AngularSvgIconModule, WordPipe],
  templateUrl: './transaction-recent-view.component.html',
  styleUrl: './transaction-recent-view.component.scss'
})
export class TransactionRecentViewComponent {
  organization: Organization | null = null;
  transactionReport: RecentTransactionReport | null = null;
  @Input()
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

  private initializeComponent(): void {
    this.subscribeToOrganization();
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

  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.accService
      .getRecentTransactionByType(
        this.organization.id,
        this.transactionType,
        10
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.transactionReport = response;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error fetching transaction summary:', error);
        },
      });
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
}
