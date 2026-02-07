```
import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly keycloak = inject(Keycloak);

  getUsername(): string {
    return this.keycloak.tokenParsed?.['preferred_username'] ?? '';
  }

  getRoles(): string[] {
    const roles: string[] = [];
    const realmAccess = this.keycloak.realmAccess;
    if (realmAccess?.roles) {
      for (const role of realmAccess.roles) {
        if (role.startsWith("role.")) {
          roles.push(role.split(".")[1]);
        }
      }
    }
    return [...new Set(roles)];
  }

  getModules(): string[] {
    const modules: string[] = [];
    const realmAccess = this.keycloak.realmAccess;
    if (realmAccess?.roles) {
      for (const role of realmAccess.roles) {
        if (role.startsWith("module.")) {
          modules.push(role.split(".")[1]);
        }
      }
    }
    return [...new Set(modules)];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasModule(module: string): boolean {
    return this.getModules().includes(module);
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
```


```
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideKeycloak,
  includeBearerTokenInterceptor,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition
} from 'keycloak-angular';
import { routes } from './app.routes';
import { keycloakConfig } from './init/keycloak.config';

const apiTokenCondition: IncludeBearerTokenCondition = {
  urlPattern: /^http:\/\/localhost:9099\/api\/.*/i
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [apiTokenCondition]
    },
    provideKeycloak(keycloakConfig)
  ]
};
```


```
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { CashComponent } from './components/cash/cash.component';
import { AppConfigComponent } from './components/app-config/app-config.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'invoice', component: InvoiceComponent, canActivate: [authGuard], data: { roles: ['USER'] } },
  { path: 'cash', component: CashComponent, canActivate: [authGuard], data: { roles: ['MANAGER'] } },
  { path: 'app-config', component: AppConfigComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '**', redirectTo: '' }
];

```

replace current authentication with keycloak "Login with Keycloak" in Home Page, follow this coding example, render dynamic menu based on roles, change package if necessary.