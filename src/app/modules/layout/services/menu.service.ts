import { Injectable, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Menu } from 'src/app/core/constants/menu';
import { MenuItem, SubMenuItem } from 'src/app/core/models/menu.model';
import { AuthService } from '../../auth/services/auth.service';
import packageJson from '../../../../../package.json';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy, OnInit {
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  private _pagesMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();
  public appJson: any = packageJson;
  

  constructor(private router: Router, private authService: AuthService) {
    this.initialize();
  }

  ngOnInit(): void {
   this.initialize();
  }

  private initialize() {    
    this.authService.user.subscribe((authUser=>{

      if (authUser?.role.includes('ADMIN')) {
        this._pagesMenu.set(Menu.adminPages);
      } else {
        this._pagesMenu.set(Menu.userPages);
      }

      let sub = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          /** Expand menu base on active route */
          this._pagesMenu().forEach((menu) => {
            let activeGroup = false;
            menu.items.forEach((subMenu) => {
              const active = this.isActive(subMenu.route);
              subMenu.expanded = active;
              subMenu.active = active;
              if (active) activeGroup = true;
              if (subMenu.children) {
                this.expand(subMenu.children);
              }
            });
            menu.active = activeGroup;
          });
        }
      });
      this._subscription.add(sub);
    }));

  }
  get showSideBar() {
    return this._showSidebar();
  }
  get showMobileMenu() {
    return this._showMobileMenu();
  }
  get pagesMenu() {
    return this._pagesMenu();
  }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }
  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  public toggleSidebar() {
    this._showSidebar.set(!this._showSidebar());
  }

  public toggleMenu(menu: any) {
    this.showSideBar = true;
    menu.expanded = !menu.expanded;
  }

  public toggleSubMenu(submenu: SubMenuItem) {
    submenu.expanded = !submenu.expanded;
  }

  private expand(items: Array<any>) {
    items.forEach((item) => {
      item.expanded = this.isActive(item.route);
      if (item.children) this.expand(item.children);
    });
  }

  private isActive(instruction: any): boolean {
    return this.router.isActive(this.router.createUrlTree([instruction]), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  public getAppTitle():string{
    return this.appJson.displayName;
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
