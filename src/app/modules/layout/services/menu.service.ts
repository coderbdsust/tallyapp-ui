import { Injectable, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Menu } from 'src/app/core/constants/menu';
import {  MenuItem, SubMenuItem } from 'src/app/core/models/menu.model';
import { AuthService } from '../../auth/services/auth.service';
import packageJson from '../../../../../package.json';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy {
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  private _pagesMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();
  public appJson: any = packageJson;

  constructor(private router: Router, private authService: AuthService) {
    this.initialize();
  }

  private initialize(): void {
    this.authService.user.subscribe((authUser) => {
      this.updateMenuBasedOnUser(authUser);
      this.setupRouterSubscription();
    });
  }

  private updateMenuBasedOnUser(authUser: any): void {
    if (authUser?.modules) {
      const filteredMenu = Menu.getFilteredPages(authUser.modules);
      this._pagesMenu.set(filteredMenu);
    } else {
      this._pagesMenu.set([]);
    }
  }

  private setupRouterSubscription(): void {
    const routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuActiveStates();
      }
    });
    this._subscription.add(routerSub);
  }

  private updateMenuActiveStates(): void {
    this._pagesMenu().forEach((menuGroup) => {
      let activeGroup = false;
      
      menuGroup.items.forEach((menuItem) => {
        const isActive = this.isActive(menuItem.route);
        menuItem.expanded = isActive;
        menuItem.active = isActive;
        
        if (isActive) {
          activeGroup = true;
        }
        
        if (menuItem.children) {
          this.updateChildrenActiveStates(menuItem.children);
        }
      });
      
      menuGroup.active = activeGroup;
    });
  }

  private updateChildrenActiveStates(children: SubMenuItem[]): void {
    children.forEach((child) => {
      const isActive = this.isActive(child.route);
      child.active = isActive;
      
      if (child.children) {
        this.updateChildrenActiveStates(child.children);
      }
    });
  }

  private isActive(route: string | null | undefined): boolean {
    if (!route) return false;
    return this.router.isActive(this.router.createUrlTree([route]), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  // Getters
  get showSideBar(): boolean {
    return this._showSidebar();
  }

  get showMobileMenu(): boolean {
    return this._showMobileMenu();
  }

  get pagesMenu(): MenuItem[] {
    return this._pagesMenu();
  }

  // Setters
  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }

  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  // Public methods
  public toggleSidebar(): void {
    this._showSidebar.set(!this._showSidebar());
  }

  public toggleMenu(menuItem: SubMenuItem): void {
    this.showSideBar = true;
    menuItem.expanded = !menuItem.expanded;
  }

  public toggleSubMenu(subMenuItem: SubMenuItem): void {
    if (subMenuItem.children) {
      subMenuItem.expanded = !subMenuItem.expanded;
    }
  }

  public getAppTitle(): string {
    return this.appJson.displayName || this.appJson.name || 'Application';
  }

  public closeMobileMenu(): void {
    this._showMobileMenu.set(false);
  }

  public openMobileMenu(): void {
    this._showMobileMenu.set(true);
  }

  public navigateAndCloseMobile(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}