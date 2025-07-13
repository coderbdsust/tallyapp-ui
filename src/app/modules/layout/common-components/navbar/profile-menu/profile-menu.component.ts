import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { ClickOutsideDirective } from '../../../../../common/directives/click-outside.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ThemeService } from '../../../../../core/services/theme.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from 'src/app/core/services/auth.service';
import { map, take } from 'rxjs';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { RolePipe } from 'src/app/common/pipes/role.pipe';

@Component({
    selector: 'app-profile-menu',
    templateUrl: './profile-menu.component.html',
    styleUrls: ['./profile-menu.component.scss'],
    imports: [ClickOutsideDirective, NgClass, RouterLink, AngularSvgIconModule, CommonModule, NgIf, RolePipe],
    animations: [
        trigger('openClose', [
            state('open', style({
                opacity: 1,
                transform: 'translateY(0)',
                visibility: 'visible',
            })),
            state('closed', style({
                opacity: 0,
                transform: 'translateY(-20px)',
                visibility: 'hidden',
            })),
            transition('open => closed', [animate('0.2s')]),
            transition('closed => open', [animate('0.2s')]),
        ]),
    ]
})
export class ProfileMenuComponent implements OnInit {
  public isOpen = false;
  public selectedLanguage = localStorage.getItem('app-language')||'en';
  public menuItem: { title: string; icon: string; link: string }[] = [];

  public logoutItem = {
    title: 'Log out',
    icon: './assets/icons/heroicons/outline/logout.svg',
    link: '/auth',
  };

  public profileMenuUser = [
    {
      title: 'My Profile',
      icon: './assets/icons/heroicons/outline/user-circle.svg',
      link: '/user/profile',
    },
    {
      title: 'Change Password',
      icon: './assets/icons/heroicons/outline/wrench.svg',
      link: '/user/change-password',
    }
  ];

  public themeColors = [
    {
      name: 'base',
      code: '#e11d48',
    },
    {
      name: 'yellow',
      code: '#f59e0b',
    },
    {
      name: 'green',
      code: '#22c55e',
    },
    {
      name: 'blue',
      code: '#3b82f6',
    },
    {
      name: 'orange',
      code: '#ea580c',
    },
    {
      name: 'red',
      code: '#cc0022',
    },
    {
      name: 'violet',
      code: '#6d28d9',
    },
  ];

  public themeMode = ['light', 'dark'];

  constructor(public themeService: ThemeService, public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.getMenu();
  }

  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  toggleThemeMode() {
    this.themeService.theme.update((theme) => {
      const mode = !this.themeService.isDark ? 'dark' : 'light';
      return { ...theme, mode: mode };
    });
  }

  toggleThemeColor(color: string) {
    this.themeService.theme.update((theme) => {
      return { ...theme, color: color };
    });
  }

  onLogout() {
    this.authService.logout();
  }


  public getMenu(): void {
    this.authService.user.pipe(
      take(1),
      map(user => (this.profileMenuUser))
    ).subscribe(menu => {
      this.menuItem = menu; // Assign the resolved menu array
    });
  }

  onLanguageChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value;
    if (lang && lang !== '-1') {
      this.selectedLanguage = lang;
      localStorage.setItem('app-language', lang);
    }
  }


}
