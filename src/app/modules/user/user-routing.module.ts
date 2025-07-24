import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { UserComponent } from './user.component';
import { ProfileComponent } from './profile-edit/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ProfileViewComponent } from './profile-view/profile-view.component';

const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    canActivate:[AuthGuard],
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
