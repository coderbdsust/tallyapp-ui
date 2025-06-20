import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/modules/auth/services/common.service';
import { environment } from 'src/environments/environment';
import { Module, NewRole, RoleResponse } from '../permission.model';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends CommonService {
  constructor(private http: HttpClient) {
    super();
  }

    public getAvailableModules() {
      return this.http
        .get<Module[]>(`${environment.tallyURL}/module/v1/all-modules`)
        .pipe(catchError(this.mapErrorResponse));
    }

    public getAvailableRoles() {
      return this.http
        .get<RoleResponse[]>(`${environment.tallyURL}/admin/user-management/v1/role-with-modules`)
        .pipe(catchError(this.mapErrorResponse));
    }

    public createRole(newRole:NewRole) {
      return this.http
        .post<RoleResponse>(`${environment.tallyURL}/admin/user-management/v1/create-role`, newRole)
        .pipe(catchError(this.mapErrorResponse));
    }

    public assignModule(roleId:string, moduleName:string) {
      return this.http
        .post<RoleResponse>(`${environment.tallyURL}/admin/user-management/v1/${roleId}/assign-module`, moduleName)
        .pipe(catchError(this.mapErrorResponse));
    }

    public removeModule(roleId:string, moduleName:string) {
      return this.http
        .post<RoleResponse>(`${environment.tallyURL}/admin/user-management/v1/${roleId}/remove-module`, moduleName)
        .pipe(catchError(this.mapErrorResponse));
    }
}
