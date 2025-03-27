import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-new-password',
    templateUrl: './new-password.component.html',
    styleUrls: ['./new-password.component.scss'],
    imports: [FormsModule, AngularSvgIconModule, ButtonComponent, ReactiveFormsModule, RouterLink, NgIf]
})
export class NewPasswordComponent implements OnInit {

  constructor(private readonly _formBuilder: FormBuilder, private readonly _router: Router, private acRoute: ActivatedRoute, private authService: AuthService) {
    const currentNav = this._router.getCurrentNavigation();
    this.email = currentNav?.extras?.state?.['userKey'];
    this.otpCode = currentNav?.extras?.state?.['userOtp'];
    if (!this.email || !this.otpCode) {
      this._router.navigate([`/auth/sign-in`]);
    }
  }

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  form!: FormGroup;
  email: string = '';
  otpCode: string = '';
  submitted = false;

  get f() {
    return this.form.controls;
  }

  passwordTextType!: boolean;

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  onSubmit() {
    this.submitted = true;

    const pass = this.form.value;

    if (this.form.invalid) {
      return;
    }

    if(pass.password !== pass.confirmPassword){
      this.authService.showToastError(`Two password isn't matched`);
      return ;
    }

    const password = {...pass, email: this.email, otpCode: this.otpCode};
    

    this.authService.resetPasswordWithEmail(password).subscribe({
      next: (response) => {
        this._router.navigateByUrl(`/auth/sign-in`);
        this.authService.showToastSuccess(`Password changed successfully, Please login`);
      },
      error: (errorRes) => {
        this.authService.showToastErrorResponse(errorRes);
      },
    });
  }
}
