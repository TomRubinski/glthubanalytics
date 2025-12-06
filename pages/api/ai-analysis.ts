import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { GitHubAnalyzer } from '@/lib/github-analyzer';
import { AIAnalyzer, AIAnalysisResult } from '@/lib/ai-analyzer';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AIAnalysisResult | { error: string }>
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verificar se a API key da OpenAI está configurada
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
        return res.status(500).json({
            error: 'OpenAI API key não configurada. Adicione OPENAI_API_KEY ao arquivo .env.local'
        });
    }

    try {
        const { owner, repo, author, since, until, branch } = req.body;

        if (!owner || !repo || !author || !since || !until) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Buscar dados do GitHub
        const githubAnalyzer = new GitHubAnalyzer(session.accessToken);
        const commits = await githubAnalyzer.fetchCommits({
            owner,
            repo,
            author,
            since,
            until,
            branch,
        });

        const stats = await githubAnalyzer.analyzeRepository({
            owner,
            repo,
            author,
            since,
            until,
            branch,
        });

        // Preparar dados para análise IA - incluindo os patches (diffs) dos arquivos
        const commitsForAI = commits.map(c => ({
            message: c.commit.message,
            sha: c.sha,
            date: c.commit.author.date,
            additions: c.stats?.additions || 0,
            deletions: c.stats?.deletions || 0,
            files: c.files?.map(f => ({
                filename: f.filename,
                status: f.status,
                additions: f.additions,
                deletions: f.deletions,
                patch: f.patch || '',
            })) || [],
        }));

        // Analisar com IA
        const aiAnalyzer = new AIAnalyzer(openaiApiKey);
        const aiResult = await aiAnalyzer.analyzeContributions(
            stats,
            commitsForAI,
            { owner, repo, author, since, until }
        );

        res.status(200).json(aiResult);
    } catch (error) {
        console.error('AI Analysis error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'AI analysis failed'
        });
    }
}
