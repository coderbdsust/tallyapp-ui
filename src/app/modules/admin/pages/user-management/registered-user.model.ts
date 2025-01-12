export interface RegisteredUser {
    id:string;
    username:string;
    email:string;
    mobileNo:string;
    fullName:string;
    dateOfBirth:string;
    enabled:boolean;
    accountLocked:boolean;
    tfaEnabled:boolean;
    roles:string[];
    createdDate:string;
    mobileNoVerified:boolean;
}