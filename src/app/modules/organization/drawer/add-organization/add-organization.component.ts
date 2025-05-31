import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { DrawerInterface, DrawerOptions, InstanceOptions } from 'flowbite';
import { Drawer } from 'flowbite';
import { Organization } from '../../service/model/organization.model';
import { OrganizationService } from '../../service/organization.service';


@Component({
    selector: 'app-add-organization',
    imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, ButtonComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './add-organization.component.html',
    styleUrl: './add-organization.component.scss'
})
export class AddOrganizationComponent {
  @Output() public orgEmitter = new EventEmitter<Organization>();
  organization!: Organization;
  $orgDrawerTargetEl: any;
  orgForm!: FormGroup;
  // options with default values
  orgDrawerOptions: DrawerOptions = {
    placement: 'right',
    backdrop: true,
    bodyScrolling: true,
    edge: false,
    edgeOffset: '',
    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30'
  };

  // instance options object
  orgDrawerInstanceOptions: InstanceOptions = {
    id: 'drawer-organization',
    override: true,
  };

  drawer: DrawerInterface | undefined;
  submitted = false;
  errorMessage = '';

  constructor(
    private readonly _formBuilder: FormBuilder,
    private orgService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.$orgDrawerTargetEl = document.getElementById('drawer-organization') as HTMLElement;
    this.$orgDrawerTargetEl.classList.remove('hidden');
    this.drawer = new Drawer(this.$orgDrawerTargetEl, this.orgDrawerOptions, this.orgDrawerInstanceOptions);
    this.drawer.hide();
    this.initializeOrgForm();
  }

  private initializeOrgForm(org:Organization | null = null) {
    this.orgForm = this._formBuilder.group({
      id: [org?.id],
      orgName: [org?.orgName, Validators.required],
      orgRegNumber: [org?.orgRegNumber, Validators.required],
      orgTinNumber: [org?.orgTinNumber, Validators.required],
      orgVatNumber: [org?.orgVatNumber, Validators.required],
      orgOpenAt: [org?.orgOpenAt, Validators.required],
      orgOpenInWeek: [org?.orgOpenInWeek, Validators.required],
      orgOpeningTitle: [org?.orgOpeningTitle, Validators.required],
      owner: [org?.owner, Validators.required],
      orgEmail: [org?.orgEmail, [Validators.required, Validators.email]],
      orgMobileNo: [
        org?.orgMobileNo,
        [Validators.required, Validators.pattern(/^01[3-9]\d{8}$/), Validators.minLength(11), Validators.maxLength(11)],
      ],
      since: [org?.since, Validators.required],
      image: [org?.image],
      avatar: [org?.avatar],
      orgAddressLine: [org?.orgAddressLine, [Validators.required]],
      orgAddressCity: [org?.orgAddressCity, [Validators.required]],
      orgAddressPostcode: [org?.orgAddressPostcode, [Validators.required]],
      orgAddressCountry: [org?.orgAddressCountry, [Validators.required]],
      status: ['ACTIVE', [Validators.required]],
    });
  }

  openDrawer(organization: Organization | null = null) {
    this.initializeOrgForm(organization);
    this.drawer?.show();
  }

  closeDrawer() {
    this.drawer?.hide();
    this.submitted = false;
  }

  get f() {
    return this.orgForm.controls;
  }

  onAddOrganization() {
    this.submitted = true;

    const organizationData = this.orgForm.value;

    if (this.orgForm.invalid) {
      return;
    }

    this.orgService.addOrganization(organizationData).subscribe({
      next: (org) => {
        this.orgEmitter.emit(org);
        this.orgForm.patchValue({
          id: org.id,
        });
        this.orgService.showToastSuccess('Organization saved successfully');
        this.closeDrawer();
      },
      error: (error) => {
        this.orgService.showToastErrorResponse(error);
      },
    });
  }
}
