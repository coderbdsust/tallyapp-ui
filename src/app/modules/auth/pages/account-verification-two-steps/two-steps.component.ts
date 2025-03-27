import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-two-steps',
    templateUrl: './two-steps.component.html',
    styleUrls: ['./two-steps.component.scss'],
    imports: [FormsModule, RouterLink, ButtonComponent, NgClass, NgIf, NgFor]
})
export class TwoStepsComponent implements OnInit {
  constructor(private readonly _router: Router, private acRoute: ActivatedRoute, private authService: AuthService) {
    const currentNav = this._router.getCurrentNavigation();
    this.username = currentNav?.extras?.state?.["userKey"];
    if(!this.username){
      this._router.navigate([`/auth/sign-in`]);
    }
  }

  public inputs: string[] = Array(6).fill('');
  submitted = false;
  errorMessage = 'Please give a OTP';
  username: string = '';

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
    user.username = this.username;
    this.authService.resendAccountVerificationOTP(user).subscribe({
      next: (response) => {
        if (response.businessCode == 601) {
          this._router.navigate([`/auth/sign-in`]);
          this.authService.showToastSuccess(`${response.message}`);
        } else {
          this.authService.showToastSuccess(`${response.message}`);
        }
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
      username: this.username,
      otpCode: otp,
    };

    this.errorMessage = '';

    this.authService.verifyUser(verification).subscribe({
      next: (response) => {
        this._router.navigate([`/auth/sign-in`]);
        this.authService.showToastSuccess(`User successfully verified, Please login`);
      },
      error: (error) => {
        this.authService.showToastErrorResponse(error);
      },
    });
  }
}
