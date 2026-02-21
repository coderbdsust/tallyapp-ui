import { CommonModule, NgClass } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { Product, ProductCategory, ProductStock, UnitType } from '../../../../core/models/product.model';
import { FileUploadResponse } from '../../../../core/models/file-upload-response.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ProductService } from '../../../../core/services/product.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { catchError, forkJoin, Observable, of, throwError } from 'rxjs';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { generateRandomLuhnCode } from 'src/app/common/utils/LuhnCode';
import { Employee } from '../../../../core/models/employee.model';
import { ProductCategoryService } from '../../../../core/services/product-category.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';

/** Local UI representation of one image slot */
export interface ImageItem {
  /** Unique UI key */
  id: string;
  /** Object URL (new file) or remote fileURL (existing) */
  previewUrl: string;
  /** The pending File to upload — null for already-uploaded photos */
  file: File | null;
  /** Full response from the server once uploaded (null until uploaded) */
  uploadedPhoto: FileUploadResponse | null;
}

@Component({
  selector: 'app-add-product',
  imports: [
    NgClass,
    ButtonComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgSelectComponent,
    AngularSvgIconModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent extends FormError implements OnDestroy {
  form!: FormGroup;
  submitted = false;
  isModalOpen = false;

  @Input() orgId: string | null = null;
  @Output() modifiedEmitter = new EventEmitter<boolean>();

  allEmployees: any[] = [];
  allProductCategories: ProductCategory[] = [];
  isEdit = false;
  unitTypes: UnitType[] = [];

  // ── Multi-image state ─────────────────────────────────────
  readonly MAX_IMAGES = 4;
  images: ImageItem[] = [];
  isUploading = false;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private productService: ProductService,
    private employeeService: EmployeeService,
    private fileUploaderService: FileUploaderService,
    private productCategoryService: ProductCategoryService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadProductUnitTypes();
    this.initializeForm();
  }

  ngOnDestroy(): void {
    // Revoke blob URLs for pending (not-yet-uploaded) files
    this.images
      .filter((img) => img.file !== null)
      .forEach((img) => URL.revokeObjectURL(img.previewUrl));
  }

  // ── Loaders ───────────────────────────────────────────────

  loadProductUnitTypes(): void {
    this.productService.getProductUnitTypes().subscribe({
      next: (unitTypes) => (this.unitTypes = unitTypes),
      error: (err) => this.productService.showToastErrorResponse(err),
    });
  }

  loadProductCategories(orgId: string | null): void {
    if (!orgId) return;
    this.productCategoryService.getProductCagegoriesByOrganization(orgId).subscribe({
      next: (categories) => (this.allProductCategories = categories),
      error: (err) => this.productCategoryService.showToastErrorResponse(err),
    });
  }

  // ── Employee ──────────────────────────────────────────────

  onSearchEmployeeKeyType(event: Event): void {
    const searchKey = (event.target as HTMLSelectElement).value;
    if (!searchKey || searchKey.length < 3) {
      this.productService.showToastInfo('Please type at least 3 characters');
      return;
    }
    this.employeeService.getEmployeesByOrganization(this.orgId!, 0, 10, searchKey).subscribe({
      next: (response) => {
        this.allEmployees = response.content.map((employee: any) => ({
          ...employee,
          fullName: `${employee.fullName} - ${employee.employeeType} - ${employee.mobileNo}`,
        }));
      },
    });
  }

  onSelectEmployee(employee: Employee): void {
    if (!employee) return;
    if (employee.employeeBillingType.includes('DAILY')) {
      const stockArray = this.form.get('productStockList') as FormArray;
      stockArray.controls.forEach((ctrl) => {
        ctrl.get('perUnitEmployeeCost')?.setValue(employee.billingRate);
        ctrl.get('perUnitProductionCost')?.setValue(0);
        ctrl.get('unitPrice')?.setValue(employee.billingRate * 1.5);
      });
    }
  }

  compareEmployee(emp1: any, emp2: any): boolean {
    return emp1 && emp2 ? emp1.id === emp2.id : emp1 === emp2;
  }

  // ── Form init ─────────────────────────────────────────────

  private initializeForm(product: Product | null = null): void {
    // Revoke any pending blob URLs from a previous open
    this.images.filter((img) => img.file !== null).forEach((img) => URL.revokeObjectURL(img.previewUrl));

    // Seed image list from product.photos (the real model field)
    this.images = (product?.photos ?? []).map((photo) => ({
      id: crypto.randomUUID(),
      previewUrl: photo.url,
      file: null,
      uploadedPhoto: photo,
    }));

    let stockArray = this._formBuilder.array([]) as FormArray;
    if (product?.productStockList?.length) {
      stockArray = this.setProductStockList(product.productStockList);
    } else {
      stockArray.push(this.createProductStockForm());
    }

    this.form = this._formBuilder.group({
      id: [product?.id ?? null],
      name: [product?.name ?? '', [Validators.required, Validators.maxLength(70)]],
      code: [product?.code ?? '', [Validators.required]],
      unitType: [product?.unitType ?? null, [Validators.required]],
      description: [product?.description ?? ''],
      madeBy: [product?.madeBy ?? null, [Validators.required]],
      categoryId: [product?.productCategory?.id ?? null, [Validators.required]],
      productStockList: stockArray,
    });
  }

  addNewCategory(categoryName: string): Promise<ProductCategory> {
    const category: ProductCategory = { id: null, name: categoryName, description: categoryName, active: true };
    return new Promise((resolve, reject) => {
      if (!this.orgId) {
        this.productCategoryService.showToastError('Organization ID is missing.');
        return reject('Organization ID is missing.');
      }
      this.productCategoryService.addProductCategoryByOrganization(this.orgId, category).subscribe({
        next: (saved) => { this.allProductCategories.push(saved); resolve(saved); },
        error: (err) => { this.productCategoryService.showToastErrorResponse(err); reject(err); },
      });
    });
  }

  // ── Stock ─────────────────────────────────────────────────

  createProductStockForm(): FormGroup {
    return this._formBuilder.group({
      id: [''],
      batchNumber: [''],
      manufactureDate: [''],
      expiryDate: [''],
      initialQuantity: [0],
      availableQuantity: [0],
      quantityToAdd: [1, Validators.required],
      unitPrice: [1, [Validators.required, Validators.min(1)]],
      discountPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      perUnitProductionCost: [0, Validators.required],
      perUnitEmployeeCost: [0, Validators.required],
    });
  }

  get getProductStockList(): FormArray {
    return this.form.get('productStockList') as FormArray;
  }

  setProductStockList(stockList: ProductStock[]): FormArray {
    const arr = this._formBuilder.array([]) as FormArray;
    stockList.forEach((stock) => {
      arr.push(this._formBuilder.group({
        id: [stock.id],
        batchNumber: [stock.batchNumber],
        manufactureDate: [stock.manufactureDate],
        expiryDate: [stock.expiryDate],
        initialQuantity: [stock.initialQuantity],
        availableQuantity: [stock.availableQuantity],
        quantityToAdd: [0, Validators.required],
        unitPrice: [stock.unitPrice || 1, [Validators.required, Validators.min(1)]],
        discountPercent: [stock.discountPercent, [Validators.required, Validators.min(0), Validators.max(100)]],
        perUnitProductionCost: [stock.perUnitProductionCost, Validators.required],
        perUnitEmployeeCost: [stock.perUnitEmployeeCost, Validators.required],
      }));
    });
    return arr;
  }

  addStock(): void {
    this.getProductStockList.push(this.createProductStockForm());
  }

  removeStock(index: number): void {
    this.getProductStockList.removeAt(index);
  }

  // ── Modal ─────────────────────────────────────────────────

  openModal(product: Product | null = null, orgId: string | null = null): void {
    this.isEdit = !!product;
    this.orgId = orgId;
    this.initializeForm(product);
    this.loadProductCategories(orgId);
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  get f() {
    return this.form.controls;
  }

  generateProductCode(): void {
    if (!this.isEdit) {
      this.form.patchValue({ code: generateRandomLuhnCode(6) });
    }
  }

  // ── Multi-image ───────────────────────────────────────────

  get canAddImage(): boolean {
    return this.images.length < this.MAX_IMAGES;
  }

  triggerFileInput(input: HTMLInputElement): void {
    if (this.canAddImage) input.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const remaining = this.MAX_IMAGES - this.images.length;
    const newItems: ImageItem[] = Array.from(input.files)
      .slice(0, remaining)
      .map((file) => ({
        id: crypto.randomUUID(),
        previewUrl: URL.createObjectURL(file),
        file,
        uploadedPhoto: null,
      }));

    this.images = [...this.images, ...newItems];
    input.value = '';
  }

  removeImage(id: string): void {
    const img = this.images.find((i) => i.id === id);
    // Revoke blob URL only for pending (not-yet-uploaded) files
    if (img?.file) URL.revokeObjectURL(img.previewUrl);
    this.images = this.images.filter((i) => i.id !== id);
  }

  // ── Submit ────────────────────────────────────────────────

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.submitted = false;
    this.isUploading = true;

    const pendingImages = this.images.filter((img) => img.file !== null);
    const alreadyUploadedPhotos: FileUploadResponse[] = this.images
      .filter((img) => img.uploadedPhoto !== null)
      .map((img) => img.uploadedPhoto!);

    // Upload all pending files in parallel using storeFile()
    const uploadObservables: Observable<FileUploadResponse | null>[] = pendingImages.length
      ? pendingImages.map((img) =>
          this.fileUploaderService.storeFile(img.file!).pipe(
            catchError((err) => {
              this.fileUploaderService.showToastErrorResponse(err);
              return throwError(() => err);
            }),
          ),
        )
      : [of<FileUploadResponse | null>(null)];

    forkJoin(uploadObservables).subscribe({
      next: (responses: (FileUploadResponse | null)[]) => {
        this.isUploading = false;

        // Merge already-uploaded photos with newly uploaded ones
        const newPhotos = responses.filter((r): r is FileUploadResponse => r !== null);
        const allPhotos: FileUploadResponse[] = [...alreadyUploadedPhotos, ...newPhotos];

        const product = {
          ...this.form.value,
          photos: allPhotos,
        };

        if (this.isEdit) {
          if (product.madeBy?.id) product.madeBy = product.madeBy.id;
          this.productService.editProduct(product.id, product).subscribe({
            next: () => {
              this.productService.showToastSuccess('Product updated successfully');
              this.closeModal();
              this.modifiedEmitter.emit(true);
            },
            error: (err) => {
              this.productService.showToastErrorResponse(err);
              this.closeModal();
            },
          });
        } else {
          this.productService.addProduct(product.madeBy, product).subscribe({
            next: () => {
              this.productService.showToastSuccess('Product added successfully');
              this.closeModal();
              this.modifiedEmitter.emit(true);
            },
            error: (err) => {
              this.productService.showToastErrorResponse(err);
              this.closeModal();
            },
          });
        }
      },
      error: () => {
        this.isUploading = false;
      },
    });
  }
}