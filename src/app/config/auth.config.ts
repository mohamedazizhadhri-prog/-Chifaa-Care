import { environment } from '../../environments/environment';

export const authConfig = {
  domain: environment.auth0Domain,
  clientId: environment.auth0ClientId,
  authorizationParams: {
    redirect_uri: window.location.origin + '/callback',
    audience: environment.auth0Audience,
    scope: 'openid profile email'
  },
  httpInterceptor: {
    allowedList: [
      {
        uri: `${environment.apiUrl}/*`,
        tokenOptions: {
          authorizationParams: {
            audience: environment.auth0Audience,
            scope: 'openid profile email'
          }
        }
      }
    ]
  }
};
