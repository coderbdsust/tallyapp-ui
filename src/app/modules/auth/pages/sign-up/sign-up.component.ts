import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ErrorResponse } from 'src/app/common/models/error-response';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, AngularSvgIconModule, NgClass, NgIf, NgFor, ButtonComponent],
})
export class SignUpComponent implements OnInit {
    
  form!: FormGroup;
  submitted = false;
  passwordTextType!: boolean;
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  months = [
    { id: 1, value: "Jan", fullName: "January" },
    { id: 2, value: "Feb", fullName: "February" },
    { id: 3, value: "Mar", fullName: "March" },
    { id: 4, value: "Apr", fullName: "April" },
    { id: 5, value: "May", fullName: "May" },
    { id: 6, value: "Jun", fullName: "June" },
    { id: 7, value: "Jul", fullName: "July" },
    { id: 8, value: "Aug", fullName: "August" },
    { id: 9, value: "Sep", fullName: "September" },
    { id: 10, value: "Oct", fullName: "October" },
    { id: 11, value: "Nov", fullName: "November" },
    { id: 12, value: "Dec", fullName: "December" },
  ];
  years!:number[];
  errorMessage="";

  constructor(private readonly _formBuilder: FormBuilder, private readonly _router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.initYears();
    this.form = this._formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      // mobileNo: ['', [Validators.required,  Validators.pattern(/^01[3-9]\d{8}$/), Validators.minLength(11), Validators.maxLength(11)]],
      // dateOfBirth: ['', Validators.required],
      day:['', Validators.required],
      month:['', Validators.required],
      year:['', Validators.required],
      password: ['', [Validators.required,Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$_])[A-Za-z\d@$_]{8,}$/)]],
      confirmPassword: ['', [Validators.required,Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$_])[A-Za-z\d@$_]{8,}$/)]]
      //acceptTerm: ['', Validators.required]
    });
  }

  initYears(){
    const currentYear: number = new Date().getFullYear();
    const years: number[] = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i);
    this.years=years;
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  isValidDate(year: number, month: number, day: number): boolean {
    const date = new Date(year, month - 1, day);
    console.log(date);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }


  formatDate(y: number, m: number, d: number ): string {
    const date = new Date(y, m-1, d);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
   
    this.submitted = true;

    const signUpData  = this.form.value;

    if (this.form.invalid) {
      return;
    }
    
    if(!this.isValidDate(signUpData.year, signUpData.month, signUpData.day)){
      this.errorMessage="Date of Birth is not valid";
      return ;
    }   

    if(signUpData.password != signUpData.confirmPassword) {
      this.errorMessage=`Password and Confirm Password didn't matched`;
      return ;
    }
    
    signUpData.dateOfBirth = this.formatDate(signUpData.year, signUpData.month, signUpData.day);
    
    this.errorMessage="";

    this.authService.signUp(signUpData).subscribe({
      next: (response) => {
        this._router.navigateByUrl(`/auth/account-activation`,{state:{userKey:response.username}});
        this.authService.showToastSuccess(`New user created successfully, Please check email and verify with OTP`);
      },
      error: (error) => {
        this.authService.showToastErrorResponse(error);
      },
    });
   
  }
}
