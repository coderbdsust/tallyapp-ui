import { Component, OnInit } from '@angular/core';
import { Nft } from '../../../models/nft';
import { NftAuctionsTableItemComponent } from '../nft-auctions-table-item/nft-auctions-table-item.component';
import { NgFor } from '@angular/common';
import { Product } from 'src/app/modules/organization/service/model/product.model';
import { ProductService } from 'src/app/modules/organization/service/product.service';
import { Organization } from 'src/app/modules/organization/service/model/organization.model';
import { OrganizationService } from 'src/app/modules/organization/service/organization.service';

@Component({
    selector: '[nft-auctions-table]',
    templateUrl: './nft-auctions-table.component.html',
    imports: [NgFor, NftAuctionsTableItemComponent]
})
export class NftAuctionsTableComponent implements OnInit {
  public organization:Organization | null = null;
  public products: Product[] = [];

  constructor(private productService: ProductService, private orgService: OrganizationService) {
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if(org) {
        this.organization = org;
        this.loadProductsByOrganization(org.id);
      }
    });
  }

  loadProductsByOrganization(orgId: String) {
    this.productService.getProductByOrganization(orgId,0, 10, '').subscribe({
      next: (response) => {
        this.products = response.content;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }


}
