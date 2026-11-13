import { perfilIncompleto } from './lacunas';

/**
 * Perfil ainda sem números. No Brasil o conselho regional é o CREFITO,
 * compartilhado com a fisioterapia; a anuidade não foi copiada da linha da fisio.
 */
export const perfilTerapiaOcupacional = perfilIncompleto(
  'terapia-ocupacional',
  'Terapia ocupacional',
  'Terapeuta ocupacional',
  'CREFITO',
);
