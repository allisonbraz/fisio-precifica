/**
 * Ponto opcional para um módulo futuro de produtos.
 *
 * O repositório irmão fono-precifica tem `calcularPrecoVendaAparelho`
 * (venda e locação de aparelho). Este arquivo não implementa essa conta.
 * Não invente a fórmula aqui.
 *
 * Decisão em aberto (🔴): o preço do aparelho compõe a sessão, é uma linha
 * à parte, ou os dois? Ver `_reversa_sdd/questions.md`, item 13.
 */
export interface PrecoProduto {
  /** Identificador estável do cálculo, quando ele existir. */
  id: 'venda-ou-locacao-aparelho';
}

export interface ModuloProdutos {
  id: 'produtos';
  status: 'nao-implementado';
  origem: 'fono-precifica:calcularPrecoVendaAparelho';
  /** Reservado. Permanece ausente até a regra ser trazida do outro repositório. */
  calcularPrecoVendaAparelho?: never;
}

export const moduloProdutos: ModuloProdutos = {
  id: 'produtos',
  status: 'nao-implementado',
  origem: 'fono-precifica:calcularPrecoVendaAparelho',
};
