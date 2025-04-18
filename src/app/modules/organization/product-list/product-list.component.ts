import { Component, ViewChild } from '@angular/core';
import { Product } from '../service/model/product.model';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { ProductService } from '../service/product.service';
import { OrganizationService } from '../service/organization.service';
import { Organization } from '../service/model/organization.model';
import { MatDialog } from '@angular/material/dialog';
import { AddProductComponent } from '../modal/add-product/add-product.component';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-product-list',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, AddProductComponent, NgIf],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent extends PaginatedComponent<Product> {
  @ViewChild('addProductModal', { static: false }) addProductModal!: AddProductComponent;
  search: string = '';
  searchCriteria: string = '';
  loading: boolean = false;
  submitted = false;
  errorMessage = '';
  organization!: Organization;

  constructor(
    private productService: ProductService,
    private orgService: OrganizationService,
    public dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if(org) {
        this.organization = org;
        this.loadProducts(org.id, this.currentPage, this.selectedRows, this.search, this.searchCriteria);
      }
    });
  }
  
  loadProducts(orgId: string, page: number, size: number, search: string, searchCriteria: string = '') {
    this.loading = true;
    this.productService.getProductByOrganization(orgId, this.currentPage, this.selectedRows, this.search, this.searchCriteria).subscribe({
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
        this.productService.showToastErrorResponse(error);
      },
    });
  }

  editProduct(selectedProduct: Product) {
    this.addProductModal.openModal(selectedProduct, this.organization.id);
  }

  deleteProduct(selectedProduct: Product) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete ${selectedProduct.name}?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productService.deleteProduct(selectedProduct.id).subscribe({
          next: (response) => {
            this.removeFromPage(selectedProduct.id, 'id');
            this.productService.showToastSuccess(response.message);
          },
          error: (errRes) => {
            this.productService.showToastErrorResponse(errRes);
          },
        });
      }
    });
  }

  addProduct() {
    this.addProductModal.openModal(null, this.organization.id);
  }

  onSearchChange(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    
    if(this.searchCriteria === '' && this.search !== '') {
      this.productService.showToastError('Please select a search criteria');
      return;
    }

    this.loadProducts(this.organization.id, 0, this.selectedRows, this.search, this.searchCriteria);
  }

  onSelectChange(event: Event) {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedRows = rows === -1 ? this.totalRows || 0 : rows;
    this.loadProducts(this.organization.id, 0, this.selectedRows, this.search, this.searchCriteria);
  }

  onSearchCriteria(event:Event){
    const input = (event.target as HTMLInputElement).value;
    this.searchCriteria = input;
    console.log(this.searchCriteria);
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

  updatePagination() {
    this.loadProducts(this.organization.id, this.currentPage, this.selectedRows, this.search, this.searchCriteria);
  }

  productListRefresh(status: Boolean) {
    if (status) {
      this.loadProducts(this.organization.id, this.currentPage, this.selectedRows, this.search, this.searchCriteria);
    }
  }
}
