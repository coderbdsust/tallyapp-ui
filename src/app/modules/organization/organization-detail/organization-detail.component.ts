import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, ViewChild } from '@angular/core';
import { PageResponse } from 'src/app/common/models/page-response';
import { AppProperties } from '../../admin/pages/app-properties/app-properties.model';
import { AuthService } from '../../auth/services/auth.service';
import { EditAppPropertiesComponent } from '../../admin/pages/app-properties/modal/edit-app-properties.component';
import { AppPropertiesService } from '../../admin/pages/app-properties/service/app-properties.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Drawer } from 'flowbite';
import type { DrawerOptions, DrawerInterface } from 'flowbite';
import type { InstanceOptions } from 'flowbite';
import { Router } from '@angular/router';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { OrganizationService } from '../service/organization.service';
import { AssignOrganizationComponent } from "../assign-organization/assign-organization.component";
import { Organization } from '../service/organization.model';
import { AddOrganizationComponent } from "../add-organization/add-organization.component";
import { OrgDrawerService } from '../service/org-drawer.service';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonComponent,
    EditAppPropertiesComponent,
    AssignOrganizationComponent,
    AddOrganizationComponent
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './organization-detail.component.html',
  styleUrl: './organization-detail.component.scss',
})
export class OrganizationDetailComponent {
  pageResponse = signal<PageResponse<AppProperties> | null>(null);
  selectedRows: number = 10;
  totalRows: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  search: string = '';
  loading: boolean = false;
  pagesArray: number[] = [];
  @ViewChild('addEmployeeModal', { static: false }) addEmployeeModal!: EditAppPropertiesComponent;
  @ViewChild('assignOrganizationModal', { static: false }) assignOrganizationModal!: AssignOrganizationComponent;
  appProperty!: AppProperties;
  submitted = false;
  errorMessage = '';
  organization!: Organization;

  constructor(
    private appPropService: AppPropertiesService,
    private authService: AuthService,
    private orgService: OrganizationService,
    private orgDrawerService: OrgDrawerService
  ) {}

  ngOnInit(): void {
    this.loadAppProperties(this.currentPage, this.selectedRows, this.search);
    this.loadOrganization();
  }

  handleEdit(appProperty: AppProperties) {
    this.appProperty = appProperty;
    this.addEmployeeModal.openModal();
  }

  handleDelete(appProperty: AppProperties) {
    this.authService.showToastError('Not implemented');
  }

  addProperty() {
    this.authService.showToastError('Not implemented');
  }

  private loadAppProperties(page: number, size: number, search: string) {
    this.loading = true;
    this.appPropService.getAppProperties(page, size, search).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.currentPage = response.pageNo;
        this.totalRows = response.totalElements;
        this.totalPages = response.totalPages;
        this.updatePagesArray();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.appPropService.showToastErrorResponse(error);
      },
    });
  }

  onSearchChange(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.loadAppProperties(0, this.selectedRows, this.search);
  }

  onSelectChange(event: Event) {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedRows = rows === -1 ? this.totalRows || 0 : rows;
    this.loadAppProperties(0, this.selectedRows, this.search);
  }

  get startIndex(): number {
    return this.currentPage * this.selectedRows + 1;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.selectedRows - 1, this.totalRows);
  }

  get first(): boolean {
    return this.currentPage === 0;
  }

  get last(): boolean {
    return this.currentPage === this.totalPages - 1;
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
    this.loadAppProperties(this.currentPage, this.selectedRows, this.search);
  }

  private updatePagesArray() {
    this.pagesArray = Array.from({ length: this.totalPages }, (_, index) => index);
  }

  getPagesArray(): number[] {
    return this.pagesArray;
  }

  assignOrganization(){
    this.assignOrganizationModal.openModal();
  }

  private loadOrganization() {
    this.orgService.getOrganizations().subscribe({
      next: (organizations) => {
        //console.log(organizations);
        if (organizations && organizations.length > 0) {
          let org = organizations[0];
          this.organization = org;
        }
      },
      error: () => {},
    });
  }

  openOrganization(){
    this.orgDrawerService.openDrawer();
  }
    
}
