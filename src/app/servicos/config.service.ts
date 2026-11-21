import { Injectable } from '@angular/core';

export interface ConfigSite {
  azure: { clientId: string; tenantId: string; redirectUri?: string };
  repositorio: { url: string; ramo: string };
  contatoCoe: { rotulo: string; url: string };
}

const PADRAO: ConfigSite = {
  azure: { clientId: '', tenantId: '' },
  repositorio: { url: '', ramo: 'main' },
  contatoCoe: { rotulo: 'Canal do COE Quality IA', url: '' },
};

/** Configuração lida em tempo de execução (public/config.json): troca de ambiente sem novo build. */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private atual: ConfigSite = PADRAO;

  async carregar(): Promise<void> {
    try {
      const r = await fetch('config.json', { cache: 'no-store' });
      if (r.ok) this.atual = { ...PADRAO, ...(await r.json()) };
    } catch {
      /* sem config.json: segue com os padrões (modo demonstração) */
    }
  }

  get valor(): ConfigSite {
    return this.atual;
  }
}
