import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Subject, takeUntil } from 'rxjs';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
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

  getAmountColor(type: string, amount: number): string {
    const incomingTypes = ['CASH_IN', 'SALE', 'PAYMENT_RECEIVED', 'REFUND'];
    const outgoingTypes = ['CASH_OUT', 'PURCHASE', 'PAYMENT_MADE', 'EXPENSE', 'EMPLOYEE_EXPENSE'];

    if (incomingTypes.includes(type)) {
      return 'text-green-600 font-semibold';
    }
    if (outgoingTypes.includes(type)) {
      return 'text-red-600 font-semibold';
    }
    return 'text-gray-900 font-medium';
  }

  // Transaction type styling
  getTransactionTypeColor(type: string): { bg: string; text: string } {
    const colorMap: Record<string, { bg: string; text: string }> = {
      'CASH_IN': { bg: 'bg-green-200', text: 'text-green-800' },
      'CASH_OUT': { bg: 'bg-red-200', text: 'text-red-800' },
      'PURCHASE': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'SALE': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'PAYMENT_RECEIVED': { bg: 'bg-green-200', text: 'text-green-900' },
      'PAYMENT_MADE': { bg: 'bg-red-200', text: 'text-red-900' },
      'EXPENSE': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'REFUND': { bg: 'bg-pink-100', text: 'text-pink-800' },
      'ADJUSTMENT': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'REVERSAL': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'ACCOUNTS_RECEIVABLE': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      'EQUITY': { bg: 'bg-teal-100', text: 'text-teal-800' },
      'EMPLOYEE_EXPENSE': { bg: 'bg-rose-100', text: 'text-rose-800' }
    };

    return colorMap[type] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}
