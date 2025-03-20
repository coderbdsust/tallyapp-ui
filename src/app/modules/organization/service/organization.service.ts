import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../auth/services/common.service';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { Organization, UserForOrganization } from './organization.model';
import { Router } from '@angular/router';
import { ApiResponse } from '../../auth/services/auth.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService extends CommonService {

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  public getOrganizations() {
    return this.http
      .get<Organization[]>(`${environment.tallyURL}/organization/v1/list`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getOrganizationById(id: string) {
    return this.http
      .get<Organization>(`${environment.tallyURL}/organization/v1/${id}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public addOrganization(organization: Organization) {
    return this.http
      .post<Organization>(`${environment.tallyURL}/organization/v1/add`, organization)
      .pipe(catchError(this.mapErrorResponse));
  }

  public searchUsersForOrganization(searchKey:String){
    return this.http
      .get<UserForOrganization[]>(`${environment.tallyURL}/users/v1/search-users-for-organization?searchKey=${searchKey}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public addUsersToOrganization(orgId:String, userIds: String[]) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/organization/v1/add-users-to-organization/${orgId}`, userIds)
      .pipe(catchError(this.mapErrorResponse));
  }
}
