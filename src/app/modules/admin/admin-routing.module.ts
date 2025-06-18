import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { TableComponent } from './pages/table/table.component';
import { AppPropertiesComponent } from './pages/app-properties/app-properties.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { RegisteredUserComponent } from './pages/user-management/registered-user.component';
import { PermissionMatrixComponent } from './pages/permission-matrix/permission-matrix.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: 'app-property', pathMatch: 'full' },
      { path: 'table', component: TableComponent },
      { path: 'app-property', component: AppPropertiesComponent },
      { path: 'user-management', component: RegisteredUserComponent },
      { path: 'permission-matrix', component: PermissionMatrixComponent }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
