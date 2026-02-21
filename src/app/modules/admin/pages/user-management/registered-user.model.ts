import { FileUploadResponse } from "src/app/core/models/file-upload-response.model";

export interface RegisteredUser {
    id:string;
    username:string;
    email:string;
    mobileNo:string;
    fullName:string;
    firstName:string,
    lastName:string,
    gender:string,
    dateOfBirth:string;
    createdDate:string;
    lastKeycloakSync:string;
    keycloakUserId:string;
    maximumOrganizationLimit:number;
    profileImage: FileUploadResponse;
}