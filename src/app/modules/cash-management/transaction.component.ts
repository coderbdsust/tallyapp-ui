import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CashInComponent } from './pages/cash-in/cash-in.component';
import { CashOutComponent } from './pages/cash-out/cash-out.component';
import { CashFlowComponent } from './pages/cash-flow/cash-flow.component';
import { JournalViewerComponent } from './pages/journal-viewer/journal-viewer.component';
import { ReportComponent } from './pages/report/report.component';


@Component({
  selector: 'app-transaction',
  imports: [CashInComponent, CashOutComponent, NgIf, NgFor, CashFlowComponent, JournalViewerComponent, ReportComponent],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent implements OnInit, OnDestroy {
  activeTab = 'cash-in';
  private subscription = new Subscription();

  tabs = [
    { id: 'cash-in', label: 'Cash In' },
    { id: 'cash-out', label: 'Cash Out' },
    // { id: 'expense', label: 'Expense' },
    { id: 'cash-flow', label: 'Cash Flow' },
    { id: 'journal-viewer', label: 'Journals' },
    { id: 'report', label: 'Transaction & Report' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Subscribe to query parameter changes
    const queryParamSub = this.route.queryParams.subscribe(params => {
      // console.log('Transaction component received query params:', params);
      
      const tab = params['tab'];
      if (tab && this.tabs.some(t => t.id === tab)) {
        this.activeTab = tab;
        // console.log('Setting active tab to:', tab);
      } else {
        // If no valid tab specified, default to cash-in and update URL
        this.activeTab = 'cash-in';
        this.updateQueryParam('cash-in', true); // true = replace URL
      }
    });
    
    this.subscription.add(queryParamSub);
  }

  setActiveTab(tabId: string) {
    // console.log('Setting active tab via click:', tabId);
    this.activeTab = tabId;
    this.updateQueryParam(tabId, false); // false = don't replace URL
  }

  private updateQueryParam(tabId: string, replaceUrl: boolean = false) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabId },
      queryParamsHandling: 'replace', // Always replace to ensure clean URL
      replaceUrl: replaceUrl // Only replace browser history on initial load
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}