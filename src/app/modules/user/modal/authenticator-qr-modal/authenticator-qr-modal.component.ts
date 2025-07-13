import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { AuthenticatorAppService } from '../../../../core/services/authenticator-app.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OtpComponent } from 'src/app/common/components/otp/otp.component';

@Component({
  selector: 'app-authenticator-qr-modal',
  imports: [CommonModule, MatDialogModule, MatRadioModule, MatButtonModule, FormsModule,
     ButtonComponent, MatFormFieldModule, MatInputModule, OtpComponent, NgIf],
  templateUrl: './authenticator-qr-modal.component.html',
  styleUrl: './authenticator-qr-modal.component.scss'
})
export class AuthenticatorQrModalComponent {

  step: 'qr' | 'otp' = 'qr';
  base64Image:string='https://placehold.co/200';
  otpCode: string = '';
  authStatus:boolean;

  constructor(
    public authAppService : AuthenticatorAppService,
    public dialogRef: MatDialogRef<AuthenticatorQrModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: boolean
  ) {
    this.authStatus = data;
    this.requestForQR(data);

  }

  requestForQR(data:boolean){
    if(data){
      this.step='qr';
      this.authAppService.authenticatorAppRegister().subscribe({
        next: (response) => {
          this.base64Image = 'data:image/png;base64, '+response.qrCode;
        },
        error:(error)=>{
          this.authAppService.showToastErrorResponse(error);
        }
      })
    }else{
      this.step='otp';
    }
  }

  next(){
    this.step = 'otp';
  }

  onOtpInput(otp:string){
    this.otpCode=otp;
  }

  submitOtp() {
    this.dialogRef.close(this.otpCode);
  }

  close(){
    this.dialogRef.close();
  }
  

}
