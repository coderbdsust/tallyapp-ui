import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { formatCurrency, formatDate } from 'src/app/common/utils/common';
import { FinancialData } from 'src/app/core/models/journal.model';
import { Organization } from 'src/app/core/models/organization.model';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { OrganizationService } from 'src/app/core/services/organization.service';


@Component({
  selector: 'app-journal-viewer',
  imports: [CommonModule],
  templateUrl: './journal-viewer.component.html',
  styleUrl: './journal-viewer.component.scss'
})
export class JournalViewerComponent {

  org!: Organization;
  financialData!: FinancialData;
  formatCurrency=formatCurrency;
  formatDate=formatDate;

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
}
