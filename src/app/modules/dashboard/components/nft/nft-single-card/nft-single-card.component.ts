import { Component, Input, OnInit } from '@angular/core';
import { Nft } from '../../../models/nft';
import { NgStyle } from '@angular/common';

@Component({
    selector: '[nft-single-card]',
    templateUrl: './nft-single-card.component.html',
    imports: [NgStyle]
})
export class NftSingleCardComponent implements OnInit {
  @Input() nft: Nft = <Nft>{};

  constructor() {}

  ngOnInit(): void {}
}
