export const environment = {
  production: true,
  tallyURL: 'http://localhost:8080/tallyapp',
  TALLY_APP:"TALLY_CREDENTIALS",
  TALLY_ORGANIZATION:"TALLY_ORGANIZATION",
  keycloak: {
    url: 'http://localhost:9090',
    realm: 'tallyapp',
    clientId: 'tallyapp-web'
  }
};
