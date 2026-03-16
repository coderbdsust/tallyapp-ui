import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';
import { Organization } from 'src/app/core/models/organization.model';
import { ProductCategory } from 'src/app/core/models/product.model';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { ProductCategoryService } from 'src/app/core/services/product-category.service';
import { ProductCategoryFormComponent } from '../../modal/product-category-form/product-category-form.component';

@Component({
  selector: 'app-product-category-list',
  imports: [AngularSvgIconModule, NgIf, NgFor],
  templateUrl: './product-category-list.component.html',
  styleUrl: './product-category-list.component.scss'
})
export class ProductCategoryListComponent {
    
    search: string = '';
    searchCriteria: string = '';
    loading: boolean = false;
    submitted = false;
    errorMessage = '';
    organization!: Organization;
    productCategories: ProductCategory[] = [];
  
    private destroy$ = new Subject<void>();
  
    constructor(
      readonly pcService: ProductCategoryService,
      private orgService: OrganizationService,
      public dialog: MatDialog,
    ) {
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
      this.pcService
        .getProductCagegoriesByOrganization(
          this.organization.id,
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.productCategories = response;
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
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
  
    deleteProductCategory(selectedProductCategory: ProductCategory): void {
      const dialogRef = this.dialog.open(ConfirmationModalComponent, {
        width: '350px',
        data: { message: `Are you sure you want to delete ${selectedProductCategory.name}?` },
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.pcService
            .deleteProductCategoryByOrganization(this.organization.id, selectedProductCategory.id || '')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                this.pcService.showToastSuccess(response.message);
                this.loadData();
              },
              error: (errRes) => {
                this.pcService.showToastErrorResponse(errRes);
              },
            });
        }
      });
    }

    addProductCategory(): void {
      const dialogRef = this.dialog.open(ProductCategoryFormComponent, {
        width: '400px',
        data: { organization: this.organization },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadData();
        }
      });
    }

}
