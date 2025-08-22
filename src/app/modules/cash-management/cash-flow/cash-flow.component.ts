import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { CashFlow, CashFlowReport, FlowTypeStyle, PageCashFlowReport } from 'src/app/core/models/organization-balance.model';
import { Organization } from 'src/app/core/models/organization.model';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { formatCurrency } from 'src/app/common/utils/common';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CashBalanceViewerComponent } from "../cash-balance-viewer/cash-balance-viewer.component";

@Component({
  selector: 'app-cash-flow',
  imports: [NgClass, NgFor, NgIf, AngularSvgIconModule, CashBalanceViewerComponent],
  templateUrl: './cash-flow.component.html',
  styleUrl: './cash-flow.component.scss',
})
export class CashFlowComponent extends PaginatedComponent<CashFlow>{
  search: string = '';
  searchCriteria: string = '';
  loading: boolean = false;
  org: Organization | null = null;
  reportData: PageCashFlowReport | null = null;
  formatCurrency = formatCurrency;

  constructor(private readonly orgService: OrganizationService, private readonly accService: AccountingService) {
    super()
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.org = org;
        this.loadData();
      }
    });
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

  loadCashFlowReport(org: Organization, startDate: string | null, endDate: string | null, search: string | null, page: number, size: number): void {
    this.accService.getPageCashFlowReport(org.id, startDate, endDate, search, page, size)
    .subscribe((report) => {
      this.reportData = report;
      this.updatePaginationState(report.pageCashFlowResponse);
      this.loading = false;
    });
  }

  loadData(): void {
      if (!this.org) return;
  
      this.loading = true;
      this.loadCashFlowReport(this.org, null, null, this.search, this.currentPage, this.selectedRows);
    }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatReportDate(dateString: string | null): string {
    if (dateString)
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    else {
      return '';
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }



  isInflowType(flowType: string): boolean {
    return flowType === 'CASH_IN' || flowType === 'PAYMENT_RECEIVED' || flowType === 'SALE';
  }

  getFlowTypeStyle(flowType: string): FlowTypeStyle {
    // Configuration maps for better maintainability
    const INFLOW_TYPES = new Set(['CASH_IN', 'PAYMENT_RECEIVED', 'SALE']);
    const OUTFLOW_TYPES = new Set(['CASH_OUT', 'PAYMENT_MADE', 'EXPENSE', 'PURCHASE', 'EMPLOYEE_EXPENSE']);

    const ICONS: Record<string, string> = {
      CASH_IN: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      CASH_OUT: 'M18 12H6',
      SALE: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      PURCHASE: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      PAYMENT_RECEIVED: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      PAYMENT_MADE: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      EXPENSE: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      EMPLOYEE_EXPENSE: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      REFUND: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
      ADJUSTMENT:
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      REVERSAL:
        'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      ACCOUNTS_RECEIVABLE:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      EQUITY:
        'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    };

    const LABELS: Record<string, string> = {
      CASH_IN: 'Cash In',
      CASH_OUT: 'Cash Out',
      PURCHASE: 'Purchase',
      SALE: 'Sale',
      PAYMENT_RECEIVED: 'Payment Received',
      PAYMENT_MADE: 'Payment Made',
      EXPENSE: 'Expense',
      REFUND: 'Refund',
      ADJUSTMENT: 'Adjustment',
      REVERSAL: 'Reversal',
      ACCOUNTS_RECEIVABLE: 'Accounts Receivable',
      EQUITY: 'Equity',
      EMPLOYEE_EXPENSE: 'Employee Expense',
    };

    const isInflow = INFLOW_TYPES.has(flowType);
    const iconPath =
      ICONS[flowType] || 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
    const label = LABELS[flowType] || flowType;

    return {
      iconSvg: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}" /></svg>`,
      bgColor: isInflow ? 'bg-green-100' : 'bg-red-100',
      textColor: isInflow ? 'text-green-800' : 'text-red-800',
      iconColor: isInflow ? 'text-green-600' : 'text-red-600',
      label,
    };
  }
}
