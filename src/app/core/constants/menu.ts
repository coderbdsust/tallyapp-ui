import { MenuItem } from '../models/menu.model';

export class Menu {
  // Define module to menu item mapping
  private static readonly MODULE_MENU_MAP: Record<string, string[]> = {
    'DASHBOARD': ['Dashboard'],
    'EMPLOYEE_MANAGEMENT': ['Employee'],
    'PRODUCT_MANAGEMENT': ['Product'],
    'INVOICE_MANAGEMENT': ['Invoice'],
    'ORGANIZATION_MANAGEMENT': ['Organization'],
    'USER_MANAGEMENT': ['Settings'], // For user management under settings
    'APP_CONFIGURATION': ['Settings'], // For app properties under settings
    'PROFILE': [], // Profile is usually always available
    'REPORTING': [] // Can be added to specific menu items if needed
  };

  // Base menu structure with all possible items
  private static readonly ALL_PAGES: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Dashboard',
          route: '/dashboard',
          requiredModules: ['DASHBOARD'],
          children: [
            { label: 'Home', route: '/dashboard/home' },
            { label: 'Statistics', route: '/dashboard/statistics' },
          ],
        }
      ],
    },
    {
      group: 'Module',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/office.svg',
          label: 'Employee',
          route: '/organization/employee/list',
          requiredModules: ['EMPLOYEE_MANAGEMENT']
        },
        {
          icon: 'assets/icons/heroicons/outline/office.svg',
          label: 'Product',
          route: '/organization/product/list',
          requiredModules: ['PRODUCT_MANAGEMENT']
        },
        {
          icon: 'assets/icons/heroicons/outline/newpaper.svg',
          label: 'Invoice',
          route: '/invoice/list',
          requiredModules: ['INVOICE_MANAGEMENT']
        },
        {
          icon: 'assets/icons/heroicons/outline/building-library.svg',
          label: 'Organization',
          route: '/organization/list',
          requiredModules: ['ORGANIZATION_MANAGEMENT']
        }
      ],
    },
    {
      group: 'Settings',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/cog.svg',
          label: 'Settings',
          route: '/admin',
          requiredModules: ['USER_MANAGEMENT', 'APP_CONFIGURATION'],
          children: [
            { 
              label: 'App Properties', 
              route: '/admin/app-property',
              requiredModules: ['APP_CONFIGURATION']
            },
            { 
              label: 'User Management', 
              route: '/admin/user-management',
              requiredModules: ['USER_MANAGEMENT']
            },
            { 
              label: 'Permission Matrix', 
              route: '/admin/permission-matrix',
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
          .filter(item => !item.children || item.children.length > 0) // Remove parent items with no accessible children
      }))
      .filter(group => group.items.length > 0); // Remove empty groups
  }

  /**
   * Check if user has all required modules for a menu item
   * @param requiredModules Modules required for the menu item
   * @param userModules Modules available to the user
   * @returns Boolean indicating if user has access
   */
  private static hasRequiredModules(requiredModules: string[], userModules: string[]): boolean {
    if (!requiredModules || requiredModules.length === 0) {
      return true; // No specific modules required
    }
    return requiredModules.some(module => userModules.includes(module));
  }

  /**
   * Legacy getter for backward compatibility
   * @deprecated Use getFilteredPages() instead
   */
  public static get pages(): MenuItem[] {
    // Return all pages for backward compatibility
    // In practice, you should use getFilteredPages()
    return this.ALL_PAGES;
  }
}