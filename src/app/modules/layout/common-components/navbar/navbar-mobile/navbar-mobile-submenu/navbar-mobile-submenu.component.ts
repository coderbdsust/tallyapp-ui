import { Component, Input, OnInit } from '@angular/core';
import { MenuService } from 'src/app/core/services/menu.service';
import { SubMenuItem } from 'src/app/core/models/menu.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-navbar-mobile-submenu',
    templateUrl: './navbar-mobile-submenu.component.html',
    styleUrls: ['./navbar-mobile-submenu.component.scss'],
    imports: [
        NgClass,
        NgFor,
        NgTemplateOutlet,
        RouterLinkActive,
        RouterLink,
        AngularSvgIconModule,
    ]
})
export class NavbarMobileSubmenuComponent implements OnInit {
  @Input() public submenu = <SubMenuItem>{};

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {}

  public toggleMenu(menu: any) {
    this.menuService.toggleSubMenu(menu);
  }

  private collapse(items: Array<any>) {
    items.forEach((item) => {
      item.expanded = false;
      if (item.children) this.collapse(item.children);
    });
  }

  public closeMobileMenu() {
    this.menuService.showMobileMenu = false;
  }
}
