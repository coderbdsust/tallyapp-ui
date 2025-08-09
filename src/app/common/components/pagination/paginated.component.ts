import { PageResponse } from "../../models/page-response";

export abstract class PaginatedComponent<T> {
  pageResponse: PageResponse<T> | null = null;
  selectedRows: number = 10;
  totalRows: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pagesArray: number[] = [];
  maxVisiblePages: number = 5;

  // Abstract method that child components must implement
  abstract loadData(): void;

  updateInPage(updatedItem: T, idKey: keyof T) {
    if (!this.pageResponse) return;

    let updatedContent = this.pageResponse.content.map((item) =>
      item[idKey] === updatedItem[idKey] ? updatedItem : item
    );

    const isExisting = this.pageResponse.content.some((item) => item[idKey] === updatedItem[idKey]);
    if (!isExisting) {
      updatedContent = [...this.pageResponse.content, updatedItem];
    }

    this.recalculatePage(updatedContent);
  }

  removeFromPage(itemId: any, idKey: keyof T) {
    if (!this.pageResponse) return;

    const updatedContent = this.pageResponse.content.filter((item) => item[idKey] !== itemId);
    this.recalculatePage(updatedContent);
  }

  private recalculatePage(updatedContent: T[]) {
    if (!this.pageResponse) return;

    this.totalRows = updatedContent.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageResponse.size));
    this.currentPage = Math.min(this.currentPage, this.totalPages - 1);

    this.pageResponse = {
      ...this.pageResponse,
      content: updatedContent,
      totalElements: this.totalRows,
      totalPages: this.totalPages,
      first: this.currentPage === 0,
      last: this.currentPage >= this.totalPages - 1,
    };

    this.updatePagesArray();
  }

  // Pagination navigation methods
  goToPreviousPage(): void {
    if (!this.first) {
      this.currentPage--;
      this.loadData();
    }
  }

  goToNextPage(): void {
    if (!this.last) {
      this.currentPage++;
      this.loadData();
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  goToFirstPage(): void {
    if (this.currentPage !== 0) {
      this.currentPage = 0;
      this.loadData();
    }
  }

  goToLastPage(): void {
    const lastPage = this.totalPages - 1;
    if (this.currentPage !== lastPage) {
      this.currentPage = lastPage;
      this.loadData();
    }
  }

  // Page size change handler
  onPageSizeChange(newSize: number): void {
    this.selectedRows = newSize === -1 ? this.totalRows || 0 : newSize;
    this.resetToFirstPage();
  }

  // Filter/search change handler
  onFilterChange(): void {
    this.resetToFirstPage();
  }

  // Helper method to reset to first page and reload data
  private resetToFirstPage(): void {
    this.currentPage = 0;
    this.loadData();
  }

  // Update pagination state from API response
  updatePaginationState(response: PageResponse<T>): void {
    this.pageResponse = response;
    this.currentPage = response.page;
    this.totalRows = response.totalElements;
    this.totalPages = response.totalPages;
    this.updatePagesArray();
  }

  // Getters
  get startIndex(): number {
    return this.totalRows === 0 ? 0 : this.currentPage * this.selectedRows + 1;
  }

  get endIndex(): number {
    return this.totalRows === 0 ? 0 : Math.min(this.startIndex + this.selectedRows - 1, this.totalRows);
  }

  get first(): boolean {
    return this.currentPage === 0;
  }

  get last(): boolean {
    return this.currentPage >= this.totalPages - 1;
  }

  get hasData(): boolean {
    return !!(this.pageResponse?.content && this.pageResponse.content.length > 0);
  }

  get showPagination(): boolean {
    return this.totalPages > 1;
  }

  // Pagination display methods
  updatePagesArray(): void {
    this.pagesArray = Array.from({ length: this.totalPages }, (_, index) => index);
  }

  getPagesArray(): number[] {
    return this.pagesArray;
  }

  getVisiblePages(): (number | string)[] {
    if (this.totalPages <= this.maxVisiblePages) {
      return Array.from({ length: this.totalPages }, (_, index) => index);
    }

    const visiblePages: (number | string)[] = [];
    const halfVisible = Math.floor(this.maxVisiblePages / 2);
    
    visiblePages.push(0);
    
    let startPage = Math.max(1, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages - 2, this.currentPage + halfVisible);
    
    if (this.currentPage <= halfVisible) {
      endPage = Math.min(this.totalPages - 2, this.maxVisiblePages - 2);
    }
    
    if (this.currentPage >= this.totalPages - halfVisible - 1) {
      startPage = Math.max(1, this.totalPages - this.maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      visiblePages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    
    if (endPage < this.totalPages - 2) {
      visiblePages.push('...');
    }
    
    if (this.totalPages > 1) {
      visiblePages.push(this.totalPages - 1);
    }
    
    return visiblePages;
  }

  isCurrentPage(page: number | string): boolean {
    return typeof page === 'number' && page === this.currentPage;
  }

  isClickablePage(page: number | string): boolean {
    return typeof page === 'number';
  }
  
  getPageNumber(page: number | string): number {
    return typeof page === 'number' ? page + 1 : 0;
  }

  // Page size options
  getPageSizeOptions(): { value: number; label: string }[] {
    return [
      { value: 10, label: '10' },
      { value: 20, label: '20' },
      { value: 30, label: '30' },
      { value: 50, label: '50' },
      { value: -1, label: 'All' }
    ];
  }
}