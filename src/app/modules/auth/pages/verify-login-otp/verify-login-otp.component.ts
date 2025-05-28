import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { TfaChannelSelectionModalComponent } from '../modal/tfa-channel-selection-modal/tfa-channel-selection-modal.component';

@Component({
    selector: 'app-verify-login-otp',
    templateUrl: './verify-login-otp.component.html',
    styleUrls: ['./verify-login-otp.component.scss'],
    imports: [FormsModule, ButtonComponent, NgIf]
})
export class VerifyLoginOtpComponent implements OnInit {
  
  constructor(private readonly _router: Router, private acRoute: ActivatedRoute, private authService: AuthService) {
    
    const currentNav = this._router.getCurrentNavigation();
    this.username = currentNav?.extras?.state?.["tfaData"].username;
    this.otpTxnId = currentNav?.extras?.state?.["tfaData"].otpTxnId;
    this.message = currentNav?.extras?.state?.["tfaData"].message;


    if(!this.username){
      this._router.navigate([`/auth/sign-in`]);
    }
  }

  public inputs: string[] = Array(6).fill('');
  submitted = false;
  errorMessage = 'Please give a OTP';
  username: string = '';
  otpTxnId: string = '';
  message: string = '';

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

  resendOTP() {}
  
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
      otp: otp,
      otpTxnId: this.otpTxnId,
    };

    this.errorMessage = '';

    this.authService.verifyLoginOtp(verification).subscribe({
      next: (response) => {
        this._router.navigate([`/`]);
        this.authService.showToastSuccess(`Welcome, ${response.fullName}`);
      },
      error: (error) => {
        this.authService.showToastErrorResponse(error);
      },
    });
  }
}
