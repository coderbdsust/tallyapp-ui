import { Component, Input, OnInit } from '@angular/core';
import { Nft } from '../../../models/nft';
import { NgStyle } from '@angular/common';
import { Organization, OrganizationTopEmployee } from 'src/app/modules/organization/service/model/organization.model';
import { OrganizationService } from 'src/app/modules/organization/service/organization.service';

@Component({
  selector: '[nft-single-card]',
  templateUrl: './nft-single-card.component.html',
  imports: [NgStyle],
})
export class NftSingleCardComponent implements OnInit {
  organization: Organization | null = null;
  orgTopEmployee: OrganizationTopEmployee | null = null;

  constructor(private orgService: OrganizationService) {}

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.organization = org;
        this.loadTopEmployeesByOrganization(org.id);
      }
    });
  }

  loadTopEmployeesByOrganization(orgId: string) {
    this.orgService.getOrganizationTopEmployee(orgId).subscribe({
      next: (response) => {
        this.orgTopEmployee = response;
      },
      error: (error) => { 
        this.orgTopEmployee = null;
      }
    });
  }
}
