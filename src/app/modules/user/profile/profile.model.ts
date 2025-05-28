export interface Address {
  id:string;
  addressLine:string;
  city:string;
  state:string;
  postCode:string;
  country:string;
}
export interface ShortProfile {
  id:string;
  designation:string;
  skills:string;
  companyName:string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  mobileNo: string;
  fullName: string;
  gender:string;
  dateOfBirth: string;
  enabled: boolean;
  accountLocked: boolean;
  tfaEnabled: boolean;
  createdDate: Date;
  roles: string[];
  addressList: Address[];
  shortProfileList: ShortProfile[];
  mobileNoVerified: boolean;
}

export interface TFAResponse {
  byEmail: boolean;
  byMobile: boolean;
  byAuthenticator: boolean;
}