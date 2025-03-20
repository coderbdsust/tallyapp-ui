import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { OrganizationService } from '../service/organization.service';
import { DrawerInterface, DrawerOptions, InstanceOptions } from 'flowbite';
import { Drawer } from 'flowbite';
import { Organization } from '../service/organization.model';
import { OrgDrawerService } from '../service/org-drawer.service';

@Component({
  selector: 'app-add-organization',
  standalone: true,
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, ButtonComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-organization.component.html',
  styleUrl: './add-organization.component.scss',
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
    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
    onHide: () => {
      // console.log('drawer is hidden');
    },
    onShow: () => {
      // console.log('drawer is shown');
    },
    onToggle: () => {
      // console.log('drawer has been toggled');
    },
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
    private orgService: OrganizationService,
    private orgDrawerService: OrgDrawerService
  ) {}

  ngOnInit(): void {
    this.orgDrawerService.drawerState$.subscribe(state => {
      console.log('Drawer state : '+state);
      if(state)
        this.openOrganization();
    });

    this.$orgDrawerTargetEl = document.getElementById('drawer-organization') as HTMLElement;
    this.drawer = new Drawer(this.$orgDrawerTargetEl, this.orgDrawerOptions, this.orgDrawerInstanceOptions);
    this.drawer.hide();
    this.initializeOrgForm();
  }

  private initializeOrgForm() {
    this.orgForm = this._formBuilder.group({
      id: [''],
      orgName: ['', Validators.required],
      orgRegNumber: ['', Validators.required],
      orgTinNumber: ['', Validators.required],
      orgVatNumber: ['', Validators.required],
      orgOpenAt: ['', Validators.required],
      orgOpenInWeek: ['', Validators.required],
      orgOpeningTitle: ['', Validators.required],
      owner: ['', Validators.required],
      orgEmail: ['', [Validators.required, Validators.email]],
      orgMobileNo: [
        '',
        [Validators.required, Validators.pattern(/^01[3-9]\d{8}$/), Validators.minLength(11), Validators.maxLength(11)],
      ],
      since: ['', Validators.required],
      image: [''],
      avatar: [''],
      orgAddressLine: ['', [Validators.required]],
      orgAddressCity: ['', [Validators.required]],
      orgAddressPostcode: ['', [Validators.required]],
      orgAddressCountry: ['', [Validators.required]],
      status: ['ACTIVE', [Validators.required]],
    });
  }

  private loadOrganization() {
    this.orgService.getOrganizations().subscribe({
      next: (organizations) => {
        if (organizations && organizations.length > 0) {
          const org = organizations[0];
          this.organization = org;
          this.orgForm.patchValue({
            id: org.id,
            orgName: org.orgName,
            orgRegNumber: org.orgRegNumber,
            orgTinNumber: org.orgTinNumber,
            orgVatNumber: org.orgVatNumber,
            orgOpenAt: org.orgOpenAt,
            orgOpenInWeek: org.orgOpenInWeek,
            orgOpeningTitle: org.orgOpeningTitle,
            owner: org.owner,
            orgEmail: org.orgEmail,
            orgMobileNo: org.orgMobileNo,
            since: org.since,
            image: org.image,
            avatar: org.avatar,
            orgAddressLine: org.orgAddressLine,
            orgAddressCity: org.orgAddressCity,
            orgAddressPostcode: org.orgAddressPostcode,
            orgAddressCountry: org.orgAddressCountry,
            status: org.status,
          });
        }
      },
      error: () => {},
    });
  }

  openOrganization() {
    this.loadOrganization();
    this.drawer?.show();
  }

  closeOrganization() {
    this.drawer?.hide();
    this.submitted = false;
    this.orgDrawerService.closeDrawer();
  }

  get f() {
    return this.orgForm.controls;
  }

  onAddOrganization() {
    console.log('submitted');

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
        this.closeOrganization();
      },
      error: (error) => {
        this.orgService.showToastErrorResponse(error);
      },
    });
  }
}
