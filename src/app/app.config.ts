import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { ConfigService } from './servicos/config.service';
import { AuthService } from './servicos/auth.service';

function iniciar(config: ConfigService, auth: AuthService) {
  return async () => {
    await config.carregar();
    await auth.iniciar();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    { provide: APP_INITIALIZER, useFactory: iniciar, deps: [ConfigService, AuthService], multi: true },
  ],
};
