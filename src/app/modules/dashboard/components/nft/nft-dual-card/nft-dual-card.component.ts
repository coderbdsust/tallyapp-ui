import { Component, Input, OnInit } from '@angular/core';
import { Nft } from '../../../models/nft';
import { NgStyle, CurrencyPipe } from '@angular/common';
import { OrganizationService } from 'src/app/modules/organization/service/organization.service';
import { Organization } from 'src/app/modules/organization/service/organization.model';
import { Router } from '@angular/router';

@Component({
    selector: '[nft-dual-card]',
    templateUrl: './nft-dual-card.component.html',
    imports: [NgStyle, CurrencyPipe]
})
export class NftDualCardComponent implements OnInit {
  @Input() nft: Nft = <Nft>{};
  org: Organization | undefined;

  constructor(public orgService: OrganizationService, private readonly _router: Router) {
    this.loadOrganizations();
  }

  ngOnInit(): void {}

  private loadOrganizations() {
    this.orgService.getOrganizations().subscribe({
      next: (organizations) => {
        if(organizations  && organizations.length>0){
          this.org = organizations[0];
        }
      },
      error: (err) => {
        this.orgService.mapErrorResponse(err);
      },
    });
  }

  viewOrganization(){
    this._router.navigate([`/organization/detail`]);
  }
}
