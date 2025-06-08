import { CommonModule, NgClass } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { Product } from '../../service/model/product.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ProductService } from '../../service/product.service';
import { EmployeeService } from '../../service/employee.service';
import { FileUploaderComponent } from '../../../../common/components/file-uploader/file-uploader.component';
import { catchError, of, tap, throwError } from 'rxjs';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { generateRandomLuhnCode } from 'src/app/common/utils/LuhnCode';

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
    AngularSvgIconModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent {
  form!: FormGroup;
  submitted = false;
  isModalOpen = false;
  orgId: string | null = null;
  allEmployees: any = [];
  isEdit = false;
  @Output() modifiedEmitter = new EventEmitter<Boolean>();
  selectedFile: File | null = null;
  @ViewChild(FileUploaderComponent) fileUploader!: FileUploaderComponent;
  fileDeletedNeedToSubmit:boolean=false;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private productService: ProductService,
    private employeeService: EmployeeService,
    private fileUploaderService: FileUploaderService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  onSearchKeyType(event: Event) {
    const searchKey = (event.target as HTMLSelectElement).value;
    if (searchKey && searchKey.length < 5) {
      this.productService.showToastInfo('Please type atleast five (5) characters');
      return;
    }

    this.employeeService.getEmployeesByOrganization(this.orgId!, 0, 10, searchKey).subscribe({
      next: (response) => {
        this.allEmployees = response.content.map((employee) => ({
          id: employee.id,
          fullName: `${employee.fullName}`,
        }));
      },
    });
  }

  private initializeForm(product: Product | null = null) {
    if (product && product.imageUrl) {
      this.fileUploader.setFile(product.imageUrl);
    } else {
      if (this.fileUploader) {
        this.fileUploader.clearFile();
      }
    }

    this.form = this._formBuilder.group({
      id: [product?.id],
      name: [product?.name, [Validators.required]],
      code: [product?.code, [Validators.required]],
      description: [product?.description],
      perUnitEmployeeCost: [product?.perUnitEmployeeCost, [Validators.required]],
      perUnitProductionCost: [product?.perUnitProductionCost, [Validators.required]],
      unitPrice: [product?.unitPrice, [Validators.required]],
      initialQuantity:[product?.initialQuantity, [Validators.required]],
      imageUrl: [product?.imageUrl],
      madeBy: [product?.madeBy || null, [Validators.required]],
    });
  }

  compareEmployee(emp1: any, emp2: any): boolean {
    return emp1 && emp2 ? emp1.id === emp2.id : emp1 === emp2;
  }

  openModal(product: Product | null = null, orgId: string | null = null) {
    this.isEdit = !!product;
    this.orgId = orgId;
    this.initializeForm(product);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if(this.fileDeletedNeedToSubmit){
      this.onSubmit();
    }
  }

  get f() {
    return this.form.controls;
  }

  onProductImageSelect(file: File | null) {
    console.log('Selected file:', file);
    this.selectedFile = file;
    if (!file) {
      this.form.patchValue({ imageUrl: null });
    }
  }

  generateProductCode(){
    if(!this.isEdit) {
        let code = generateRandomLuhnCode(6);
       this.form.patchValue({ code: code });
    }
  }

  onFileRemoved(){
    console.log('File removed');
    this.fileDeletedNeedToSubmit=true;
  }

  addStock(){
    this.productService.showToastInfo('Not implemented');
  }

  removeStock(){
     this.productService.showToastInfo('Not implemented');
  }

  onSubmit() {
    this.submitted = true;
    this.fileDeletedNeedToSubmit=false;

    if (this.form.invalid) {
      return;
    }

    let product = this.form.value;

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
