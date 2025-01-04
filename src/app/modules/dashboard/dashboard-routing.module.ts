import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { NftComponent } from './pages/nft/nft.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { StatsDashboardComponent } from './pages/stats-dashboard/stats-dashboard.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: 'nfts', pathMatch: 'full' },
      { path: 'nfts', component: NftComponent },
      { path: 'stats', component: StatsDashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
