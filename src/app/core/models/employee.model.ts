import { FileUploadResponse } from "./file-upload-response.model";

export interface Employee {
    id:                  string;
    fullName:            string;
    dateOfBirth:         Date;
    joiningDate:         Date;
    mobileNo:            string;
    empAddressLine:      string;
    empCity:             string;
    empPostcode:         string;
    empCountry:          string;
    employeeType:        string;
    status:              string;
    employeeBillingType: string;
    billingRate:         number;
    dailyAllowance:      number;
    profileImage: FileUploadResponse;

}
