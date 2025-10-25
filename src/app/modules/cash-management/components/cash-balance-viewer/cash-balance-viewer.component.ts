import { Component, Input } from '@angular/core';
import { formatCurrency } from 'src/app/common/utils/common';
import { CashFlowBalanceSummary, PageCashFlowReport } from 'src/app/core/models/organization-balance.model';

@Component({
  selector: 'app-cash-balance-viewer',
  imports: [],
  templateUrl: './cash-balance-viewer.component.html',
  styleUrl: './cash-balance-viewer.component.scss'
})
export class CashBalanceViewerComponent {

  @Input()
  balanceSummary: CashFlowBalanceSummary | null = null;
  formatCurrency = formatCurrency;

}
