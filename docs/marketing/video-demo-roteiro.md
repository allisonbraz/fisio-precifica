# Roteiro do Vídeo de Demonstração — FisioPrecifica

> **Objetivo:** Converter visitante frio da landing em comprador (curso, standalone ou mentoria).
> **Duração-alvo:** 4 minutos (margem 3:30–4:30).
> **Audiência:** Fisioterapeuta que clicou no anúncio ou link orgânico. Não conhece o app. Possivelmente cético.
> **Plataforma:** Landing de vendas + YouTube (não-listado, embed) + corte vertical para Reels/Shorts.
> **Apresentador:** Allison Braz.
> **Tom:** Direto, sem floreio, com autoridade técnica. Sem "fala mansa de coach". Empatia sim, condescendência não.

---

## Estrutura em 5 Atos

| Ato | Duração | Objetivo | O que está na tela |
|-----|---------|----------|--------------------|
| 1. Hook (problema) | 0:00–0:25 | Prender atenção, gerar identificação | Allison falando câmera + texto na tela |
| 2. Promessa (solução) | 0:25–0:50 | Ancorar valor, explicar o que vamos ver | Allison + screen recording rápido (montagem) |
| 3. Demo prática | 0:50–3:10 | Mostrar o app funcionando com dados reais | Screen recording + voiceover |
| 4. Recap + diferenciais | 3:10–3:40 | Reforçar valor, lidar com objeção comum | Allison na câmera + bullets na tela |
| 5. CTA | 3:40–4:00 | Direcionar para a compra | Allison + texto + link/botão |

---

## ATO 1 — Hook (0:00 a 0:25) [25 segundos]

### Tela
- **Plano:** Allison falando direto para câmera, fundo simples (consultório ou estúdio)
- **Texto sobreposto (3s in):** "Você cobra pelo que vale ou pelo que tem coragem?"

### Fala (palavra-por-palavra)

> "Você é fisioterapeuta. Atende muito bem. Pacientes voltam, indicam outros, te elogiam. Mas no fim do mês, o dinheiro não bate. Você trabalha 50 horas por semana e ganha menos do que o aluguel de algumas salas dessa cidade. E sabe por quê? Não é porque você atende mal. É porque você cobra errado."

**Notas de direção:**
- Começar olhando direto pra câmera, sério.
- Pausa de 0.5s depois de "ganha menos do que o aluguel de algumas salas dessa cidade" — deixa a frase respirar.
- Última frase ("você cobra errado") com um leve sorriso de "eu sei do que estou falando".

---

## ATO 2 — Promessa (0:25 a 0:50) [25 segundos]

### Tela
- Allison em primeiro plano por 5s, depois corta para uma rápida montagem das telas do app (3-4 cortes de 1.5s cada): Calculadora rápida → Custos → Indicadores → Cartão profissional.

### Fala

> "Eu construí uma ferramenta que resolve isso. Em menos de 30 minutos, ela te mostra **quanto custa atender de verdade**, **quanto você precisa cobrar** pra viver bem, e **por que** esse é o número certo — com argumentos que param em pé na frente de qualquer paciente, contador ou parceiro. Se chama FisioPrecifica. Vou te mostrar funcionando, ao vivo, agora."

**Notas:**
- Negrito = palavras a enfatizar na voz.
- A última frase ("vou te mostrar funcionando, ao vivo, agora") é a transição — fala enquanto o corte para a tela do app já está acontecendo.

---

## ATO 3 — Demo Prática (0:50 a 3:10) [2 minutos e 20 segundos]

> **Modo:** Screen recording da tela do app + voiceover (Allison fala enquanto navega).
> **Cursor:** Movimento calmo, sem cliques desnecessários. Cursor circle effect ON para destacar onde clica.

### Cena 3.1 — Calculadora Rápida (0:50 a 1:20) [30s]

**Tela:** Landing page do app, scroll até a Calculadora Rápida.

**Fala:**
> "Sem cadastro nenhum, na própria landing, você já tem uma calculadora rápida. Olha só: quanto você cobra hoje por sessão?" *[digita: R$ 100]* "Quantos atendimentos por semana?" *[digita: 30]* "E quantos custos fixos você estima por mês?" *[digita: R$ 4.000]* "Pronto. Veja: você está tirando R$ 6,67 de lucro por hora trabalhada. Menos do que um entregador de aplicativo. E essa é só a entrada — falta entrar imposto, reserva pra férias, depreciação dos equipamentos. Provavelmente você está no negativo e nem sabe."

**Notas:**
- Os números são exemplos — substituir pelos defaults reais da Calculadora Rápida em `client/src/pages/Home.tsx` quando gravar.
- A frase "menos do que um entregador de aplicativo" é deliberadamente provocativa. Quem vai assistir ou se identifica e segue, ou se ofende e fecha. Quem segue é o cliente certo.

### Cena 3.2 — Login + Custos Detalhados (1:20 a 1:50) [30s]

**Tela:** Login → Dashboard → Custos → aba "Custos Fixos" → cadastro de itens.

**Fala:**
> "Mas a calculadora rápida é só o começo. Quando você cria sua conta — leva 30 segundos, é gratuito pra começar — você entra no app completo. Aqui você cadastra todos os seus custos fixos: aluguel da sala, internet, software, contador..." *[mostra lista]* "...depreciação dos equipamentos — sim, sua maca, seu aparelho, sua cadeira têm vida útil e isso entra no preço — e custos variáveis por sessão, tipo material descartável e comissão de plataforma."

**Notas:**
- Mostrar visualmente as 4 abas: Custos Fixos, Depreciação, Custos Variáveis, Reservas.
- Pausar 1s na aba Reservas e dizer "essa aqui é a que ninguém calcula — vou voltar nela".

### Cena 3.3 — Reservas Estratégicas (1:50 a 2:15) [25s]

**Tela:** Aba Reservas (dentro de Custos).

**Fala:**
> "A reserva é o que separa o profissional do amador. Férias, 13º se você tira, fundo de emergência. Dá pra cadastrar valor fixo por mês — tipo R$ 500 pra férias — ou percentual da receita, tipo 8.33% pro 13º. O app calcula a circularidade pra você: ele estima a receita, calcula a reserva, e ajusta o preço de novo. Você não precisa fazer essa conta. O sistema faz."

**Notas:**
- Enquanto fala, fazer o toggle entre "Modo Fixo" e "Modo Percentual" pra mostrar visualmente.

### Cena 3.4 — Precificação (2:15 a 2:45) [30s]

**Tela:** Página `/precificacao`, mostrando o cálculo final com regime tributário.

**Fala:**
> "Agora o coração do app: precificação. Você escolhe seu regime tributário..." *[abre o select]* "MEI 5%, Simples Nacional, Lucro Presumido, Autônomo Pessoa Física, ou personalizado se você tem uma situação específica. Define a margem que quer..." *[mexe no slider]* "...e o app te entrega o preço justo. Esse aqui é seu preço mínimo pra não estar pagando pra trabalhar. Esse aqui é o preço com a margem que você definiu. E esse aqui — esse é o preço que coloca você no lucro de verdade."

**Notas:**
- Apontar visualmente para os 3 níveis de preço com cursor ou anotação na pós-produção.
- "Pagando pra trabalhar" — frase que pega forte. Falar com pausa.

### Cena 3.5 — Indicadores e Saúde Financeira (2:45 a 3:10) [25s]

**Tela:** Página `/indicadores`, mostrando o radar chart e o Score.

**Fala:**
> "E porque preço sozinho não conta a história toda, o app te mostra a sua saúde financeira completa. Taxa de ocupação. Ponto de equilíbrio — quantas sessões você precisa fazer no mês pra não dar prejuízo. Diversificação de receita. E um score de 0 a 100 que olha pra tudo isso de uma vez. Aqui não tem mistério. Tem número, tem método, e tem decisão."

**Notas:**
- Pausar no radar chart por 2s pra dar destaque visual.
- "Aqui não tem mistério. Tem número, tem método, e tem decisão" — repete o ritmo de 3 da última frase do Ato 1.

---

## ATO 4 — Recap + Diferenciais (3:10 a 3:40) [30 segundos]

### Tela
- Allison na câmera. Texto sobreposto com 3 bullets aparecendo um a um:
  - ✓ Cadastrou seus custos
  - ✓ Calculou seu preço justo
  - ✓ Sabe sua saúde financeira

### Fala

> "Em 30 minutos no app, você sai do achismo e entra no método. Você sabe quanto custa atender. Sabe quanto cobrar. Sabe defender seu preço. E isso, antes de qualquer estratégia de marketing, antes de qualquer script de venda, é o que separa o fisioterapeuta que cobra R$ 80 do fisioterapeuta que cobra R$ 200 — e os pacientes pagam, porque o profissional sabe o que está fazendo."

**Notas:**
- Última frase é o coração do pitch. Falar olhando direto pra câmera, com convicção.
- Não sorrir. Manter postura de autoridade.

---

## ATO 5 — CTA (3:40 a 4:00) [20 segundos]

### Tela
- Allison na câmera por 5s.
- Depois: card visual com 3 opções de compra (mesmo design da landing de vendas).
- Texto grande no final: **fisio-precifica.vercel.app/comprar**

### Fala

> "Tem três jeitos de começar. Se você quer só a ferramenta, são R$ 200 por um ano de acesso. Se você quer aprender o método junto com a ferramenta, é o curso completo Precificação Inteligente, com 17 aulas e o app por R$ 297. E se você quer transformação completa, com mentoria ao vivo de 12 semanas e tudo isso de bônus, conhece o programa Fisioterapeuta Inabalável. Link aqui embaixo. Decide o seu caminho."

**Notas:**
- "Decide o seu caminho" — frase de fechamento. Pausa final de 1s antes do corte.
- O texto-link no final precisa ficar em tela por pelo menos 3s estáticos, com música suave.

---

## Versões Derivadas (cortes para outras plataformas)

### Versão Reels/TikTok/Shorts (60 segundos)
**Mantém:** Ato 1 (hook completo, 25s) + Cena 3.1 (calculadora rápida, 25s) + CTA simplificado (10s).
**Corta:** Atos 2, 3.2-3.5, 4.
**Diferença visual:** Formato 9:16, legendas grudadas (closed captions sempre on, fundo escuro com texto branco), edição mais rápida.
**CTA único:** "Link na bio".

### Versão LinkedIn / longa (8-10min)
**Mantém:** Tudo da versão de 4min.
**Adiciona:**
- Antes do Ato 1: Allison se apresentando (15s) — credenciais, por que construiu o app
- Entre 3.5 e Ato 4: depoimento de 1 aluno (30s) — caso real de impacto
- Após CTA: Bastidores do app (1-2min) — por que cada feature foi construída assim, princípios técnicos. Para audiência mais técnica/executiva.

---

## Equipamento e Produção

### Mínimo viável
- **Câmera:** Celular moderno (iPhone 12+ ou Android equivalente), tripé.
- **Áudio:** Microfone de lapela com fio (Boya BY-M1 ou Maono AU-100). **Áudio do celular embutido NÃO serve.**
- **Iluminação:** Luz natural lateral (janela à esquerda ou direita). Se gravar à noite, ring light barato.
- **Screen recording:** OBS Studio (gratuito) ou Loom. Resolução 1920x1080, 30fps.
- **Edição:** CapCut (gratuito) ou DaVinci Resolve. Não precisa de Premiere.

### Detalhes que diferenciam
- Cursor circle effect (CapCut tem nativo)
- Closed captions sempre ligadas (60% das pessoas vão assistir sem som)
- Música de fundo suave, instrumental, baixo volume (trilhas livres em Epidemic Sound, YouTube Audio Library)
- Logo do FisioPrecifica nos primeiros 2s e nos últimos 3s
- Cores do branding (Terracotta `oklch(0.62 0.12 45)` e Sage `oklch(0.62 0.06 155)`) nos textos sobrepostos

---

## Checklist Pré-gravação

- [ ] Conta de teste no app criada com dados realistas (não vazios, não absurdos)
  - Custos fixos: R$ 4.000-6.000 cadastrados
  - Custos variáveis: 2-3 itens
  - Reservas: férias R$ 500/mês, 13º 8.33%, emergência 5%
  - Regime: Simples Nacional (mais comum)
  - 2-3 serviços cadastrados
- [ ] Browser sem extensões visíveis (modo privado ou perfil limpo)
- [ ] Notificações desligadas
- [ ] Roteiro impresso ou no segundo monitor (sem teleprompter — deixa robotizado)
- [ ] Ambiente sem ruído
- [ ] Roupa neutra (azul, cinza, branco — nada com listras finas que dão moiré)
- [ ] Bateria do celular acima de 50% / câmera plugada
- [ ] Testar áudio com 30s de gravação antes de começar
- [ ] Beber água — boca seca atrapalha demais

---

## Checklist Pós-gravação (edição)

- [ ] Cortar respiros longos e "umm"/"ééé"
- [ ] Adicionar legendas (CapCut tem auto-caption)
- [ ] Revisar legendas — auto-caption erra termos técnicos
- [ ] Adicionar zoom-ins nos números importantes (preço final, score)
- [ ] Música de fundo a -25dB (bem baixa)
- [ ] Voz do Allison a -6dB (alta, clara)
- [ ] Texto sobreposto em momentos-chave (frases de impacto)
- [ ] Fade in/out de 0.5s no início e fim
- [ ] Thumbnail com Allison + texto grande "QUANTO VOCÊ COBRA?"
- [ ] Exportar em 1080p, MP4, H.264
- [ ] Versão vertical 9:16 cortada (1080x1920) com elementos visuais reposicionados

---

## Métricas para Avaliar Sucesso do Vídeo

> Definir antes de publicar. Reavaliar a cada 30 dias.

| Métrica | Meta inicial | Onde medir |
|---------|--------------|------------|
| View rate (% que assiste >50%) | >40% | YouTube Analytics |
| Click-through rate (clica no CTA) | >5% | Vercel Analytics + UTM |
| Conversion rate (compra após assistir) | >2% | Plataforma de pagamento (UTM) |
| Watch time médio | >2:30 (de 4min) | YouTube Analytics |
| Comentários por 100 views | >0.5 | YouTube + redes sociais |

---

## Notas de Posicionamento (para manter consistência)

**Tom:** Não é coach. Não é guru. Não é vendedor. É um fisioterapeuta-engenheiro que construiu uma ferramenta porque precisava — e descobriu que muita gente precisava também.

**O que NÃO falar no vídeo:**
- ❌ "Mude sua vida" / "transforme tudo"
- ❌ "Garantia de R$X em 30 dias"
- ❌ Promessas de resultado financeiro específico
- ❌ Comparações depreciativas com outras profissões
- ❌ "Eu já fiz X reais" / flexing financeiro
- ❌ Termos técnicos sem explicação imediata

**O que FALAR (e foi reforçado neste roteiro):**
- ✅ "Pagando pra trabalhar"
- ✅ "Achismo vs método"
- ✅ "Números que param em pé"
- ✅ "Cobra errado" (sem julgar — explicando por que)
- ✅ Argumentos que a pessoa pode usar com pacientes/parceiros

---

## Versionamento deste Documento

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | 2026-05-01 | @pm Morgan + Allison | Roteiro inicial completo |

---

*Documento mantido em `docs/marketing/` — extender conforme novas variações de vídeo forem produzidas (testimonials, tutoriais técnicos, vídeos de feature, etc.).*
