import { NgModule } from '@angular/core';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { UserprofileService } from '../auth/services/userprofile.service';

@NgModule({
  imports: [DashboardRoutingModule],
  providers: [UserprofileService]
})
export class DashboardModule {}
