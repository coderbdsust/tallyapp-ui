import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { OtpComponent } from '../../../../common/components/otp/otp.component';

@Component({
  selector: 'app-verify-login-otp',
  templateUrl: './verify-login-otp.component.html',
  styleUrls: ['./verify-login-otp.component.scss'],
  imports: [FormsModule, ButtonComponent, NgIf, OtpComponent],
})
export class VerifyLoginOtpComponent implements OnInit {
  
  constructor(private readonly _router: Router, private acRoute: ActivatedRoute, private authService: AuthService) {
    const currentNav = this._router.getCurrentNavigation();
    let tfaData = currentNav?.extras?.state?.['tfaData'];

    if (!tfaData) {
      this._router.navigate([`/auth/sign-in`]);
      return;
    }

    this.username = tfaData.username;
    this.otpTxnId = tfaData.otpTxnId;
    this.channel = tfaData.channel;
    this.message = tfaData.message;
  }

  submitted = false;
  errorMessage = 'Please give a OTP';
  username: string = '';
  otpTxnId: string = '';
  channel: string = '';
  message: string = '';
  otpCode: string = '';

  ngOnInit() {}

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    this.clearData();
    this._router.navigate([`/auth/sign-in`], { replaceUrl: true });
  }

  private clearData() {
    this.username = '';
    this.otpTxnId = '';
    this.channel = '';
    this.message = '';
    this.errorMessage = '';
    this.submitted = false;
  }

  resendOTP() {}

  onOtpInput(otp: string) {
    this.otpCode = otp;
  }

  onCancel() {
    this.clearData();
    this._router.navigate([`/auth/sign-in`], { replaceUrl: true });
  }

  onSubmit() {
    this.submitted = true;

    if (!this.otpCode || this.otpCode.length < 6) {
      this.errorMessage = 'Please give a correct OTP';
      return;
    }

    const verification = {
      username: this.username,
      otp: this.otpCode,
      otpTxnId: this.otpTxnId,
      channel: this.channel,
    };

    this.errorMessage = '';

    this.authService.verifyLoginOtp(verification).subscribe({
      next: (response) => {
        if (response?.roles[0]?.includes('SUPER_ADMIN')) {
            this._router.navigate(['/admin/user-management']);
          } else {
            this._router.navigate(['/']);
          }
        this.authService.showToastSuccess(`Welcome, ${response.fullName}`);
      },
      error: (error) => {
        this.authService.showToastErrorResponse(error);
      },
    });
  }
}
