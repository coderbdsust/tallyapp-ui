import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { EmployeeComponent } from './employee.component';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';



const routes: Routes = [
  {
    path: '',
    component: EmployeeComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: EmployeeListComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeRoutingModule {}
