import { Component, Input, OnInit } from '@angular/core';
import { Nft } from '../../../../../core/models/nft';
import { NgStyle } from '@angular/common';
import { Organization } from 'src/app/core/models/organization.model';
import { OrganizationService } from 'src/app/core/services/organization.service';

@Component({
  selector: '[nft-single-card-employee]',
  templateUrl: './nft-single-card-employee.component.html',
  imports: [NgStyle],
})
export class NftSingleCardEmployeeComponent implements OnInit {
  organization: Organization | null = null;
  totalEmployee: Number = 0;

  constructor(private orgService: OrganizationService) {}

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.organization = org;
        this.totalEmployeeByOrganzation(org.id);
      }
    });
  }

  totalEmployeeByOrganzation(orgId: string) {
    this.orgService.getTotalEmployeeByOrganization(orgId).subscribe({
      next: (response) => {
        this.totalEmployee = response;
      },
    });
  }
}
