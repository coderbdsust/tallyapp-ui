import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Organization } from '../../organization/service/model/organization.model';
import { Router } from '@angular/router';
import { OrganizationService } from '../../organization/service/organization.service';
import { AccountingService } from '../../dashboard/service/accounting.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { WordPipe } from 'src/app/common/pipes/word.pipe';

@Component({
  selector: 'app-expense',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, WordPipe],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss'
})
export class ExpenseComponent extends FormError implements OnInit {

    form!: FormGroup;
    org: Organization|null=null;

    public readonly allPaymentMethods = [
      'Cash',
      'Bank Transfer',
      'Mobile Banking',
      'Card',
      'Cheque',
      'Other'
    ];

    public allExpenseTypes: string[] = [];

    constructor(
      private readonly router: Router,
      private readonly fb: FormBuilder,
      private readonly orgService: OrganizationService,
      private readonly accService: AccountingService
    ) {
      super();  
      console.log('Expense Component Initialized');
      this.initiatlizeForm(null);
    }
  
    ngOnInit(): void {
      this.orgService.organization$.subscribe((org) => {
        if (org) {
          this.org = org;
          this.initiatlizeForm(this.org);
        }
      });

      this.accService.getExpenseType().subscribe({
        next: (types) => {
          this.allExpenseTypes = types;
        },
        error: (error) => {
          this.accService.showToastErrorResponse(error);
        }
      });

    }
  
    initiatlizeForm(org: Organization|null): void {
      this.form = this.fb.group({
        organizationId: [org?.id, Validators.required],
        transactionDate: ['', Validators.required],
        amount: [0, Validators.required],
        paymentMethod: ['', Validators.required],
        expenseType: ['', Validators.required],
        description: ['', Validators.required],
      });
    }
  
    submit() {
      console.log(this.form.value);
  
      if(this.form.invalid) {
        this.orgService.showToastError('Please fill in all required fields correctly.');
        return;
      }
      
       this.accService.recordExpense(this.form.value).subscribe({
        next: (response) => {
          this.orgService.showToastSuccess(response.message || 'Expense recorded successfully');
          this.initiatlizeForm(this.org)
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
