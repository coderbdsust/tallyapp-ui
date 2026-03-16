import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { QuotationComponent } from './quotation.component';
import { QuotationListComponent } from './pages/quotation-list/quotation-list.component';
import { QuotationAddComponent } from './pages/quotation-add/quotation-add.component';
import { QuotationDetailComponent } from './pages/quotation-detail/quotation-detail.component';


const routes: Routes = [
  {
    path: '',
    component: QuotationComponent,
    canActivate:[authGuard],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component:  QuotationListComponent},
      { path: 'add', component: QuotationAddComponent },
       { path: 'detail', component: QuotationDetailComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationRoutingModule {}
