// Cabeçalho: menus no padrão "disclosure navigation" (botão + lista de links), acessível por teclado.
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../src/app/servicos/auth.service';
import { axe } from 'jest-axe';
import { CabecalhoComponent } from '../../src/app/layout/cabecalho.component';
import { MENUS } from '../../src/app/navegacao';

@Component({ standalone: true, template: '' })
class PaginaVazia {}

async function montar() {
  const r = await render(CabecalhoComponent, { providers: [provideRouter([{ path: '**', component: PaginaVazia }])] });
  return { ...r, user: userEvent.setup(), router: TestBed.inject(Router), auth: TestBed.inject(AuthService) };
}

const painel = (id: string) => document.getElementById(`painel-${id}`)!;

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

  it('CEN-SITE-004 a seção atual fica marcada e a troca de página fecha os menus', async () => {
    const { user, router, fixture } = await montar();
    await user.click(screen.getByRole('button', { name: 'Qualidade' }));
    expect(painel('qualidade')).toBeVisible();
    await router.navigateByUrl('/qualidade/templates');
    fixture.detectChanges();
    expect(screen.getByRole('button', { name: /Qualidade/ })).toHaveAttribute('aria-expanded', 'false');
    expect(painel('qualidade')).not.toBeVisible();
    const qualidade = screen.getByRole('button', { name: 'Qualidade (seção atual)' });
    expect(qualidade).toHaveClass('botao-menu--atual');
    expect(screen.getByRole('button', { name: 'Indicadores' })).not.toHaveClass('botao-menu--atual');
    await router.navigateByUrl('/qualidade');
    fixture.detectChanges();
    expect(screen.getByRole('button', { name: 'Qualidade (seção atual)' })).toBeInTheDocument();
    await router.navigateByUrl('/qualidades-falsas');
    fixture.detectChanges();
    expect(screen.getByRole('button', { name: 'Qualidade' })).not.toHaveClass('botao-menu--atual');
  });

  it('CEN-SITE-003 clicar no mesmo botão fecha o menu; clicar fora também', async () => {
    const { user } = await montar();
    const botao = screen.getByRole('button', { name: 'Indicadores' });
    await user.click(botao);
    await user.click(botao);
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    await user.click(botao);
    await user.click(screen.getByRole('link', { name: 'Início' }));
    expect(botao).toHaveAttribute('aria-expanded', 'false');
  });

  it('CEN-SITE-003 clique dentro da navegação não fecha o menu aberto', async () => {
    const { user } = await montar();
    const botao = screen.getByRole('button', { name: 'Indicadores' });
    await user.click(botao);
    fireEvent.click(painel('indicadores'));
    expect(botao).toHaveAttribute('aria-expanded', 'true');
  });

  it('CEN-SITE-003 o foco saindo do menu fecha; o foco dentro do menu mantém aberto', async () => {
    const { user } = await montar();
    const botao = screen.getByRole('button', { name: 'Qualidade' });
    await user.click(botao);
    const grupo = botao.closest('li')!;
    const primeiroLink = painel('qualidade').querySelector('a')!;
    fireEvent.focusOut(botao, { relatedTarget: primeiroLink });
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    fireEvent.focusOut(grupo, { relatedTarget: null });
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    fireEvent.focusOut(primeiroLink, { relatedTarget: screen.getByRole('button', { name: 'Indicadores' }) });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
  });

  it('CEN-SITE-003 o foco saindo de outro menu fechado não fecha o menu aberto', async () => {
    const { user } = await montar();
    const qualidade = screen.getByRole('button', { name: 'Qualidade' });
    await user.click(qualidade);
    const indicadores = screen.getByRole('button', { name: 'Indicadores' });
    fireEvent.focusOut(indicadores, { relatedTarget: screen.getByRole('link', { name: 'Início' }) });
    expect(qualidade).toHaveAttribute('aria-expanded', 'true');
  });

  it('CEN-SITE-009 no celular, o botão Menu abre e fecha a navegação e Esc devolve o foco', async () => {
    const { user } = await montar();
    const menu = screen.getByRole('button', { name: 'Menu' });
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(nav).not.toHaveClass('navegacao--aberta');
    await user.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    expect(nav).toHaveClass('navegacao--aberta');
    await user.click(screen.getByRole('button', { name: 'Qualidade' }));
    await user.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Qualidade' })).toHaveAttribute('aria-expanded', 'false');
    await user.click(menu);
    screen.getByRole('link', { name: 'Início' }).focus();
    await user.keyboard('{Escape}');
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveFocus();
  });

  it('CEN-SITE-009 Esc com o submenu aberto no celular fecha só o submenu', async () => {
    const { user } = await montar();
    const menu = screen.getByRole('button', { name: 'Menu' });
    await user.click(menu);
    const qualidade = screen.getByRole('button', { name: 'Qualidade' });
    await user.click(qualidade);
    await user.keyboard('{Escape}');
    expect(qualidade).toHaveAttribute('aria-expanded', 'false');
    expect(qualidade).toHaveFocus();
    expect(menu).toHaveAttribute('aria-expanded', 'true');
  });

  it('CEN-SITE-005 sem o arquivo do logo, mostra o nome Itaú em texto', async () => {
    await montar();
    const logo = screen.getByRole('img', { name: 'Itaú' });
    fireEvent.error(logo);
    expect(screen.queryByRole('img', { name: 'Itaú' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Itaú\s*COE Quality IA/ })).toHaveTextContent('Itaú');
  });

  it('CEN-SITE-020 saudação ao usuário; botão Sair só com login corporativo', async () => {
    const { auth, fixture } = await montar();
    expect(screen.queryByText(/^Olá/)).not.toBeInTheDocument();
    auth.usuario.set({ nome: 'Visitante' });
    fixture.detectChanges();
    expect(screen.getByText('Olá, Visitante')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument();
    auth.modoDemonstracao.set(false);
    auth.usuario.set({ nome: 'Ana' });
    fixture.detectChanges();
    const sair = jest.spyOn(auth, 'sair').mockResolvedValue();
    screen.getByRole('button', { name: 'Sair' }).click();
    expect(sair).toHaveBeenCalled();
  });
});
