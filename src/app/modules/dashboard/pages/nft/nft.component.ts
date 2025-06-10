import { Component, OnInit } from '@angular/core';
import { NftAuctionsTableComponent } from '../../components/nft/nft-auctions-table/nft-auctions-table.component';
import { NftChartCardComponent } from '../../components/nft/nft-chart-card/nft-chart-card.component';
import { NftDualCardComponent } from '../../components/nft/nft-dual-card/nft-dual-card.component';

@Component({
    selector: 'app-nft',
    templateUrl: './nft.component.html',
    imports: [
        NftDualCardComponent,
        NftAuctionsTableComponent,
        NftChartCardComponent
    ]
})
export class NftComponent implements OnInit {
  
  constructor() {}

  ngOnInit(): void {}
}
