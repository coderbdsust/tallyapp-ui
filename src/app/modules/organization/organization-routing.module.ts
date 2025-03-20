import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { OrganizationComponent } from './organization.component';
import { OrganizationDetailComponent } from './organization-detail/organization-detail.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: 'detail', pathMatch: 'full' },
      { path: 'detail', component: OrganizationDetailComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationRoutingModule {}
