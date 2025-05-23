import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { TwoStepsComponent } from './pages/account-verification-two-steps/two-steps.component';
import { LoginResolve } from 'src/app/core/resolver/login-resolve';
import { ForgotPasswordVerificationOtpComponent } from './pages/forgot-password-verification-otp/forgot-password-verification-otp.component';
import { VerifyLoginOtpComponent } from './pages/verify-login-otp/verify-login-otp.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
      {
        path: 'sign-in',
        component: SignInComponent,
        data: { returnUrl: window.location.pathname },
        resolve: { ready: LoginResolve },
      },
      { 
        path: 'sign-up',
        component: SignUpComponent,
        resolve: { ready: LoginResolve }
       },
      { 
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        resolve: { ready: LoginResolve }
       },
       { 
        path: 'forgot-password-otp',
        component: ForgotPasswordVerificationOtpComponent,
        resolve: { ready: LoginResolve }
       },
      { path: 'new-password',
        component: NewPasswordComponent,
        resolve: { ready: LoginResolve }
      },
      { 
        path: 'account-activation',
        component: TwoStepsComponent,
        resolve: { ready: LoginResolve }
       },
      { 
        path: 'verify-login-otp',
        component: VerifyLoginOtpComponent,
        resolve: { ready: LoginResolve }
       },
      { path: '**', redirectTo: 'sign-in', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
