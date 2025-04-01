import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { Organization, UserForOrganization } from '../../service/model/organization.model';
import { OrganizationService } from '../../service/organization.service';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-assign-organization',
  imports: [NgClass, NgIf, FormsModule, CommonModule, ReactiveFormsModule, ButtonComponent, NgSelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './assign-organization.component.html',
  styleUrl: './assign-organization.component.scss',
})
export class AssignOrganizationComponent implements OnChanges {
  @Input() organization!: Organization;
  form!: FormGroup;
  submitted = false;
  isModalOpen = false;
  isDropdownOpen: boolean = false;
  allUsers: any[] = [];

  constructor(private orgService: OrganizationService, private readonly _formBuilder: FormBuilder) {}

  private initializeForm() {
    this.form = this._formBuilder.group({
      orgId: [this.organization?.id, [Validators.required]],
      orgName: [this.organization?.orgName, [Validators.required]],
      selectedUsers: [[], [Validators.required]],
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  ngOnChanges() {
    this.initializeForm();
  }

  get f() {
    return this.form.controls;
  }

  trackByUserId(index: number, user: any): number {
    return user.id;
  }

  onSearchKeyType(event: Event) {
    const searchKey = (event.target as HTMLSelectElement).value;
    if (searchKey && searchKey.length < 5) {
      this.orgService.showToastInfo('Please type atleast five (5) characters');
      return;
    }
    this.fetchUsers(searchKey);
  }

  customLabel(user: any) {
    return `${user.fullName} (${user.email})`;
  }

  fetchUsers(searchKey: String) {
    this.orgService.searchUsersForOrganization(searchKey).subscribe({
      next: (userList) => {
        this.allUsers = userList.map((i) => ({
          id: i.id,
          label: i.fullName + ' (' + i.email + ')',
        }));
      },
      error: (errRes) => {
        console.log(errRes);
      },
    });
  }

  onSubmit() {
    this.submitted = true;
    const addOwner = this.form.value;

    if (this.form.invalid) {
      return;
    }

    const userIds = addOwner.selectedUsers;

    this.orgService.addUsersToOrganization(addOwner.orgId, userIds).subscribe({
      next: (response) => {
        this.closeModal();
        this.orgService.showToastSuccess(`${response.message}`);
      },
      error: (errorRes) => {
        this.closeModal();
        this.orgService.showToastErrorResponse(errorRes);
      },
    });
  }
}
