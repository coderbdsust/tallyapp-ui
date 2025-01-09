import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { TableComponent } from './pages/table/table.component';
import { AppPropertiesComponent } from './pages/app-properties/app-properties.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: 'components', pathMatch: 'full' },
      { path: 'table', component: TableComponent },
      { path: 'app-property', component: AppPropertiesComponent },
      { path: 'registered-user', component: TableComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
