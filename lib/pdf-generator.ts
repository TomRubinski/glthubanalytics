import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisReport } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function generatePDFReport(report: AnalysisReport): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(124, 58, 237);
    pdf.text('Relatório de Contribuições GitHub', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // Repository Info
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Repositório: ${report.params.owner}/${report.params.repo}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Autor: ${report.params.author}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Período: ${format(new Date(report.params.since), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(report.params.until), 'dd/MM/yyyy', { locale: ptBR })}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Gerado em: ${format(new Date(report.generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, yPosition);

    yPosition += 15;

    // Divider
    pdf.setDrawColor(124, 58, 237);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 10;

    // Executive Summary
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Resumo Executivo', 20, yPosition);
    yPosition += 10;

    if (report.aiSummary) {
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        const summaryLines = pdf.splitTextToSize(report.aiSummary, pageWidth - 40);
        pdf.text(summaryLines, 20, yPosition);
        yPosition += summaryLines.length * 5 + 10;
    }

    // Statistics
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Estatísticas Principais', 20, yPosition);
    yPosition += 10;

    const stats = [
        { label: 'Total de Commits', value: report.stats.totalCommits.toString() },
        { label: 'Linhas Adicionadas', value: report.stats.totalAdditions.toLocaleString('pt-BR') },
        { label: 'Linhas Removidas', value: report.stats.totalDeletions.toLocaleString('pt-BR') },
        { label: 'Mudança Líquida', value: report.stats.netChanges.toLocaleString('pt-BR') },
        { label: 'Arquivos Modificados', value: report.stats.filesModified.toString() },
        { label: 'Tamanho Médio do Commit', value: Math.round(report.stats.averageCommitSize).toLocaleString('pt-BR') },
    ];

    pdf.setFontSize(10);
    stats.forEach((stat) => {
        if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
        }

        pdf.setTextColor(100, 100, 100);
        pdf.text(stat.label + ':', 20, yPosition);
        pdf.setTextColor(124, 58, 237);
        pdf.setFont(undefined, 'bold');
        pdf.text(stat.value, 100, yPosition);
        pdf.setFont(undefined, 'normal');
        yPosition += 7;
    });

    yPosition += 10;

    // Language Distribution
    if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Distribuição por Linguagem', 20, yPosition);
    yPosition += 10;

    const languages = Object.entries(report.stats.languageDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    pdf.setFontSize(10);
    languages.forEach(([lang, changes]) => {
        if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
        }

        pdf.setTextColor(100, 100, 100);
        pdf.text(lang + ':', 20, yPosition);
        pdf.setTextColor(124, 58, 237);
        pdf.text(changes.toLocaleString('pt-BR') + ' mudanças', 100, yPosition);
        yPosition += 7;
    });

    yPosition += 10;

    // Top Keywords
    if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Palavras-chave Mais Usadas', 20, yPosition);
    yPosition += 10;

    const keywords = Object.entries(report.stats.commitKeywords)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    pdf.setFontSize(10);
    keywords.forEach(([keyword, count]) => {
        if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
        }

        pdf.setTextColor(100, 100, 100);
        pdf.text(keyword + ':', 20, yPosition);
        pdf.setTextColor(124, 58, 237);
        pdf.text(count.toString() + ' vezes', 100, yPosition);
        yPosition += 7;
    });

    // Save PDF
    pdf.save(`github-report-${report.params.repo}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export async function captureChartAsPNG(elementId: string): Promise<string> {
    const element = document.getElementById(elementId);
    if (!element) return '';

    const canvas = await html2canvas(element, {
        backgroundColor: '#0f0f1a',
        scale: 2,
    });

    return canvas.toDataURL('image/png');
}

export function formatNumber(num: number): string {
    return num.toLocaleString('pt-BR');
}

export function formatDate(date: string): string {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(date: string): string {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatRelativeTime(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;

    return formatDate(date);
}
