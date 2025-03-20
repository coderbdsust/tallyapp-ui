import { NgClass, NgIf } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppProperties } from '../app-properties.model';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { AppPropertiesService } from '../service/app-properties.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-edit-app-properties',
  standalone: true,
  imports: [NgClass, NgIf, FormsModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './edit-app-properties.component.html',
  styleUrl: './edit-app-properties.component.scss'
})
export class EditAppPropertiesComponent implements OnInit{

  @Input() appProperty!:AppProperties;
  form!: FormGroup;
  submitted=false;
  isModalOpen = false;

  constructor(private appPropertiesService:AppPropertiesService, private readonly _formBuilder: FormBuilder, private authService: AuthService){}
  
  ngOnInit(): void {
   // this.initializeForm();
  }

  private initializeForm(){
    this.form = this._formBuilder.group({
      id: [this.appProperty?.id, [Validators.required]],
      appKey: [this.appProperty?.appKey, [Validators.required]],
      appValue: [this.appProperty?.appValue, [Validators.required]],
      profile: [this.appProperty?.profile, [Validators.required]]
    });
  }


  openModal(){
    this.isModalOpen=true;
  }

  closeModal(){
    this.isModalOpen=false;
  }

  saveAppProperty(property:any){
    this.appPropertiesService.showToastError('Not implemeneted');
  }

  ngOnChanges() {
    this.initializeForm();
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    const appProperty = this.form.value;

    if (this.form.invalid) {
      return;
    }

    this.appPropertiesService.editAppProperties(appProperty).subscribe({
      next: (response) => {
        this.closeModal();
        this.authService.showToastSuccess(`App property updated`);
      },
      error: (errorRes) => {
        this.closeModal();
        this.authService.showToastErrorResponse(errorRes);
      },
    });
    

  }

}
