import { Component, OnInit } from '@angular/core';
import { Nft } from '../../models/nft';
import { NftAuctionsTableComponent } from '../../components/nft/nft-auctions-table/nft-auctions-table.component';
import { NftChartCardComponent } from '../../components/nft/nft-chart-card/nft-chart-card.component';
import { NftSingleCardComponent } from '../../components/nft/nft-single-card/nft-single-card.component';
import { NftDualCardComponent } from '../../components/nft/nft-dual-card/nft-dual-card.component';
import { NftSingleCardEmployeeComponent } from '../../components/nft/nft-single-card-employee/nft-single-card-employee.component';

@Component({
    selector: 'app-nft',
    templateUrl: './nft.component.html',
    imports: [
        NftDualCardComponent,
        NftSingleCardComponent,
        NftSingleCardEmployeeComponent,
        NftAuctionsTableComponent,
    ]
})
export class NftComponent implements OnInit {
  
  constructor() {}

  ngOnInit(): void {}
}
