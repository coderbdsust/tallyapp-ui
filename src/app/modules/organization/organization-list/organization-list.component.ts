import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { OrganizationService } from '../service/organization.service';
import { AssignOrganizationComponent } from '../modal/assign-organization/assign-organization.component';
import { Organization } from '../service/model/organization.model';
import { EmployeeService } from '../service/employee.service';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AddOrganizationComponent } from '../drawer/add-organization/add-organization.component';
import { OrganizationOwnerComponent } from '../modal/organization-owner/organization-owner.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-organization-list',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AssignOrganizationComponent,
    AddOrganizationComponent,
    WordPipe,
    NgIf,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-list.component.scss',
})
export class OrganizationListComponent extends PaginatedComponent<Organization> implements OnInit, OnDestroy {
  @ViewChild('organizationDrawer') organizationDrawer!: AddOrganizationComponent;
  @ViewChild('assignOrganizationModal', { static: false }) assignOrganizationModal!: AssignOrganizationComponent;
  
  search: string = '';
  loading: boolean = false;
  submitted = false;
  errorMessage = '';
  organization!: Organization;
  allOrganizations: Organization[] = [];
  searchEnabled: boolean = false; // Flag to control search functionality

  private destroy$ = new Subject<void>();

  constructor(
    private orgService: OrganizationService, 
    private empService: EmployeeService, 
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToOrganization();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Abstract method implementation
  loadData(): void {
    this.loading = true;
    this.orgService
      .getOrganizationsByPage(this.currentPage, this.selectedRows, this.search)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allOrganizations = response.content;
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.empService.showToastErrorResponse(error);
        },
      });
  }

  private subscribeToOrganization(): void {
    this.orgService.organization$
      .pipe(takeUntil(this.destroy$))
      .subscribe((org) => {
        if (org) {
          this.organization = org;
          this.loadData();
        }
      });
  }

  // Event handlers
  onSearchChange(event: Event): void {
    if (!this.searchEnabled) {
      this.orgService.showToastInfo('Search functionality is not implemented yet.');
      return;
    }

    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  // Organization actions
  editOrganization(selectedOrganization: Organization): void {
    this.organizationDrawer.openDrawer(selectedOrganization);
  }

  assignOrganization(): void {
    this.assignOrganizationModal.openModal();
  }

  openOrganizationOwners(org: Organization): void {
    console.log('Open organization owners for:', org);
    const dialogRef = this.dialog.open(OrganizationOwnerComponent, {
      width: '650px',
      data: org,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.loadData();
    });
  }

  openOrganizationDrawer(isEdit: boolean): void {
    if (isEdit) {
      this.organizationDrawer.openDrawer(this.organization);
    } else {
      this.organizationDrawer.openDrawer();
    }
  }

  // Event callbacks
  onAddOrganization(org: Organization): void {
    console.log('New Organization Added:', org);
    this.updateInPage(org, 'id');
    this.orgService.loadAllOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  // Utility methods
  getOrganizationIndex(index: number): number {
    return index + this.startIndex;
  }

  getStatusColor(status: string): { bg: string; text: string } {
    const statusMap: Record<string, { bg: string; text: string }> = {
      'ACTIVE': { bg: 'bg-green-100', text: 'text-green-800' },
      'INACTIVE': { bg: 'bg-red-100', text: 'text-red-800' },
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'SUSPENDED': { bg: 'bg-orange-100', text: 'text-orange-800' }
    };

    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  getOwnerDisplayText(org: Organization): string {
    if (org.totalOwners > 1) {
      return `${org.totalOwners} owners`;
    }
    return org.totalOwners === 1 ? '1 owner' : 'No owners';
  }

  getStatsColor(value: number, type: 'products' | 'employees'): string {
    if (value === 0) return 'text-red-500';
    if (value < 5) return 'text-yellow-600';
    return 'text-green-600';
  }
}