import { MenuItem } from '../models/menu.model';

export class Menu {
  // Define module to menu item mapping
  private static readonly MODULE_MENU_MAP: Record<string, string[]> = {
    'DASHBOARD': ['MENU.DASHBOARD'],
    'EMPLOYEE_MANAGEMENT': ['MENU.EMPLOYEE'],
    'PRODUCT_MANAGEMENT': ['MENU.PRODUCT'],
    'INVOICE_MANAGEMENT': ['MENU.INVOICE'],
    'ORGANIZATION_MANAGEMENT': ['MENU.ORGANIZATION'],
    'SUPPLIER_MANAGEMENT': ['MENU.SUPPLIER'],
    'CASH_MANAGEMENT': ['MENU.CASH_MANAGEMENT'],
    'USER_MANAGEMENT': ['MENU.SETTINGS'],
    'APP_CONFIGURATION': ['MENU.SETTINGS'],
    'PROFILE': [],
    'REPORTING': ['MENU.REPORT']
  };

  // Base menu structure with all possible items
  private static readonly ALL_PAGES: MenuItem[] = [
    {
      group: 'MENU.BASE',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'MENU.DASHBOARD',
          route: '/dashboard',
          requiredModules: ['DASHBOARD'],
          children: [
            { label: 'MENU.HOME', route: '/dashboard/home' }
          ],
        }
      ],
    },
    {
      group: 'MENU.MODULE',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/building-library.svg',
          label: 'MENU.ORGANIZATION',
          route: '/organization/list',
          requiredModules: ['ORGANIZATION_MANAGEMENT']
        },
        {
          icon: 'assets/icons/heroicons/outline/banknotes.svg',
          label: 'MENU.CASH_MANAGEMENT',
          route: '/cash-management',
          requiredModules: ['CASH_MANAGEMENT']
        },
        {
          icon: 'assets/icons/heroicons/outline/user.svg',
          label: 'MENU.EMPLOYEE',
          route: '/employee',
          requiredModules: ['EMPLOYEE_MANAGEMENT']
        },
        {
          icon: 'assets/icons/heroicons/outline/cart.svg',
          label: 'MENU.PRODUCT',
          route: '/product',
          requiredModules: ['PRODUCT_MANAGEMENT']
        },
        {
          icon: 'assets/icons/heroicons/outline/newpaper.svg',
          label: 'MENU.INVOICE',
          route: '/invoice',
          requiredModules: ['INVOICE_MANAGEMENT'],
          children: [
            { label: 'MENU.INVOICES', route: '/invoice/list' },
            { label: 'MENU.CUSTOMERS', route: '/invoice/customer' },
            { label: 'MENU.SALES_RETURN', route: '/invoice/sales-return' }
          ]
        },
        {
          icon: 'assets/icons/heroicons/outline/newpaper.svg',
          label: 'MENU.QUOTATION',
          route: '/quotation/list',
          requiredModules: ['QUOTATION_MANAGEMENT']
        },
        {
          icon: 'assets/icons/heroicons/outline/cube.svg',
          label: 'MENU.SUPPLIER',
          route: '/supplier',
          requiredModules: ['SUPPLIER_MANAGEMENT'],
          children: [
            { label: 'MENU.SUPPLIERS', route: '/supplier/list' },
            { label: 'MENU.PURCHASE_ORDERS', route: '/supplier/purchase-order' }
          ]
        },
        {
          icon: 'assets/icons/heroicons/outline/document-text.svg',
          label: 'MENU.REPORT',
          route: '/report',
          requiredModules: ['REPORTING']
        }
      ],
    },
    {
      group: 'MENU.SUPER_ADMIN',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/cog.svg',
          label: 'MENU.SETTINGS',
          route: '/admin',
          requiredModules: ['USER_MANAGEMENT', 'APP_CONFIGURATION'],
          children: [
            {
              label: 'MENU.USER_MANAGEMENT',
              route: '/admin/user-management',
              requiredModules: ['USER_MANAGEMENT']
            }
          ]
        }
      ]
    }
  ];

  /**
   * Get filtered menu items based on user's available modules
   * @param userModules Array of modules the user has access to
   * @returns Filtered menu items
   */
  public static getFilteredPages(userModules: string[]): MenuItem[] {
    return this.ALL_PAGES
      .map(group => ({
        ...group,
        items: group.items
          .filter(item => this.hasRequiredModules(item.requiredModules || [], userModules))
          .map(item => ({
            ...item,
            children: item.children?.filter(child =>
              this.hasRequiredModules(child.requiredModules || [], userModules)
            )
          }))
          .filter(item => !item.children || item.children.length > 0)
      }))
      .filter(group => group.items.length > 0);
  }

  /**
   * Check if user has all required modules for a menu item
   * @param requiredModules Modules required for the menu item
   * @param userModules Modules available to the user
   * @returns Boolean indicating if user has access
   */
  private static hasRequiredModules(requiredModules: string[], userModules: string[]): boolean {
    if (!requiredModules || requiredModules.length === 0) {
      return true;
    }
    return requiredModules.some(module => userModules.includes(module));
  }

  /**
   * Find a menu item by route and query parameters
   * @param route The route to search for
   * @param queryParams Optional query parameters to match
   * @returns The matching menu item or null
   */
  public static findMenuItemByRoute(route: string, queryParams?: { [key: string]: any }): any {
    for (const group of this.ALL_PAGES) {
      for (const item of group.items) {
        if (this.matchesRouteAndParams(item, route, queryParams)) {
          return item;
        }
        
        if (item.children) {
          for (const child of item.children) {
            if (this.matchesRouteAndParams(child, route, queryParams)) {
              return child;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Helper method to check if a menu item matches route and query parameters
   */
  private static matchesRouteAndParams(
    item: any, 
    route: string, 
    queryParams?: { [key: string]: any }
  ): boolean {
    if (item.route !== route) {
      return false;
    }

    // If no query params specified, match any item with the route
    if (!queryParams) {
      return true;
    }

    // If query params specified, they must match exactly
    if (!item.queryParams) {
      return Object.keys(queryParams).length === 0;
    }

    return Object.entries(queryParams).every(([key, value]) => 
      item.queryParams[key] === value
    );
  }

  /**
   * Legacy getter for backward compatibility
   * @deprecated Use getFilteredPages() instead
   */
  public static get pages(): MenuItem[] {
    return this.ALL_PAGES;
  }
}