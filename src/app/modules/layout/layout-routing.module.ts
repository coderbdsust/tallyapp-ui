import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: LayoutComponent,
    loadChildren: () => import('../dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'admin',
    component: LayoutComponent,
    loadChildren: () => import('../admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'organization',
    component: LayoutComponent,
    loadChildren: () => import('../organization/organization.module').then((m) => m.OrganizationModule),
  },
  {
    path: 'user',
    component: LayoutComponent,
    loadChildren: () => import('../user/user.module').then((m) => m.UserModule),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'error/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
