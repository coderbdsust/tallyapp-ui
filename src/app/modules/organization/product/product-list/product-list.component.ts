import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';
import { AddProductComponent } from '../../modal/add-product/add-product.component';
import { Organization } from '../../../../core/models/organization.model';
import { ProductService } from '../../../../core/services/product.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { MatDialog } from '@angular/material/dialog';
import { Product } from '../../../../core/models/product.model';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';

@Component({
  selector: 'app-product-list',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, AddProductComponent, NgIf],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent extends PaginatedComponent<Product> implements OnInit, OnDestroy {
  @ViewChild('addProductModal', { static: false }) addProductModal!: AddProductComponent;
  
  search: string = '';
  searchCriteria: string = '';
  loading: boolean = false;
  submitted = false;
  errorMessage = '';
  organization!: Organization;
  formatCurrency = formatCurrency;

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private orgService: OrganizationService,
    public dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToOrganization();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Abstract method implementation
  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.productService
      .getProductByOrganization(
        this.organization.id,
        this.currentPage,
        this.selectedRows,
        this.search,
        this.searchCriteria
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.productService.showToastErrorResponse(error);
        },
      });
  }

  private subscribeToOrganization(): void {
    this.orgService.organization$
      .pipe(takeUntil(this.destroy$))
      .subscribe((org) => {
        if (org) {
          this.organization = org;
          this.loadData();
        }
      });
  }

  // Event handlers
  onSearchChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;

    if (this.searchCriteria === '' && this.search !== '') {
      this.productService.showToastError('Please select a search criteria');
      return;
    }

    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  onSearchCriteriaChange(event: Event): void {
    const input = (event.target as HTMLSelectElement).value;
    this.searchCriteria = input;
    
    // If search criteria is cleared and there's a search term, clear the search
    if (this.searchCriteria === '' && this.search !== '') {
      this.search = '';
    }
    
    this.onFilterChange();
  }

  // Product actions
  editProduct(selectedProduct: Product): void {
    this.addProductModal.openModal(selectedProduct, this.organization.id);
  }

  deleteProduct(selectedProduct: Product): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete ${selectedProduct.name}?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productService
          .deleteProduct(selectedProduct.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
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

  addProduct(): void {
    this.addProductModal.openModal(null, this.organization.id);
  }

  productListRefresh(status: Boolean): void {
    if (status) {
      this.loadData();
    }
  }

  // Utility methods
  getSearchCriteriaOptions(): { value: string; label: string }[] {
    return [
      { value: '', label: 'Search Criteria' },
      { value: 'name', label: 'Product Name' },
      { value: 'code', label: 'Product Code' },
      { value: 'madeBy', label: 'Made By' }
    ];
  }

  isSearchDisabled(): boolean {
    return this.searchCriteria === '';
  }

  getSearchPlaceholder(): string {
    if (this.searchCriteria === '') {
      return 'Select search criteria first';
    }
    
    const criteriaMap: { [key: string]: string } = {
      'name': 'Search by product name...',
      'code': 'Search by product code...',
      'madeBy': 'Search by maker...'
    };
    
    return criteriaMap[this.searchCriteria] || 'Search...';
  }
}