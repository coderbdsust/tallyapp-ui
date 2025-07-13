import { Component, Input, OnInit } from '@angular/core';
import { Nft } from '../../../../../core/models/nft';
import { NgStyle } from '@angular/common';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { Organization } from 'src/app/core/models/organization.model';
import { Router } from '@angular/router';

@Component({
    selector: '[nft-dual-card]',
    templateUrl: './nft-dual-card.component.html',
    imports: [NgStyle]
})
export class NftDualCardComponent implements OnInit {
  @Input() nft: Nft = <Nft>{};
  org: Organization | undefined;

  constructor(public orgService: OrganizationService, private readonly _router: Router) {

  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if(org) {
        this.org = org;
      }
    });
  }

  viewOrganization(){
    this._router.navigate([`/organization/detail`]);
  }
}
