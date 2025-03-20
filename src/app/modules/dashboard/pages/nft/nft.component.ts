import { Component, OnInit } from '@angular/core';
import { Nft } from '../../models/nft';
import { NftAuctionsTableComponent } from '../../components/nft/nft-auctions-table/nft-auctions-table.component';
import { NftChartCardComponent } from '../../components/nft/nft-chart-card/nft-chart-card.component';
import { NftSingleCardComponent } from '../../components/nft/nft-single-card/nft-single-card.component';
import { NftDualCardComponent } from '../../components/nft/nft-dual-card/nft-dual-card.component';
import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { NftSingleCardEmployeeComponent } from '../../components/nft/nft-single-card-employee/nft-single-card-employee.component';

@Component({
    selector: 'app-nft',
    templateUrl: './nft.component.html',
    standalone: true,
    imports: [
        NftHeaderComponent,
        NftDualCardComponent,
        NftSingleCardComponent,
        NftSingleCardEmployeeComponent,
        NftChartCardComponent,
        NftAuctionsTableComponent,
    ],
})
export class NftComponent implements OnInit {
  nft: Array<Nft>;

  constructor() {
    this.nft = [
      {
        id: 34356771,
        title: 'Shop Name',
        creator: 'Creator Name',
        startAt: '8am Morning',
        image: './assets/furniture/furniture-01.png',
        avatar: './assets/avatars/avt-01.jpg',
      },
      {
        id: 34356771,
        title: 'Shop Name',
        creator: 'Creator Name',
        startAt: '8am Morning',
        image: './assets/furniture/furniture-01.png',
        avatar: './assets/avatars/avt-01.jpg',
        topEmployee:'Chan Mia',
        topEmployeeMonth:'October-2024'
      },
      {
        id: 34356771,
        title: 'Shop Name',
        creator: 'Creator Name',
        startAt: '8am Morning',
        image: './assets/furniture/furniture-01.png',
        avatar: './assets/avatars/avt-01.jpg',
        totalEmployee:20
      }
    ];
  }

  ngOnInit(): void {}
}
