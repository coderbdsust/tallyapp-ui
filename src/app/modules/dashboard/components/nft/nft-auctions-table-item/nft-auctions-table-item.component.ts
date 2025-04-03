import { Component, Input, OnInit } from '@angular/core';
import { Nft } from '../../../models/nft';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Product } from 'src/app/modules/organization/service/model/product.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: '[nft-auctions-table-item]',
    templateUrl: './nft-auctions-table-item.component.html',
    imports: [AngularSvgIconModule, CommonModule]
})
export class NftAuctionsTableItemComponent implements OnInit {
  @Input() product = <Product>{};

  constructor() {}

  ngOnInit(): void {}
}
