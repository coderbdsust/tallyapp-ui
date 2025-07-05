import { Component, Input, OnInit } from "@angular/core";
import { CardStatsComponent } from "../cards/card-stats/card-stats.component";
import { Organization } from "src/app/modules/organization/service/model/organization.model";
import { OrganizationService } from "src/app/modules/organization/service/organization.service";
import { AccountingService } from "../../service/accounting.service";
import { OrganizationBalance } from "../../models/organization-balance";
import { CurrencyPipe } from "@angular/common";

@Component({
    selector: "app-header-stats",
    templateUrl: "./header-stats.component.html",
    imports: [CardStatsComponent],
})
export class HeaderStatsComponent implements OnInit {

   @Input() public organization: Organization | null = null;
   @Input() public organizationBalance: OrganizationBalance| null = null;

  constructor() {}
  
  ngOnInit(): void {}

  
}
