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
    implementedFeatures: string[];
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
        commits: Array<{
            message: string;
            sha: string;
            date: string;
            additions: number;
            deletions: number;
            files?: Array<{
                filename: string;
                status: string;
                additions: number;
                deletions: number;
                patch: string;
            }>;
        }>,
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
            max_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Resposta vazia da API de IA');
        }

        return this.parseAIResponse(content, commits);
    }

    private buildAnalysisPrompt(
        stats: CommitStats,
        commits: Array<{
            message: string;
            sha: string;
            date: string;
            additions: number;
            deletions: number;
            files?: Array<{
                filename: string;
                status: string;
                additions: number;
                deletions: number;
                patch: string;
            }>;
        }>,
        params: { owner: string; repo: string; author: string; since: string; until: string }
    ): string {
        // Selecionar commits mais significativos (por tamanho de mudança) para análise detalhada
        const significantCommits = [...commits]
            .sort((a, b) => (b.additions + b.deletions) - (a.additions + a.deletions))
            .slice(0, 15);

        // Construir análise detalhada dos commits com diffs
        const detailedCommitsAnalysis = significantCommits.map(commit => {
            const filesInfo = commit.files?.slice(0, 5).map(f => {
                // Limitar tamanho do patch para não exceder limite de tokens
                const patchPreview = f.patch ? f.patch.substring(0, 800) : '';
                return `  - ${f.filename} (${f.status}): +${f.additions}/-${f.deletions}
    Mudanças:
\`\`\`
${patchPreview}${patchPreview.length >= 800 ? '\n... (truncado)' : ''}
\`\`\``;
            }).join('\n') || '  (sem detalhes de arquivos)';

            return `### Commit: ${commit.sha.substring(0, 7)} - ${commit.date.split('T')[0]}
Mensagem: "${commit.message}"
Impacto: +${commit.additions}/-${commit.deletions} linhas
Arquivos modificados:
${filesInfo}`;
        }).join('\n\n');

        const topLanguages = Object.entries(stats.languageDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([lang, changes]) => `${lang}: ${changes} mudanças`)
            .join(', ');

        return `Analise PROFUNDAMENTE as contribuições do desenvolvedor "${params.author}" no repositório "${params.owner}/${params.repo}" 
no período de ${params.since} a ${params.until}.

## IMPORTANTE: Análise Qualitativa das Mudanças
Abaixo estão os commits mais significativos com os DIFFS reais do código.
Analise O QUE FOI IMPLEMENTADO, MELHORADO OU CORRIGIDO baseando-se no código real, não apenas nas estatísticas.

## Estatísticas Gerais:
- Total de commits: ${stats.totalCommits}
- Linhas adicionadas: ${stats.totalAdditions.toLocaleString('pt-BR')}
- Linhas removidas: ${stats.totalDeletions.toLocaleString('pt-BR')}
- Mudança líquida: ${stats.netChanges.toLocaleString('pt-BR')} linhas
- Arquivos modificados: ${stats.filesModified}
- Tamanho médio de commit: ${Math.round(stats.averageCommitSize)} linhas

## Linguagens mais utilizadas:
${topLanguages}

## ANÁLISE DETALHADA DOS COMMITS COM DIFFS:
${detailedCommitsAnalysis}

## Distribuição por dia da semana:
${Object.entries(stats.commitsByWeekday).map(([day, count]) => `${day}: ${count} commits`).join(', ')}

---

## INSTRUÇÕES PARA ANÁLISE:

1. **ANALISE O CÓDIGO REAL nos diffs** - Não se baseie apenas nos números ou mensagens de commit.
   
2. **Identifique FUNCIONALIDADES IMPLEMENTADAS** - O que o desenvolvedor construiu? Quais features novas?

3. **Identifique MELHORIAS** - O código foi refatorado? Performance melhorada? Bugs corrigidos?

4. **Use o formato XYZ para cada insight**:
   - X (Situação): O contexto técnico do que existia ou era necessário
   - Y (Comportamento/Ação): O que exatamente foi implementado/alterado (baseado no código)
   - Z (Impacto): Qual o benefício concreto dessa mudança

Forneça uma análise completa em formato JSON com a seguinte estrutura:
{
    "executiveSummary": "Resumo executivo de 2-3 parágrafos focando NO QUE FOI CONSTRUÍDO/MELHORADO, não em números. Seja específico sobre as funcionalidades e melhorias implementadas.",
    "xyzFeedback": [
        {
            "situation": "X - Contexto técnico específico (ex: 'O sistema não tinha validação de entrada no formulário de login')",
            "behavior": "Y - O que foi implementado (ex: 'Implementou validação client-side com regex para email e força de senha')",
            "impact": "Z - Benefício concreto (ex: 'Reduz erros de usuário e melhora segurança antes do envio ao servidor')",
            "type": "positive | improvement | neutral"
        }
    ],
    "recommendations": ["Lista de recomendações técnicas específicas baseadas no código analisado"],
    "productivityScore": 0-100,
    "strengths": ["Pontos fortes TÉCNICOS identificados no código (patterns, qualidade, etc)"],
    "areasOfImprovement": ["Áreas técnicas que podem ser melhoradas baseando-se no código visto"],
    "commitQualitySuggestions": ["Sugestões para melhorar as mensagens de commit"],
    "implementedFeatures": ["Lista das funcionalidades/melhorias identificadas nos diffs"]
}

IMPORTANTE: 
- Gere pelo menos 5-8 feedbacks XYZ cobrindo diferentes aspectos técnicos das contribuições.
- Cada feedback XYZ deve ser ESPECÍFICO e baseado no código real analisado, não genérico.
- O campo "implementedFeatures" deve listar as features/melhorias concretas identificadas.`
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
            },
            implementedFeatures: parsed.implementedFeatures || []
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
