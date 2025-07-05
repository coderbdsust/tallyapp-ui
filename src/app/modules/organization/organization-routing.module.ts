import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { OrganizationComponent } from './organization.component';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { EmployeeComponent } from './employee/employee.component';
import { ProductComponent } from './product/product.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: OrganizationListComponent },
      { path: 'employee', component: EmployeeComponent },
      { path: 'product', component: ProductComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationRoutingModule {}
