import { Component, Input, OnInit } from "@angular/core";
import { CardStatsComponent } from "../cards/card-stats/card-stats.component";
import { Organization } from "src/app/core/models/organization.model";
import { OrganizationBalance } from "../../../../core/models/organization-balance.model";
import {  NgIf } from "@angular/common";

@Component({
    selector: "app-header-stats",
    templateUrl: "./header-stats.component.html",
    imports: [CardStatsComponent, NgIf],
})
export class HeaderStatsComponent implements OnInit {

   @Input() public organization: Organization | null = null;
   @Input() public organizationBalance: OrganizationBalance| null = null;
   @Input() public showFullBalance: Boolean = true;

  constructor() {}
  
  ngOnInit(): void {}

  
}
