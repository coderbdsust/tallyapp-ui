import { PageResponse } from "../../models/page-response";

export class PaginatedComponent<T> {
  pageResponse: PageResponse<T> | null = null;
  selectedRows: number = 10;
  totalRows: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pagesArray: number[] = [];
  maxVisiblePages: number = 5; // Maximum number of page buttons to show

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

  updatePagesArray() {
    this.pagesArray = Array.from({ length: this.totalPages }, (_, index) => index);
  }

  getPagesArray(): number[] {
    return this.pagesArray;
  }

  // New method for smart pagination
  getVisiblePages(): (number | string)[] {
    if (this.totalPages <= this.maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      return Array.from({ length: this.totalPages }, (_, index) => index);
    }

    const visiblePages: (number | string)[] = [];
    const halfVisible = Math.floor(this.maxVisiblePages / 2);
    
    // Always show first page
    visiblePages.push(0);
    
    let startPage = Math.max(1, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages - 2, this.currentPage + halfVisible);
    
    // Adjust if we're near the beginning
    if (this.currentPage <= halfVisible) {
      endPage = Math.min(this.totalPages - 2, this.maxVisiblePages - 2);
    }
    
    // Adjust if we're near the end
    if (this.currentPage >= this.totalPages - halfVisible - 1) {
      startPage = Math.max(1, this.totalPages - this.maxVisiblePages + 1);
    }
    
    // Add ellipsis before middle pages if needed
    if (startPage > 1) {
      visiblePages.push('...');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    
    // Add ellipsis after middle pages if needed
    if (endPage < this.totalPages - 2) {
      visiblePages.push('...');
    }
    
    // Always show last page (if there are more than 1 pages)
    if (this.totalPages > 1) {
      visiblePages.push(this.totalPages - 1);
    }
    
    return visiblePages;
  }

  // Method to check if a page item is current
  isCurrentPage(page: number | string): boolean {
    return typeof page === 'number' && page === this.currentPage;
  }

  // Method to check if a page item is clickable
  isClickablePage(page: number | string): boolean {
    return typeof page === 'number';
  }
  
  getPageNumber(page: number | string): number {
    return typeof page === 'number' ? page + 1 : 0;
  }
}