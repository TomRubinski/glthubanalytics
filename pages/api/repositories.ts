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
        const { username } = req.query;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Username is required' });
        }

        const analyzer = new GitHubAnalyzer(session.accessToken);
        const repositories = await analyzer.getRepositories(username);

        res.status(200).json(repositories);
    } catch (error: any) {
        console.error('Repositories fetch error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch repositories' });
    }
}
