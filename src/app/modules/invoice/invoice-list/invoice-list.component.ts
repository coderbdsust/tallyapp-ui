import { Component } from '@angular/core';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { Invoice } from '../invoice.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { _ } from '@angular/cdk/number-property.d-ce316715';
import { InvoiceService } from '../service/invoice.service';
import { OrganizationService } from '../../organization/service/organization.service';
import { Organization } from '../../organization/service/model/organization.model';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { WordPipe } from 'src/app/common/pipes/word.pipe';

@Component({
  selector: 'app-invoice-list',
  imports: [AngularSvgIconModule, CommonModule, WordPipe],
  
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent extends PaginatedComponent<Invoice>{

  constructor(
            private _router: Router,
            private invoiceService: InvoiceService,
            private orgService: OrganizationService,
            public dialog: MatDialog) {
    super();
  }

  
  search: string = '';
  searchCriteria:string='';
  loading: boolean = false;
  submitted = false;
  organization!:Organization;

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if(org) {
        this.organization = org;
        this.loadInvoices(org.id, this.currentPage, this.selectedRows, this.search, this.searchCriteria);
      }
    });
  }

   onSearchChange(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.loadInvoices(this.organization.id, 0, this.selectedRows, this.search);
  }

  onSelectChange(event: Event) {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedRows = rows === -1 ? this.totalRows || 0 : rows;
     this.loadInvoices(this.organization.id, 0, this.selectedRows, this.search);
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
     this.loadInvoices(this.organization.id, this.currentPage, this.selectedRows, this.search);
  }

  viewInvoice(invoice: Invoice) {
    // Implement the logic to view the invoice details
    console.log('Viewing invoice:', invoice);
    this._router.navigate(['/invoice/detail'], { queryParams: { orgId: this.organization.id, invoiceId: invoice.id } });
  }

  editInvoice(invoice: Invoice) {
    // Implement the logic to edit the invoice
    console.log('Editing invoice:', invoice);
    // this._router.navigate(['/invoice/add']);
    this._router.navigate(['/invoice/add'], { queryParams: { orgId: this.organization.id, invoiceId: invoice.id } });


  }
  
  deleteInvoice(invoice: Invoice) {
    // Implement the logic to delete the invoice
    console.log('Deleting invoice:', invoice);
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
          width: '350px',
          data: { message: `Are you sure you want to delete ${invoice.invoiceNumber}  ${invoice.customer?.name||''}?` },
        });
    
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.invoiceService.deleteInvoice(invoice.id).subscribe({
              next: (response) => {
                console.log(response);
                this.invoiceService.showToastSuccess('Invoice deleted successfully');
                 this.loadInvoices(this.organization.id, this.currentPage, this.selectedRows, this.search, this.searchCriteria);
              },
              error: (errRes) => {
                this.invoiceService.showToastErrorResponse(errRes);
              },
            });
          }
        });
  }

  createInvoice() {
    // Implement the logic to create a new invoice
    console.log('Creating a new invoice');
    this._router.navigate(['/invoice/add']);
    this.invoiceService.createInvoice(this.organization.id).subscribe({
      next:(invoice)=>{
        this._router.navigate(['/invoice/add'], { queryParams: { orgId: this.organization.id, invoiceId: invoice.id } });
      },
      error:(err)=>{
        this.invoiceService.showToastErrorResponse(err);
      }
    });
  }

  loadInvoices(orgId: string, page: number, size: number, search: string, searchCriteria: string = '') {
    this.loading = true;
    this.invoiceService.getInvoiceByOrganization(orgId, this.currentPage, this.selectedRows, this.search, this.searchCriteria).subscribe({
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
        this.invoiceService.showToastErrorResponse(error);
      },
    });
  }

  downloadInvoice(invoice:Invoice){
      console.log(invoice);
      this.invoiceService.downloadInvoice(this.organization.id, invoice.id).subscribe({
      next: (pdfRes: Blob) => {
        const blob = new Blob([pdfRes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber || invoice.id}.pdf`;
        a.click();

        window.URL.revokeObjectURL(url); // clean up the blob URL
      },
      error: (err) => {
        this.invoiceService.showToastErrorResponse(err);
      }
    });
  }

}
