import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { passwordStrength } from 'check-password-strength'
import { UserprofileService } from 'src/app/core/services/userprofile.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';

@Component({
    selector: 'app-change-password',
    imports: [FormsModule, AngularSvgIconModule, ButtonComponent, ReactiveFormsModule, AngularSvgIconModule, NgIf, NgFor, NgClass],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent extends FormError implements OnInit {

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router,
    private userProfileService: UserprofileService,
  ) {super();}

  form!: FormGroup;
  submitted = false;
  passwordTextType!: boolean;
  errorMessage: string = '';
  passwordStrength: number= 0;
  passwordMeaterLabel: string = '';


  ngOnInit(): void {
    this.form = this._formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', Validators.required],
    });
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  onPasswordInput(event: Event) {
    this.errorMessage = '';
    const password = (event.target as HTMLInputElement).value;
    if (password.length > 0) {
      this.passwordMeaterLabel = passwordStrength(password).value;
      this.passwordStrength = passwordStrength(password).id+1;
    } else {
      this.passwordStrength = 0;
      this.passwordMeaterLabel = '';
    }
  }

  onSubmit() {
    this.submitted = true;

    const changePassword = this.form.value;

    if (this.form.invalid) {
      return;
    }

    if (changePassword.oldPassword === changePassword.newPassword) {
      this.errorMessage = `Old password and new password can't be same`;
      return;
    }

    if (changePassword.newPassword !== changePassword.confirmPassword) {
      this.errorMessage = `Password and confirm password didn't matched`;
      return;
    }
    this.errorMessage = '';

    this.userProfileService.changePassword(changePassword).subscribe({
      next: (response) => {
        this.userProfileService.showToastSuccess(response.message);
      },
      error: (error) => {
        this.userProfileService.showToastErrorResponse(error);
      },
    });
  }
}