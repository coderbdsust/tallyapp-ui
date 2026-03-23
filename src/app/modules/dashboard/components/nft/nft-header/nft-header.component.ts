import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-nft-header',
    templateUrl: './nft-header.component.html',
    standalone: true,
    imports: [TranslateModule],
})
export class NftHeaderComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
