import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OrganizationService } from '../../../../core/services/organization.service';
import { Organization } from '../../../../core/models/organization.model';
import { ButtonComponent } from "../../../../common/components/button/button.component";
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { DailyWorkService } from '../../../../core/services/daily-work.service';
import { DailyWork, EmployeeWorkUnit } from '../../../../core/models/daily-work.model';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-employee-daily-reporting',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, AngularSvgIconModule, ButtonComponent],
  templateUrl: './employee-daily-reporting.component.html',
  styleUrl: './employee-daily-reporting.component.scss'
})
export class EmployeeDailyReportingComponent extends FormError implements OnInit {

  expenditureForm!: FormGroup;
  organzation: Organization | null = null;
  dailyWork: DailyWork | null = null;
  dailyWorks: DailyWork[] = [];

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private readonly dailyWorkService: DailyWorkService,
    private readonly orgService: OrganizationService) {
    super();
    this.initializeDailyWorkForm('', this.getCurrentDate(), []);
  }

  initializeDailyWorkForm(dailyWorkId: string, entryDate: string, employeeWorkUnits: EmployeeWorkUnit[]) {
    this.expenditureForm = this.fb.group({
      dailyWorkId: [dailyWorkId],
      entryDate: [entryDate, Validators.required],
      employeeWorkUnits: this.fb.array([])
    });

    // Clear existing form array first
    const formArray = this.employeeWorkUnits;
    formArray.clear();

    // Add employee work units if provided
    if (employeeWorkUnits && employeeWorkUnits.length > 0) {
      employeeWorkUnits.forEach(e => this.addEmployeeWorkUnitRow(e));
    }
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.organzation = org;
        this.pendingDailyWorks(org);
      }
    });
  }

  pendingDailyWorks(org: Organization) {
    this.dailyWorkService.getPendingDailyWorkEntries(org.id).subscribe({
      next: (response) => {
        this.dailyWorks = response;
      },
      error: (error) => {
        this.dailyWorkService.showToastErrorResponse(error);
      }
    });
  }

  newReportForm(org: Organization, entryDate: string) {
    this.dailyWorkService.createDailyWorkEntry(org.id, entryDate).subscribe({
      next: (dailyWork) => {
        this.dailyWork = dailyWork;
        this.initializeDailyWorkForm(dailyWork.dailyWorkId, dailyWork.entryDate, dailyWork.employeeWorkUnits);
      },
      error: (error) => {
        this.dailyWorkService.showToastErrorResponse(error);
      },
    });
  }

  get employeeWorkUnits(): FormArray {
    return this.expenditureForm.get('employeeWorkUnits') as FormArray;
  }

  get totalEmployees(): number {
    return this.employeeWorkUnits.length;
  }

  get totalExpenses(): number {
    return this.employeeWorkUnits.controls.reduce((total, control) => {
      const expense = control.get('expense')?.value;
      return total + (typeof expense === 'number' ? expense : 0);
    }, 0);
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  createEmployeeFormGroup(emp: EmployeeWorkUnit | null = null): FormGroup {
    const group = this.fb.group({
      employeeWorkUnitId: [emp?.employeeWorkUnitId || ''],
      employeeId: [emp?.employeeId || '', Validators.required],
      employeeName: [emp?.employeeName || '', Validators.required],
      workUnit: [emp?.workUnit || 1, [Validators.required, Validators.min(0)]],
      isPresent: [emp?.isPresent !== undefined ? emp.isPresent : true],
      unitRate: [emp?.workUnitRate || 0, [Validators.required, Validators.min(0)]],
      billingType: [emp?.billingType || '', Validators.required],
      expense: [emp?.expense || 0, [Validators.required, Validators.min(0)]]
    });

    // Set up reactive changes for isPresent and workUnit
    this.setupFormGroupSubscriptions(group);

    return group;
  }

  private setupFormGroupSubscriptions(group: FormGroup): void {
    const isPresentControl = group.get('isPresent');
    const workUnitControl = group.get('workUnit');

    if (isPresentControl && workUnitControl) {
      // Handle presence change
      isPresentControl.valueChanges.subscribe((isPresent) => {
        if (!isPresent) {
          workUnitControl.setValue(0);
          workUnitControl.disable({ emitEvent: false });
        } else {
          workUnitControl.enable({ emitEvent: false });
          if (workUnitControl.value === 0) {
            workUnitControl.setValue(1);
          }
        }
      });

      // Initial state setup
      if (!isPresentControl.value) {
        workUnitControl.setValue(0);
        workUnitControl.disable({ emitEvent: false });
      }
    }
  }

  addEmployeeWorkUnitRow(emp: EmployeeWorkUnit | null = null): void {
    this.employeeWorkUnits.push(this.createEmployeeFormGroup(emp));
  }

  removeEmployeeRow(index: number): void {
    if (this.employeeWorkUnits.length > 1) {
      this.employeeWorkUnits.removeAt(index);
    }
  }

  // Fix the form control access in template
  getEmployeeControl(index: number, controlName: string) {
    return this.employeeWorkUnits.at(index).get(controlName);
  }

  // Fix the toggle function for isPresent
  togglePresent(index: number): void {
    const control = this.getEmployeeControl(index, 'isPresent');
    if (control) {
      control.setValue(!control.value);
    }
  }

  onSubmit(): void {
    if (this.expenditureForm.valid) {
      const formData = this.expenditureForm.value as DailyWork;

      // Ensure we have a valid dailyWorkId
      if (!formData.dailyWorkId) {
        this.dailyWorkService.showToastInfo('Please initiate a new report first.');
        return;
      }

      this.dailyWorkService.editDailyWorkEntry(formData.dailyWorkId, formData).subscribe({
        next: (response) => {
          this.dailyWorkService.showToastSuccess('Daily work entry updated successfully');
          if (this.organzation) {
            this.pendingDailyWorks(this.organzation);
          }
        },
        error: (err) => {
          this.dailyWorkService.showToastErrorResponse(err);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.dailyWorkService.showToastInfo('Please fill in all required fields correctly.');
    }
  }

  clearAll(): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to clear all employee data?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.employeeWorkUnits.clear();
        this.dailyWork = null;
        this.expenditureForm.get('dailyWorkId')?.setValue('');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.expenditureForm.controls).forEach(key => {
      const control = this.expenditureForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(arrayKey => {
              arrayControl.get(arrayKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }

  newReport(): void {
    if (this.organzation) {
      const entryDate = this.expenditureForm.get('entryDate')?.value;
      if (!entryDate) {
        this.dailyWorkService.showToastInfo('Please select an entry date');
        return;
      }
      this.newReportForm(this.organzation, entryDate);
    } else {
      this.dailyWorkService.showToastError('Organization not found');
    }
  }

  editReport(dailyWork: DailyWork): void {
    this.dailyWork = dailyWork;
    this.initializeDailyWorkForm(dailyWork.dailyWorkId, dailyWork.entryDate, dailyWork.employeeWorkUnits);
    this.dailyWorkService.showToastInfo('Modify Daily Work Entry : ' + dailyWork.entryDate);
  }

  deleteReport(dailyWork: DailyWork): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete this daily work entry?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dailyWorkService.removeDailyWorkEntry(dailyWork.dailyWorkId).subscribe({
          next: (response) => {
            this.dailyWorkService.showToastSuccess(response.message || 'Daily work entry deleted successfully');
            if (this.organzation) {
              this.pendingDailyWorks(this.organzation);
            }

            // Clear form if deleted entry was being edited
            if (this.dailyWork?.dailyWorkId === dailyWork.dailyWorkId) {
              this.employeeWorkUnits.clear();
              this.dailyWork = null;
              this.expenditureForm.get('dailyWorkId')?.setValue('');
            }

          },
          error: (err) => {
            this.dailyWorkService.showToastErrorResponse(err);
          }
        });
      }
    });
  }

  approveReport(dailyWork: DailyWork): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to approve this daily work entry?` },
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result) {
        this.dailyWorkService.approveDailyWorkEntry(dailyWork.dailyWorkId, dailyWork).subscribe({
          next: (response) => {
            this.dailyWorkService.showToastSuccess('Daily work entry approved successfully');
            if (this.organzation) {
              this.pendingDailyWorks(this.organzation);
            }

            // Clear form if approved entry was being edited
            if (this.dailyWork?.dailyWorkId === dailyWork.dailyWorkId) {
              this.clearAll();
            }
          },
          error: (err) => {
            this.dailyWorkService.showToastErrorResponse(err);
          }
        });
      }
    });

  }
}