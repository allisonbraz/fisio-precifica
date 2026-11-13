import { perfilIncompleto } from './lacunas';

/**
 * Perfil ainda sem números. A sigla CRFa é o nome do conselho, não uma anuidade.
 * Venda e locação de aparelho ficam no módulo `produtos`, que não está implementado.
 */
export const perfilFonoaudiologia = perfilIncompleto(
  'fonoaudiologia',
  'Fonoaudiologia',
  'Fonoaudiólogo',
  'CRFa',
);
