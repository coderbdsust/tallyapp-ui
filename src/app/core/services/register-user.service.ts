import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { PageResponse } from 'src/app/common/models/page-response';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/core/models/auth.model';
import { RegisteredUser } from 'src/app/modules/admin/pages/user-management/registered-user.model';
import { RegUser } from '../models/reg-user.model';

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



  public addUser(user: RegisteredUser) {
    return this.http
      .post<any>(`${environment.tallyURL}/admin/user-management/v1/add-user`, user)
      .pipe(catchError(this.mapErrorResponse));
  }

  public syncUser(id: string) {
    return this.http
      .get<RegisteredUser>(
        `${environment.tallyURL}/admin/user-management/v1/sync/${id}`,
      )
      .pipe(catchError(this.mapErrorResponse));
  }

    public syncUsers() {
    return this.http
      .get<ApiResponse>(
        `${environment.tallyURL}/admin/user-management/v1/sync`,
      )
      .pipe(catchError(this.mapErrorResponse));
  }

}
