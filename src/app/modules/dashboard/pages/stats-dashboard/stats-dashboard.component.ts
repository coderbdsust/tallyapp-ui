import { Component } from '@angular/core';
import { CardPageVisitsComponent } from '../../components/cards/card-page-visits/card-page-visits.component';
import { CardSocialTrafficComponent } from '../../components/cards/card-social-traffic/card-social-traffic.component';
import { HeaderStatsComponent } from "../../components/header-stats/header-stats.component";
import { CardLineChartComponent } from '../../components/cards/card-line-chart/card-line-chart.component';
import { CardBarChartComponent } from '../../components/cards/card-bar-chart/card-bar-chart.component';

@Component({
    selector: 'app-stats-dashboard',
    imports: [
        CardPageVisitsComponent,
        CardSocialTrafficComponent,
        CardLineChartComponent,
        CardBarChartComponent,
        HeaderStatsComponent
    ],
    templateUrl: './stats-dashboard.component.html',
    styleUrl: './stats-dashboard.component.scss'
})
export class StatsDashboardComponent {

}
