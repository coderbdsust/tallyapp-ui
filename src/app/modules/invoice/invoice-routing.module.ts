import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { InvoiceComponent } from './invoice.component';
import { InvoiceListComponent } from './pages/invoice-list/invoice-list.component';
import { AddInvoiceComponent } from './pages/add-invoice/add-invoice.component';
import { InvoiceDetailComponent } from './pages/invoice-detail/invoice-detail.component';
import { CustomerListComponent } from './pages/customer-list/customer-list.component';
import { ProductReturnListComponent } from './pages/product-return-list/product-return-list.component';

const routes: Routes = [
  {
    path: '',
    component: InvoiceComponent,
    canActivate:[authGuard],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: InvoiceListComponent },
      { path: 'add', component: AddInvoiceComponent },
      { path: 'detail', component: InvoiceDetailComponent },
      { path: 'customer', component: CustomerListComponent },
      { path: 'sales-return', component: ProductReturnListComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {}
