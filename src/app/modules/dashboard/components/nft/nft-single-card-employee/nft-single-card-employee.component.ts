import { Component, Input, OnInit } from '@angular/core';
import { Nft } from '../../../models/nft';
import { NgStyle, CurrencyPipe } from '@angular/common';

@Component({
    selector: '[nft-single-card-employee]',
    templateUrl: './nft-single-card-employee.component.html',
    standalone: true,
    imports: [NgStyle, CurrencyPipe],
})
export class NftSingleCardEmployeeComponent implements OnInit {
  @Input() nft: Nft = <Nft>{};

  constructor() {}

  ngOnInit(): void {}
}
