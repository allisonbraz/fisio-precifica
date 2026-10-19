import type { ReactNode } from 'react';
import { Link } from 'wouter';

type LegalDocument = 'privacy' | 'terms';

export default function Legal({ document }: { document: LegalDocument }) {
  const isPrivacy = document === 'privacy';

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 text-foreground sm:px-6">
      <Link href="/" className="text-sm font-medium text-primary hover:underline">← Voltar ao FisioPrecifica</Link>
      <article className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <header>
          <h1 className="font-heading text-3xl font-bold">{isPrivacy ? 'Política de Privacidade' : 'Termos de Uso'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Última atualização: 19 de outubro de 2026</p>
        </header>
        {isPrivacy ? <PrivacyContent /> : <TermsContent />}
      </article>
    </main>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-5 text-sm leading-6 text-muted-foreground">
      <p>O FisioPrecifica trata seus dados para fornecer cálculos, salvar suas configurações e permitir o uso da conta.</p>
      <Section title="Dados que coletamos">
        <p>Coletamos dados de cadastro (nome, e-mail e senha), dados profissionais informados no perfil (como CPF/CNPJ, endereço, CREFITO e canais de contato) e dados financeiros cadastrados no app (custos, receitas e preços). Se um cadastro de contato for feito com consentimento explícito, também podem ser registrados WhatsApp, IP e o identificador do navegador.</p>
      </Section>
      <Section title="Como usamos os dados">
        <p>Dados de cadastro permitem autenticação e comunicação sobre a conta. Dados profissionais e financeiros são usados somente para os recursos do FisioPrecifica. Dados de contato para marketing, incluindo WhatsApp, IP e identificador do navegador, só são usados depois de um aceite explícito. Sem esse aceite, o servidor recusa o cadastro.</p>
      </Section>
      <Section title="Compartilhamento e segurança">
        <p>Os dados financeiros ficam isolados por conta. O acesso direto ao banco é limitado por regras de segurança, e a operação administrativa usa uma chave separada no servidor. Não vendemos esses dados.</p>
      </Section>
      <Section title="Seus direitos">
        <p>Você pode exportar um backup em <Link href="/configuracoes" className="text-primary hover:underline">Configurações</Link>. Para pedir a exclusão da conta e dos dados, use o canal oficial de atendimento do produto, a partir do e-mail vinculado à conta. A exclusão automática dentro do app ainda não está disponível.</p>
      </Section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-5 text-sm leading-6 text-muted-foreground">
      <p>O FisioPrecifica é uma ferramenta de apoio para organizar custos e estimar preços de serviços de fisioterapia.</p>
      <Section title="Uso responsável">
        <p>As informações e os cálculos são referências para a sua decisão. Eles não substituem orientação contábil, tributária, jurídica ou clínica individualizada. Confirme alíquotas e obrigações com o seu contador.</p>
      </Section>
      <Section title="Conta e dados">
        <p>Você é responsável por manter suas credenciais seguras e pelas informações que inserir. Os dados podem ser exportados em Configurações. A exclusão pode ser solicitada pelo canal indicado na Política de Privacidade.</p>
      </Section>
      <Section title="Contato">
        <p>Dúvidas sobre o produto, estes termos ou a privacidade devem ser encaminhadas pelo canal oficial de atendimento do FisioPrecifica.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
