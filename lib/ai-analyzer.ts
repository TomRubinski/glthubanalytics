import OpenAI from 'openai';
import { CommitStats } from '@/types';

// Padrão XYZ do Google para mensagens de feedback
// X = Situação observada (contexto)
// Y = Comportamento/ação específica
// Z = Impacto/resultado

export interface AIAnalysisResult {
    executiveSummary: string;
    xyzFeedback: XYZFeedback[];
    recommendations: string[];
    productivityScore: number;
    strengths: string[];
    areasOfImprovement: string[];
    commitQualityAnalysis: CommitQualityAnalysis;
}

export interface XYZFeedback {
    situation: string;  // X - Contexto/situação
    behavior: string;   // Y - Comportamento observado
    impact: string;     // Z - Impacto/resultado
    type: 'positive' | 'improvement' | 'neutral';
}

export interface CommitQualityAnalysis {
    averageMessageLength: number;
    conventionalCommitsUsage: number; // Percentual de commits seguindo padrão conventional
    descriptiveScore: number; // 0-100
    suggestions: string[];
}

export class AIAnalyzer {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            baseURL: 'https://routellm.abacus.ai/v1',
            apiKey
        });
    }

    async analyzeContributions(
        stats: CommitStats,
        commits: Array<{ message: string; sha: string; date: string; additions: number; deletions: number }>,
        params: { owner: string; repo: string; author: string; since: string; until: string }
    ): Promise<AIAnalysisResult> {
        const prompt = this.buildAnalysisPrompt(stats, commits, params);

        const response = await this.openai.chat.completions.create({
            model: 'deepseek-ai/DeepSeek-V3.2-Exp',
            messages: [
                {
                    role: 'system',
                    content: `Você é um especialista em análise de produtividade de desenvolvedores e qualidade de código. 
                    
Você deve fornecer feedback usando o padrão XYZ do Google:
- X (Situação): Descreva o contexto ou situação observada
- Y (Comportamento): Descreva o comportamento ou ação específica
- Z (Impacto): Explique o impacto ou resultado dessa ação

Seja construtivo, específico e acionável em suas recomendações.
Responda sempre em português do Brasil.
IMPORTANTE: Responda APENAS com um objeto JSON válido, sem texto adicional antes ou depois.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Resposta vazia da API de IA');
        }

        return this.parseAIResponse(content, commits);
    }

    private buildAnalysisPrompt(
        stats: CommitStats,
        commits: Array<{ message: string; sha: string; date: string; additions: number; deletions: number }>,
        params: { owner: string; repo: string; author: string; since: string; until: string }
    ): string {
        const commitMessages = commits.slice(0, 50).map(c =>
            `- "${c.message}" (+${c.additions}/-${c.deletions})`
        ).join('\n');

        const topLanguages = Object.entries(stats.languageDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([lang, changes]) => `${lang}: ${changes} mudanças`)
            .join(', ');

        const topKeywords = Object.entries(stats.commitKeywords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([kw, count]) => `${kw} (${count}x)`)
            .join(', ');

        return `Analise as contribuições do desenvolvedor "${params.author}" no repositório "${params.owner}/${params.repo}" 
no período de ${params.since} a ${params.until}.

## Estatísticas Gerais:
- Total de commits: ${stats.totalCommits}
- Linhas adicionadas: ${stats.totalAdditions.toLocaleString('pt-BR')}
- Linhas removidas: ${stats.totalDeletions.toLocaleString('pt-BR')}
- Mudança líquida: ${stats.netChanges.toLocaleString('pt-BR')} linhas
- Arquivos modificados: ${stats.filesModified}
- Tamanho médio de commit: ${Math.round(stats.averageCommitSize)} linhas

## Linguagens mais utilizadas:
${topLanguages}

## Palavras-chave mais frequentes nos commits:
${topKeywords || 'Nenhuma keyword padrão encontrada'}

## Maior commit:
"${stats.largestCommit.message}" com ${stats.largestCommit.changes} mudanças

## Amostra de mensagens de commit (últimos 50):
${commitMessages}

## Distribuição por dia da semana:
${Object.entries(stats.commitsByWeekday).map(([day, count]) => `${day}: ${count} commits`).join(', ')}

Forneça uma análise completa em formato JSON com a seguinte estrutura:
{
    "executiveSummary": "Resumo executivo de 2-3 parágrafos sobre a produtividade e contribuições do desenvolvedor",
    "xyzFeedback": [
        {
            "situation": "X - Contexto observado",
            "behavior": "Y - Comportamento específico",
            "impact": "Z - Impacto resultante",
            "type": "positive | improvement | neutral"
        }
    ],
    "recommendations": ["Lista de recomendações acionáveis"],
    "productivityScore": 0-100,
    "strengths": ["Pontos fortes identificados"],
    "areasOfImprovement": ["Áreas que podem ser melhoradas"],
    "commitQualitySuggestions": ["Sugestões para melhorar as mensagens de commit"]
}

Inclua pelo menos 3-5 feedbacks XYZ cobrindo diferentes aspectos das contribuições.`;
    }

    private parseAIResponse(
        content: string,
        commits: Array<{ message: string }>
    ): AIAnalysisResult {
        // Limpar markdown code blocks se presentes
        let cleanContent = content.trim();

        // Remove ```json ou ``` do início
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.slice(7);
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.slice(3);
        }

        // Remove ``` do final
        if (cleanContent.endsWith('```')) {
            cleanContent = cleanContent.slice(0, -3);
        }

        cleanContent = cleanContent.trim();

        const parsed = JSON.parse(cleanContent);

        // Calcular análise de qualidade de commits
        const commitQualityAnalysis = this.analyzeCommitQuality(commits);

        return {
            executiveSummary: parsed.executiveSummary || '',
            xyzFeedback: parsed.xyzFeedback || [],
            recommendations: parsed.recommendations || [],
            productivityScore: parsed.productivityScore || 0,
            strengths: parsed.strengths || [],
            areasOfImprovement: parsed.areasOfImprovement || [],
            commitQualityAnalysis: {
                ...commitQualityAnalysis,
                suggestions: parsed.commitQualitySuggestions || []
            }
        };
    }

    private analyzeCommitQuality(commits: Array<{ message: string }>): Omit<CommitQualityAnalysis, 'suggestions'> {
        if (commits.length === 0) {
            return {
                averageMessageLength: 0,
                conventionalCommitsUsage: 0,
                descriptiveScore: 0
            };
        }

        // Padrão conventional commits: type(scope): description
        const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?:\s.+/i;

        const totalLength = commits.reduce((sum, c) => sum + c.message.length, 0);
        const conventionalCount = commits.filter(c => conventionalPattern.test(c.message)).length;

        // Score descritivo baseado em comprimento e qualidade
        const avgLength = totalLength / commits.length;
        let descriptiveScore = Math.min(100, avgLength * 1.5);

        // Bonus por uso de conventional commits
        descriptiveScore += (conventionalCount / commits.length) * 20;
        descriptiveScore = Math.min(100, descriptiveScore);

        return {
            averageMessageLength: Math.round(avgLength),
            conventionalCommitsUsage: Math.round((conventionalCount / commits.length) * 100),
            descriptiveScore: Math.round(descriptiveScore)
        };
    }
}
