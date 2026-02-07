import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { authGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { modules: ['DASHBOARD','REPORTING'] },
    loadChildren: () => import('../dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { modules: ['APP_CONFIGURATION','USER_MANAGEMENT'] },
    loadChildren: () => import('../admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'organization',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { modules: ['ORGANIZATION_MANAGEMENT'] },
    loadChildren: () => import('../organization/organization.module').then((m) => m.OrganizationModule),
  },
  {
    path: 'invoice',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { modules: ['INVOICE_MANAGEMENT'] },
    loadChildren: () => import('../invoice/invoice.module').then((m) => m.InvoiceModule),
  },
  {
    path: 'invoice-standalone',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { modules: ['INVOICE_STANDALONE_MANAGEMENT'] },
    loadChildren: () => import('../invoice-standalone/invoice-standalone.module').then((m) => m.InvoiceStandaloneModule),
  },
  {
    path: 'cash-management',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { modules: ['CASH_MANAGEMENT'] },
    loadChildren: () => import('../cash-management/transaction.module').then((m) => m.TransactionModule),
  },
  {
    path: 'product',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { modules: ['PRODUCT_MANAGEMENT'] },
    loadChildren: () => import('../product/product.module').then((m) => m.ProductModule),
  },
    {
    path: 'employee',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { modules: ['EMPLOYEE_MANAGEMENT'] },
    loadChildren: () => import('../employee/employee.module').then((m) => m.EmployeeModule),
  },
  {
    path: 'user',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { modules: ['PROFILE'] },
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
