import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from '../../../../common/components/button/button.component';
import { AuthService } from '../../services/auth.service';


@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, RouterLink, AngularSvgIconModule, NgClass, NgIf, ButtonComponent]
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  passwordTextType!: boolean;
  errorMessage="";

  constructor(private readonly _formBuilder: FormBuilder, private readonly _router: Router, private authService: AuthService) {}

  onClick() {
    console.log('Button clicked');
  }

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

  onSubmit() {
    this.submitted = true;
    
    const loginData = this.form.value;

    if (this.form.invalid) {
      return;
    }
    
    this.errorMessage="";
    
    this.authService.signIn(loginData).subscribe({
      next: (response) => {
        if(response.status === 'TFA_REQUIRED') {
            this._router.navigate(['/auth/verify-login-otp'], { state: { tfaData: response } });
        }else{
            this._router.navigate(['/']);
            this.authService.showToastSuccess(`Welcome, ${response.fullName}`);
        }
      },
      error: (errorRes) => {
        this.authService.showToastErrorResponse(errorRes);
      },
    });
    

  }
}
