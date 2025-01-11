import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { OrganizationComponent } from './organization.component';
import { CreateOrganizationComponent } from './create-organization/create-organization.component';
import { EditOrganizationComponent } from './edit-organization/edit-organization.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: 'create', pathMatch: 'full' },
      { path: 'create', component: CreateOrganizationComponent },
      { path: 'edit', component: EditOrganizationComponent },
      { path: 'detail', component: EditOrganizationComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationRoutingModule {}
