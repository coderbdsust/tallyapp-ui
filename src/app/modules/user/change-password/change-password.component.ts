import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { UserprofileService } from '../service/userprofile.service';
import { passwordStrength } from 'check-password-strength'

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, ButtonComponent, ReactiveFormsModule, AngularSvgIconModule, NgIf, NgFor, NgClass],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent implements OnInit {
this: any;
  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router,
    private userProfileService: UserprofileService,
  ) {}

  form!: FormGroup;
  submitted = false;
  passwordTextType!: boolean;
  errorMessage: string = '';
  passwordStrength: number= 0;
  passwordMeaterLabel: string = '';


  ngOnInit(): void {
    this.form = this._formBuilder.group({
      oldPassword: ['', Validators.required],
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required],
    });
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  onPasswordInput(event: Event) {
    const password = (event.target as HTMLInputElement).value;
    if (password.length > 0) {
      this.passwordMeaterLabel = passwordStrength(password).value;
      this.passwordStrength = passwordStrength(password).id+1;
    } else {
      this.passwordStrength = 0;
      this.passwordMeaterLabel = '';
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    const changePassword = this.form.value;

    if (this.form.invalid) {
      return;
    }

    if (changePassword.oldPassword === changePassword.password) {
      this.errorMessage = `Old password and new password can't be same`;
      return;
    }

    if (changePassword.password !== changePassword.confirmPassword) {
      this.errorMessage = `Password and confirm password didn't matched`;
      return;
    }
    this.errorMessage = '';

    this.userProfileService.changeUserPassword(changePassword).subscribe({
      next: (response) => {
        this.userProfileService.showToastSuccess(response.message);
      },
      error: (error) => {
        this.userProfileService.showToastErrorResponse(error);
      },
    });
  }
}
