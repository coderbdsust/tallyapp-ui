import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobilecomponent';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor } from '@angular/common';
import { Organization } from 'src/app/modules/organization/service/model/organization.model';
import { OrganizationService } from 'src/app/modules/organization/service/organization.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    imports: [
        AngularSvgIconModule,
        NavbarMenuComponent,
        ProfileMenuComponent,
        NavbarMobileComponent,
        NgFor
    ]
})
export class NavbarComponent implements OnInit {

  allOrganizations: Organization[] = [];
  organzation: Organization | null = null;
  
  constructor(public menuService: MenuService, public orgService: OrganizationService) { }

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
