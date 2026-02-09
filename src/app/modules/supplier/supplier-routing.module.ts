import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { SupplierComponent } from './supplier.component';
import { SupplierListComponent } from './pages/supplier-list/supplier-list.component';
import { PurchaseOrderListComponent } from './pages/purchase-order-list/purchase-order-list.component';
import { PurchaseOrderCreateComponent } from './pages/purchase-order-create/purchase-order-create.component';
import { PurchaseOrderDetailComponent } from './pages/purchase-order-detail/purchase-order-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SupplierComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: SupplierListComponent },
      { path: 'purchase-order', component: PurchaseOrderListComponent },
      { path: 'purchase-order/create', component: PurchaseOrderCreateComponent },
      { path: 'purchase-order/detail', component: PurchaseOrderDetailComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupplierRoutingModule {}
