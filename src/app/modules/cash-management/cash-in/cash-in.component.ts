import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Organization } from '../../organization/service/model/organization.model';
import { OrganizationService } from '../../organization/service/organization.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { AccountingService } from '../../dashboard/service/accounting.service';

@Component({
  selector: 'app-cash-in',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './cash-in.component.html',
  styleUrl: './cash-in.component.scss',
})
export class CashInComponent extends FormError implements OnInit {
  form!: FormGroup;
  org: Organization|null = null;
  public readonly allPaymentMethods = [
    'Cash',
    'Bank Transfer',
    'Mobile Banking',
    'Card',
    'Cheque',
    'Other'
  ];

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly orgService: OrganizationService,
    private readonly accService: AccountingService
  ) {
    super();  
    console.log('Cash In Component Initialized');
    this.initiatlizeForm(null)
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.org = org;
        this.initiatlizeForm(this.org);
      }
    });
  }

  initiatlizeForm(org: Organization|null): void {
    this.form = this.fb.group({
      organizationId: [org?.id, Validators.required],
      transactionDate: ['', Validators.required],
      amount: [0, Validators.required],
      paymentMethod: ['', Validators.required],
      reference: [''],
      description: [''],
    });
  }

  submit() {
    console.log(this.form.value);

    if(this.form.invalid) {
      this.orgService.showToastError('Please fill in all required fields correctly.');
      return;
    }
    
     this.accService.recordCashIn(this.form.value).subscribe({
      next: (response) => {
        this.orgService.showToastSuccess(response.message || 'Cash In recorded successfully');
        this.form.reset();
      },
      error: (error) => {
        this.orgService.showToastErrorResponse(error);
      }

    });
  }

  cancel() {
    this.form.reset();
  }

  
  
}
