import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, AngularSvgIconModule, NgIf, ButtonComponent],
})
export class ForgotPasswordComponent implements OnInit {

  form!: FormGroup;
  submitted = false;

  constructor(private readonly _formBuilder: FormBuilder, private readonly _router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
          email: ['', [Validators.required]],
     });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    
    const formObject = this.form.value;

    if (this.form.invalid) {
      return;
    }
    
    this.authService.forgotPasswordByEmail(formObject).subscribe({
      next: (response) => {
        this._router.navigateByUrl(`/auth/forgot-password-otp`,{state:{userKey:formObject.email}});
        this.authService.showToastSuccess(`An OTP is sent to email, Please check email to reset password`);
      },
      error: (errorRes) => {
        this.authService.showToastErrorResponse(errorRes);
      },
    });
    

  }
}
