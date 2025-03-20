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
    image: string | './assets/furniture/furniture-01.png';
    avatar: string | './assets/avatars/avt-01.jpg';
  }
  

export interface UserForOrganization {
    id: string;
    fullName:string;
    email:string;
}