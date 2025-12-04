import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { GitHubAnalyzer } from '@/lib/github-analyzer';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { owner, repo, author, since, until, branch } = req.body;

        if (!owner || !repo || !author || !since || !until) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const analyzer = new GitHubAnalyzer(session.accessToken);
        const stats = await analyzer.analyzeRepository({
            owner,
            repo,
            author,
            since,
            until,
            branch,
        });

        res.status(200).json(stats);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Analysis failed' });
    }
}
