import type { PricingProfile } from '../profile';

const confirmado = (valor: number) => ({ status: 'confirmado' as const, valor });

/**
 * Catálogo e parâmetros que o FisioPrecifica já gravava em `store.ts` e `labels.ts`.
 * Valores numéricos de abertura são os mesmos de antes (muitos custos nascem em 0).
 * Os textos "Ex: R$ …" são ajuda, não preço calculado.
 */
export const perfilFisioterapia = {
  id: 'fisioterapia',
  nome: 'Fisioterapia',
  nomeProfissional: 'Fisioterapeuta',
  apelidos: [],
  catalogoCompleto: true,
  conselho: {
    sigla: 'CREFITO',
    nomeLinhaCusto: 'CREFITO ou outro conselho de classe',
  },
  parametros: {
    sessoesMeta: confirmado(80),
    margemLucro: confirmado(0.15),
    impostoPercentual: confirmado(0.06),
    horasTrabalho: confirmado(8),
    diasUteis: confirmado(22),
    sessoesporDia: confirmado(8),
    duracaoPadraoMinutos: confirmado(50),
  },
  regimeSugerido: 'simples',
  regimes: [
    { value: 'simples', label: 'Simples Nacional', imposto: 0.06, desc: 'Confirme a alíquota efetiva com seu contador. Para fisioterapia, o Fator R pode alterar o anexo.' },
    { value: 'presumido', label: 'Lucro Presumido', imposto: 0.1433, desc: 'Estimativa inicial; ISS e demais tributos variam. Confirme a alíquota efetiva.' },
    { value: 'autonomo', label: 'Autônomo (pessoa física)', imposto: 0.15, desc: 'Estimativa inicial. IRPF e tributos municipais dependem da situação individual.' },
    { value: 'personalizado', label: 'Personalizado', imposto: 0, desc: 'Defina sua alíquota manualmente' },
  ],
  rotulos: {
    custoTotalMensal: 'Custo Total Mensal',
    custoOperacionalMensal: 'Custo Operacional Mensal',
    custoPorSessao: 'Custo por Sessão',
    precoPorSessao: 'Preço por Sessão',
    receitaBruta: 'Receita Bruta Estimada',
    receitaLiquida: 'Receita Líquida',
    impostos: 'Impostos sobre Receita',
    lucroOperacional: 'Lucro Operacional',
    lucroDisponivel: 'Lucro Disponível',
    sessoesMeta: 'Meta de Sessões/Mês',
    sessoesRealizadas: 'Sessões Realizadas',
    taxaOcupacao: 'Taxa de Ocupação',
    pontoEquilibrio: 'Ponto de Equilíbrio',
    valorHora: 'Valor por Hora',
    margemLucro: 'Margem de Lucro',
    reservasEstrategicas: 'Reservas Estratégicas',
    custoFixo: 'Custos Fixos',
    custoVariavel: 'Custos Variáveis',
    depreciacao: 'Depreciação',
  },
  custosFixos: [
    { id: '1', nome: 'Pró-labore', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Sua retirada mensal como sócio/proprietário. Ex: R$ 5.000/mês é o mínimo que você precisa receber.' },
    { id: '2', nome: 'Salários + Encargos', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Folha de pagamento de funcionários (recepcionista, auxiliar, etc). Ex: R$ 2.000/mês + encargos.' },
    { id: '3', nome: 'CREFITO ou outro conselho de classe', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Anuidade do conselho profissional (CREFITO, CRM, etc). Ex: R$ 600/ano. Será dividido por 12 automaticamente.' },
    { id: '4', nome: 'Associação profissional', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Anuidade de associações como ABRAFITO, ABF ou sindicatos. Ex: R$ 360/ano.' },
    { id: '5', nome: 'Aluguel do consultório/sala', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Valor mensal do aluguel do espaço onde você atende. Ex: R$ 1.500/mês por uma sala comercial.' },
    { id: '6', nome: 'Contador/Contabilidade', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Honorários do escritório de contabilidade. Ex: R$ 300 a R$ 800/mês dependendo do porte.' },
    { id: '7', nome: 'Software de Gestão', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Assinatura de sistemas como ZenFisio, Fisioclin, etc. Ex: R$ 100 a R$ 300/mês.' },
    { id: '8', nome: 'Internet/Telefone', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Plano de internet e telefone do consultório. Ex: R$ 150/mês para internet fibra + telefone.' },
    { id: '9', nome: 'Seguro', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Seguro de responsabilidade civil profissional. Ex: R$ 800 a R$ 2.000/ano.' },
    { id: '10', nome: 'Marketing fixo', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Investimento recorrente em marketing: site, redes sociais, Google Ads. Ex: R$ 500/mês.' },
    { id: '11', nome: 'Combustível', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Gasto com deslocamento para atendimentos domiciliares ou entre unidades. Ex: R$ 400/mês.' },
    { id: '12', nome: 'Condomínio, IPTU e impostos prediais', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Taxas do imóvel comercial. Ex: Condomínio R$ 400 + IPTU R$ 100/mês.' },
    { id: '13', nome: 'Parcelas de financiamento', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Parcelas de equipamentos ou imóvel financiado. Ex: R$ 500/mês. Enquanto houver parcela, não aplique depreciação ao mesmo bem.', temParcelaAtiva: true },
    { id: '14', nome: 'Outros custos fixos', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Qualquer outro custo fixo não listado acima. Ex: estacionamento, uniformes, etc.' },
  ],
  depreciacao: [
    { id: 'dep1', nome: 'Depreciação de equipamentos', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Consumo financeiro de equipamentos ao longo do tempo. Ex: Maca de R$ 3.600 ÷ 60 meses = R$ 60/mês. Não pode coexistir com parcela ativa do mesmo bem.', isDepreciacao: true, temParcelaAtiva: false },
    { id: 'dep2', nome: 'Depreciação de mobiliário', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Desgaste de móveis (mesas, cadeiras, armários). Ex: Mobiliário de R$ 6.000 ÷ 120 meses = R$ 50/mês.', isDepreciacao: true, temParcelaAtiva: false },
    { id: 'dep3', nome: 'Amortização de reformas', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Diluição do custo de reformas no imóvel. Ex: Reforma de R$ 12.000 ÷ 60 meses = R$ 200/mês.', isDepreciacao: true, temParcelaAtiva: false },
  ],
  custosVariaveis: [
    { id: '1', nome: 'Material de Consumo (gel, eletrodos, etc.)', valor: 0, frequencia: 'mensal', modo: 'mensal', observacao: '', descricao: 'Materiais usados durante as sessões. Informe como total mensal ou altere a base de cálculo.' },
    { id: '2', nome: 'Materiais de uso único por sessão', valor: 0, frequencia: 'mensal', modo: 'por_sessao', observacao: '', descricao: 'Lençol descartável, luvas e papel toalha. Informe o custo de uma sessão.' },
    { id: '3', nome: 'Taxa de cartão de crédito/débito', valor: 0, frequencia: 'mensal', modo: 'percentual_receita', percentual: 0, observacao: '', descricao: 'Percentual médio efetivamente pago sobre o faturamento.' },
    { id: '4', nome: 'Água e esgoto', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Conta de água do consultório. Ex: R$ 80 a R$ 150/mês.' },
    { id: '5', nome: 'Energia Elétrica', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Conta de luz (ar-condicionado, equipamentos). Ex: R$ 200 a R$ 500/mês.' },
    { id: '6', nome: 'Material de Limpeza', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Produtos de limpeza e higienização. Ex: R$ 100 a R$ 200/mês.' },
    { id: '7', nome: 'Marketing variável', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Ações pontuais de marketing: impulsionamento, panfletos, eventos. Ex: R$ 300/mês.' },
    { id: '10', nome: 'Comissão (se houver)', valor: 0, frequencia: 'mensal', modo: 'percentual_receita', percentual: 0, observacao: '', descricao: 'Percentual do faturamento pago a parceiros ou profissionais.' },
    { id: '11', nome: 'Outros custos variáveis', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Qualquer outro custo que varia conforme o volume de atendimentos.' },
  ],
  reservas: [
    { id: 'r1', nome: 'Fundo de reposição de equipamentos', valor: 0, frequencia: 'mensal', descricao: 'Reserva para comprar equipamentos novos no futuro. Ex: R$ 300/mês para trocar aparelhos a cada 5 anos.' },
    { id: 'r2', nome: 'Cursos e capacitação estratégica', valor: 0, frequencia: 'mensal', descricao: 'Investimento em formações que não são obrigatórias, mas agregam valor. Ex: R$ 500/mês para especializações.' },
    { id: 'r3', nome: 'Mentorias e consultorias', valor: 0, frequencia: 'mensal', descricao: 'Acompanhamento profissional para crescimento do negócio. Ex: R$ 800/mês de mentoria de gestão.' },
    { id: 'r4', nome: 'Reserva de emergência', valor: 0, frequencia: 'mensal', descricao: 'Colchão financeiro para imprevistos (3 a 6 meses de custos). Ex: R$ 1.000/mês até atingir a meta.' },
    { id: 'r5', nome: 'Férias (provisão)', valor: 0, frequencia: 'mensal', descricao: 'Provisão mensal para se pagar férias como autônomo. Ex: Pró-labore ÷ 12 + 1/3 constitucional ÷ 12.' },
    { id: 'r5b', nome: '13º salário (provisão)', valor: 0, frequencia: 'mensal', descricao: 'Provisão mensal para se pagar o 13º como autônomo. Ex: Pró-labore ÷ 12.' },
    { id: 'r6', nome: 'Expansão do negócio', valor: 0, frequencia: 'mensal', descricao: 'Reserva para abrir nova unidade, contratar mais profissionais ou ampliar o espaço. Ex: R$ 500/mês.' },
    { id: 'r7', nome: 'Outras reservas estratégicas', valor: 0, frequencia: 'mensal', descricao: 'Qualquer outra reserva por decisão estratégica do gestor.' },
  ],
  tiposServico: [
    { id: '1', nome: 'Sessão Individual', duracaoMinutos: 50, custoAdicional: 0, multiplicadorPreco: 1, descricao: 'Atendimento padrão em consultório' },
    { id: '2', nome: 'Avaliação Inicial', duracaoMinutos: 60, custoAdicional: 0, multiplicadorPreco: 1.5, descricao: 'Primeira consulta com avaliação completa' },
    { id: '3', nome: 'Atendimento Domiciliar', duracaoMinutos: 60, custoAdicional: 30, multiplicadorPreco: 1.8, descricao: 'Sessão na residência do paciente' },
    { id: '4', nome: 'Pilates Individual', duracaoMinutos: 50, custoAdicional: 0, multiplicadorPreco: 1.3, descricao: 'Sessão de Pilates individual' },
    { id: '5', nome: 'Pilates em Grupo (por aluno)', duracaoMinutos: 50, custoAdicional: 0, multiplicadorPreco: 0.6, descricao: 'Sessão de Pilates em grupo' },
  ],
  lacunas: [
    '🔴 LACUNA: o intervalo de 10 minutos entre sessões está fixo na fórmula `sugerirSessoesPorDia` e ainda não é parâmetro deste perfil.',
  ],
} as const satisfies PricingProfile;
