import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';

export interface TokenResponse {
  accessToken:string,
  refreshToken:string
}

export interface SignUpResponse {
  id:string,
  username:string,
  email:string,
  mobileNo:string,
  fullName:string,
  dateOfBirth:string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  signUp(signUpData:any) {
    return this.http.post<SignUpResponse>(
      `${environment.tallyURL}/auth/v1/register`,
      signUpData
    )
  }

  signIn(signInData:any){
    return this.http.post<TokenResponse>(
      `${environment.tallyURL}/auth/v1/login`,
      signInData
    )
  }

  verifyUser(verifyData:any) {
    return this.http.post(
      `${environment.tallyURL}/auth/v1/verify`,
      verifyData
    )
  }
}
