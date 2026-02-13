import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { Subject, takeUntil } from 'rxjs';
import { Supplier, PurchaseOrder } from '../../supplier.model';
import { PurchaseOrderService } from 'src/app/core/services/purchase-order.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { Organization } from 'src/app/core/models/organization.model';
import { FormError } from 'src/app/common/components/form-error/form-error.component';

@Component({
  selector: 'app-purchase-order-create',
  imports: [AngularSvgIconModule, CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './purchase-order-create.component.html',
  styleUrl: './purchase-order-create.component.scss'
})
export class PurchaseOrderCreateComponent extends FormError implements OnInit, OnDestroy {
  poForm!: FormGroup;
  submitted = false;
  isEditMode = false;
  loading = false;
  organization!: Organization;
  suppliers: Supplier[] = [];
  supplierSearch: string = '';
  showSupplierDropdown = false;
  selectedSupplier: Supplier | null = null;

  private orgId: string = '';
  private poId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private poService: PurchaseOrderService,
    private supplierService: SupplierService,
    private orgService: OrganizationService
  ) {super();}

  ngOnInit(): void {
    this.initForm();
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orgId = params['orgId'];
        this.poId = params['poId'];

        if (!this.orgId) {
          this.subscribeToOrganization();
        } else {
          this.loadSuppliers('');
          if (this.poId) {
            this.isEditMode = true;
            this.loadPurchaseOrder();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToOrganization(): void {
    this.orgService.organization$
      .pipe(takeUntil(this.destroy$))
      .subscribe((org) => {
        if (org) {
          this.organization = org;
          this.orgId = org.id;
          this.loadSuppliers('');
        }
      });
  }

  private initForm(po: PurchaseOrder | null = null) {
    const today = new Date().toISOString().split('T')[0];
    this.poForm = this.fb.group({
      supplierId: [po?.supplierId, Validators.required],
      supplierName: [po?.supplierName],
      totalAmount: [po?.totalAmount, [Validators.required, Validators.min(0.01)]],
      description: [po?.description],
      reference: [po?.reference],
      orderDate: [po?.orderDate || today, Validators.required],
      dueDate: [po?.dueDate, Validators.required],
    });
  }

  private loadPurchaseOrder(): void {
    this.loading = true;
    this.poService.getPurchaseOrderById(this.orgId, this.poId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (po) => {
          if (po.status !== 'DRAFT') {
            this.poService.showToastError('Only DRAFT purchase orders can be edited');
            this.router.navigate(['/supplier/purchase-order/detail'], {
              queryParams: { orgId: this.orgId, poId: this.poId }
            });
            return;
          }
          this.initForm(po);
          this.selectedSupplier = { id: po.supplierId, name: po.supplierName } as Supplier;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.poService.showToastErrorResponse(err);
          this.router.navigate(['/supplier/purchase-order']);
        },
      });
  }

  loadSuppliers(search: string): void {
    this.supplierService.searchSuppliers(this.orgId, search, 0, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.suppliers = response.content;
        },
        error: (err) => {
          this.supplierService.showToastErrorResponse(err);
        },
      });
  }

  onSupplierSearch(event: Event): void {
    const search = (event.target as HTMLInputElement).value;
    this.supplierSearch = search;
    this.showSupplierDropdown = true;
    this.loadSuppliers(search);
  }

  selectSupplier(supplier: Supplier): void {
    this.selectedSupplier = supplier;
    this.supplierSearch = supplier.name;
    this.poForm.patchValue({ supplierId: supplier.id, supplierName: supplier.name });
    this.showSupplierDropdown = false;
  }

  clearSupplier(): void {
    this.selectedSupplier = null;
    this.supplierSearch = '';
    this.poForm.patchValue({ supplierId: null, supplierName: null });
  }

  get f() {
    return this.poForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.poForm.invalid) return;

    const formData = this.poForm.value;

    if (this.isEditMode) {
      this.poService.updatePurchaseOrder(this.orgId, this.poId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (po) => {
            this.poService.showToastSuccess('Purchase order updated successfully');
            this.router.navigate(['/supplier/purchase-order/detail'], {
              queryParams: { orgId: this.orgId, poId: po.id }
            });
          },
          error: (err) => {
            this.poService.showToastErrorResponse(err);
          },
        });
    } else {
      this.poService.createPurchaseOrder(this.orgId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (po) => {
            this.poService.showToastSuccess('Purchase order created successfully');
            this.router.navigate(['/supplier/purchase-order/detail'], {
              queryParams: { orgId: this.orgId, poId: po.id }
            });
          },
          error: (err) => {
            this.poService.showToastErrorResponse(err);
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/supplier/purchase-order']);
  }
}
