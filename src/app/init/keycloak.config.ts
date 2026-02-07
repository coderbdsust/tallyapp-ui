import { ProvideKeycloakOptions } from 'keycloak-angular';
import { environment } from '../../environments/environment';

export const keycloakConfig: ProvideKeycloakOptions = {
  config: {
    url: environment.keycloak.url,
    realm: environment.keycloak.realm,
    clientId: environment.keycloak.clientId
  },
  initOptions: {
    onLoad: 'check-sso',
    checkLoginIframe: false,
    pkceMethod: 'S256'
  }
};
