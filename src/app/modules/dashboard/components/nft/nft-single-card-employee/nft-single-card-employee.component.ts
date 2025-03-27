import { Component, Input, OnInit } from '@angular/core';
import { Nft } from '../../../models/nft';
import { NgStyle } from '@angular/common';

@Component({
    selector: '[nft-single-card-employee]',
    templateUrl: './nft-single-card-employee.component.html',
    imports: [NgStyle]
})
export class NftSingleCardEmployeeComponent implements OnInit {
  @Input() nft: Nft = <Nft>{};

  constructor() {}

  ngOnInit(): void {}
}
