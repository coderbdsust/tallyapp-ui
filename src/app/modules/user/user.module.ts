import { NgModule } from '@angular/core';


import { UserprofileService } from './service/userprofile.service';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  imports: [UserRoutingModule],
  providers: [UserprofileService]
})
export class UserModule {}
