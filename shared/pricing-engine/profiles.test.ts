import { describe, expect, it } from 'vitest';
import { criarDocumentoInicial } from './profile';
import { listaPerfis, obterPerfil } from './profiles/registro';
import { perfilFisioterapia } from './profiles/fisioterapia';
import { moduloProdutos } from './produtos';
import type { ParametroNumerico, PricingProfile, ProfissaoId } from './profile';

function parametros(perfil: PricingProfile): ParametroNumerico[] {
  return Object.values(perfil.parametros);
}

describe('perfil de fisioterapia', () => {
  it('abre com os mesmos números de antes', () => {
    const doc = criarDocumentoInicial(perfilFisioterapia);
    expect(doc.sessoesMeta).toBe(80);
    expect(doc.margemLucro).toBe(0.15);
    expect(doc.impostoPercentual).toBe(0.06);
    expect(doc.horasTrabalho).toBe(8);
    expect(doc.diasUteis).toBe(22);
    expect(doc.sessoesporDia).toBe(8);
    expect(doc.duracaoPadraoMinutos).toBe(50);
    expect(doc.regimeTributario).toBe('simples');
    expect(doc.precoDefinido).toBe(0);
    expect(doc.custosFixos).toHaveLength(17);
    expect(doc.custosFixos[0]?.nome).toBe('Pró-labore');
    expect(doc.custosFixos[2]?.nome).toBe('CREFITO ou outro conselho de classe');
    expect(doc.custosVariaveis.map(c => c.nome)).toContain('Material de Consumo (gel, eletrodos, etc.)');
    expect(doc.tiposServico.map(s => s.nome)).toEqual([
      'Sessão Individual',
      'Avaliação Inicial',
      'Atendimento Domiciliar',
      'Pilates Individual',
      'Pilates em Grupo (por aluno)',
    ]);
    expect(doc.tiposServico[2]?.custoAdicional).toBe(30);
    expect(doc.tiposServico[2]?.multiplicadorPreco).toBe(1.8);
  });

  it('devolve uma cópia, não o catálogo interno', () => {
    const doc = criarDocumentoInicial(perfilFisioterapia);
    doc.custosFixos[0]!.valor = 999;
    expect(perfilFisioterapia.custosFixos[0]?.valor).toBe(0);
  });
});

describe('registro de profissões', () => {
  it('lista as seis profissões, com fisioterapia na frente', () => {
    const ids: ProfissaoId[] = [
      'fisioterapia',
      'fonoaudiologia',
      'terapia-ocupacional',
      'nutricao',
      'psicologia',
      'educacao-fisica',
    ];
    expect(listaPerfis.map(perfil => perfil.id)).toEqual(ids);
    expect(obterPerfil('psicologia').nomeProfissional).toBe('Psicólogo');
    expect(obterPerfil('nutricao').nomeProfissional).toBe('Nutricionista');
    expect(obterPerfil('educacao-fisica').apelidos).toEqual(['personal']);
  });
});

describe('perfis ainda sem dados', () => {
  const incompletos: Array<[string, PricingProfile, string]> = listaPerfis
    .filter(perfil => !perfil.catalogoCompleto)
    .map(perfil => [perfil.nome, perfil, perfil.conselho.sigla]);

  it.each(incompletos)('%s não inventa número e não abre documento', (_nome, perfil, conselho) => {
    expect(perfil.catalogoCompleto).toBe(false);
    expect(perfil.conselho.sigla).toBe(conselho);
    expect(perfil.custosFixos).toEqual([]);
    expect(perfil.custosVariaveis).toEqual([]);
    expect(perfil.reservas).toEqual([]);
    expect(perfil.tiposServico).toEqual([]);
    expect(perfil.depreciacao).toEqual([]);
    expect(perfil.regimes).toEqual([]);
    expect(perfil.regimeSugerido).toBeNull();
    for (const parametro of parametros(perfil)) {
      expect(parametro.status).toBe('lacuna');
      if (parametro.status !== 'lacuna') continue;
      expect(parametro.valor).toBeNull();
      expect(parametro.marcador).toBe('🔴 LACUNA');
    }
    expect(perfil.lacunas.every(item => item.includes('🔴 LACUNA'))).toBe(true);
    expect(() => criarDocumentoInicial(perfil)).toThrow(/LACUNA/);
  });
});

describe('módulo produtos', () => {
  it('existe só como reserva, sem cálculo de aparelho', () => {
    expect(moduloProdutos.status).toBe('nao-implementado');
    expect(moduloProdutos.origem).toContain('calcularPrecoVendaAparelho');
    expect('calcularPrecoVendaAparelho' in moduloProdutos).toBe(false);
  });
});
