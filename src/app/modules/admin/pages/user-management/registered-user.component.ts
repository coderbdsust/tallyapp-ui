import { Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisteredUser } from './registered-user.model';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { Subject, takeUntil } from 'rxjs';
import { RegisterUserService } from 'src/app/core/services/register-user.service';
import { AddUserComponent } from '../modal/add-user/add-user.component';

@Component({
  selector: 'app-registered-user',
  imports: [AngularSvgIconModule, FormsModule, CommonModule, AddUserComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './registered-user.component.html',
  styleUrl: './registered-user.component.scss'
})
export class RegisteredUserComponent extends PaginatedComponent<RegisteredUser> implements OnInit, OnDestroy {
  search: string = '';
  loading: boolean = false;
  registeredUser!: RegisteredUser;
  @ViewChild('addUserModal', { static: false }) addUserModal!: AddUserComponent;

  private destroy$ = new Subject<void>();

  constructor(
    private registerUserService: RegisterUserService
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
    this.loadData();
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

  // Utility methods
  private updateUserInPage(user: RegisteredUser, property: keyof RegisteredUser, value: any): void {
    if (this.pageResponse?.content) {
      const userIndex = this.pageResponse.content.findIndex(u => u.username === user.username);
      if (userIndex !== -1) {
        (this.pageResponse.content[userIndex] as any)[property] = value;
      }
    }
  }

  addUser(): void {
      this.addUserModal.openModal(null);
  }

  editUser(user:RegisteredUser): void {
      this.addUserModal.openModal(user);
  }

  getUserIndex(index: number): number {
    return index + this.startIndex;
  }

  getAvatarUrl(user: RegisteredUser): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff`;
  }
}