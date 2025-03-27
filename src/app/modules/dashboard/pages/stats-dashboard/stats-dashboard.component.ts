import { Component } from '@angular/core';
import { CardPageVisitsComponent } from '../../components/cards/card-page-visits/card-page-visits.component';
import { CardSocialTrafficComponent } from '../../components/cards/card-social-traffic/card-social-traffic.component';
import { HeaderStatsComponent } from "../../components/header-stats/header-stats.component";
@Component({
    selector: 'app-stats-dashboard',
    imports: [
        CardPageVisitsComponent,
        CardSocialTrafficComponent,
        HeaderStatsComponent
    ],
    templateUrl: './stats-dashboard.component.html',
    styleUrl: './stats-dashboard.component.scss'
})
export class StatsDashboardComponent {

}
