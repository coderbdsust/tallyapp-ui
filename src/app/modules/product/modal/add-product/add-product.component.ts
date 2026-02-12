import { CommonModule, NgClass } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { Product, ProductCategory, ProductStock, UnitType } from '../../../../core/models/product.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ProductService } from '../../../../core/services/product.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { FileUploaderComponent } from '../../../../common/components/file-uploader/file-uploader.component';
import { catchError, of, tap, throwError } from 'rxjs';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { generateRandomLuhnCode } from 'src/app/common/utils/LuhnCode';
import { Employee } from '../../../../core/models/employee.model';
import { ProductCategoryService } from '../../../../core/services/product-category.service';

@Component({
  selector: 'app-add-product',
  imports: [
    NgClass,
    ButtonComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgSelectComponent,
    FileUploaderComponent,
    AngularSvgIconModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent {
  form!: FormGroup;
  submitted = false;
  isModalOpen = false;
  @Input() orgId: string | null = null;
  allEmployees: any = [];
  allProductCategories: ProductCategory[] = [];
  isEdit = false;
  @Output() modifiedEmitter = new EventEmitter<Boolean>();
  selectedFile: File | null = null;
  @ViewChild(FileUploaderComponent) fileUploader!: FileUploaderComponent;
  fileDeletedNeedToSubmit: boolean = false;
  unitTypes: UnitType[] = [];

  constructor(
    private readonly _formBuilder: FormBuilder,
    private productService: ProductService,
    private employeeService: EmployeeService,
    private fileUploaderService: FileUploaderService,
    private productCategoryService:ProductCategoryService
  ) {}

  ngOnInit(): void {
    this.loadProductUnitTypes();
    this.initializeForm();
  }

  loadProductUnitTypes(){
    this.productService.getProductUnitTypes().subscribe({
      next: (unitTypes) => {
        this.unitTypes = unitTypes;
      },
      error: (errorRes) => {
        this.productService.showToastErrorResponse(errorRes);
      },
    });
  }

  loadProductCategories(orgId:string|null){
    if(orgId){
        this.productCategoryService.getProductCagegoriesByOrganization(orgId).subscribe({
          next:(categories)=>{
            console.log(categories);
            this.allProductCategories = categories;
          },error:(errorRes)=>{
            this.productCategoryService.showToastErrorResponse(errorRes);
          }
        });
    }
  }

  onSearchEmployeeKeyType(event: Event) {
    const searchKey = (event.target as HTMLSelectElement).value;
    if (!searchKey || searchKey.length < 3) {
      this.productService.showToastInfo('Please type atleast five (3) characters');
      return;
    }

    this.employeeService.getEmployeesByOrganization(this.orgId!, 0, 10, searchKey).subscribe({
      next: (response) => {
        this.allEmployees = response.content.map((employee) => ({
          ...employee,
          id: employee.id,
          fullName: `${employee.fullName} - ${employee.employeeType} - ${employee.mobileNo}`,
        }));
      },
    });
  }

  onSelectEmployee(employee: Employee) {
    console.log(employee);

    if (!employee) {
      return;
    }

    if (employee.employeeBillingType.includes('DAILY')) {
      let stockArray = this.form.get('productStockList') as FormArray;
      stockArray.controls.forEach((control) => {
        control.get('perUnitEmployeeCost')?.setValue(employee.billingRate);
        control.get('perUnitProductionCost')?.setValue(0);
        control.get('unitPrice')?.setValue(employee.billingRate*1.5);
      });
    }
  }

  private initializeForm(product: Product | null = null) {
    if (product && product.imageUrl) {
      this.fileUploader.setFile(product.imageUrl);
    } else {
      if (this.fileUploader) {
        this.fileUploader.clearFile();
      }
    }

    let stockArray = this._formBuilder.array([]) as FormArray;

    if (product && product?.productStockList) {
      stockArray = this.setProductStockList(product.productStockList);
    } else {
      stockArray.push(this.createProductStockForm());
    }

    this.form = this._formBuilder.group({
      id: [product?.id],
      name: [product?.name, [Validators.required]],
      code: [product?.code, [Validators.required]],
      unitType:[product?.unitType,[Validators.required]],
      description: [product?.description],
      imageUrl: [product?.imageUrl],
      madeBy: [product?.madeBy || null, [Validators.required]],
      categoryId:[product?.productCategory?.id, [Validators.required]],
      productStockList: stockArray,
    });
  }

  addNewCategory(categoryName: string): Promise<ProductCategory> {
  const category: ProductCategory = {
    id:null,
    name: categoryName,
    description: categoryName,
    active: true
  };

  return new Promise((resolve, reject) => {
    if (!this.orgId) {
      this.productCategoryService.showToastError('Organization ID is missing.');
      return reject('Organization ID is missing.');
    }

    this.productCategoryService.addProductCategoryByOrganization(this.orgId, category).subscribe({
      next: (savedCategory) => {
        this.allProductCategories.push(savedCategory);
        resolve(savedCategory);
      },
      error: (error) => {
        this.productCategoryService.showToastErrorResponse(error);
        reject(error);
      }
    });
  });
}



  createProductStockForm() {
    return this._formBuilder.group({
      id: [''],
      batchNumber: [''],
      manufactureDate: [''],
      expiryDate: [''],
      initialQuantity: [0],
      availableQuantity: [0],
      quantityToAdd: [1, Validators.required],
      unitPrice: [1, [Validators.required,Validators.min(1)]],
      discountPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      perUnitProductionCost: [0, Validators.required],
      perUnitEmployeeCost: [0, Validators.required],
    });
  }

  get getProductStockList(): FormArray {
    return this.form.get('productStockList') as FormArray;
  }

  setProductStockList(stockList: ProductStock[]): FormArray {
    let stockArray = this.form.get('productStockList') as FormArray;
    stockArray.clear();
    stockList.forEach((stock) => {
      stockArray.push(
        this._formBuilder.group({
          id: [stock.id],
          batchNumber: [stock.batchNumber],
          manufactureDate: [stock.manufactureDate],
          expiryDate: [stock.expiryDate],
          initialQuantity: [stock.initialQuantity],
          availableQuantity: [stock.availableQuantity],
          quantityToAdd: [0, Validators.required],
          unitPrice: [stock.unitPrice || 1, [Validators.required,Validators.min(1)]],
          discountPercent: [stock.discountPercent, [Validators.required, Validators.min(0), Validators.max(100)]],
          perUnitProductionCost: [stock.perUnitProductionCost, Validators.required],
          perUnitEmployeeCost: [stock.perUnitEmployeeCost, Validators.required],
        }),
      );
    });
    return stockArray;
  }

  compareEmployee(emp1: any, emp2: any): boolean {
    return emp1 && emp2 ? emp1.id === emp2.id : emp1 === emp2;
  }

  openModal(product: Product | null = null, orgId: string | null = null) {
    this.isEdit = !!product;
    this.orgId = orgId;
    this.initializeForm(product);
    this.loadProductCategories(orgId);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.fileDeletedNeedToSubmit) {
      this.onSubmit();
    }
  }

  get f() {
    return this.form.controls;
  }

  onProductImageSelect(file: File | null) {
    this.selectedFile = file;
    if (!file) {
      this.form.patchValue({ imageUrl: null });
    }
  }

  generateProductCode() {
    if (!this.isEdit) {
      let code = generateRandomLuhnCode(6);
      this.form.patchValue({ code: code });
    }
  }

  onFileRemoved() {
    this.fileDeletedNeedToSubmit = true;
  }

  addStock() {
    const stockArray = this.form.get('productStockList') as FormArray;
    stockArray.push(this.createProductStockForm());
  }

  removeStock(index: number) {
    const stockArray = this.form.get('productStockList') as FormArray;
    stockArray.removeAt(index);
  }

  onSubmit() {
    this.submitted = true;
    this.fileDeletedNeedToSubmit = false;

    if (this.form.invalid) {
      return;
    }

    let product = this.form.value;
    console.log(product);

    this.submitted = false;

    let uploadObservable = of(null); // Default observable if no file is selected

    if (this.selectedFile) {
      uploadObservable = this.fileUploaderService.uploadFile(this.selectedFile).pipe(
        tap((response: any) => {
          product.imageUrl = response.fileURL;
        }),
        catchError((error) => {
          this.fileUploaderService.showToastErrorResponse(error);
          return throwError(() => error);
        }),
      );
    }

    uploadObservable.subscribe({
      next: () => {
        if (this.isEdit) {
          if (product.madeBy.id) product.madeBy = product.madeBy.id;

          this.productService.editProduct(product.id, product).subscribe({
            next: () => {
              this.productService.showToastSuccess('Product updated successfully');
              this.closeModal();
              this.modifiedEmitter.emit(true);
            },
            error: (error) => {
              this.productService.showToastErrorResponse(error);
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
            error: (error) => {
              this.productService.showToastErrorResponse(error);
              this.closeModal();
            },
          });
        }
      },
    });
  }
}
