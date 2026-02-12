import { CommonModule, NgClass } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { RegisterUserService } from 'src/app/core/services/register-user.service';
import { UserprofileService } from 'src/app/core/services/userprofile.service';
import { RegisteredUser } from '../../user-management/registered-user.model';

@Component({
  selector: 'app-add-user',
  imports: [
    NgClass,
    ButtonComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgSelectComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {
  form!: FormGroup;
  submitted = false;
  isModalOpen = false;
  isEdit = false;
  genderList: String[] = [];
  @Output() modifiedEmitter = new EventEmitter<Boolean>();

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly regUserService: RegisterUserService,
    private readonly userprofileService: UserprofileService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadGenderList();
  }

  private initializeForm(user: RegisteredUser | null = null) {
    this.form = this._formBuilder.group({
      id: [user?.id],
      firstName: [user?.firstName, [Validators.required]],
      lastName: [user?.lastName, [Validators.required]],
      username: [user?.username, [Validators.required]],
      mobileNo: [user?.mobileNo, [Validators.required]],
      gender: [user?.gender, [Validators.required]],
      keycloakUserId: [user?.keycloakUserId, [Validators.required]],
      email: [user?.email, [Validators.required, Validators.email]],
      dateOfBirth: [user?.dateOfBirth, [Validators.required]],
      maximumOrganizationLimit:[user?.maximumOrganizationLimit || 1, [Validators.required, Validators.min(1),Validators.max(100)]]
    });
  }

  private loadGenderList() {
    this.userprofileService.getGenderList().subscribe({
      next: (data) => this.genderList = data,
      error: (err) => this.regUserService.showToastErrorResponse(err)
    });
  }

  openModal(user: RegisteredUser | null = null) {
    this.isEdit = !!user;
    this.initializeForm(user);
    this.submitted = false;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const user: RegisteredUser = this.form.value;

    this.regUserService.addUser(user).subscribe({
      next: () => {
        this.regUserService.showToastSuccess('User saved successfully');
        this.submitted = false;
        this.closeModal();
        this.modifiedEmitter.emit(true);
      },
      error: (err) => {
        this.regUserService.showToastErrorResponse(err);
      }
    });
  }
}
