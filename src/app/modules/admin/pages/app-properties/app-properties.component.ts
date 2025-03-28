import { Component, signal, computed, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { AppProperties } from './app-properties.model';
import { AppPropertiesService } from './service/app-properties.service';
import { CommonModule } from '@angular/common';
import { EditAppPropertiesComponent } from './modal/edit-app-properties.component';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { PaginatedComponent } from 'src/app/common/components/pagination/pagination.component';
import { TruncatePipe } from 'src/app/common/pipes/truncate.pipe';

@Component({
    selector: 'app-app-properties',
    imports: [AngularSvgIconModule, FormsModule, CommonModule, EditAppPropertiesComponent, TruncatePipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './app-properties.component.html',
    styleUrl: './app-properties.component.scss'
})
export class AppPropertiesComponent extends PaginatedComponent<AppProperties> implements OnInit  {
  search: string = '';
  loading: boolean = false;
  @ViewChild('modal', { static: false }) modal!: EditAppPropertiesComponent;
  appProperty!: AppProperties;

  constructor(private appPropService: AppPropertiesService, private authService:AuthService) {super();}

  ngOnInit(): void {
    this.loadAppProperties(this.currentPage, this.selectedRows, this.search);
  }

  handleEdit(appProperty: AppProperties) {
    this.appProperty = appProperty;
    this.modal.openModal();
  }

  handleDelete(appProperty: AppProperties) {
   this.authService.showToastError('Not implemented');
  }

  addProperty(){
    this.authService.showToastError('Not implemented');
  }

  private loadAppProperties(page: number, size: number, search: string) {
    this.loading = true;
    this.appPropService.getAppProperties(page, size, search).subscribe({
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
  
}
