import type { PricingProfile, ProfissaoId } from '../profile';
import { perfilEducacaoFisica } from './educacao-fisica';
import { perfilFisioterapia } from './fisioterapia';
import { perfilFonoaudiologia } from './fonoaudiologia';
import { perfilNutricao } from './nutricao';
import { perfilPsicologia } from './psicologia';
import { perfilTerapiaOcupacional } from './terapia-ocupacional';

/**
 * Mapa fechado: o TypeScript recusa o arquivo se `ProfissaoId` ganhar um
 * membro e esta lista não for atualizada.
 */
const registro = {
  fisioterapia: perfilFisioterapia,
  fonoaudiologia: perfilFonoaudiologia,
  'terapia-ocupacional': perfilTerapiaOcupacional,
  nutricao: perfilNutricao,
  psicologia: perfilPsicologia,
  'educacao-fisica': perfilEducacaoFisica,
} as const satisfies Record<ProfissaoId, PricingProfile>;

export const registroPerfis: Record<ProfissaoId, PricingProfile> = registro;

/** Ordem estável para telas e testes. Fisioterapia continua a primeira. */
export const listaPerfis: readonly PricingProfile[] = [
  registro.fisioterapia,
  registro.fonoaudiologia,
  registro['terapia-ocupacional'],
  registro.nutricao,
  registro.psicologia,
  registro['educacao-fisica'],
];

export function obterPerfil(id: ProfissaoId): PricingProfile {
  return registroPerfis[id];
}
