import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/modules/auth/services/common.service';
import { RegisteredUser } from '../registered-user.model';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { PageResponse } from 'src/app/common/models/page-response';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/modules/auth/services/auth.model';

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
        `${environment.tallyURL}/users/admin/v1/registered/list?page=${page}&size=${size}&search=${search}`,
      )
      .pipe(catchError(this.mapErrorResponse));
  }

  public getAllRoles() {
    return this.http
      .get<string[]>(`${environment.tallyURL}/users/admin/v1/roles`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public changeRole(changeRole:any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/users/admin/v1/change/role`, changeRole)
      .pipe(catchError(this.mapErrorResponse));
  }

  public lockOrUnlockAccount(lockStatus:any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/users/admin/v1/account/lock`, lockStatus)
      .pipe(catchError(this.mapErrorResponse));
  }
}
