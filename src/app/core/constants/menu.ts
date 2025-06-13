import { MenuItem } from '../models/menu.model';

export class Menu {
  public static userPages: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Dashboard',
          route: '/dashboard',
          children: [
            { label: 'Home', route: '/dashboard/home' },
            { label: 'Statistics', route: '/dashboard/statistics' },
          ],
        }
      ],
    }
  ];

    public static managerPages: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Dashboard',
          route: '/dashboard',
          children: [
            { label: 'Home', route: '/dashboard/home' },
            { label: 'Statistics', route: '/dashboard/statistics' },
          ],
        }
      ],
    },
    {
      group: 'Manager',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/office.svg',
          label: 'Organization',
          route: '/organization',
          children: [
            { label: 'Employee', route: '/organization/employee/list' },
            { label: 'Product', route: '/organization/product/list' }
          ]
        },
        {
         icon: 'assets/icons/heroicons/outline/building-library.svg',
          label: 'Manage',
          route: '/organization',
          children: [
            { label: 'Organization', route: '/organization/list' },
          ]
        }
      ],
    },
  ];

  public static adminPages: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Dashboard',
          route: '/dashboard',
          children: [
            { label: 'Home', route: '/dashboard/home' },
            { label: 'Statistics', route: '/dashboard/statistics' },
          ],
        }
      ],
    },
    {
      group: 'Admin',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/office.svg',
          label: 'Organization',
          route: '/organization',
          children: [
            { label: 'Employee', route: '/organization/employee/list' },
            { label: 'Product', route: '/organization/product/list' }
          ]
        },
        {
          icon: 'assets/icons/heroicons/outline/newpaper.svg',
          label: 'Invoice Management',
          route: '/invoice',
          children: [
            { label: 'Invoice', route: '/invoice/list' }
          ]
        },
        {
         icon: 'assets/icons/heroicons/outline/building-library.svg',
          label: 'Manage',
          route: '/organization',
          children: [
            { label: 'Organization', route: '/organization/list' },
          ]
        },
        {
          icon: 'assets/icons/heroicons/outline/cog.svg',
          label: 'Settings',
          route: '/admin',
          children: [
            { label: 'App Properties', route: '/admin/app-property' },
            { label: 'User Management', route: '/admin/user-management' }
          ]
        }
      ],
    },
  ];
}
