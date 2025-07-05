import { Component, Input, OnInit } from "@angular/core";
import { Organization } from "src/app/modules/organization/service/model/organization.model";
import { OrganizationBalance } from "../../../models/organization-balance";
import { NgFor } from "@angular/common";

@Component({
  selector: "app-card-page-visits",
  templateUrl: "./card-page-visits.component.html",
  styleUrl: './card-page-visits.component.scss',
  standalone: true,
  imports: [NgFor]
})
export class CardPageVisitsComponent implements OnInit {
   
   @Input() public organization: Organization | null = null;
   @Input() public organizationBalance: OrganizationBalance| null = null;

  constructor() {}

  ngOnInit(): void {}
}
