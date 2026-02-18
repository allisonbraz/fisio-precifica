/**
 * FisioPrecifica Data Store v3
 * Evolução Estrutural: Separação Custos Operacionais / Depreciação / Reservas Estratégicas
 * "O sistema deve proteger o profissional de decisões financeiras erradas."
 */

// ===== INTERFACES =====

export interface LeadData {
  nome: string;
  whatsapp: string;
  email: string;
  registeredAt: string;
}

export interface PerfilProfissional {
  nome: string;
  cidade: string;
  crefito: string;
  especialidades: string;
  logoUrl: string; // base64 data URL
}

export type FrequenciaCusto = 'mensal' | 'anual';

export interface CustoFixo {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
  observacao: string;
  descricao: string;
  /** If true, this item has an active installment (parcela) — blocks depreciation */
  temParcelaAtiva?: boolean;
  /** If true, this item is a depreciation/amortization entry */
  isDepreciacao?: boolean;
}

export interface CustoVariavel {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
  observacao: string;
  descricao: string;
}

export interface ReservaEstrategica {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
  descricao: string;
}

export interface TipoServico {
  id: string;
  nome: string;
  duracaoMinutos: number;
  custoAdicional: number;
  multiplicadorPreco: number;
  descricao: string;
}

export interface PlanoTratamento {
  id: string;
  nome: string;
  tipoServicoId: string;
  quantidadeSessoes: number;
  descontoPercentual: number;
  validade: number; // dias
}

export interface RegistroMensal {
  id: string;
  mes: string; // YYYY-MM
  sessoesRealizadas: number;
  receitaTotal: number;
  custoFixoTotal: number;
  custoVariavelTotal: number;
  observacoes: string;
}

export interface DadosPrecificacao {
  custosFixos: CustoFixo[];
  custosVariaveis: CustoVariavel[];
  reservasEstrategicas: ReservaEstrategica[];
  sessoesMeta: number;
  margemLucro: number;
  precoDefinido: number;
  tiposServico: TipoServico[];
  planosTratamento: PlanoTratamento[];
  registrosMensais: RegistroMensal[];
  horasTrabalho: number;
  diasUteis: number;
  sessoesporDia: number;
}

// ===== STORAGE KEYS =====

const STORAGE_KEY = 'fisioprecifica_data';
const LEAD_KEY = 'fisioprecifica_lead';
const PERFIL_KEY = 'fisioprecifica_perfil';
const LEADS_LIST_KEY = 'fisioprecifica_leads_list';

// ===== DEFAULT DATA =====

const defaultCustosFixos: CustoFixo[] = [
  { id: '1', nome: 'Pró-labore', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Sua retirada mensal como sócio/proprietário. Ex: R$ 5.000/mês é o mínimo que você precisa receber.' },
  { id: '2', nome: 'Salários + Encargos', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Folha de pagamento de funcionários (recepcionista, auxiliar, etc). Ex: R$ 2.000/mês + encargos.' },
  { id: '3', nome: 'CREFITO ou outro conselho de classe', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Anuidade do conselho profissional (CREFITO, CRM, etc). Ex: R$ 600/ano. Será dividido por 12 automaticamente.' },
  { id: '4', nome: 'Associação profissional', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Anuidade de associações como ABRAFITO, ABF, COFFITO ou sindicatos. Ex: R$ 360/ano.' },
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
];

// Depreciação como custo fixo especial (isDepreciacao = true)
const defaultDepreciacao: CustoFixo[] = [
  { id: 'dep1', nome: 'Depreciação de equipamentos', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Consumo financeiro de equipamentos ao longo do tempo. Ex: Maca de R$ 3.600 ÷ 60 meses = R$ 60/mês. Não pode coexistir com parcela ativa do mesmo bem.', isDepreciacao: true, temParcelaAtiva: false },
  { id: 'dep2', nome: 'Depreciação de mobiliário', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Desgaste de móveis (mesas, cadeiras, armários). Ex: Mobiliário de R$ 6.000 ÷ 120 meses = R$ 50/mês.', isDepreciacao: true, temParcelaAtiva: false },
  { id: 'dep3', nome: 'Amortização de reformas', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Diluição do custo de reformas no imóvel. Ex: Reforma de R$ 12.000 ÷ 60 meses = R$ 200/mês.', isDepreciacao: true, temParcelaAtiva: false },
];

const defaultCustosVariaveis: CustoVariavel[] = [
  { id: '1', nome: 'Material de Consumo (gel, eletrodos, etc.)', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Materiais usados durante as sessões. Ex: gel condutor, eletrodos, faixas elásticas. R$ 200/mês.' },
  { id: '2', nome: 'Material descartável por sessão', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Lençol descartável, luvas, papel toalha. Ex: R$ 2 a R$ 5 por sessão × número de sessões.' },
  { id: '3', nome: 'Taxa de cartão de crédito/débito', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Taxas cobradas pela maquininha. Ex: 2% a 5% do faturamento mensal com cartão.' },
  { id: '4', nome: 'Água e esgoto', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Conta de água do consultório. Ex: R$ 80 a R$ 150/mês.' },
  { id: '5', nome: 'Energia Elétrica', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Conta de luz (ar-condicionado, equipamentos). Ex: R$ 200 a R$ 500/mês.' },
  { id: '6', nome: 'Material de Limpeza', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Produtos de limpeza e higienização. Ex: R$ 100 a R$ 200/mês.' },
  { id: '7', nome: 'Marketing variável', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Ações pontuais de marketing: impulsionamento, panfletos, eventos. Ex: R$ 300/mês.' },
  { id: '8', nome: 'Impostos da prefeitura (ISS, ECAD)', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'ISS (2% a 5% do faturamento) e outras taxas municipais. Ex: R$ 200/mês.' },
  { id: '9', nome: 'Impostos sobre faturamento/receita', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'DAS (Simples Nacional), IRPJ, etc. Conforme seu regime tributário. Ex: 6% a 15% do faturamento.' },
  { id: '10', nome: 'Comissão (se houver)', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Comissão paga a indicadores ou parceiros. Ex: 10% sobre sessões indicadas.' },
  { id: '11', nome: 'Outros custos variáveis', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Qualquer outro custo que varia conforme o volume de atendimentos.' },
];

const defaultReservasEstrategicas: ReservaEstrategica[] = [
  { id: 'r1', nome: 'Fundo de reposição de equipamentos', valor: 0, frequencia: 'mensal', descricao: 'Reserva para comprar equipamentos novos no futuro. Ex: R$ 300/mês para trocar aparelhos a cada 5 anos.' },
  { id: 'r2', nome: 'Cursos e capacitação estratégica', valor: 0, frequencia: 'mensal', descricao: 'Investimento em formações que não são obrigatórias, mas agregam valor. Ex: R$ 500/mês para especializações.' },
  { id: 'r3', nome: 'Mentorias e consultorias', valor: 0, frequencia: 'mensal', descricao: 'Acompanhamento profissional para crescimento do negócio. Ex: R$ 800/mês de mentoria de gestão.' },
  { id: 'r4', nome: 'Reserva de emergência', valor: 0, frequencia: 'mensal', descricao: 'Colchão financeiro para imprevistos (3 a 6 meses de custos). Ex: R$ 1.000/mês até atingir a meta.' },
  { id: 'r5', nome: 'Férias e 13º (provisão)', valor: 0, frequencia: 'mensal', descricao: 'Provisão mensal para se pagar férias e 13º como autônomo. Ex: Pró-labore ÷ 12 + Pró-labore/3 ÷ 12.' },
  { id: 'r6', nome: 'Expansão do negócio', valor: 0, frequencia: 'mensal', descricao: 'Reserva para abrir nova unidade, contratar mais profissionais ou ampliar o espaço. Ex: R$ 500/mês.' },
  { id: 'r7', nome: 'Outras reservas estratégicas', valor: 0, frequencia: 'mensal', descricao: 'Qualquer outra reserva por decisão estratégica do gestor.' },
];

const defaultTiposServico: TipoServico[] = [
  { id: '1', nome: 'Sessão Individual', duracaoMinutos: 50, custoAdicional: 0, multiplicadorPreco: 1, descricao: 'Atendimento padrão em consultório' },
  { id: '2', nome: 'Avaliação Inicial', duracaoMinutos: 60, custoAdicional: 0, multiplicadorPreco: 1.5, descricao: 'Primeira consulta com avaliação completa' },
  { id: '3', nome: 'Atendimento Domiciliar', duracaoMinutos: 60, custoAdicional: 30, multiplicadorPreco: 1.8, descricao: 'Sessão na residência do paciente' },
  { id: '4', nome: 'Pilates Individual', duracaoMinutos: 50, custoAdicional: 0, multiplicadorPreco: 1.3, descricao: 'Sessão de Pilates individual' },
  { id: '5', nome: 'Pilates em Grupo (por aluno)', duracaoMinutos: 50, custoAdicional: 0, multiplicadorPreco: 0.6, descricao: 'Sessão de Pilates em grupo' },
];

const defaultData: DadosPrecificacao = {
  custosFixos: [...defaultCustosFixos, ...defaultDepreciacao],
  custosVariaveis: defaultCustosVariaveis,
  reservasEstrategicas: defaultReservasEstrategicas,
  sessoesMeta: 80,
  margemLucro: 0.30,
  precoDefinido: 0,
  tiposServico: defaultTiposServico,
  planosTratamento: [],
  registrosMensais: [],
  horasTrabalho: 8,
  diasUteis: 22,
  sessoesporDia: 8,
};

const defaultPerfil: PerfilProfissional = {
  nome: '',
  cidade: '',
  crefito: '',
  especialidades: '',
  logoUrl: '',
};

// ===== LOAD / SAVE =====

const CUSTOS_FIXOS_NAME_MAP: Record<string, string> = {
  'CREFITO': 'CREFITO ou outro conselho de classe',
  'CREFITO (anuidade)': 'CREFITO ou outro conselho de classe',
  'Conselho de classe': 'CREFITO ou outro conselho de classe',
  'Aluguel': 'Aluguel do consultório/sala',
  'Aluguel da sala': 'Aluguel do consultório/sala',
  'Aluguel do espaço': 'Aluguel do consultório/sala',
  'Aluguel consultório': 'Aluguel do consultório/sala',
};

// Items that should be migrated from custos to reservas
const ITEMS_TO_MIGRATE_TO_RESERVAS = new Set([
  'cursos e capacitação',
  'aquisição e manutenção de equipamentos',
]);

function findDefaultByName(nome: string, defaults: { nome: string; descricao: string; frequencia: FrequenciaCusto }[]): { nome: string; descricao: string; frequencia: FrequenciaCusto } | undefined {
  const normalized = nome.toLowerCase().trim();
  const exact = defaults.find(d => d.nome.toLowerCase().trim() === normalized);
  if (exact) return exact;
  const partial = defaults.find(d =>
    d.nome.toLowerCase().includes(normalized) || normalized.includes(d.nome.toLowerCase())
  );
  return partial;
}

export function loadData(): DadosPrecificacao {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old "pacotes" to "planosTratamento"
      if (parsed.pacotes && !parsed.planosTratamento) {
        parsed.planosTratamento = parsed.pacotes;
        delete parsed.pacotes;
      }

      // Old default observacoes that should be cleared
      const STALE_OBSERVACOES = new Set([
        'anuidade ÷ 12 meses', 'anuidade ÷ 12', 'sua retirada mensal',
        'site, redes sociais', 'atendimento domiciliar',
        'condomínio + iptu', 'gel, eletrodos, etc.',
      ]);

      // Migrate custos fixos
      if (parsed.custosFixos) {
        // Remove items that should now be reservas (if they have no value set)
        const migratedToReservas: any[] = [];
        parsed.custosFixos = parsed.custosFixos.filter((c: any) => {
          if (ITEMS_TO_MIGRATE_TO_RESERVAS.has(c.nome.toLowerCase().trim())) {
            if (c.valor > 0) migratedToReservas.push(c);
            return false; // Remove from custos fixos
          }
          return true;
        });

        parsed.custosFixos = parsed.custosFixos.map((c: any) => {
          const mappedName = CUSTOS_FIXOS_NAME_MAP[c.nome] || c.nome;
          const allDefaults = [...defaultCustosFixos, ...defaultDepreciacao];
          const defaultById = allDefaults.find(d => d.id === c.id);
          const defaultByName = findDefaultByName(mappedName, allDefaults);
          const matched = defaultById || defaultByName;
          const cleanObs = (c.observacao && STALE_OBSERVACOES.has(c.observacao.toLowerCase().trim())) ? '' : (c.observacao || '');
          return {
            ...c,
            nome: matched?.nome || mappedName,
            frequencia: c.frequencia || (matched?.frequencia || 'mensal'),
            descricao: matched?.descricao || c.descricao || '',
            observacao: cleanObs,
            isDepreciacao: c.isDepreciacao || (matched as any)?.isDepreciacao || false,
            temParcelaAtiva: c.temParcelaAtiva ?? (matched as any)?.temParcelaAtiva ?? false,
          };
        });

        // Deduplicate: if multiple items have the same name after mapping, keep the one with higher value
        const deduped = new Map<string, any>();
        for (const c of parsed.custosFixos) {
          const key = c.nome.toLowerCase().trim();
          const existing = deduped.get(key);
          if (!existing || c.valor > existing.valor) {
            deduped.set(key, c);
          }
        }
        parsed.custosFixos = Array.from(deduped.values());

        // Add missing default custos fixos and depreciação
        const existingNames = new Set(parsed.custosFixos.map((c: any) => c.nome.toLowerCase()));
        for (const def of [...defaultCustosFixos, ...defaultDepreciacao]) {
          if (!existingNames.has(def.nome.toLowerCase())) {
            parsed.custosFixos.push({ ...def });
          }
        }

        // If we migrated items with values to reservas, add them
        if (migratedToReservas.length > 0 && !parsed.reservasEstrategicas) {
          parsed.reservasEstrategicas = [...defaultReservasEstrategicas];
        }
      }

      // Migrate custos variáveis
      if (parsed.custosVariaveis) {
        parsed.custosVariaveis = parsed.custosVariaveis.map((c: any) => {
          const defaultById = defaultCustosVariaveis.find(d => d.id === c.id);
          const defaultByName = findDefaultByName(c.nome, defaultCustosVariaveis);
          const matched = defaultById || defaultByName;
          return {
            ...c,
            frequencia: c.frequencia || 'mensal',
            descricao: matched?.descricao || c.descricao || '',
          };
        });
        const existingNames = new Set(parsed.custosVariaveis.map((c: any) => c.nome.toLowerCase()));
        for (const def of defaultCustosVariaveis) {
          if (!existingNames.has(def.nome.toLowerCase())) {
            parsed.custosVariaveis.push({ ...def });
          }
        }
      }

      // Initialize reservas if not present
      if (!parsed.reservasEstrategicas) {
        parsed.reservasEstrategicas = [...defaultReservasEstrategicas];
      } else {
        // Add missing default reservas
        const existingNames = new Set(parsed.reservasEstrategicas.map((r: any) => r.nome.toLowerCase()));
        for (const def of defaultReservasEstrategicas) {
          if (!existingNames.has(def.nome.toLowerCase())) {
            parsed.reservasEstrategicas.push({ ...def });
          }
        }
      }

      return { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }
  return { ...defaultData };
}

export function saveData(data: DadosPrecificacao): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar dados:', e);
  }
}

export function resetData(): DadosPrecificacao {
  localStorage.removeItem(STORAGE_KEY);
  return JSON.parse(JSON.stringify(defaultData));
}

// ===== LEAD FUNCTIONS =====

export function loadLead(): LeadData | null {
  try {
    const stored = localStorage.getItem(LEAD_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Erro ao carregar lead:', e);
  }
  return null;
}

export function saveLead(lead: LeadData): void {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify(lead));
    const list = loadLeadsList();
    const exists = list.find(l => l.email === lead.email);
    if (!exists) {
      list.push(lead);
      localStorage.setItem(LEADS_LIST_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error('Erro ao salvar lead:', e);
  }
}

export function loadLeadsList(): LeadData[] {
  try {
    const stored = localStorage.getItem(LEADS_LIST_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Erro ao carregar leads:', e);
  }
  return [];
}

// ===== PERFIL FUNCTIONS =====

export function loadPerfil(): PerfilProfissional {
  try {
    const stored = localStorage.getItem(PERFIL_KEY);
    if (stored) return { ...defaultPerfil, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Erro ao carregar perfil:', e);
  }
  return { ...defaultPerfil };
}

export function savePerfil(perfil: PerfilProfissional): void {
  try {
    localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
  } catch (e) {
    console.error('Erro ao salvar perfil:', e);
  }
}

// ===== CALCULATION HELPERS =====

/** Get the effective monthly value of a cost (divides annual by 12) */
export function getValorMensal(custo: { valor: number; frequencia: FrequenciaCusto }): number {
  return custo.frequencia === 'anual' ? custo.valor / 12 : custo.valor;
}

// --- BLOCO 1: Custos Operacionais (sem depreciação) ---

/** Total custos fixos operacionais (exclui depreciação) */
export function calcularTotalCustosOperacionais(custos: CustoFixo[]): number {
  return custos
    .filter(c => !c.isDepreciacao)
    .reduce((sum, c) => sum + getValorMensal(c), 0);
}

// --- BLOCO 2: Depreciação / Amortização ---

/** Total depreciação mensal (somente itens sem parcela ativa) */
export function calcularTotalDepreciacao(custos: CustoFixo[]): number {
  return custos
    .filter(c => c.isDepreciacao && !c.temParcelaAtiva)
    .reduce((sum, c) => sum + getValorMensal(c), 0);
}

// --- BLOCO 3: Reservas Estratégicas ---

/** Total reservas estratégicas mensais */
export function calcularTotalReservas(reservas: ReservaEstrategica[]): number {
  return reservas.reduce((sum, r) => sum + getValorMensal(r), 0);
}

// --- Combined calculations ---

/** Total custos fixos (operacionais + depreciação efetiva) — for backward compat */
export function calcularTotalCustosFixos(custos: CustoFixo[]): number {
  return calcularTotalCustosOperacionais(custos) + calcularTotalDepreciacao(custos);
}

export function calcularTotalCustosVariaveis(custos: CustoVariavel[]): number {
  return custos.reduce((sum, c) => sum + getValorMensal(c), 0);
}

/** Custo Total Mensal = Custos Operacionais + Depreciação + Custos Variáveis (SEM reservas) */
export function calcularCustoTotalMensal(data: DadosPrecificacao): number {
  return calcularTotalCustosFixos(data.custosFixos) + calcularTotalCustosVariaveis(data.custosVariaveis);
}

export function calcularCustoFixoPorSessao(data: DadosPrecificacao): number {
  if (data.sessoesMeta === 0) return 0;
  return calcularTotalCustosFixos(data.custosFixos) / data.sessoesMeta;
}

export function calcularCustoVariavelPorSessao(data: DadosPrecificacao): number {
  if (data.sessoesMeta === 0) return 0;
  return calcularTotalCustosVariaveis(data.custosVariaveis) / data.sessoesMeta;
}

/** Custo por Sessão = (Custos Operacionais + Depreciação + Variáveis) ÷ Sessões */
export function calcularCustoTotalPorSessao(data: DadosPrecificacao): number {
  return calcularCustoFixoPorSessao(data) + calcularCustoVariavelPorSessao(data);
}

/** Preço com margem = Custo por Sessão × (1 + margem) */
export function calcularPrecoMinimo(data: DadosPrecificacao): number {
  const custoTotal = calcularCustoTotalPorSessao(data);
  return custoTotal * (1 + data.margemLucro);
}

/** Calculate margin from a defined price */
export function calcularMargemDoPreco(data: DadosPrecificacao, preco: number): number {
  const custoTotal = calcularCustoTotalPorSessao(data);
  if (custoTotal === 0) return preco > 0 ? 1 : 0;
  return (preco - custoTotal) / custoTotal;
}

// --- LUCRO: duas camadas ---

/** Lucro Operacional = Receita - (Custos Operacionais + Depreciação + Variáveis) */
export function calcularLucroOperacional(data: DadosPrecificacao, precoSessao: number): number {
  const receita = precoSessao * data.sessoesMeta;
  const custoTotal = calcularCustoTotalMensal(data);
  return receita - custoTotal;
}

/** Lucro Disponível = Lucro Operacional - Reservas Estratégicas */
export function calcularLucroDisponivel(data: DadosPrecificacao, precoSessao: number): number {
  const lucroOp = calcularLucroOperacional(data, precoSessao);
  const reservas = calcularTotalReservas(data.reservasEstrategicas);
  return lucroOp - reservas;
}

/** Percentual do lucro destinado a reservas */
export function calcularPercentualReservas(data: DadosPrecificacao, precoSessao: number): number {
  const lucroOp = calcularLucroOperacional(data, precoSessao);
  if (lucroOp <= 0) return 0;
  const reservas = calcularTotalReservas(data.reservasEstrategicas);
  return (reservas / lucroOp) * 100;
}

export function calcularPrecoServico(data: DadosPrecificacao, servico: TipoServico): number {
  const precoBase = calcularPrecoMinimo(data);
  return (precoBase * servico.multiplicadorPreco) + servico.custoAdicional;
}

export function calcularPrecoPlano(precoUnitario: number, plano: PlanoTratamento): number {
  const total = precoUnitario * plano.quantidadeSessoes;
  return total * (1 - plano.descontoPercentual / 100);
}

export function simularPreco(data: DadosPrecificacao, precoSessao: number): {
  receitaMensal: number;
  custoTotal: number;
  lucroOperacional: number;
  reservas: number;
  lucroDisponivel: number;
  margem: number;
  viavel: boolean;
} {
  const receitaMensal = precoSessao * data.sessoesMeta;
  const custoTotal = calcularCustoTotalMensal(data);
  const lucroOperacional = receitaMensal - custoTotal;
  const reservas = calcularTotalReservas(data.reservasEstrategicas);
  const lucroDisponivel = lucroOperacional - reservas;
  const margem = receitaMensal > 0 ? (lucroOperacional / receitaMensal) * 100 : 0;
  return {
    receitaMensal,
    custoTotal,
    lucroOperacional,
    reservas,
    lucroDisponivel,
    margem,
    viavel: lucroOperacional >= 0,
  };
}

export function calcularPontoEquilibrio(data: DadosPrecificacao, precoSessao: number): number {
  const custoFixoTotal = calcularTotalCustosFixos(data.custosFixos);
  const custoVarPorSessao = calcularCustoVariavelPorSessao(data);
  const contribuicao = precoSessao - custoVarPorSessao;
  if (contribuicao <= 0) return Infinity;
  return Math.ceil(custoFixoTotal / contribuicao);
}

export function calcularHorasTrabalhadas(data: DadosPrecificacao): number {
  return data.diasUteis * data.horasTrabalho;
}

export function calcularTaxaOcupacao(data: DadosPrecificacao): number {
  const capacidadeMaxima = data.diasUteis * data.sessoesporDia;
  if (capacidadeMaxima === 0) return 0;
  return (data.sessoesMeta / capacidadeMaxima) * 100;
}

export function calcularValorHora(data: DadosPrecificacao, precoSessao: number, duracaoMinutos: number = 50): number {
  return (precoSessao / duracaoMinutos) * 60;
}

// ===== ALERTAS INTELIGENTES =====

export interface AlertaFinanceiro {
  tipo: 'warning' | 'info' | 'danger';
  mensagem: string;
  detalhe: string;
}

export function gerarAlertas(data: DadosPrecificacao, precoSessao: number): AlertaFinanceiro[] {
  const alertas: AlertaFinanceiro[] = [];

  // 1. Depreciação com parcela ativa
  const depComParcela = data.custosFixos.filter(c => c.isDepreciacao && c.temParcelaAtiva && c.valor > 0);
  if (depComParcela.length > 0) {
    alertas.push({
      tipo: 'danger',
      mensagem: 'Equipamento com parcela ativa não pode ter depreciação',
      detalhe: `${depComParcela.map(c => c.nome).join(', ')} — enquanto houver parcela ativa, a depreciação é bloqueada automaticamente.`,
    });
  }

  // 2. Lucro positivo sem reservas
  const lucroOp = calcularLucroOperacional(data, precoSessao);
  const totalReservas = calcularTotalReservas(data.reservasEstrategicas);
  if (lucroOp > 0 && totalReservas === 0) {
    alertas.push({
      tipo: 'warning',
      mensagem: 'Seu lucro é positivo, mas você não está formando reservas',
      detalhe: 'Recomendamos destinar pelo menos 10% a 20% do lucro operacional para reservas estratégicas (emergência, férias, expansão).',
    });
  }

  // 3. Lucro insuficiente para cobrir reservas
  if (lucroOp > 0 && totalReservas > lucroOp) {
    alertas.push({
      tipo: 'danger',
      mensagem: 'Suas reservas excedem o lucro operacional',
      detalhe: `Lucro operacional: ${formatarMoeda(lucroOp)} | Reservas: ${formatarMoeda(totalReservas)}. Reduza as reservas ou aumente o preço.`,
    });
  }

  // 4. Margem muito baixa
  const custoSessao = calcularCustoTotalPorSessao(data);
  if (custoSessao > 0 && precoSessao > 0) {
    const margem = ((precoSessao - custoSessao) / custoSessao) * 100;
    if (margem < 15) {
      alertas.push({
        tipo: 'danger',
        mensagem: 'Margem de lucro arriscada (abaixo de 15%)',
        detalhe: `Sua margem atual é de ${margem.toFixed(1)}%. Abaixo de 15% qualquer imprevisto pode gerar prejuízo.`,
      });
    }
  }

  // 5. Preço abaixo do custo
  if (precoSessao > 0 && precoSessao < custoSessao) {
    alertas.push({
      tipo: 'danger',
      mensagem: 'Preço abaixo do custo por sessão',
      detalhe: `Você está cobrando ${formatarMoeda(precoSessao)} mas seu custo é ${formatarMoeda(custoSessao)}. Cada sessão gera prejuízo.`,
    });
  }

  return alertas;
}

// ===== FORMATTERS =====

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(valor / 100);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function exportarDados(data: DadosPrecificacao): string {
  return JSON.stringify(data, null, 2);
}

export function importarDados(json: string): DadosPrecificacao | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.custosFixos && parsed.custosVariaveis) {
      return { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.error('Erro ao importar dados:', e);
  }
  return null;
}
