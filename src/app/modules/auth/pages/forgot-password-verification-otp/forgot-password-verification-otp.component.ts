import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password-verification-otp',
    templateUrl: './forgot-password-verification-otp.component.html',
    styleUrls: ['./forgot-password-verification-otp.component.scss'],
    imports: [FormsModule, RouterLink, ButtonComponent, NgIf]
})
export class ForgotPasswordVerificationOtpComponent implements OnInit {
  constructor(private readonly _router: Router, private acRoute: ActivatedRoute, private authService: AuthService) {
    const currentNav = this._router.getCurrentNavigation();
    this.email = currentNav?.extras?.state?.["userKey"];
    if(!this.email){
      this._router.navigate([`/auth/sign-in`]);
    }
  }

  public inputs: string[] = Array(6).fill('');
  submitted = false;
  errorMessage = 'Please give a OTP';
  email: string = '';

  ngOnInit(): void {
  }

  isNumeric(value: string): boolean {
    const regex = /^[0-9]+$/;
    return regex.test(value);
  }

  // Handle input event to move focus to the next field
  onInput(event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value.length === 1 && index < this.inputs.length - 1) {
      const nextInput = inputElement.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
    }
  }

  // Handle paste event to distribute OTP digits into input fields
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData('text') || '';
    if (clipboardData.length === 6) {
      // Distribute digits to inputs
      for (let i = 0; i < 6; i++) {
        this.inputs[i] = clipboardData[i] || '';
      }
      event.preventDefault(); // Prevent default paste behavior
    }
  }

  resendOTP() {
    let user: any = {};
    user.email = this.email;
    this.authService.forgotPasswordByEmail(user).subscribe({
      next: (response) => {
        this.authService.showToastSuccess(`${response.message}`);
      },
      error: (error) => {
        this.authService.showToastErrorResponse(error);
      },
    });
  }

  onSubmit() {
    this.submitted = true;
    const otp = this.inputs.join('');
    if (otp.length < 6) {
      this.errorMessage = 'Please give a correct OTP';
      return;
    }

    if (!this.isNumeric(otp)) {
      this.errorMessage = 'Invalid OTP';
      return;
    }

    const verification = {
      email: this.email,
      otpCode: otp,
    };

    this.errorMessage = '';

    this.authService.forgotPasswordOTPValidityByEmail(verification).subscribe({
      next: (response) => {
        this._router.navigateByUrl(`/auth/new-password`,{state:{userKey:verification.email, userOtp: verification.otpCode}});
        //this.authService.showToastSuccess(`An OTP is sent to email, Please check email to reset password`);
      },
      error: (error) => {
        this.authService.showToastErrorResponse(error);
      },
    });
  }
}
