import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { UserComponent } from './user.component';
import { ProfileComponent } from './pages/profile-edit/profile.component';
import { ProfileViewComponent } from './pages/profile-view/profile-view.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';


const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    canActivate:[authGuard],
    children: [
      { path: '', redirectTo: 'profile-edit', pathMatch: 'full' },
      { path: 'profile-edit', component: ProfileComponent },
      { path: 'profile-view', component: ProfileViewComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
