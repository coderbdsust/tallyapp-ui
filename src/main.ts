import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { LoaderService } from './app/core/services/loader.service';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { LanguageInterceptor } from './app/core/interceptor/language-interceptor.service';
import { provideKeycloak, includeBearerTokenInterceptor, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG } from 'keycloak-angular';
import { keycloakConfig } from './app/init/keycloak.config';

if (environment.production) {
  enableProdMode();
  //show this warning only on prod mode
  if (window) {
    selfXSSWarning();
  }
}

bootstrapApplication(AppComponent, {
  providers: [
      importProvidersFrom(BrowserModule, AppRoutingModule),
      provideAnimations(),
      provideKeycloak(keycloakConfig),
      provideHttpClient(
        withInterceptors([includeBearerTokenInterceptor]),
        withInterceptorsFromDi()
      ),
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [
          {
            urlPattern: new RegExp(`^${environment.tallyURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$`),
          },
        ],
      },
      { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
      LoaderService,
      provideAngularSvgIcon()
    ],
}).catch((err) => console.error(err));

function selfXSSWarning() {
  setTimeout(() => {
    console.log(
      '%c** STOP **',
      'font-weight:bold; font: 2.5em Arial; color: white; background-color: #e11d48; padding-left: 15px; padding-right: 15px; border-radius: 25px; padding-top: 5px; padding-bottom: 5px;',
    );
    console.log(
      `\n%cThis is a browser feature intended for developers. Using this console may allow attackers to impersonate you and steal your information sing an attack called Self-XSS. Do not enter or paste code that you do not understand.`,
      'font-weight:bold; font: 2em Arial; color: #e11d48;',
    );
  });
}
