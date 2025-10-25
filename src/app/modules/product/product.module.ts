import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProductRoutingModule } from './product-routing.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProductRoutingModule,
    NgSelectModule
  ]
})
export class ProductModule { }
