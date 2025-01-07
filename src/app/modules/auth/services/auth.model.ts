export interface AuthUser {
  accessToken: string;
  refreshToken: string;
  expireTime: Date;
  fullName: string;
  username: string;
  email: string;
  role: string;
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
