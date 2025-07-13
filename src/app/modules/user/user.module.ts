import { NgModule } from '@angular/core';


import { UserprofileService } from '../../core/services/userprofile.service';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  imports: [UserRoutingModule],
  providers: [UserprofileService]
})
export class UserModule {}
