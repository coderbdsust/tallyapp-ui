import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { Organization } from 'src/app/core/models/organization.model';
import { ProductCategory } from 'src/app/core/models/product.model';
import { ProductCategoryService } from 'src/app/core/services/product-category.service';

@Component({
  selector: 'app-product-category-form',
  imports: [MatDialogModule, ReactiveFormsModule, NgIf],
  templateUrl: './product-category-form.component.html',
  styleUrl: './product-category-form.component.scss'
})
export class ProductCategoryFormComponent {

  form: FormGroup;
  submitted = false;
  loading = false;
  organization: Organization;

  constructor(
    public dialogRef: MatDialogRef<ProductCategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { organization: Organization },
    private fb: FormBuilder,
    private pcService: ProductCategoryService
  ) {
    this.organization = data.organization;
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(70)]],
      description: ['', [Validators.maxLength(200)]]
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    const category: ProductCategory = {
      id: null,
      name: this.form.value.name.trim(),
      description: this.form.value.description?.trim() || '',
      active: true
    };

    this.pcService
      .addProductCategoryByOrganization(this.organization.id, category)
      .subscribe({
        next: (response) => {
          this.pcService.showToastSuccess('Product category added successfully');
          this.loading = false;
          this.dialogRef.close(response);
        },
        error: (errRes) => {
          this.pcService.showToastErrorResponse(errRes);
          this.loading = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
