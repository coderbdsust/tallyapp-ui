import { Component, OnInit } from '@angular/core';
import { Nft } from '../../../models/nft';
import { NftAuctionsTableItemComponent } from '../nft-auctions-table-item/nft-auctions-table-item.component';
import { NgFor } from '@angular/common';

@Component({
    selector: '[nft-auctions-table]',
    templateUrl: './nft-auctions-table.component.html',
    standalone: true,
    imports: [NgFor, NftAuctionsTableItemComponent],
})
export class NftAuctionsTableComponent implements OnInit {
  public activeAuction: Nft[] = [];

  constructor() {
    this.activeAuction = [
      {
        id: 1346771,
        title: 'Tick Wood Bed',
        creator: 'Md Khalil',
        image:
          './assets/furniture/furniture-bed-01.jpg',
        avatar: './assets/img/profile-male.jpg',
        ending_in: '1h 43m 52s',
        last_bid: 56000,
        price: 60000,
        instant_price: 58000,
      },
      {
        id: 1346772,
        title: 'Dining Table',
        creator: 'Suruj',
        image:
         './assets/furniture/furniture-dining-table-01.jpg',
        avatar: './assets/img/profile-male.jpg',
        ending_in: '2h 00m 02s',
        last_bid: 66000,
        price: 70000,
        instant_price: 68000,
      },
      {
        id: 1346780,
        title: 'King Size Bed',
        creator: 'Md Babul',
        image:
          './assets/furniture/furniture-king-bed-01.jpg',
        avatar: './assets/img/profile-male.jpg',
        ending_in: '1h 05m 00s',
        last_bid: 70000,
        price: 75000,
        instant_price: 72000,
      },
      {
        id: 1346792,
        title: 'Wardrobe',
        creator: 'Md Babul',
        image:
          './assets/furniture/furniture-wardrobe-01.jpg',
        avatar: './assets/img/profile-male.jpg',
        ending_in: '1h 05m 00s',
        last_bid: 40000,
        price: 45000,
        instant_price: 42000,
      },{
        id: 1346793,
        title: 'Sofas',
        creator: 'Md Suruj',
        image:
          './assets/furniture/sofas-01.jpg',
        avatar: './assets/img/profile-male.jpg',
        ending_in: '1h 05m 00s',
        last_bid: 86000,
        price: 90000,
        instant_price: 88000,
      }
    ];
  }

  ngOnInit(): void {}
}
