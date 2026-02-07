import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { InvoiceStandaloneComponent } from './invoice-standalone.component';
import { InvoiceStandaloneListComponent } from './pages/invoice-standalone-list/invoice-standalone-list.component';
import { InvoiceStandaloneAddComponent } from './pages/invoice-standalone-add/invoice-standalone-add.component';
import { InvoiceStandaloneDetailComponent } from './pages/invoice-standalone-detail/invoice-standalone-detail.component';


const routes: Routes = [
  {
    path: '',
    component: InvoiceStandaloneComponent,
    canActivate:[authGuard],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component:  InvoiceStandaloneListComponent},
      { path: 'add', component: InvoiceStandaloneAddComponent },
       { path: 'detail', component: InvoiceStandaloneDetailComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceStandaloneRoutingModule {}
