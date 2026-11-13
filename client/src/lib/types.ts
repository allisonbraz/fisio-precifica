export interface LeadData {
  nome: string;
  whatsapp: string;
  email: string;
  registeredAt: string;
}

export interface PerfilProfissional {
  nome: string;
  cidade: string;
  endereco: string;
  crefito: string;
  especialidades: string;
  logoUrl: string;
  whatsapp: string;
  instagram: string;
  cpfCnpj: string;
  nomeEmpresa: string;
  site: string;
  outraRedeSocial: string;
}

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
} from '@shared/pricing-engine';
