import { FileUploadResponse } from "./file-upload-response.model";

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
  firstName: string;
  lastName: string;
  gender:string;
  dateOfBirth: string;
  createdDate: Date;
  addressList: Address[];
  shortProfileList: ShortProfile[];
  profileImage: FileUploadResponse;
}