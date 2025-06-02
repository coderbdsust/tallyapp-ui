import { Component } from '@angular/core';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { Invoice } from '../invoice.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { _ } from '@angular/cdk/number-property.d-ce316715';

@Component({
  selector: 'app-invoice-list',
  imports: [AngularSvgIconModule, CommonModule],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent extends PaginatedComponent<Invoice>{

  constructor(private _router: Router) {
    super();
  }

  
  search: string = '';
  loading: boolean = false;
  submitted = false;

   onSearchChange(event: Event) {
    // const input = (event.target as HTMLInputElement).value;
    // this.search = input;
    // this.loadOrganizationByPage(0, this.selectedRows, this.search);
    // this.orgService.showToastInfo('Search functionality is not implemented yet.');
  }

  onSelectChange(event: Event) {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedRows = rows === -1 ? this.totalRows || 0 : rows;
    // this.loadOrganizationByPage(0, this.selectedRows, this.search);
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
    // this.loadOrganizationByPage(this.currentPage, this.selectedRows, this.search);
  }

  viewInvoice(invoice: Invoice) {
    // Implement the logic to view the invoice details
    console.log('Viewing invoice:', invoice);
  }

  editInvoice(invoice: Invoice) {
    // Implement the logic to edit the invoice
    console.log('Editing invoice:', invoice);
  }
  
  deleteInvoice(invoice: Invoice) {
    // Implement the logic to delete the invoice
    console.log('Deleting invoice:', invoice);
  }

  createInvoice() {
    // Implement the logic to create a new invoice
    console.log('Creating a new invoice');
    this._router.navigate(['/invoice/add']);

  }




}
