import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobilecomponent';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';
import { Organization } from 'src/app/modules/organization/service/model/organization.model';
import { OrganizationService } from 'src/app/modules/organization/service/organization.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    imports: [
        AngularSvgIconModule,
        NavbarMenuComponent,
        ProfileMenuComponent,
        NavbarMobileComponent,
        NgFor,
        NgIf
    ]
})
export class NavbarComponent implements OnInit {

  allOrganizations: Organization[] = [];
  organzation: Organization | null = null;
  isOrganizationRoute = false;
  targetPaths = ['/dashboard', '/employee', '/product','/invoice'];
  
  constructor(public menuService: MenuService, public orgService: OrganizationService, private router: Router) { 
    this.router.events.subscribe(() => {
      this.isOrganizationRoute = this.targetPaths.some(path => this.router.url.includes(path));
    });
  }

  ngOnInit(): void {

    this.orgService.organization$.subscribe((org) => {  
      if(org) {
        this.organzation = org;
      }
    });

    if(this.allOrganizations.length === 0) {
       this.loadOrganizations();
    }
  }

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }

  loadOrganizations() {
    this.orgService.getOrganizations().subscribe({
      next: (response) => {
        this.allOrganizations = response;
        if(this.allOrganizations && this.allOrganizations.length>0 && this.orgService.getSelectedOrganization() === null) {
          this.orgService.setOrganization(this.allOrganizations[0]);
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
      }
    });
  }

  onSelectOrganization(event:Event){
    const orgId = (event.target as HTMLSelectElement).value;
    let organization = this.allOrganizations.find(org => org.id === orgId) || null;
    this.orgService.setOrganization(organization);
  }

}
