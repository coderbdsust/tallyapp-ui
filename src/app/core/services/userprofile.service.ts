import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { Address, ShortProfile, UserProfile } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class UserprofileService extends CommonService {
  constructor(private http: HttpClient) {
    super();
  }

  getGenderList() {
    return this.http
      .get<String[]>(`${environment.tallyURL}/users/v1/gender-list`)
      .pipe(catchError(this.mapErrorResponse));
  }

  getUserProfile() {
    return this.http
      .get<UserProfile>(`${environment.tallyURL}/users/v1/profile`)
      .pipe(catchError(this.mapErrorResponse));
  }

  updateUserProfile(userProfile: UserProfile) {
    return this.http
      .put<UserProfile>(`${environment.tallyURL}/users/v1/profile`, userProfile)
      .pipe(catchError(this.mapErrorResponse));
  }

  addShortProfiles(shortProfileList: ShortProfile[]) {
    return this.http
      .post<ShortProfile[]>(`${environment.tallyURL}/users/v1/short-profile/add-list`, shortProfileList)
      .pipe(catchError(this.mapErrorResponse));
  }

  addAddresses(addressList: Address[]) {
    return this.http
      .post<Address[]>(`${environment.tallyURL}/users/v1/address/add-list`, addressList)
      .pipe(catchError(this.mapErrorResponse));
  }

  deleteAddress(id: string) {
    return this.http
      .delete<ApiResponse>(`${environment.tallyURL}/users/v1/address/${id}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  deleteShortProfile(id: string) {
    return this.http
      .delete<ApiResponse>(`${environment.tallyURL}/users/v1/short-profile/${id}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  changePassword(changePassword: any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/users/v1/change-password`, changePassword)
      .pipe(catchError(this.mapErrorResponse));
  }

}
