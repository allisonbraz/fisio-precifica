/**
 * Perfil Page
 * Design: Warm Professional — Organic Modernism
 * Professional identification: name, city, CREFITO, specialties, logo/photo
 * Data used for personalized reports and PDF download
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle,
  Camera,
  MapPin,
  Award,
  Stethoscope,
  Download,
  FileText,
  Save,
  Phone,
  Instagram,
  FileDigit,
  Building2,
  Globe,
  Link,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/PageHeader';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosOperacionais,
  calcularTotalDepreciacao,
  calcularTotalCustosVariaveis,
  calcularTotalReservas,
  calcularCustoTotalMensal,
  calcularPrecoMinimo,
  calcularCustoTotalPorSessao,
  calcularTaxaOcupacao,
  calcularPontoEquilibrio,
  calcularValorHora,
  calcularPrecoServico,
  calcularPrecoPlano,
  formatarMoeda,
  getValorMensal,
} from '@/lib/store';
import { toast } from 'sonner';

export default function Perfil() {
  const { data, perfil, updatePerfil, isRegistered, lead } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generating, setGenerating] = useState(false);

  // Auto-scroll to PDF section if hash is #relatorio
  useEffect(() => {
    if (window.location.hash === '#relatorio') {
      setTimeout(() => document.getElementById('relatorio')?.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      updatePerfil({ logoUrl: result });
      toast.success('Foto/logo atualizada!');
    };
    reader.readAsDataURL(file);
  };

  const generatePDF = async () => {
    if (!isRegistered) {
      toast.error('Faça login para baixar o relatório');
      return;
    }

    setGenerating(true);

    try {
      const custoOperacional = calcularTotalCustosOperacionais(data.custosFixos);
      const custoDepreciacao = calcularTotalDepreciacao(data.custosFixos);
      const custoVarTotal = calcularTotalCustosVariaveis(data.custosVariaveis);
      const totalReservas = calcularTotalReservas(data.reservasEstrategicas);
      const custoFixoTotal = custoOperacional + custoDepreciacao;
      const custoMensal = calcularCustoTotalMensal(data);
      const precoPorSessao = calcularPrecoMinimo(data); // preço = custo + margem
      const custoSessao = calcularCustoTotalPorSessao(data);
      const taxaOcupacao = calcularTaxaOcupacao(data);
      const pontoEquilibrio = calcularPontoEquilibrio(data, precoPorSessao);
      const valorHora = calcularValorHora(data, precoPorSessao);
      const receitaPotencial = precoPorSessao * data.sessoesMeta;
      const lucroOperacional = receitaPotencial - custoMensal;
      const lucroDisponivel = lucroOperacional - totalReservas;
      const margemLiquida = receitaPotencial > 0 ? (lucroOperacional / receitaPotencial) * 100 : 0;
      const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

      // Build custos fixos table rows
      const custosFixosRows = data.custosFixos
        .filter(c => c.valor > 0)
        .map(c => `
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;">${c.nome}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:center;">${c.frequencia === 'anual' ? 'Anual' : 'Mensal'}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:right;font-family:monospace;">${formatarMoeda(c.valor)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:right;font-family:monospace;">${formatarMoeda(getValorMensal(c))}</td>
          </tr>
        `).join('');

      const custosVariaveisRows = data.custosVariaveis
        .filter(c => c.valor > 0)
        .map(c => `
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;">${c.nome}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:center;">${c.frequencia === 'anual' ? 'Anual' : 'Mensal'}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:right;font-family:monospace;">${formatarMoeda(c.valor)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:right;font-family:monospace;">${formatarMoeda(getValorMensal(c))}</td>
          </tr>
        `).join('');

      const servicosRows = data.tiposServico.map(s => {
        const preco = calcularPrecoServico(data, s);
        return `
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;">${s.nome}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:center;">${s.duracaoMinutos} min</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:center;">×${s.multiplicadorPreco.toFixed(1)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:right;font-family:monospace;font-weight:bold;color:#b5725d;">${formatarMoeda(preco)}</td>
          </tr>
        `;
      }).join('');

      const planosRows = data.planosTratamento.map(p => {
        const servico = data.tiposServico.find(s => s.id === p.tipoServicoId);
        const precoUnit = servico ? calcularPrecoServico(data, servico) : precoPorSessao;
        const precoPlano = calcularPrecoPlano(precoUnit, p);
        return `
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;">${p.nome}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:center;">${p.quantidadeSessoes}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:center;">${p.descontoPercentual}%</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:right;font-family:monospace;font-weight:bold;color:#b5725d;">${formatarMoeda(precoPlano)}</td>
          </tr>
        `;
      }).join('');

      const logoSection = perfil.logoUrl
        ? `<img src="${perfil.logoUrl}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #c2785c;" />`
        : `<div style="width:60px;height:60px;border-radius:50%;background:#c2785c;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:bold;">${(perfil.nome || lead?.nome || 'F')[0].toUpperCase()}</div>`;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Relatório de Precificação - FisioPrecifica</title>
  <style>
    @page { margin: 20mm 15mm; size: A4; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #3d3428; line-height: 1.5; margin: 0; padding: 0; }
    .header { background: linear-gradient(135deg, #c2785c 0%, #7c9a82 100%); color: white; padding: 24px; border-radius: 0 0 16px 16px; margin-bottom: 20px; }
    .header-content { display: flex; align-items: center; gap: 16px; }
    .header-info h1 { margin: 0; font-size: 20px; }
    .header-info p { margin: 2px 0; font-size: 12px; opacity: 0.9; }
    .section { margin-bottom: 20px; break-inside: avoid; }
    .section-title { font-size: 15px; font-weight: 700; color: #c2785c; border-bottom: 2px solid #c2785c; padding-bottom: 4px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f0eb; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #8a7e74; border-bottom: 2px solid #e5e0d8; }
    .highlight-box { background: #f5f0eb; border: 1px solid #e5e0d8; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .metric { background: white; border: 1px solid #e5e0d8; border-radius: 8px; padding: 12px; text-align: center; }
    .metric-label { font-size: 10px; color: #8a7e74; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-value { font-size: 18px; font-weight: 700; color: #c2785c; font-family: monospace; margin-top: 4px; }
    .footer { text-align: center; font-size: 10px; color: #8a7e74; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e0d8; }
    .price-highlight { background: linear-gradient(135deg, #c2785c10, #7c9a8210); border: 2px solid #c2785c; border-radius: 12px; padding: 20px; text-align: center; margin: 16px 0; }
    .price-highlight .price { font-size: 32px; font-weight: 700; color: #c2785c; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      ${logoSection}
      <div class="header-info">
        <h1>${perfil.nome || lead?.nome || 'Fisioterapeuta'}</h1>
        ${perfil.crefito ? `<p>📋 ${perfil.crefito}</p>` : ''}
        ${perfil.cidade ? `<p>📍 ${perfil.cidade}</p>` : ''}
        ${perfil.especialidades ? `<p>🏥 ${perfil.especialidades}</p>` : ''}
      </div>
    </div>
  </div>

  <div style="padding: 0 10px;">
    <div class="section">
      <div class="section-title">Resumo Financeiro</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">
        <div style="background:#fdf2ee;border:2px solid #c2785c;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:#8a7e74;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">CUSTO POR SESSÃO</div>
          <div style="font-size:28px;font-weight:700;color:#c2785c;font-family:monospace;">${formatarMoeda(custoSessao)}</div>
          <div style="font-size:10px;color:#8a7e74;margin-top:4px;">Mínimo para não ter prejuízo</div>
        </div>
        <div style="background:#f0f5f1;border:2px solid #7c9a82;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:#8a7e74;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">PREÇO POR SESSÃO</div>
          <div style="font-size:28px;font-weight:700;color:#7c9a82;font-family:monospace;">${formatarMoeda(precoPorSessao)}</div>
          <div style="font-size:10px;color:#8a7e74;margin-top:4px;">Com margem de ${(data.margemLucro * 100).toFixed(0)}% sobre o custo</div>
        </div>
      </div>
      <div class="metric-grid">
        <div class="metric">
          <div class="metric-label">Custo Mensal Total</div>
          <div class="metric-value">${formatarMoeda(custoMensal)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Receita Potencial</div>
          <div class="metric-value" style="color:#7c9a82;">${formatarMoeda(receitaPotencial)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Lucro Operacional</div>
          <div class="metric-value" style="color:${lucroOperacional >= 0 ? '#7c9a82' : '#c2785c'};">${formatarMoeda(lucroOperacional)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Margem Líquida</div>
          <div class="metric-value">${margemLiquida.toFixed(1)}%</div>
        </div>
        <div class="metric">
          <div class="metric-label">Ponto de Equilíbrio</div>
          <div class="metric-value">${pontoEquilibrio === Infinity ? '—' : pontoEquilibrio + ' sessões'}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Valor/Hora</div>
          <div class="metric-value">${formatarMoeda(valorHora)}</div>
        </div>
      </div>
    </div>

    ${custosFixosRows ? `
    <div class="section">
      <div class="section-title">Custos Fixos</div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Período</th>
            <th style="text-align:right;">Valor</th>
            <th style="text-align:right;">Mensal</th>
          </tr>
        </thead>
        <tbody>
          ${custosFixosRows}
          <tr style="background:#f5f0eb;font-weight:bold;">
            <td colspan="3" style="padding:8px 10px;font-size:12px;">TOTAL</td>
            <td style="padding:8px 10px;font-size:12px;text-align:right;font-family:monospace;color:#c2785c;">${formatarMoeda(custoFixoTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}

    ${custosVariaveisRows ? `
    <div class="section">
      <div class="section-title">Custos Variáveis</div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Período</th>
            <th style="text-align:right;">Valor</th>
            <th style="text-align:right;">Mensal</th>
          </tr>
        </thead>
        <tbody>
          ${custosVariaveisRows}
          <tr style="background:#f5f0eb;font-weight:bold;">
            <td colspan="3" style="padding:8px 10px;font-size:12px;">TOTAL</td>
            <td style="padding:8px 10px;font-size:12px;text-align:right;font-family:monospace;color:#d4a853;">${formatarMoeda(custoVarTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">Tabela de Serviços</div>
      <table>
        <thead>
          <tr>
            <th>Serviço</th>
            <th style="text-align:center;">Duração</th>
            <th style="text-align:center;">Multiplicador</th>
            <th style="text-align:right;">Preço Sugerido</th>
          </tr>
        </thead>
        <tbody>
          ${servicosRows}
        </tbody>
      </table>
    </div>

    ${planosRows ? `
    <div class="section">
      <div class="section-title">Planos de Tratamento</div>
      <table>
        <thead>
          <tr>
            <th>Plano</th>
            <th style="text-align:center;">Sessões</th>
            <th style="text-align:center;">Desconto</th>
            <th style="text-align:right;">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${planosRows}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${totalReservas > 0 ? `
    <div class="section">
      <div class="section-title">Reservas Estratégicas</div>
      <table>
        <thead>
          <tr>
            <th>Reserva</th>
            <th style="text-align:right;">Valor Mensal</th>
          </tr>
        </thead>
        <tbody>
          ${data.reservasEstrategicas.filter(r => r.valor > 0).map(r => `
            <tr>
              <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;">${r.nome}</td>
              <td style="padding:6px 10px;border-bottom:1px solid #e5e0d8;font-size:12px;text-align:right;font-family:monospace;">${formatarMoeda(r.valor)}</td>
            </tr>
          `).join('')}
          <tr style="background:#f5f0eb;font-weight:bold;">
            <td style="padding:8px 10px;font-size:12px;">TOTAL RESERVAS</td>
            <td style="padding:8px 10px;font-size:12px;text-align:right;font-family:monospace;color:#7c9a82;">${formatarMoeda(totalReservas)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">Composição do Lucro</div>
      <div class="highlight-box" style="background:linear-gradient(135deg,#f5f0eb,#f0f5f1);">
        <div style="font-size:13px;line-height:2;">
          <div style="display:flex;justify-content:space-between;"><span>Receita Potencial</span><strong style="font-family:monospace;color:#7c9a82;">${formatarMoeda(receitaPotencial)}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span>− Custos Operacionais</span><strong style="font-family:monospace;color:#c2785c;">−${formatarMoeda(custoOperacional)}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span>− Depreciação/Amortização</span><strong style="font-family:monospace;color:#c2785c;">−${formatarMoeda(custoDepreciacao)}</strong></div>
          <div style="display:flex;justify-content:space-between;"><span>− Custos Variáveis</span><strong style="font-family:monospace;color:#d4a853;">−${formatarMoeda(custoVarTotal)}</strong></div>
          <div style="border-top:2px solid #e5e0d8;padding-top:4px;display:flex;justify-content:space-between;"><strong>= Lucro Operacional</strong><strong style="font-family:monospace;color:${lucroOperacional >= 0 ? '#7c9a82' : '#c2785c'};">${formatarMoeda(lucroOperacional)}</strong></div>
          ${totalReservas > 0 ? `<div style="display:flex;justify-content:space-between;"><span>− Reservas Estratégicas</span><strong style="font-family:monospace;color:#7c9a82;">−${formatarMoeda(totalReservas)}</strong></div>` : ''}
          <div style="border-top:2px solid #c2785c;padding-top:4px;display:flex;justify-content:space-between;"><strong>= Lucro Disponível</strong><strong style="font-family:monospace;font-size:16px;color:${lucroDisponivel >= 0 ? '#7c9a82' : '#c2785c'};">${formatarMoeda(lucroDisponivel)}</strong></div>
          <div style="font-size:10px;color:#8a7e74;margin-top:4px;">O que sobra para: Reinvestir · Criar reserva · Crescer · Dividendos</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Parâmetros Utilizados</div>
      <div class="highlight-box">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
          <div><strong>Dias úteis/mês:</strong> ${data.diasUteis}</div>
          <div><strong>Sessões/dia:</strong> ${data.sessoesporDia}</div>
          <div><strong>Meta sessões/mês:</strong> ${data.sessoesMeta}</div>
          <div><strong>Margem de lucro:</strong> ${(data.margemLucro * 100).toFixed(0)}%</div>
          <div><strong>Taxa de ocupação:</strong> ${taxaOcupacao.toFixed(1)}%</div>
          <div><strong>Horas de trabalho/dia:</strong> ${data.horasTrabalho}h</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Relatório gerado em ${dataAtual} pelo FisioPrecifica</p>
      <p>Este relatório é uma estimativa baseada nos dados informados. Consulte seu contador para decisões fiscais.</p>
    </div>
  </div>
</body>
</html>`;

      // Use browser print to PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Permita pop-ups para gerar o PDF');
        setGenerating(false);
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for images to load then trigger print
      setTimeout(() => {
        printWindow.print();
        setGenerating(false);
        toast.success('Relatório gerado! Use "Salvar como PDF" na janela de impressão.');
      }, 500);

    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      toast.error('Erro ao gerar relatório');
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meu Perfil Profissional"
        description="Seus dados serão usados para personalizar o relatório de precificação"
        icon={UserCircle}
        action={
          <Button
            onClick={generatePDF}
            disabled={!isRegistered || generating}
            className="rounded-xl gap-1.5"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Gerando...' : 'Baixar Relatório PDF'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Photo/Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center text-center"
        >
          <div className="relative group">
            {perfil.logoUrl ? (
              <img
                src={perfil.logoUrl}
                alt="Foto profissional"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center border-4 border-primary/10">
                <UserCircle className="w-16 h-16 text-muted-foreground/40" />
              </div>
            )}
            <button
              onClick={() => {
                if (!isRegistered) { toast.error('Faça login para editar'); return; }
                fileInputRef.current?.click();
              }}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <h3 className="font-heading font-bold text-foreground text-lg mt-4">
            {perfil.nome || lead?.nome || 'Seu Nome'}
          </h3>
          {perfil.crefito && (
            <p className="text-sm text-muted-foreground mt-1">{perfil.crefito}</p>
          )}
          {perfil.cidade && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {perfil.cidade}
            </p>
          )}
          {perfil.especialidades && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{perfil.especialidades}</p>
          )}

          <div id="relatorio" className="mt-6 w-full pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full rounded-xl gap-1.5"
              onClick={generatePDF}
              disabled={!isRegistered || generating}
            >
              <FileText className="w-4 h-4" />
              Gerar Relatório Completo
            </Button>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 space-y-5"
        >
          <h3 className="font-heading font-semibold text-foreground">Dados Profissionais</h3>
          <p className="text-sm text-muted-foreground">
            Estas informações aparecerão no cabeçalho do seu relatório de precificação.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <UserCircle className="w-3.5 h-3.5 opacity-60" />
                Nome completo
              </Label>
              <Input
                value={perfil.nome}
                onChange={(e) => updatePerfil({ nome: e.target.value })}
                placeholder="Dr(a). Seu Nome"
                className="rounded-xl"
                disabled={!isRegistered}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 opacity-60" />
                Cidade / Estado
              </Label>
              <Input
                value={perfil.cidade}
                onChange={(e) => updatePerfil({ cidade: e.target.value })}
                placeholder="São Paulo - SP"
                className="rounded-xl"
                disabled={!isRegistered}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 opacity-60" />
                CREFITO ou outro conselho de classe
              </Label>
              <Input
                value={perfil.crefito}
                onChange={(e) => updatePerfil({ crefito: e.target.value })}
                placeholder="CREFITO-3/12345-F"
                className="rounded-xl"
                disabled={!isRegistered}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 opacity-60" />
                Especialidades
              </Label>
              <Textarea
                value={perfil.especialidades}
                onChange={(e) => updatePerfil({ especialidades: e.target.value })}
                placeholder="Ex: Ortopedia, Pilates, RPG, Fisioterapia Esportiva..."
                className="rounded-xl resize-none"
                rows={3}
                disabled={!isRegistered}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 opacity-60" />
                WhatsApp
              </Label>
              <Input
                value={perfil.whatsapp}
                onChange={(e) => {
                  // Keep only digits
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                  let formatted = '';
                  if (digits.length > 0) formatted = '(' + digits.slice(0, 2);
                  if (digits.length >= 2) formatted += ') ';
                  if (digits.length > 2) formatted += digits.slice(2, 7);
                  if (digits.length > 7) formatted += '-' + digits.slice(7, 11);
                  updatePerfil({ whatsapp: formatted });
                }}
                placeholder="(11) 99999-9999"
                className="rounded-xl"
                disabled={!isRegistered}
                maxLength={15}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 opacity-60" />
                Instagram
              </Label>
              <Input
                value={perfil.instagram}
                onChange={(e) => updatePerfil({ instagram: e.target.value })}
                placeholder="@seuperfil"
                className="rounded-xl"
                disabled={!isRegistered}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <FileDigit className="w-3.5 h-3.5 opacity-60" />
                CPF ou CNPJ
              </Label>
              <Input
                value={perfil.cpfCnpj}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
                  let formatted = '';
                  if (digits.length <= 11) {
                    // CPF: XXX.XXX.XXX-XX
                    if (digits.length > 0) formatted = digits.slice(0, 3);
                    if (digits.length > 3) formatted += '.' + digits.slice(3, 6);
                    if (digits.length > 6) formatted += '.' + digits.slice(6, 9);
                    if (digits.length > 9) formatted += '-' + digits.slice(9, 11);
                  } else {
                    // CNPJ: XX.XXX.XXX/XXXX-XX
                    formatted = digits.slice(0, 2);
                    if (digits.length > 2) formatted += '.' + digits.slice(2, 5);
                    if (digits.length > 5) formatted += '.' + digits.slice(5, 8);
                    if (digits.length > 8) formatted += '/' + digits.slice(8, 12);
                    if (digits.length > 12) formatted += '-' + digits.slice(12, 14);
                  }
                  updatePerfil({ cpfCnpj: formatted });
                }}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                className="rounded-xl"
                disabled={!isRegistered}
                maxLength={18}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 opacity-60" />
                Clínica / Consultório / Serviço
              </Label>
              <Input
                value={perfil.nomeEmpresa}
                onChange={(e) => updatePerfil({ nomeEmpresa: e.target.value })}
                placeholder="Ex: Clínica FisioVida, Studio Pilates..."
                className="rounded-xl"
                disabled={!isRegistered}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 opacity-60" />
                Site / Landing Page
              </Label>
              <Input
                value={perfil.site}
                onChange={(e) => updatePerfil({ site: e.target.value })}
                placeholder="https://seusite.com.br"
                className="rounded-xl"
                disabled={!isRegistered}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 opacity-60" />
                Outra rede social
              </Label>
              <Input
                value={perfil.outraRedeSocial}
                onChange={(e) => updatePerfil({ outraRedeSocial: e.target.value })}
                placeholder="Link do Facebook, TikTok, LinkedIn..."
                className="rounded-xl"
                disabled={!isRegistered}
              />
            </div>
          </div>

          <div className="bg-sage/5 border border-sage/20 rounded-xl p-4">
            <p className="text-sm text-foreground/80">
              <strong className="text-sage-dark">Dica:</strong> Preencha todos os campos para ter um relatório profissional e completo.
              O relatório inclui seus dados, custos, preços sugeridos, serviços e planos de tratamento.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
