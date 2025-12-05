import { Octokit } from '@octokit/rest';
import { AnalysisParams, Commit, CommitStats, TimelineEvent, FileChange, Repository, GitHubUser } from '@/types';

export class GitHubAnalyzer {
    private octokit: Octokit;

    constructor(accessToken: string) {
        this.octokit = new Octokit({ auth: accessToken });
    }

    async analyzeRepository(params: AnalysisParams): Promise<CommitStats> {
        const commits = await this.fetchCommits(params);
        return this.calculateStats(commits);
    }

    async fetchCommits(params: AnalysisParams): Promise<Commit[]> {
        const { owner, repo, author, since, until, branch } = params;
        const commits: Commit[] = [];
        let page = 1;
        const perPage = 100;

        while (true) {
            const response = await this.octokit.repos.listCommits({
                owner,
                repo,
                author,
                since,
                until,
                sha: branch,
                per_page: perPage,
                page,
            });

            if (response.data.length === 0) break;

            // Fetch detailed stats for each commit
            const detailedCommits = await Promise.all(
                response.data.map(async (commit) => {
                    const detailed = await this.octokit.repos.getCommit({
                        owner,
                        repo,
                        ref: commit.sha,
                    });
                    return detailed.data as Commit;
                })
            );

            commits.push(...detailedCommits);

            if (response.data.length < perPage) break;
            page++;
        }

        return commits;
    }

    private calculateStats(commits: Commit[]): CommitStats {
        const stats: CommitStats = {
            totalCommits: commits.length,
            totalAdditions: 0,
            totalDeletions: 0,
            netChanges: 0,
            filesModified: 0,
            uniqueFiles: new Set<string>(),
            languageDistribution: {},
            commitsByDay: {},
            commitsByHour: {},
            commitsByWeekday: {},
            averageCommitSize: 0,
            largestCommit: {
                sha: '',
                message: '',
                changes: 0,
            },
            commitKeywords: {},
        };

        const fileChanges = new Map<string, FileChange>();

        commits.forEach((commit) => {
            // Additions and deletions
            if (commit.stats) {
                stats.totalAdditions += commit.stats.additions;
                stats.totalDeletions += commit.stats.deletions;

                if (commit.stats.total > stats.largestCommit.changes) {
                    stats.largestCommit = {
                        sha: commit.sha,
                        message: commit.commit.message,
                        changes: commit.stats.total,
                    };
                }
            }

            // Files
            if (commit.files) {
                commit.files.forEach((file) => {
                    stats.uniqueFiles.add(file.filename);

                    // Track file changes
                    const existing = fileChanges.get(file.filename);
                    if (existing) {
                        existing.modifications++;
                        existing.additions += file.additions;
                        existing.deletions += file.deletions;
                    } else {
                        const extension = this.getFileExtension(file.filename);
                        const language = this.getLanguageFromExtension(extension);
                        fileChanges.set(file.filename, {
                            filename: file.filename,
                            modifications: 1,
                            additions: file.additions,
                            deletions: file.deletions,
                            language,
                        });
                    }

                    // Language distribution
                    const extension = this.getFileExtension(file.filename);
                    const language = this.getLanguageFromExtension(extension);
                    stats.languageDistribution[language] =
                        (stats.languageDistribution[language] || 0) + file.changes;
                });
            }

            // Time-based analysis
            const date = new Date(commit.commit.author.date);
            const dayKey = date.toISOString().split('T')[0];
            const hour = date.getHours();
            const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });

            stats.commitsByDay[dayKey] = (stats.commitsByDay[dayKey] || 0) + 1;
            stats.commitsByHour[hour] = (stats.commitsByHour[hour] || 0) + 1;
            stats.commitsByWeekday[weekday] = (stats.commitsByWeekday[weekday] || 0) + 1;

            // Keyword extraction from commit messages
            const keywords = this.extractKeywords(commit.commit.message);
            keywords.forEach((keyword) => {
                stats.commitKeywords[keyword] = (stats.commitKeywords[keyword] || 0) + 1;
            });
        });

        stats.filesModified = stats.uniqueFiles.size;
        stats.netChanges = stats.totalAdditions - stats.totalDeletions;
        stats.averageCommitSize = commits.length > 0
            ? (stats.totalAdditions + stats.totalDeletions) / commits.length
            : 0;

        return stats;
    }

    private getFileExtension(filename: string): string {
        const parts = filename.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'unknown';
    }

    private getLanguageFromExtension(extension: string): string {
        const languageMap: Record<string, string> = {
            js: 'JavaScript',
            jsx: 'JavaScript',
            ts: 'TypeScript',
            tsx: 'TypeScript',
            py: 'Python',
            java: 'Java',
            cpp: 'C++',
            c: 'C',
            cs: 'C#',
            go: 'Go',
            rs: 'Rust',
            rb: 'Ruby',
            php: 'PHP',
            swift: 'Swift',
            kt: 'Kotlin',
            html: 'HTML',
            css: 'CSS',
            scss: 'SCSS',
            json: 'JSON',
            md: 'Markdown',
            sql: 'SQL',
            sh: 'Shell',
            yml: 'YAML',
            yaml: 'YAML',
            xml: 'XML',
        };

        return languageMap[extension] || 'Other';
    }

    private extractKeywords(message: string): string[] {
        // Common commit keywords
        const keywords = [
            'fix', 'feat', 'feature', 'add', 'update', 'refactor', 'remove',
            'delete', 'improve', 'optimize', 'bug', 'test', 'docs', 'style',
            'chore', 'merge', 'release', 'hotfix', 'breaking', 'deprecated'
        ];

        const messageLower = message.toLowerCase();
        return keywords.filter((keyword) => messageLower.includes(keyword));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getRepositories(_username?: string): Promise<Repository[]> {
        const allRepositories: Repository[] = [];

        // 1. Buscar todos os repositórios do usuário autenticado (públicos e privados)
        let page = 1;
        while (true) {
            const { data } = await this.octokit.repos.listForAuthenticatedUser({
                per_page: 100,
                page,
                sort: 'updated',
                affiliation: 'owner,collaborator,organization_member',
            });

            if (data.length === 0) break;
            allRepositories.push(...(data as Repository[]));
            if (data.length < 100) break;
            page++;
        }

        // 2. Buscar organizações do usuário
        try {
            const { data: orgs } = await this.octokit.orgs.listForAuthenticatedUser({
                per_page: 100,
            });

            // 3. Para cada organização, buscar os repositórios
            for (const org of orgs) {
                let orgPage = 1;
                while (true) {
                    try {
                        const { data: orgRepos } = await this.octokit.repos.listForOrg({
                            org: org.login,
                            per_page: 100,
                            page: orgPage,
                            sort: 'updated',
                            type: 'all',
                        });

                        if (orgRepos.length === 0) break;

                        // Adicionar apenas se não existir (evita duplicatas)
                        for (const repo of orgRepos) {
                            if (!allRepositories.find(r => r.id === repo.id)) {
                                allRepositories.push(repo as Repository);
                            }
                        }

                        if (orgRepos.length < 100) break;
                        orgPage++;
                    } catch {
                        // Se não tiver acesso a algum repo da org, continua
                        console.warn(`Não foi possível acessar alguns repos da org ${org.login}`);
                        break;
                    }
                }
            }
        } catch (error) {
            console.warn('Não foi possível listar organizações:', error);
        }

        // Ordenar por data de atualização
        allRepositories.sort((a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        return allRepositories;
    }

    async getBranches(owner: string, repo: string): Promise<string[]> {
        const { data } = await this.octokit.repos.listBranches({
            owner,
            repo,
            per_page: 100,
        });
        return data.map((branch) => branch.name);
    }

    async getUser(): Promise<GitHubUser> {
        const { data } = await this.octokit.users.getAuthenticated();
        return data as GitHubUser;
    }

    generateTimeline(commits: Commit[]): TimelineEvent[] {
        const timelineMap = new Map<string, TimelineEvent>();

        commits.forEach((commit) => {
            const date = commit.commit.author.date.split('T')[0];

            if (!timelineMap.has(date)) {
                timelineMap.set(date, {
                    date,
                    commits: [],
                });
            }

            const timeline = timelineMap.get(date)!;
            timeline.commits.push({
                sha: commit.sha.substring(0, 7),
                message: commit.commit.message.split('\n')[0],
                additions: commit.stats?.additions || 0,
                deletions: commit.stats?.deletions || 0,
                files: commit.files?.length || 0,
            });
        });

        return Array.from(timelineMap.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }
}
