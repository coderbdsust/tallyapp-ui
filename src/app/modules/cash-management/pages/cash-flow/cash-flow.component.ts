import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { CashFlow, PageCashFlowReport } from 'src/app/core/models/organization-balance.model';
import { Organization } from 'src/app/core/models/organization.model';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { formatCurrency, formatReportDate, formatShortDate } from 'src/app/common/utils/common';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { getFlowTypeStyle, isInflowType } from 'src/app/common/utils/cashflow-map';
import { CashBalanceViewerComponent } from '../../components/cash-balance-viewer/cash-balance-viewer.component';

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
  isInflowType = isInflowType;
  getFlowTypeStyle = getFlowTypeStyle;
  formatShortDate = formatShortDate;
  formatReportDate = formatReportDate;

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

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }
}
