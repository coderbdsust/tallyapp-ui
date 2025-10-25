import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { EmployeeRoutingModule } from './employee-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    NgSelectModule
  ]
})
export class EmployeeModule { }
