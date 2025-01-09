import { Component, signal, computed, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { AppProperties } from './app-properties.model';
import { AppPropertiesService } from './service/app-properties.service';
import { CommonModule } from '@angular/common';
import { PageResponse } from 'src/app/common/models/page-response';

@Component({
  selector: 'app-app-properties',
  standalone: true,
  imports: [AngularSvgIconModule, FormsModule, CommonModule],
  templateUrl: './app-properties.component.html',
  styleUrl: './app-properties.component.scss',
})
export class AppPropertiesComponent implements OnInit {
  pageResponse = signal<PageResponse<AppProperties> | null>(null);
  currentRows: number = 10;
  totalRows: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  search: string = '';
  first:boolean = false;
  last:boolean = false;

  constructor(private appPropService: AppPropertiesService) {}

  ngOnInit(): void {
    this.loadAppProperties(this.currentPage, this.currentRows, this.search);
  }

  private loadAppProperties(page: number, size: number, search: string) {
    this.appPropService.getAppProperties(page, size, search).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.currentPage = response.pageNo;
        this.currentRows = Math.min(response.size, response.totalElements);
        this.totalRows = response.totalElements;
        this.totalPages = response.totalPages;
        this.first = response.first;
        this.last = response.last;
      },
      error: (error) => {
        this.appPropService.showToastErrorResponse(error);
      },
    });
  }

  // public toggleProperties(checked: boolean) {
  //   this.appProperties.update((properties) => {
  //     return properties.map((property) => {
  //       return { ...property, selected: checked };
  //     });
  //   });
  // }

  onSearchChange(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.loadAppProperties(0, this.currentRows, this.search);
  }

  onSelectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const rows = parseInt(selectElement.value);
    this.currentRows = rows === -1 ? this.totalRows : rows;
    this.loadAppProperties(0, this.currentRows, this.search);
  }

  get startIndex(): number {
    return this.currentPage * this.currentRows + 1;
  }

  get endIndex(): number {
    const end = (this.currentPage + 1) * this.currentRows;
    return end > this.totalRows ? this.totalRows : end;
  }

  // Handler for going to the previous page
  goToPreviousPage() {
    if (!this.first) {
      this.currentPage -= 1;
      this.updatePagination();
    }
  }

  // Handler for going to the next page
  goToNextPage() {
    if (!this.last) {
      this.currentPage += 1;
      this.updatePagination();
    }
  }

  // Update pagination state
  updatePagination() {
    this.first = this.currentPage === 0;
    this.last = this.currentPage === this.totalPages - 1;
    this.loadAppProperties(this.currentPage, this.currentRows, this.search);
  }

  // Go to a specific page
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index);
  }
}
