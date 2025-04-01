import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { Product } from '../../service/model/product.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ProductService } from '../../service/product.service';
import { EmployeeService } from '../../service/employee.service';

@Component({
  selector: 'app-add-product',
  imports: [NgClass, ButtonComponent, FormsModule, CommonModule, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent {

  form!: FormGroup;
  submitted=false;
  isModalOpen = false;
  orgId: string | null = null;
  allEmployees:any = [];
  isEdit=false;
  @Output() productListModifiedEmitter = new EventEmitter<Boolean>();

  constructor(
    private readonly _formBuilder: FormBuilder,
    private productService: ProductService,
    private employeeService:EmployeeService) {}

  
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
      }
    });

  }

  private initializeForm(product:Product| null = null) {
    console.log(product?.madeBy);
    this.form = this._formBuilder.group({
      id: [product?.id],
      name: [product?.name, [Validators.required]],
      description: [product?.description],
      employeeCost: [product?.employeeCost, [Validators.required]],
      productionCost: [product?.productionCost, [Validators.required]],
      sellingPrice: [product?.sellingPrice, [Validators.required]],
      soldPrice: [product?.soldPrice],
      imageUrl: [product?.imageUrl],
      sold: [product?.sold],
      soldDate: [product?.soldDate],
      madeBy: [product?.madeBy || null, [Validators.required]],
    });
  }

  compareEmployee(emp1: any, emp2: any): boolean {
    return emp1 && emp2 ? emp1.id === emp2.id : emp1 === emp2;
  }
  


  openModal(product: Product| null=null, orgId: string | null = null) {
    this.isEdit = !!product;
    this.orgId = orgId;
    this.initializeForm(product);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(){
    this.submitted = true;
    
    if (this.form.invalid) {
      return;
    }
    
    const product = this.form.value;
    this.submitted = false;
    if (this.isEdit) {
      product.madeBy = product.madeBy.id;
      this.productService.editProduct(product.id, product).subscribe({
        next: (response) => {
          this.productService.showToastSuccess('Product updated successfully');
          this.closeModal();
          this.productListModifiedEmitter.emit(true);
        },
        error: (error) => {
          this.productService.showToastError(error);
          this.closeModal();
        }
      });
     }else{
      this.productService.addProduct(product.madeBy, product).subscribe({
        next: (response) => {
          this.productService.showToastSuccess('Product added successfully');
          this.closeModal();
          this.productListModifiedEmitter.emit(true);
        },
        error: (error) => {
          this.productService.showToastError(error);
          this.closeModal();
        }
      });
    }
  }

}
