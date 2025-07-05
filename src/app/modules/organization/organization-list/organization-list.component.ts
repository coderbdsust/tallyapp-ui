import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
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
export class OrganizationListComponent extends PaginatedComponent<Organization> {
  @ViewChild('organizationDrawer') organizationDrawer!: AddOrganizationComponent;
  @ViewChild('assignOrganizationModal', { static: false }) assignOrganizationModal!: AssignOrganizationComponent;
  search: string = '';
  loading: boolean = false;
  submitted = false;
  errorMessage = '';
  organization!: Organization;
  allOrganizations: Organization[] = [];

  constructor(private orgService: OrganizationService, private empService: EmployeeService, public dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.organization = org;
        this.loadOrganizationByPage(this.currentPage, this.selectedRows, this.search);
      }
    });
  }

  editOrganization(selectedOrganization: Organization) {
    this.organizationDrawer.openDrawer(selectedOrganization);
  }

  private loadOrganizationByPage(page: number, size: number, search: string) {
    this.loading = true;
    this.orgService.getOrganizationsByPage(page, size, search).subscribe({
      next: (response) => {
        this.allOrganizations = response.content;
        this.pageResponse = response;
        this.currentPage = response.pageNo;
        this.totalRows = response.totalElements;
        this.totalPages = response.totalPages;
        this.updatePagesArray();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.empService.showToastErrorResponse(error);
      },
    });
  }

  onSearchChange(event: Event) {
    // const input = (event.target as HTMLInputElement).value;
    // this.search = input;
    // this.loadOrganizationByPage(0, this.selectedRows, this.search);
    this.orgService.showToastInfo('Search functionality is not implemented yet.');
  }

  onSelectChange(event: Event) {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedRows = rows === -1 ? this.totalRows || 0 : rows;
    this.loadOrganizationByPage(0, this.selectedRows, this.search);
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
    this.loadOrganizationByPage(this.currentPage, this.selectedRows, this.search);
  }

  assignOrganization() {
    this.assignOrganizationModal.openModal();
  }

  onAddOrganization(org: Organization) {
    console.log('New Organization Added : ',org);
    this.updateInPage(org, 'id');
    this.orgService.loadAllOrganizations().subscribe();
  }

  openOrganizationOwners(org: Organization) {
    console.log('Open organization owners for:', org);
    const dialogRef = this.dialog.open(OrganizationOwnerComponent, {
      width: '650px',
      data: org,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.loadOrganizationByPage(this.currentPage, this.selectedRows, this.search);
    });

  }

  openOrganizationDrawer(isEdit: Boolean) {
    if (isEdit) {
      this.organizationDrawer.openDrawer(this.organization);
    } else {
      this.organizationDrawer.openDrawer();
    }
  }
}
