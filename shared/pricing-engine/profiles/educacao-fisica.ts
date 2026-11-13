import { perfilIncompleto } from './lacunas';

/**
 * Perfil ainda sem números. CREF é a sigla do conselho, não uma anuidade.
 * "Personal" é o nome do dia a dia; não há duração nem preço de aula neste repositório.
 */
export const perfilEducacaoFisica = perfilIncompleto(
  'educacao-fisica',
  'Educação física',
  'Educador físico',
  'CREF',
  ['personal'],
);
