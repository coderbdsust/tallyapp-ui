import { Component, signal, computed, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RegisteredUser } from './registered-user.model';
import { RegisterUserService } from './service/register-user.service';
import { EditAppPropertiesComponent } from '../app-properties/modal/edit-app-properties.component';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';

@Component({
    selector: 'app-registered-user',
    imports: [AngularSvgIconModule, FormsModule, CommonModule],
    templateUrl: './registered-user.component.html',
    styleUrl: './registered-user.component.scss'
})
export class RegisteredUserComponent extends PaginatedComponent<RegisteredUser>{
  search: string = '';
  loading: boolean = false;
  @ViewChild('modal', { static: false }) modal!: EditAppPropertiesComponent;
  registeredUser!: RegisteredUser;
  roles: string[] = [];

  constructor(private registerUserService: RegisterUserService, private authService: AuthService) {super();}

  ngOnInit(): void {
    this.loadAllRoles();
    this.loadRegisteredUsers(this.currentPage, this.selectedRows, this.search);
  }

  loadAllRoles() {
    this.registerUserService.getAllRoles().subscribe({
      next: (response) => {
        this.roles = response;
      },
      error: (error) => {
        this.registerUserService.showToastErrorResponse(error);
      },
    });
  }

  addUser() {
    this.authService.showToastError('Not implemented');
  }

  assignUser(user: any) {
    this.authService.showToastError('Not implemented');
  }

  forceLogout(user: any) {
    let username = { username: user.username };
    this.registerUserService.forceLogout(username).subscribe({
      next: (response) => {
        this.registerUserService.showToastSuccess(response.message);
      },
      error: (error) => {
        this.registerUserService.showToastErrorResponse(error);
      },
    });
  }

  private loadRegisteredUsers(page: number, size: number, search: string) {
    this.loading = true;
    this.registerUserService.getRegisteredUsers(page, size, search).subscribe({
      next: (response) => {
        this.pageResponse = response;
        this.currentPage = response.pageNo;
        this.totalRows = response.totalElements;
        this.totalPages = response.totalPages;
        this.updatePagesArray();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.registerUserService.showToastErrorResponse(error);
      },
    });
  }

  onSearchChange(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.loadRegisteredUsers(0, this.selectedRows, this.search);
  }

  onSelectChange(event: Event) {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedRows = rows === -1 ? this.totalRows || 0 : rows;
    this.loadRegisteredUsers(0, this.selectedRows, this.search);
  }

  onRoleChange(event: Event, user: RegisteredUser) {
    const role = (event.target as HTMLSelectElement).value;
    if (role !== '-1') {
      let roleChange = { username: user.username, role: role };
      this.registerUserService.changeRole(roleChange).subscribe({
        next: (response) => {
          if (response.sucs) {
            this.registerUserService.showToastSuccess(response.message);
          } else {
            this.registerUserService.showToastError(response.message);
          }
        },
        error: (error) => {
          this.registerUserService.showToastErrorResponse(error);
        },
      });
    }
  }

  onVerificationChange(event: Event, user: RegisteredUser) {
    const checkbox = event.target as HTMLInputElement;
    this.registerUserService.showToastError(`You can't change verification status, It's view only`);
  }

  onAccountLocked(event: Event, user: RegisteredUser) {
    const checkbox = event.target as HTMLInputElement;
    let accountLocking = { accountLocked: checkbox.checked, username: user.username };
    this.registerUserService.lockOrUnlockAccount(accountLocking).subscribe({
      next: (response) => {
        if (response.sucs) {
          this.registerUserService.showToastSuccess(response.message);
        } else {
          this.registerUserService.showToastError(response.message);
        }
      },
      error: (error) => {
        this.registerUserService.showToastErrorResponse(error);
      },
    });
  }

  goToPreviousPage() {
    if (!this.first) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNextPage() {
    if (!this.last) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  private updatePagination() {
    this.loadRegisteredUsers(this.currentPage, this.selectedRows, this.search);
  }

}
