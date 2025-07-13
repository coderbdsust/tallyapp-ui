import { Component, Input, OnInit } from '@angular/core';
import { Nft } from '../../../../../core/models/nft';
import { NgStyle } from '@angular/common';
import { Organization, OrganizationTopEmployee } from 'src/app/core/models/organization.model';
import { OrganizationService } from 'src/app/core/services/organization.service';

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
