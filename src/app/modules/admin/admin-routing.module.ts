import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { RegisteredUserComponent } from './pages/user-management/registered-user.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate:[authGuard],
    children: [
      { path: '', redirectTo: 'user-management', pathMatch: 'full' },
      { path: 'user-management', component: RegisteredUserComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
