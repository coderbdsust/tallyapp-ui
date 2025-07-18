import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from '../../../../common/components/button/button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { TfaChannelSelectionModalComponent } from '../modal/tfa-channel-selection-modal/tfa-channel-selection-modal.component';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, RouterLink, AngularSvgIconModule, NgClass, NgIf, ButtonComponent],
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  passwordTextType!: boolean;
  errorMessage = '';

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$_])[A-Za-z\d@$_]{8,}$/)]],
    });
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  openTfaModalForChannelSelection(tfaData: any) {
    const dialogRef = this.dialog.open(TfaChannelSelectionModalComponent, {
      width: '500px',
      data: tfaData,
    });

    dialogRef.afterClosed().subscribe((channel) => {
      if (channel) {
        let loginOtpRequest = {
          username: tfaData.username,
          channel: channel,
          token: tfaData.token,
          message: tfaData.message,
        };

        if (channel === 'Authenticator') {
          this._router.navigate(['/auth/verify-login-otp'], { state: { tfaData: loginOtpRequest }, replaceUrl: true });
          return;
        }

        this.authService.sendLoginOtp(loginOtpRequest).subscribe({
          next: (response) => {
            if (response.status === 'TFA_REQUIRED') {
              this._router.navigate(['/auth/verify-login-otp'], { state: { tfaData: response },replaceUrl: true });
            } else {
              this.authService.showToastError(response.message);
            }
          },
          error: (errorRes) => {
            this.authService.showToastErrorResponse(errorRes);
          },
        });
      }
    });
  }

  clearForm() {
    this.form.reset();
    this.submitted = false;
    this.errorMessage = '';
  }

  onSubmit() {
    this.submitted = true;

    const loginRequest = this.form.value;

    if (this.form.invalid) {
      return;
    }

    this.errorMessage = '';

    this.authService.signIn(loginRequest).subscribe({
      next: (response) => {
        if (response.status === 'TFA_REQUIRED') {
          this._router.navigate(['/auth/verify-login-otp'], { state: { tfaData: response }, replaceUrl: true });
        } else if (response.status === 'SUCCESS') {
          if (response?.roles[0]?.includes('SUPER_ADMIN')) {
            this._router.navigate(['/admin/user-management']);
          } else {
            this._router.navigate(['/']);
          }
          this.authService.showToastSuccess(`Welcome, ${response.fullName}`);
        } else if (response.status === 'TFA_CHANNEL_SELECTION') {
          this.clearForm();
          this.openTfaModalForChannelSelection(response);
        } else this.authService.showToastSuccess(`${response.message}`);
      },
      error: (errorRes) => {
        this.authService.showToastErrorResponse(errorRes);
      },
    });
  }
}
