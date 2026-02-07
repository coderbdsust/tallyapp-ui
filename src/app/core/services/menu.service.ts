import { Injectable, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Menu } from 'src/app/core/constants/menu';
import { MenuItem, SubMenuItem } from 'src/app/core/models/menu.model';
import { AuthService } from './auth.service';
import packageJson from '../../../../package.json';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy {
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  private _pagesMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();
  public appJson: any = packageJson;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    this.initialize();
  }

  private initialize(): void {
    this.updateMenuBasedOnModules();
    this.setupRouterSubscription();
  }

  private updateMenuBasedOnModules(): void {
    const modules = this.authService.getModules();
    if (modules.length > 0) {
      const filteredMenu = Menu.getFilteredPages(modules);
      this._pagesMenu.set(filteredMenu);
    } else {
      this._pagesMenu.set([]);
    }
  }

  private setupRouterSubscription(): void {
    const routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // console.log('Navigation ended:', event.url);
        this.updateMenuActiveStates();
      }
    });
    this._subscription.add(routerSub);
  }

  private updateMenuActiveStates(): void {
    const currentUrl = this.router.url;
    const urlTree = this.router.parseUrl(currentUrl);
    
    // console.log('Current URL:', currentUrl);
    // console.log('Current Query Params:', urlTree.queryParams);

    this._pagesMenu().forEach((menuGroup) => {
      let activeGroup = false;
      
      menuGroup.items.forEach((menuItem) => {
        const isActive = this.isActiveWithParams(menuItem);
        menuItem.expanded = isActive;
        menuItem.active = isActive;
        
        if (isActive) {
          activeGroup = true;
          // console.log('Active menu item:', menuItem.label);
        }
        
        if (menuItem.children) {
          const hasActiveChild = this.updateChildrenActiveStates(menuItem.children);
          if (hasActiveChild) {
            menuItem.expanded = true;
            activeGroup = true;
          }
        }
      });
      
      menuGroup.active = activeGroup;
    });
  }

  private updateChildrenActiveStates(children: SubMenuItem[]): boolean {
    let hasActiveChild = false;
    
    children.forEach((child) => {
      const isActive = this.isActiveWithParams(child);
      child.active = isActive;
      
      if (isActive) {
        hasActiveChild = true;
        // console.log('Active child menu item:', child.label, 'Query Params:', child.queryParams);
      }
      
      if (child.children) {
        const hasActiveNestedChild = this.updateChildrenActiveStates(child.children);
        if (hasActiveNestedChild) {
          child.expanded = true;
          hasActiveChild = true;
        }
      }
    });
    
    return hasActiveChild;
  }

  /**
   * Enhanced method to check if a menu item is active, considering query parameters
   */
  private isActiveWithParams(menuItem: SubMenuItem): boolean {
    if (!menuItem.route) return false;

    const currentUrl = this.router.url;
    const currentUrlTree = this.router.parseUrl(currentUrl);
    const currentPath = currentUrlTree.root.children['primary']?.segments.map(s => s.path).join('/') || '';
    const menuPath = menuItem.route.startsWith('/') ? menuItem.route.substring(1) : menuItem.route;

    // Debug logging
    // console.log('Checking menu item:', {
    //   label: menuItem.label,
    //   route: menuItem.route,
    //   queryParams: menuItem.queryParams,
    //   currentPath: currentPath,
    //   menuPath: menuPath,
    //   currentQueryParams: currentUrlTree.queryParams
    // });

    // Check if the base route matches
    const routeMatches = currentPath === menuPath || currentPath.startsWith(menuPath + '/');
    
    if (!routeMatches) {
      return false;
    }

    // If menu item has query parameters, they must match exactly
    if (menuItem.queryParams && Object.keys(menuItem.queryParams).length > 0) {
      const paramsMatch = this.queryParamsMatch(currentUrlTree.queryParams, menuItem.queryParams);
      console.log('Query params match result for', menuItem.label, ':', paramsMatch);
      return paramsMatch;
    }

    // If menu item has no query params, it's active only if:
    // 1. Current URL has no query params, OR
    // 2. This is a parent menu item (we'll be lenient for parent items)
    if (!menuItem.queryParams || Object.keys(menuItem.queryParams).length === 0) {
      // If current URL has query params but menu item doesn't, it's not active
      // This prevents parent "Transaction" from being active when a child is active
      const hasCurrentQueryParams = Object.keys(currentUrlTree.queryParams).length > 0;
      return !hasCurrentQueryParams;
    }

    return false;
  }

  /**
   * Check if query parameters match exactly
   */
  private queryParamsMatch(currentParams: any, expectedParams: any): boolean {
    const expectedKeys = Object.keys(expectedParams);
    
    // Check if all expected params are present and match
    const allMatch = expectedKeys.every(key => {
      const expected = expectedParams[key]?.toString();
      const current = currentParams[key]?.toString();
      console.log(`Comparing ${key}: expected="${expected}", current="${current}"`);
      return current === expected;
    });

    return allMatch;
  }

  /**
   * Navigate to a menu item with proper query parameter handling
   */
  public navigateToMenuItem(menuItem: SubMenuItem): void {
    if (!menuItem.route) return;

    // console.log('Navigating to menu item:', {
    //   label: menuItem.label,
    //   route: menuItem.route,
    //   queryParams: menuItem.queryParams
    // });

    if (menuItem.queryParams && Object.keys(menuItem.queryParams).length > 0) {
      this.router.navigate([menuItem.route], { 
        queryParams: menuItem.queryParams,
        queryParamsHandling: 'replace' // This ensures query params are replaced, not merged
      });
    } else {
      this.router.navigate([menuItem.route]);
    }
    
    this.closeMobileMenu();
  }

  /**
   * Alternative navigation method that preserves existing query params
   */
  public navigateToMenuItemMergeParams(menuItem: SubMenuItem): void {
    if (!menuItem.route) return;

    if (menuItem.queryParams && Object.keys(menuItem.queryParams).length > 0) {
      this.router.navigate([menuItem.route], { 
        queryParams: menuItem.queryParams,
        queryParamsHandling: 'merge' // This merges with existing query params
      });
    } else {
      this.router.navigate([menuItem.route]);
    }
    
    this.closeMobileMenu();
  }

  /**
   * Direct navigation with explicit query parameters
   */
  public navigateWithQueryParams(route: string, queryParams: { [key: string]: any }): void {
    console.log('Direct navigation:', { route, queryParams });
    
    this.router.navigate([route], {
      queryParams: queryParams,
      queryParamsHandling: 'replace'
    });
    
    this.closeMobileMenu();
  }

  // Keep your original methods for backward compatibility
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

  public navigateAndCloseMobile(route: string, queryParams?: { [key: string]: any }): void {
    if (queryParams) {
      this.router.navigate([route], { 
        queryParams,
        queryParamsHandling: 'replace'
      });
    } else {
      this.router.navigate([route]);
    }
    this.closeMobileMenu();
  }

  // Getters and setters
  get showSideBar(): boolean {
    return this._showSidebar();
  }

  get showMobileMenu(): boolean {
    return this._showMobileMenu();
  }

  get pagesMenu(): MenuItem[] {
    return this._pagesMenu();
  }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }

  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
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

  /**
   * Get current route info for debugging
   */
  public getCurrentRouteInfo(): any {
    const currentUrl = this.router.url;
    const urlTree = this.router.parseUrl(currentUrl);
    
    return {
      fullUrl: currentUrl,
      path: urlTree.root.children['primary']?.segments.map(s => s.path).join('/') || '',
      queryParams: urlTree.queryParams,
      fragment: urlTree.fragment
    };
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}