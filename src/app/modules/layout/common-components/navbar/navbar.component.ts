import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MenuService } from '../../services/menu.service';
import { OrganizationService } from 'src/app/modules/organization/service/organization.service';
import { Organization } from 'src/app/modules/organization/service/model/organization.model';

import { NavbarMobileComponent } from './navbar-mobile/navbar-mobilecomponent';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [AngularSvgIconModule, NavbarMenuComponent, ProfileMenuComponent, NavbarMobileComponent, NgFor, NgIf],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  allOrganizations: Organization[] = [];
  organization: Organization | null = null;
  isOrganizationRoute = false;

  private subscriptions: Subscription[] = [];
  private readonly targetPaths = ['/dashboard', '/employee', '/product', '/invoice','/cash-management'];

  constructor(public menuService: MenuService, public orgService: OrganizationService, private router: Router) { }

  ngOnInit(): void {
    // Check on component init if current url matches target path
    this.checkAndLoadOrganizations(this.router.url);

    // Subscribe to router events to detect navigation changes
    const routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkAndLoadOrganizations(event.url);
      });

    this.subscriptions.push(routerSub);
  }

  // Helper method to check URL and load orgs if needed
  private checkAndLoadOrganizations(url: string): void {
    const match = this.targetPaths.some(path => url.includes(path));
    if (match && !this.isOrganizationRoute) {
      this.isOrganizationRoute = true;
      this.loadOrganizationsAndSubscribe();
    } else if (!match && this.isOrganizationRoute) {
      this.isOrganizationRoute = false;
      // Optionally handle clearing orgs or subscriptions if needed here
    }
  }

  toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }

  loadOrganizationsAndSubscribe(): void {
    // Load organizations once and subscribe to the list
    this.orgService.loadAllOrganizations().subscribe({
      next: () => {
        // Subscribe to organization list
        const orgListSub = this.orgService.allOrganizations$.subscribe((orgs) => {
          this.allOrganizations = orgs;
        });
        this.subscriptions.push(orgListSub);

        // Subscribe to selected organization
        const selectedOrgSub = this.orgService.organization$.subscribe((org) => {
          this.organization = org;
        });
        this.subscriptions.push(selectedOrgSub);
      },
      error: (err) => console.error('Failed to load organizations', err),
    });
  }

  onSelectOrganization(event: Event): void {
    const orgId = (event.target as HTMLSelectElement).value;
    const selectedOrg = this.allOrganizations.find((org) => org.id === orgId) || null;
    this.orgService.setOrganization(selectedOrg);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
