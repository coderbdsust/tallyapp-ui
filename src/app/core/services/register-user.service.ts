import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { PageResponse } from 'src/app/common/models/page-response';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/core/models/auth.model';
import { RegisteredUser } from 'src/app/modules/admin/pages/user-management/registered-user.model';

@Injectable({
  providedIn: 'root',
})
export class RegisterUserService extends CommonService {
  constructor(private http: HttpClient) {
    super();
  }

  public getRegisteredUsers(page: number, size: number, search: string) {
    return this.http
      .get<PageResponse<RegisteredUser>>(
        `${environment.tallyURL}/admin/user-management/v1/registered-user/list?page=${page}&size=${size}&search=${search}`,
      )
      .pipe(catchError(this.mapErrorResponse));
  }

  public getAllRoles() {
    return this.http
      .get<string[]>(`${environment.tallyURL}/admin/user-management/v1/roles`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public changeRole(changeRole:any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/admin/user-management/v1/change/role`, changeRole)
      .pipe(catchError(this.mapErrorResponse));
  }

  public lockOrUnlockAccount(lockStatus:any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/admin/user-management/v1/account/lock`, lockStatus)
      .pipe(catchError(this.mapErrorResponse));
  }

  public forceLogout(username:any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/admin/user-management/v1/revoke/token`, username)
      .pipe(catchError(this.mapErrorResponse));
  }
}
