import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { InvoiceComponent } from './invoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { AddInvoiceComponent } from './add-invoice/add-invoice.component';

const routes: Routes = [
  {
    path: '',
    component: InvoiceComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: InvoiceListComponent },
      { path: 'add', component: AddInvoiceComponent },
      { path: 'detail', component: InvoiceDetailComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {}
