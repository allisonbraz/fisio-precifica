import { perfilIncompleto } from './lacunas';

/**
 * Perfil ainda sem números. CRN é a sigla do conselho, não uma anuidade.
 */
export const perfilNutricao = perfilIncompleto(
  'nutricao',
  'Nutrição',
  'Nutricionista',
  'CRN',
);
