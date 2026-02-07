import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { authGuard } from 'src/app/core/guards/auth.guard';

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
    path: 'invoice',
    component: LayoutComponent,
    loadChildren: () => import('../invoice/invoice.module').then((m) => m.InvoiceModule),
  },
  {
    path: 'invoice-standalone',
    component: LayoutComponent,
    loadChildren: () => import('../invoice-standalone/invoice-standalone.module').then((m) => m.InvoiceStandaloneModule),
  },
  {
    path: 'cash-management',
    component: LayoutComponent,
    loadChildren: () => import('../cash-management/transaction.module').then((m) => m.TransactionModule),
  },
  {
    path: 'product',
    component: LayoutComponent,
    loadChildren: () => import('../product/product.module').then((m) => m.ProductModule),
  },
    {
    path: 'employee',
    component: LayoutComponent,
    loadChildren: () => import('../employee/employee.module').then((m) => m.EmployeeModule),
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
