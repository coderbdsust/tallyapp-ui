import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { Organization } from 'src/app/core/models/organization.model';
import { Drawer, DrawerInterface, DrawerOptions, InstanceOptions } from 'flowbite';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { Supplier } from '../../supplier.model';
import { FormError } from 'src/app/common/components/form-error/form-error.component';

@Component({
  selector: 'app-add-supplier',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, ButtonComponent],
  templateUrl: './add-supplier.component.html',
  styleUrl: './add-supplier.component.scss'
})
export class AddSupplierComponent  extends FormError implements OnInit {
  @Output() public supplierEmitter = new EventEmitter<Supplier>();
  @Input() organization!: Organization;

  supplierForm!: FormGroup;
  drawer: DrawerInterface | undefined;
  submitted = false;
  errorMessage = '';
  supplier: Supplier | null = null;

  private $drawerTargetEl: any;
  private drawerOptions: DrawerOptions = {
    placement: 'right',
    backdrop: true,
    bodyScrolling: true,
    edge: false,
    edgeOffset: '',
    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
  };
  private drawerInstanceOptions: InstanceOptions = {
    id: 'drawer-supplier',
    override: true,
  };

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService
  ) {super();}

  ngOnInit(): void {
    this.$drawerTargetEl = document.getElementById('drawer-supplier') as HTMLElement;
    this.$drawerTargetEl.classList.remove('hidden');
    this.drawer = new Drawer(this.$drawerTargetEl, this.drawerOptions, this.drawerInstanceOptions);
    this.drawer.hide();
    this.initForm();
  }

  private initForm(supplier: Supplier | null = null) {
    this.supplier = supplier;
    this.supplierForm = this.fb.group({
      id: [supplier?.id],
      name: [supplier?.name, Validators.required],
      phone: [supplier?.phone, Validators.required],
      email: [supplier?.email, Validators.email],
      addressLine: [supplier?.addressLine],
    });
  }

  openDrawer(supplier: Supplier | null = null) {
    this.initForm(supplier);
    this.submitted = false;
    this.drawer?.show();
  }

  closeDrawer() {
    this.drawer?.hide();
    this.submitted = false;
  }

  get f() {
    return this.supplierForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.supplierForm.invalid) return;

    const supplierData = this.supplierForm.value;
    this.supplierService
      .createOrUpdateSupplier(this.organization.id, supplierData)
      .subscribe({
        next: (supplier) => {
          this.supplierEmitter.emit(supplier);
          this.supplierService.showToastSuccess('Supplier saved successfully');
          this.closeDrawer();
          this.initForm(null);
        },
        error: (error) => {
          this.supplierService.showToastErrorResponse(error);
        },
      });
  }
}
