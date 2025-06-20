export interface AuthUser {
  accessTokenExpiry: Date;
  refreshTokenExpiry: Date;
  fullName: string;
  username: string;
  email: string;
  roles: string[];
  modules: string[];
  status: string;
  message: string;
}

export interface SignUpResponse {
  id: string;
  username: string;
  email: string;
  mobileNo: string;
  fullName: string;
  dateOfBirth: string;
}

export interface ApiResponse {
  sucs:boolean;
  businessCode:number;
  userDetail:string;
  message:string;
}

export interface AuthenticatorAppResponse {
  qrCode: string;
  user : string;
  issuer:string;
}