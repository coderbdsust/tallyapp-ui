import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardStatsComponent } from '../../../dashboard/components/cards/card-stats/card-stats.component';
import { Organization } from 'src/app/core/models/organization.model';
import { OrganizationBalance } from 'src/app/core/models/organization-balance.model';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { AccountingService } from 'src/app/core/services/accounting.service';

@Component({
  selector: 'app-account-balance-viewer',
  imports: [CardStatsComponent, NgIf],
  templateUrl: './account-balance-viewer.component.html',
  styleUrl: './account-balance-viewer.component.scss'
})
export class AccountBalanceViewerComponent {

  @Input() public organization: Organization | null = null;
  @Input() public organizationBalance: OrganizationBalance | null = null;
  @Input() public showFullBalance: Boolean = true;

  constructor(private orgService: OrganizationService, private accService: AccountingService) { }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.organization = org;
        this.loadOrganizationBalance(org.id);
      }
    });
  }

  loadOrganizationBalance(orgId: string) {
    this.accService.getOrganizationBalance(orgId).subscribe({
      next: (response) => {
        this.organizationBalance = response;
      },
      error: (error) => {
        this.accService.showToastErrorResponse(error);
      }
    });
  }

}
