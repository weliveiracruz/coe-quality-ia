import { Injectable, signal } from '@angular/core';
import { PublicClientApplication, type AccountInfo } from '@azure/msal-browser';
import { ConfigService } from './config.service';

/**
 * Login com o SSO corporativo (Microsoft Entra ID / Azure AD) via MSAL.
 * O site é de consulta: não há papéis. Basta estar autenticado.
 * Sem clientId em config.json, roda em modo demonstração (sem login), útil para desenvolvimento e testes.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly usuario = signal<{ nome: string } | null>(null);
  readonly modoDemonstracao = signal(true);
  private msal?: PublicClientApplication;

  constructor(private config: ConfigService) {}

  async iniciar(): Promise<void> {
    const { clientId, tenantId, redirectUri } = this.config.valor.azure;
    if (!clientId || !tenantId) {
      this.modoDemonstracao.set(true);
      this.usuario.set({ nome: 'Visitante' });
      return;
    }
    this.modoDemonstracao.set(false);
    this.msal = new PublicClientApplication({
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: redirectUri || window.location.origin,
      },
      cache: { cacheLocation: 'sessionStorage' },
    });
    await this.msal.initialize();
    const retorno = await this.msal.handleRedirectPromise();
    const conta: AccountInfo | null = retorno?.account ?? this.msal.getAllAccounts()[0] ?? null;
    if (!conta) {
      // Site interno: sem sessão, vai direto para o login corporativo (sem desafio cognitivo, WCAG 3.3.8).
      await this.msal.loginRedirect({ scopes: ['User.Read'] });
      return;
    }
    this.msal.setActiveAccount(conta);
    this.usuario.set({ nome: conta.name?.split(' ')[0] ?? conta.username });
  }

  async sair(): Promise<void> {
    if (this.msal) await this.msal.logoutRedirect();
  }
}
