export type {
  CustoFixo,
  CustoVariavel,
  DadosPrecificacao,
  FrequenciaCusto,
  PlanoTratamento,
  PlanoVendido,
  RegimeTributario,
  RegistroMensal,
  ReservaEstrategica,
  ReservaModo,
  ServicoVendido,
  TipoServico,
} from './types';

export {
  calcularCapacidadeMaxima,
  calcularCustoFixoPorSessao,
  calcularCustoOperacionalMensal,
  calcularCustoOperacionalPorSessao,
  calcularCustoTotalMensal,
  calcularCustoTotalPorSessao,
  calcularCustoVariavelPorSessao,
  calcularCustosVariaveisMensais,
  calcularCustosVariaveisPorSessao,
  calcularHorasTrabalhadas,
  calcularLucroDisponivel,
  calcularLucroOperacional,
  calcularMargemDoPreco,
  calcularPercentualCustosVariaveis,
  calcularPercentualReservas,
  calcularPercentualReservasReceita,
  calcularPontoEquilibrio,
  calcularPrecoEstrategico,
  calcularPrecoMinimo,
  calcularPrecoPisoOperacional,
  calcularPrecoPlano,
  calcularPrecoServico,
  calcularPrecoSustentavel,
  calcularReservaPorSessao,
  calcularTaxaOcupacao,
  calcularTotalCustosFixos,
  calcularTotalCustosOperacionais,
  calcularTotalCustosVariaveis,
  calcularTotalDepreciacao,
  calcularTotalReservas,
  calcularTotalReservasFixas,
  calcularValorHora,
  getValorMensal,
  metaDeSessoesEhViavel,
  simularPreco,
  sugerirSessoesPorDia,
} from './calculate';

export type {
  ParametroLacuna,
  ParametroNumerico,
  PricingProfile,
  ProfissaoId,
  RegimeSugerido,
  RotulosPrecificacao,
} from './profile';
export { criarDocumentoInicial } from './profile';

export { perfilFisioterapia } from './profiles/fisioterapia';
export { perfilFonoaudiologia } from './profiles/fonoaudiologia';
export { perfilTerapiaOcupacional } from './profiles/terapia-ocupacional';
export { perfilNutricao } from './profiles/nutricao';
export { perfilPsicologia } from './profiles/psicologia';
export { perfilEducacaoFisica } from './profiles/educacao-fisica';
export { listaPerfis, obterPerfil, registroPerfis } from './profiles/registro';

export type { ModuloProdutos, PrecoProduto } from './produtos';
export { moduloProdutos } from './produtos';
