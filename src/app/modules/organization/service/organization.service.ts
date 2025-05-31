import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../auth/services/common.service';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, catchError } from 'rxjs';
import { Organization, OrganizationTopEmployee, UserForOrganization } from './model/organization.model';
import { Router } from '@angular/router';
import { ApiResponse } from '../../auth/services/auth.model';
import { PageResponse } from 'src/app/common/models/page-response';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService extends CommonService {

  selectedOrganization = new BehaviorSubject<Organization | null>(null);

  organization$ = this.selectedOrganization.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    super();
    this.selectedOrganization.next(this.getSelectedOrganization());
  }

  public setOrganization(org: Organization | null) {
    localStorage.setItem(environment.TALLY_ORGANIZATION, JSON.stringify(org));
    this.selectedOrganization.next(org);
  }

  public clearOrganization() {
    localStorage.removeItem(environment.TALLY_ORGANIZATION);
    this.selectedOrganization.next(null);
  }

  getSelectedOrganization(): Organization | null {
    const storedOrg = localStorage.getItem(environment.TALLY_ORGANIZATION);
    return storedOrg ? JSON.parse(storedOrg) : null;
  }

  public getOrganizations() {
    return this.http
      .get<Organization[]>(`${environment.tallyURL}/organization/v1/list`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getOrganizationsByPage(page: number, size: number, search: string) {
    return this.http
      .get<PageResponse<Organization>>(`${environment.tallyURL}/organization/v1/page/list`, {
        params: { page, size, search }
      })
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

  public getOrganizationTopEmployee(orgId: string) {
    return this.http
      .get<OrganizationTopEmployee>(`${environment.tallyURL}/organization/v1/${orgId}/top-employee`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getTotalEmployeeByOrganization(orgId: string) {
    return this.http
      .get<Number>(`${environment.tallyURL}/organization/v1/${orgId}/total-employee`)
      .pipe(catchError(this.mapErrorResponse));
  }
}
