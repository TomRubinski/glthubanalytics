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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { owner, repo } = req.query;

        if (!owner || !repo || typeof owner !== 'string' || typeof repo !== 'string') {
            return res.status(400).json({ error: 'Owner and repo are required' });
        }

        const analyzer = new GitHubAnalyzer(session.accessToken);
        const branches = await analyzer.getBranches(owner, repo);

        res.status(200).json(branches);
    } catch (error) {
        console.error('Branches fetch error:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch branches' });
    }
}
