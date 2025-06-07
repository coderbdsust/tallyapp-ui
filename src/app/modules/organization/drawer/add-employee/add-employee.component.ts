import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { Organization } from '../../service/model/organization.model';
import { Drawer, DrawerInterface, DrawerOptions, InstanceOptions } from 'flowbite';
import { OrganizationService } from '../../service/organization.service';
import { Employee } from '../../service/model/employee.model';
import { EmployeeService } from '../../service/employee.service';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { FileUploaderComponent } from "../../../../common/components/file-uploader/file-uploader.component";
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';

@Component({
    selector: 'app-add-employee',
    imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, ButtonComponent, WordPipe, FileUploaderComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './add-employee.component.html',
    styleUrl: './add-employee.component.scss'
})
export class AddEmployeeComponent {
  @ViewChild(FileUploaderComponent) fileUploader!: FileUploaderComponent;
  @Output() public employeeEmitter = new EventEmitter<Employee>();
  @Input() organization!: Organization;
  $empDrawerTargetEl: any;
  empForm!: FormGroup;
  empDrawerOptions: DrawerOptions = {
    placement: 'right',
    backdrop: true,
    bodyScrolling: true,
    edge: false,
    edgeOffset: '',
    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
    onHide: () => {
      if(this.fileUploader) {
        this.fileUploader.clearFile();
      }

     if(this.fileDeletedNeedToSubmit){
        this.onEmployeeSubmit();
      }
    }
  };

  // instance options object
  empDrawerInstanceOptions: InstanceOptions = {
    id: 'drawer-employee',
    override: true,
  };

  drawer: DrawerInterface | undefined;
  submitted = false;
  errorMessage = '';
  empBillingTypeList: String[] = [];
  empStatusList: String[] = [];
  empTypeList: String[] = [];
  selectedFile: File | null = null;
  employee: Employee | null = null;
  fileDeletedNeedToSubmit:boolean=false;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private orgService: OrganizationService,
    private empService: EmployeeService,
    private fileUploaderService: FileUploaderService
  ) {}

  ngOnInit(): void {
    this.$empDrawerTargetEl = document.getElementById('drawer-employee') as HTMLElement;
    this.$empDrawerTargetEl.classList.remove('hidden');
    this.drawer = new Drawer(this.$empDrawerTargetEl, this.empDrawerOptions, this.empDrawerInstanceOptions);
    this.drawer.hide();
    this.initializeEmpForm();
    this.initializeConstantList();
  }

  private initializeConstantList() {
    this.empService.getEmployeeStatus().subscribe({
      next: (response) => {
        this.empStatusList = response;
      },
      error: (errorRes) => {
        console.log(errorRes);
      },
    });
    this.empService.getEmployeeTypes().subscribe({
      next: (response) => {
        this.empTypeList = response;
      },
      error: (errorRes) => {
        console.log(errorRes);
      },
    });
    this.empService.getEmployeeBillingTypes().subscribe({
      next: (response) => {
        this.empBillingTypeList = response;
      },
      error: (errorRes) => {
        console.log(errorRes);
      },
    });
  }

  private initializeEmpForm(employee: Employee | null=null) {
      
      if(employee) {
        this.employee = employee;
        if(employee.profileImage)
          this.fileUploader.setFile(employee.profileImage);
      }

      this.empForm = this._formBuilder.group({
        id: [employee?.id],
        orgId: [this.organization?.id],
        orgName: [this.organization?.orgName],
        fullName: [employee?.fullName, Validators.required],
        profileImage: [employee?.profileImage],
        dateOfBirth: [employee?.dateOfBirth, Validators.required],
        mobileNo: [
          employee?.mobileNo,
          [
            Validators.required,
            Validators.pattern(/^01[3-9]\d{8}$/),
            Validators.minLength(11),
            Validators.maxLength(11),
          ],
        ],
        empAddressLine: [employee?.empAddressLine, [Validators.required]],
        empCity: [employee?.empCity, [Validators.required]],
        empPostcode: [employee?.empPostcode, [Validators.required]],
        empCountry: [employee?.empCountry, [Validators.required]],
        status: [employee?.status, [Validators.required, Validators.minLength(3)]],
        employeeBillingType: [employee?.employeeBillingType, [Validators.required, Validators.minLength(3)]],
        employeeType: [employee?.employeeType, [Validators.required, Validators.minLength(3)]],
        billingRate: [employee?.billingRate, [Validators.required]],
        dailyAllowance: [employee?.dailyAllowance, [Validators.required]]
      });
  }

  openDrawer(employee:Employee|null=null) {
    this.initializeEmpForm(employee);
    this.drawer?.show();
  }

  closeDrawer() {
    this.drawer?.hide();
    this.submitted = false;
  }

  get f() {
    return this.empForm.controls;
  }

  onAvatarSelect(file: File|null) {
    this.selectedFile = file;
    if(!file){
      this.empForm.patchValue({ profileImage: null });      
    }
  }

  onFileDeleted(){
    this.fileDeletedNeedToSubmit=true;
  }

  onEmployeeSubmit() {
    this.submitted = true;
    this.fileDeletedNeedToSubmit=false;
  
    const employeeData = this.empForm.value;
  
    if (this.empForm.invalid) {
      return;
    }
  
    const orgId = this.organization.id;
  
    let uploadObservable = of(null); // fallback if no file
  
    if (this.selectedFile) {
      uploadObservable = this.fileUploaderService.uploadFile(this.selectedFile).pipe(
        tap((response: any) => {
          console.log('File uploaded successfully:', response);
          employeeData.profileImage = response.fileURL;
        }),
        catchError((error) => {
          console.error('Error uploading file:', error);
          this.orgService.showToastErrorResponse(error);
          return throwError(() => error); // Stop the chain
        })
      );
    }
  
    uploadObservable
      .pipe(
        switchMap(() => {
          employeeData.orgId = orgId;
          const employee: Employee = employeeData as Employee;
          return this.empService.addEmployeeToOrganization(orgId, employee);
        })
      )
      .subscribe({
        next: (employee) => {
          this.employeeEmitter.emit(employee);
          this.empForm.patchValue({ id: employee.id });
          this.empService.showToastSuccess('Employee saved to organization successfully');
  
          this.closeDrawer();
          this.initializeEmpForm(employee);
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        },
      });
  }
  
}
