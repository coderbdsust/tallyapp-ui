import { Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RegisteredUser } from './registered-user.model';
import { RegisterUserService } from './service/register-user.service';
import { EditAppPropertiesComponent } from '../app-properties/modal/edit-app-properties.component';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-registered-user',
  imports: [AngularSvgIconModule, FormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './registered-user.component.html',
  styleUrl: './registered-user.component.scss'
})
export class RegisteredUserComponent extends PaginatedComponent<RegisteredUser> implements OnInit, OnDestroy {
  search: string = '';
  loading: boolean = false;
  registeredUser!: RegisteredUser;
  roles: string[] = [];

  @ViewChild('modal', { static: false }) modal!: EditAppPropertiesComponent;

  private destroy$ = new Subject<void>();

  constructor(
    private registerUserService: RegisterUserService, 
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Abstract method implementation
  loadData(): void {
    this.loading = true;
    this.registerUserService
      .getRegisteredUsers(this.currentPage, this.selectedRows, this.search)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.registerUserService.showToastErrorResponse(error);
        },
      });
  }

  private initializeComponent(): void {
    this.loadAllRoles();
    this.loadData();
  }

  private loadAllRoles(): void {
    this.registerUserService
      .getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.roles = response;
        },
        error: (error) => {
          this.registerUserService.showToastErrorResponse(error);
        },
      });
  }

  // Event handlers
  onSearchChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  onRoleChange(event: Event, user: RegisteredUser): void {
    const role = (event.target as HTMLSelectElement).value;
    if (role !== '-1') {
      const roleChange = { username: user.username, role: role };
      this.registerUserService
        .changeRole(roleChange)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.sucs) {
              this.registerUserService.showToastSuccess(response.message);
              // Update the user's role in the current page data
              this.updateUserInPage(user, 'roles', [role]);
            } else {
              this.registerUserService.showToastError(response.message);
              // Reset the select to original value
              (event.target as HTMLSelectElement).value = user.roles[0] || '';
            }
          },
          error: (error) => {
            this.registerUserService.showToastErrorResponse(error);
            // Reset the select to original value
            (event.target as HTMLSelectElement).value = user.roles[0] || '';
          },
        });
    }
  }

  onVerificationChange(event: Event, user: RegisteredUser): void {
    // Prevent the checkbox from changing
    event.preventDefault();
    this.registerUserService.showToastError(`You can't change verification status, It's view only`);
  }

  onAccountLocked(event: Event, user: RegisteredUser): void {
    const checkbox = event.target as HTMLInputElement;
    const accountLocking = { accountLocked: checkbox.checked, username: user.username };
    
    this.registerUserService
      .lockOrUnlockAccount(accountLocking)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.sucs) {
            this.registerUserService.showToastSuccess(response.message);
            // Update the user's lock status in the current page data
            this.updateUserInPage(user, 'accountLocked', checkbox.checked);
          } else {
            this.registerUserService.showToastError(response.message);
            // Reset the checkbox to original state
            checkbox.checked = !checkbox.checked;
          }
        },
        error: (error) => {
          this.registerUserService.showToastErrorResponse(error);
          // Reset the checkbox to original state
          checkbox.checked = !checkbox.checked;
        },
      });
  }

  // User actions
  addUser(): void {
    this.authService.showToastError('Not implemented');
  }

  assignUser(user: RegisteredUser): void {
    this.authService.showToastError('Not implemented');
  }

  forceLogout(user: RegisteredUser): void {
    const username = { username: user.username };
    this.registerUserService
      .forceLogout(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.registerUserService.showToastSuccess(response.message);
        },
        error: (error) => {
          this.registerUserService.showToastErrorResponse(error);
        },
      });
  }

  // Utility methods
  private updateUserInPage(user: RegisteredUser, property: keyof RegisteredUser, value: any): void {
    if (this.pageResponse?.content) {
      const userIndex = this.pageResponse.content.findIndex(u => u.username === user.username);
      if (userIndex !== -1) {
        (this.pageResponse.content[userIndex] as any)[property] = value;
      }
    }
  }

  getUserIndex(index: number): number {
    return index + this.startIndex;
  }

  getAccountStatusText(user: RegisteredUser): string {
    if (!user.enabled) return 'Unverified';
    if (user.accountLocked) return 'Locked';
    return 'Active';
  }

  getAccountStatusColor(user: RegisteredUser): string {
    if (!user.enabled) return 'text-yellow-600';
    if (user.accountLocked) return 'text-red-600';
    return 'text-green-600';
  }

  getRoleDisplayName(role: string): string {
    // Convert role names to display format
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getAvatarUrl(user: RegisteredUser): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff`;
  }

  isCurrentUserRole(user: RegisteredUser, role: string): boolean {
    return user.roles && user.roles.includes(role);
  }
}