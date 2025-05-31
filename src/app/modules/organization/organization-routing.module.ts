import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { OrganizationComponent } from './organization.component';
import { ProductListComponent } from './product-list/product-list.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { OrganizationListComponent } from './organization-list/organization-list.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: OrganizationListComponent },
      { path: 'employee/list', component: EmployeeListComponent },
      { path: 'product/list', component: ProductListComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationRoutingModule {}
