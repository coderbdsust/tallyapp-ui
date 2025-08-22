import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { formatCurrency, formatDate } from 'src/app/common/utils/common';
import { FinancialData } from 'src/app/core/models/journal.model';
import { Organization } from 'src/app/core/models/organization.model';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { TreeViewComponent } from "./tree-view/tree-view.component";


@Component({
  selector: 'app-journal-viewer',
  imports: [CommonModule, TreeViewComponent],
  templateUrl: './journal-viewer.component.html',
  styleUrl: './journal-viewer.component.scss'
})
export class JournalViewerComponent {

  org!: Organization;
  financialData!: FinancialData;
  formatCurrency=formatCurrency;
  formatDate=formatDate;
  currentView: 'grid' | 'tree' = 'tree';

  constructor(
    private readonly orgService: OrganizationService,
    private readonly accService: AccountingService
  ) {
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.org = org;
        this.loadJournalData(org);
      }
    });
  }

  loadJournalData(org: Organization) {
    this.accService.getJournalEntries(org.id).subscribe((data) => {
      this.financialData = data;
    });
  }

  toggleView(): void {
    this.currentView = this.currentView === 'grid' ? 'tree' : 'grid';
  }

  setView(view: 'grid' | 'tree'): void {
    this.currentView = view;
  }
  
  get netWorth(): number {
    return (this.financialData?.totalAssets || 0) - (this.financialData?.totalLiabilities || 0);
  }

  get netIncome(): number {
    return (this.financialData?.totalRevenue || 0) - (this.financialData?.totalExpenses || 0);
  }

  get totalAccounts(): number {
    if (!this.financialData) return 0;
    return this.financialData.assets.length + 
           this.financialData.liabilities.length + 
           this.financialData.equity.length + 
           this.financialData.revenue.length + 
           this.financialData.expenses.length;
  }
}
