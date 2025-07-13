import { Component } from '@angular/core';
import { CardPageVisitsComponent } from '../../components/cards/card-page-visits/card-page-visits.component';
import { CardSocialTrafficComponent } from '../../components/cards/card-social-traffic/card-social-traffic.component';
import { HeaderStatsComponent } from "../../components/header-stats/header-stats.component";
import { Organization } from 'src/app/core/models/organization.model';
import { OrganizationBalance } from '../../../../core/models/organization-balance.model';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { AccountingService } from '../../../../core/services/accounting.service';
@Component({
    selector: 'app-stats-dashboard',
    imports: [
        CardPageVisitsComponent,
        HeaderStatsComponent
    ],
    templateUrl: './stats-dashboard.component.html',
    styleUrl: './stats-dashboard.component.scss'
})
export class StatsDashboardComponent {

    public organization: Organization | null = null;
    public organizationBalance: OrganizationBalance | null = null;

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
