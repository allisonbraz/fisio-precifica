/**
 * FisioPrecifica Data Store v4
 * Barrel re-export + localStorage persistence + data migration
 */

// Re-export everything from modules for backward compatibility
export type * from './types';
export * from './calculations';
export * from './alerts';
export * from './formatters';

import type {
  CustoFixo,
  CustoVariavel,
  DadosPrecificacao,
  FrequenciaCusto,
  LeadData,
  PerfilProfissional,
  ReservaEstrategica,
  TipoServico,
} from './types';

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
];

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
  { id: 'r5', nome: 'Férias (provisão)', valor: 0, frequencia: 'mensal', descricao: 'Provisão mensal para se pagar férias como autônomo. Ex: Pró-labore ÷ 12 + 1/3 constitucional ÷ 12.' },
  { id: 'r5b', nome: '13º salário (provisão)', valor: 0, frequencia: 'mensal', descricao: 'Provisão mensal para se pagar o 13º como autônomo. Ex: Pró-labore ÷ 12.' },
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
  margemLucro: 0.15,
  precoDefinido: 0,
  tiposServico: defaultTiposServico,
  planosTratamento: [],
  registrosMensais: [],
  horasTrabalho: 8,
  diasUteis: 22,
  sessoesporDia: 8,
  duracaoPadraoMinutos: 50,
  regimeTributario: 'simples',
  impostoPercentual: 0.06,
};

const defaultPerfil: PerfilProfissional = {
  nome: '',
  cidade: '',
  crefito: '',
  especialidades: '',
  logoUrl: '',
  whatsapp: '',
  instagram: '',
};

// ===== MIGRATION HELPERS =====

const CUSTOS_FIXOS_NAME_MAP: Record<string, string> = {
  'CREFITO': 'CREFITO ou outro conselho de classe',
  'CREFITO (anuidade)': 'CREFITO ou outro conselho de classe',
  'Conselho de classe': 'CREFITO ou outro conselho de classe',
  'Aluguel': 'Aluguel do consultório/sala',
  'Aluguel da sala': 'Aluguel do consultório/sala',
  'Aluguel do espaço': 'Aluguel do consultório/sala',
  'Aluguel consultório': 'Aluguel do consultório/sala',
};

const ITEMS_TO_MIGRATE_TO_RESERVAS = new Set([
  'cursos e capacitação',
  'aquisição e manutenção de equipamentos',
]);

function findDefaultByName(nome: string, defaults: { nome: string; descricao: string; frequencia: FrequenciaCusto }[]): { nome: string; descricao: string; frequencia: FrequenciaCusto } | undefined {
  const normalized = nome.toLowerCase().trim();
  const exact = defaults.find(d => d.nome.toLowerCase().trim() === normalized);
  if (exact) return exact;
  return defaults.find(d =>
    d.nome.toLowerCase().includes(normalized) || normalized.includes(d.nome.toLowerCase())
  );
}

// ===== LOAD / SAVE =====

export function loadData(): DadosPrecificacao {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.pacotes && !parsed.planosTratamento) {
        parsed.planosTratamento = parsed.pacotes;
        delete parsed.pacotes;
      }

      const STALE_OBSERVACOES = new Set([
        'anuidade ÷ 12 meses', 'anuidade ÷ 12', 'sua retirada mensal',
        'site, redes sociais', 'atendimento domiciliar',
        'condomínio + iptu', 'gel, eletrodos, etc.',
      ]);

      if (parsed.custosFixos) {
        const migratedToReservas: any[] = [];
        parsed.custosFixos = parsed.custosFixos.filter((c: any) => {
          if (ITEMS_TO_MIGRATE_TO_RESERVAS.has(c.nome.toLowerCase().trim())) {
            if (c.valor > 0) migratedToReservas.push(c);
            return false;
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

        const deduped = new Map<string, any>();
        for (const c of parsed.custosFixos) {
          const key = c.nome.toLowerCase().trim();
          const existing = deduped.get(key);
          if (!existing || c.valor > existing.valor) deduped.set(key, c);
        }
        parsed.custosFixos = Array.from(deduped.values());

        const existingNames = new Set(parsed.custosFixos.map((c: any) => c.nome.toLowerCase()));
        for (const def of [...defaultCustosFixos, ...defaultDepreciacao]) {
          if (!existingNames.has(def.nome.toLowerCase())) parsed.custosFixos.push({ ...def });
        }

        if (migratedToReservas.length > 0 && !parsed.reservasEstrategicas) {
          parsed.reservasEstrategicas = [...defaultReservasEstrategicas];
        }
      }

      if (parsed.custosVariaveis) {
        parsed.custosVariaveis = parsed.custosVariaveis.map((c: any) => {
          const defaultById = defaultCustosVariaveis.find(d => d.id === c.id);
          const defaultByName = findDefaultByName(c.nome, defaultCustosVariaveis);
          const matched = defaultById || defaultByName;
          return { ...c, frequencia: c.frequencia || 'mensal', descricao: matched?.descricao || c.descricao || '' };
        });
        const existingNames = new Set(parsed.custosVariaveis.map((c: any) => c.nome.toLowerCase()));
        for (const def of defaultCustosVariaveis) {
          if (!existingNames.has(def.nome.toLowerCase())) parsed.custosVariaveis.push({ ...def });
        }
      }

      if (!parsed.reservasEstrategicas) {
        parsed.reservasEstrategicas = [...defaultReservasEstrategicas];
      } else {
        // Migration: split old "Férias e 13º (provisão)" into two separate items
        const oldComboIdx = parsed.reservasEstrategicas.findIndex(
          (r: any) => r.nome.toLowerCase().includes('férias e 13')
        );
        if (oldComboIdx !== -1) {
          parsed.reservasEstrategicas.splice(oldComboIdx, 1);
        }

        const existingNames = new Set(parsed.reservasEstrategicas.map((r: any) => r.nome.toLowerCase()));
        for (const def of defaultReservasEstrategicas) {
          if (!existingNames.has(def.nome.toLowerCase())) parsed.reservasEstrategicas.push({ ...def });
        }
      }

      // Migration: add new fields if missing
      if (parsed.duracaoPadraoMinutos === undefined) {
        parsed.duracaoPadraoMinutos = 50;
      }
      if (parsed.regimeTributario === undefined) {
        parsed.regimeTributario = 'simples';
      }
      if (parsed.impostoPercentual === undefined) {
        parsed.impostoPercentual = 0.06;
      }

      // Migration: margemLucro was previously markup (could be > 1.0 for >100%).
      // Now it's margin on revenue (0.0 to ~0.50 max realistic).
      // If margemLucro > 0.50, it's likely old markup format — convert.
      if (parsed.margemLucro !== undefined && parsed.margemLucro > 0.50) {
        // Convert markup to margin: margin = markup / (1 + markup)
        parsed.margemLucro = parsed.margemLucro / (1 + parsed.margemLucro);
      }

      return { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }
  return { ...defaultData };
}

export function saveData(data: DadosPrecificacao): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch (e) { console.error('Erro ao salvar dados:', e); }
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
  } catch (e) { console.error('Erro ao carregar lead:', e); }
  return null;
}

export function saveLead(lead: LeadData): void {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify(lead));
    const list = loadLeadsList();
    if (!list.find(l => l.email === lead.email)) {
      list.push(lead);
      localStorage.setItem(LEADS_LIST_KEY, JSON.stringify(list));
    }
  } catch (e) { console.error('Erro ao salvar lead:', e); }
}

export function loadLeadsList(): LeadData[] {
  try {
    const stored = localStorage.getItem(LEADS_LIST_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error('Erro ao carregar leads:', e); }
  return [];
}

// ===== PERFIL FUNCTIONS =====

export function loadPerfil(): PerfilProfissional {
  try {
    const stored = localStorage.getItem(PERFIL_KEY);
    if (stored) return { ...defaultPerfil, ...JSON.parse(stored) };
  } catch (e) { console.error('Erro ao carregar perfil:', e); }
  return { ...defaultPerfil };
}

export function savePerfil(perfil: PerfilProfissional): void {
  try { localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil)); }
  catch (e) { console.error('Erro ao salvar perfil:', e); }
}
