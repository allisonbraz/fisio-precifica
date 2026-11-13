/**
 * FisioPrecifica Data Store v4
 * Barrel re-export + localStorage persistence + data migration
 */

// Re-export everything from modules for backward compatibility
export type * from './types';
export * from './calculations';
export * from './alerts';
export * from './formatters';

import { criarDocumentoInicial, perfilFisioterapia } from '@shared/pricing-engine';
import { markLocalDataCleared, setPendingLocalSync } from './sync';
import type {
  CustoFixo,
  CustoVariavel,
  DadosPrecificacao,
  FrequenciaCusto,
  LeadData,
  PerfilProfissional,
  ReservaEstrategica,
} from './types';

// ===== STORAGE KEYS =====

const STORAGE_KEY = 'fisioprecifica_data';
const LEAD_KEY = 'fisioprecifica_lead';
const PERFIL_KEY = 'fisioprecifica_perfil';
const LEADS_LIST_KEY = 'fisioprecifica_leads_list';

// ===== DEFAULT DATA =====

const defaultCustosFixos: CustoFixo[] = [...perfilFisioterapia.custosFixos];
const defaultDepreciacao: CustoFixo[] = [...perfilFisioterapia.depreciacao];
const defaultCustosVariaveis: CustoVariavel[] = [...perfilFisioterapia.custosVariaveis];
const defaultReservasEstrategicas: ReservaEstrategica[] = [...perfilFisioterapia.reservas];
const defaultData: DadosPrecificacao = criarDocumentoInicial(perfilFisioterapia);

const defaultPerfil: PerfilProfissional = {
  nome: '',
  cidade: '',
  endereco: '',
  crefito: '',
  especialidades: '',
  logoUrl: '',
  whatsapp: '',
  instagram: '',
  cpfCnpj: '',
  nomeEmpresa: '',
  site: '',
  outraRedeSocial: '',
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

function findDefaultByName<T extends { nome: string }>(nome: string, defaults: T[]): T | undefined {
  const normalized = nome.toLowerCase().trim();
  const exact = defaults.find(d => d.nome.toLowerCase().trim() === normalized);
  if (exact) return exact;
  return defaults.find(d =>
    d.nome.toLowerCase().includes(normalized) || normalized.includes(d.nome.toLowerCase())
  );
}

type LegacyCost = {
  id?: string;
  nome: string;
  valor?: number;
  frequencia?: FrequenciaCusto;
  observacao?: string;
  descricao?: string;
  isDepreciacao?: boolean;
  temParcelaAtiva?: boolean;
  modo?: CustoVariavel['modo'] | ReservaEstrategica['modo'];
  percentual?: number;
};

type LegacyStored = {
  pacotes?: DadosPrecificacao['planosTratamento'];
  planosTratamento?: DadosPrecificacao['planosTratamento'];
  custosFixos?: LegacyCost[];
  custosVariaveis?: LegacyCost[];
  reservasEstrategicas?: LegacyCost[];
  duracaoPadraoMinutos?: number;
  regimeTributario?: string;
  impostoPercentual?: number;
  margemLucro?: number;
  etapasConcluidas?: DadosPrecificacao['etapasConcluidas'];
};

// ===== LOAD / SAVE =====

export function loadData(): DadosPrecificacao {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as LegacyStored;
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
        const migratedToReservas: LegacyCost[] = [];
        parsed.custosFixos = parsed.custosFixos.filter((c) => {
          if (ITEMS_TO_MIGRATE_TO_RESERVAS.has(c.nome.toLowerCase().trim())) {
            if ((c.valor ?? 0) > 0) migratedToReservas.push(c);
            return false;
          }
          return true;
        });

        parsed.custosFixos = parsed.custosFixos.map((c) => {
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
            isDepreciacao: c.isDepreciacao || matched?.isDepreciacao || false,
            temParcelaAtiva: c.temParcelaAtiva ?? matched?.temParcelaAtiva ?? false,
          };
        });

        const deduped = new Map<string, LegacyCost>();
        for (const c of parsed.custosFixos) {
          const key = c.nome.toLowerCase().trim();
          const existing = deduped.get(key);
          if (!existing || (c.valor ?? Number.NaN) > (existing.valor ?? Number.NaN)) deduped.set(key, c);
        }
        parsed.custosFixos = Array.from(deduped.values());

        const existingNames = new Set(parsed.custosFixos.map((c) => c.nome.toLowerCase()));
        for (const def of [...defaultCustosFixos, ...defaultDepreciacao]) {
          if (!existingNames.has(def.nome.toLowerCase())) parsed.custosFixos.push({ ...def });
        }

        if (migratedToReservas.length > 0 && !parsed.reservasEstrategicas) {
          parsed.reservasEstrategicas = [...defaultReservasEstrategicas];
        }
      }

      if (parsed.custosVariaveis) {
        parsed.custosVariaveis = parsed.custosVariaveis.filter((c) => {
          const impostoLegado = c.id === '8' || c.id === '9' || /imposto|\bdas\b|irpj/i.test(c.nome);
          return !impostoLegado || (c.valor ?? 0) > 0;
        }).map((c) => {
          if (c.id === '2' && c.nome === 'Material descartável por sessão') {
            c.nome = 'Materiais de uso único por sessão';
          }
          const defaultById = defaultCustosVariaveis.find(d => d.id === c.id);
          const defaultByName = findDefaultByName(c.nome, defaultCustosVariaveis);
          const matched = defaultById || defaultByName;
          const impostoLegado = c.id === '8' || c.id === '9' || /imposto|\bdas\b|irpj/i.test(c.nome);
          return {
            ...c,
            nome: impostoLegado ? `${c.nome} — revisar possível duplicidade` : c.nome,
            frequencia: c.frequencia || 'mensal',
            modo: c.modo || matched?.modo || 'mensal',
            percentual: c.percentual || 0,
            descricao: impostoLegado
              ? 'Valor legado preservado. Se este tributo já estiver na alíquota da Precificação, zere este item para não contar duas vezes.'
              : matched?.descricao || c.descricao || '',
          };
        });
        const existingNames = new Set(parsed.custosVariaveis.map((c) => c.nome.toLowerCase()));
        for (const def of defaultCustosVariaveis) {
          if (!existingNames.has(def.nome.toLowerCase())) parsed.custosVariaveis.push({ ...def });
        }
      }

      if (!parsed.reservasEstrategicas) {
        parsed.reservasEstrategicas = [...defaultReservasEstrategicas];
      } else {
        // Migration: split old "Férias e 13º (provisão)" into two separate items
        const oldComboIdx = parsed.reservasEstrategicas.findIndex(
          (r) => r.nome.toLowerCase().includes('férias e 13')
        );
        if (oldComboIdx !== -1) {
          parsed.reservasEstrategicas.splice(oldComboIdx, 1);
        }

        const existingNames = new Set(parsed.reservasEstrategicas.map((r) => r.nome.toLowerCase()));
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
      if (parsed.regimeTributario === 'mei') {
        parsed.regimeTributario = 'personalizado';
      }
      if (parsed.impostoPercentual === undefined) {
        parsed.impostoPercentual = 0.06;
      }
      if (!parsed.etapasConcluidas) parsed.etapasConcluidas = {};

      // Migration: margemLucro was previously markup (could be > 1.0 for >100%).
      // Now it's margin on revenue (0.0 to ~0.50 max realistic).
      // If margemLucro > 0.50, it's likely old markup format — convert.
      if (parsed.margemLucro !== undefined && parsed.margemLucro > 0.50) {
        // Convert markup to margin: margin = markup / (1 + markup)
        parsed.margemLucro = parsed.margemLucro / (1 + parsed.margemLucro);
      }

      return { ...defaultData, ...(parsed as unknown as Partial<DadosPrecificacao>) };
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

export function clearAllLocalData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEAD_KEY);
  localStorage.removeItem(PERFIL_KEY);
  localStorage.removeItem(LEADS_LIST_KEY);
  setPendingLocalSync(false);
  markLocalDataCleared();
}
