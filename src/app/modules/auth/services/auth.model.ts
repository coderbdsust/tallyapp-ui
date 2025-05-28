export interface AuthUser {
  accessTokenExpiry: Date;
  refreshTokenExpiry: Date;
  fullName: string;
  username: string;
  email: string;
  role: string;
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
