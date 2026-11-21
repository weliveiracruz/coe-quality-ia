// Cabeçalho: menus no padrão "disclosure navigation" (botão + lista de links), acessível por teclado.
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideRouter } from '@angular/router';
import { axe } from 'jest-axe';
import { CabecalhoComponent } from '../../src/app/layout/cabecalho.component';
import { MENUS } from '../../src/app/navegacao';

async function montar() {
  const r = await render(CabecalhoComponent, { providers: [provideRouter([])] });
  return { ...r, user: userEvent.setup() };
}

describe('CabecalhoComponent', () => {
  it('CEN-SITE-003 Enter abre o menu e Esc fecha devolvendo o foco ao botão', async () => {
    const { user } = await montar();
    const botao = screen.getByRole('button', { name: 'Qualidade' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    botao.focus();
    await user.keyboard('{Enter}');
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /^Templates/ })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(botao).toHaveFocus();
  });

  it('CEN-SITE-003 apenas um menu aberto por vez', async () => {
    const { user } = await montar();
    await user.click(screen.getByRole('button', { name: 'Qualidade' }));
    await user.click(screen.getByRole('button', { name: 'Indicadores' }));
    expect(screen.getByRole('button', { name: 'Qualidade' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Indicadores' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('CEN-SITE-005 logo e botão Início apontam para a página inicial', async () => {
    await montar();
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /página inicial/ })).toHaveAttribute('href', '/');
  });

  it('CEN-SITE-003 um botão por menu do topo', async () => {
    await montar();
    for (const m of MENUS) expect(screen.getByRole('button', { name: m.rotulo })).toBeInTheDocument();
  });

  it('CEN-SITE-008 sem violações de acessibilidade (axe), fechado e com menu aberto', async () => {
    const { container, user } = await montar();
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole('button', { name: 'Qualidade' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
