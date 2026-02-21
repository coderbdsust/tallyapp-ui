import { FileUploadResponse } from "./file-upload-response.model";

export interface Organization {
    id: string;
    createdDate?: string | null;
    updatedDate?: string | null;
    orgName: string;
    orgRegNumber: string;
    orgTinNumber: string;
    orgVatNumber: string;
    orgMobileNo: string;
    orgEmail: string;
    orgOpenAt: string;
    orgOpenInWeek: string;
    orgOpeningTitle: string;
    since: string;
    orgAddressLine: string;
    orgAddressCity: string;
    orgAddressPostcode: string;
    orgAddressCountry: string;
    status: string;
    owner: string;
    logoB64:string|'';
    totalEmployees: number;
    totalProducts: number | 0;
    totalOwners: number | 0;
    tax:number|0;
    vat:number|0;
    ownerImage: FileUploadResponse;
    bannerImage: FileUploadResponse;
    logoImage: FileUploadResponse;
  }
  

export interface UserForOrganization {
    id: string;
    fullName:string;
    email:string;
}

export interface OrganizationOwner{
  organization: Organization;
  owners: UserForOrganization[];
}

export interface OrganizationTopEmployee {
  fullName:string;
  dateOfBirth:string;
  mobileNo:string;
  profileImage:string;
}