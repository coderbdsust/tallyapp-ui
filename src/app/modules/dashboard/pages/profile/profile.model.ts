export interface UserProfile {
  id: string;
  username: string;
  email: string;
  mobileNo: string;
  fullName: string;
  dateOfBirth: string;
  enabled: boolean;
  accountLocked: boolean;
  tfaEnabled: boolean;
  createdDate: Date;
  roles: string[];
  addressList: any[];
  mobileNoVerified: boolean;
}