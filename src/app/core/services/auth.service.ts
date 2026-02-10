import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { CommonService } from './common.service';
import { OrganizationService } from './organization.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends CommonService {
  private keycloak = inject(Keycloak);
  private orgService = inject(OrganizationService);

  getUsername(): string {
    return this.keycloak.tokenParsed?.['preferred_username'] ?? '';
  }

  getFullName(): string {
    return this.keycloak.tokenParsed?.['name'] ?? '';
  }

  getRoles(): string[] {
    const realmRoles = this.keycloak.tokenParsed?.['realm_access']?.['roles'] ?? [];
    return realmRoles
      .filter((role: string) => role.startsWith('role.'))
      .map((role: string) => role.substring(5));
  }

  getModules(): string[] {
    const realmRoles = this.keycloak.tokenParsed?.['realm_access']?.['roles'] ?? [];
    return realmRoles
      .filter((role: string) => role.startsWith('module.'))
      .map((role: string) => role.substring(7));
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasModule(module: string): boolean {
    return this.getModules().includes(module);
  }

  logout(): void {
    this.orgService.clearOrganization();
    this.keycloak.logout();
  }
}
