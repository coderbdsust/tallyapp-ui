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
            { label: 'Nfts', route: '/dashboard/nfts' },
            { label: 'Statistics', route: '/dashboard/statistics' },
          ],
        }
      ],
    }
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
            { label: 'Nfts', route: '/dashboard/nfts' },
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
          icon: 'assets/icons/heroicons/outline/cog.svg',
          label: 'Settings',
          route: '/settings',
          children: [
            { label: 'App Properties', route: '/admin/app-property' },
            { label: 'User Management', route: '/admin/user-management' }
          ]
        }
      ],
    },
  ];
}
