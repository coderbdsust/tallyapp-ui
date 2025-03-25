import { PageResponse } from '../../models/page-response';

export class PaginatedComponent<T> {
  pageResponse: PageResponse<T> | null = null;
  selectedRows: number = 10;
  totalRows: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pagesArray: number[] = [];

  updateInPage(updatedItem: T, idKey: keyof T) {
    console.log('updateInPage', updatedItem, idKey);
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
    console.log('removeFromPage', itemId, idKey);
    if (!this.pageResponse) return;

    const updatedContent = this.pageResponse.content.filter((item) => item[idKey] !== itemId);

    this.recalculatePage(updatedContent);
  }

  private recalculatePage(updatedContent: T[]) {
    console.log('recalculatePage');
    if (!this.pageResponse) return;

    this.totalRows = updatedContent.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageResponse.size)); // At least 1 page

    // Ensure currentPage is within bounds
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
}
