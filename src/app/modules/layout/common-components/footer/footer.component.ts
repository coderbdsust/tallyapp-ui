import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../../../core/services/menu.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: true,
})
export class FooterComponent implements OnInit {

  public year: number = new Date().getFullYear();

  constructor(public menuService:MenuService) { }

  ngOnInit(): void { }
}
