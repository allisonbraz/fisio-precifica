import { perfilIncompleto } from './lacunas';

/**
 * Perfil ainda sem números. CRP é a sigla do conselho, não uma anuidade.
 */
export const perfilPsicologia = perfilIncompleto(
  'psicologia',
  'Psicologia',
  'Psicólogo',
  'CRP',
);
