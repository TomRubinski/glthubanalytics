export interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
    name: string;
    email: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
}

export interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    private: boolean;
    owner: {
        login: string;
        avatar_url: string;
    };
    html_url: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    size: number;
    stargazers_count: number;
    language: string;
    default_branch: string;
}

export interface Commit {
    sha: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
    };
    stats?: {
        total: number;
        additions: number;
        deletions: number;
    };
    files?: CommitFile[];
}

export interface CommitFile {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
}

export interface AnalysisParams {
    owner: string;
    repo: string;
    author: string;
    since: string;
    until: string;
    branch?: string;
}

export interface CommitStats {
    totalCommits: number;
    totalAdditions: number;
    totalDeletions: number;
    netChanges: number;
    filesModified: number;
    uniqueFiles: Set<string>;
    languageDistribution: Record<string, number>;
    commitsByDay: Record<string, number>;
    commitsByHour: Record<number, number>;
    commitsByWeekday: Record<string, number>;
    averageCommitSize: number;
    largestCommit: {
        sha: string;
        message: string;
        changes: number;
    };
    commitKeywords: Record<string, number>;
}

export interface TimelineEvent {
    date: string;
    commits: {
        sha: string;
        message: string;
        additions: number;
        deletions: number;
        files: number;
    }[];
}

export interface AnalysisReport {
    params: AnalysisParams;
    stats: CommitStats;
    timeline: TimelineEvent[];
    charts: {
        commitsOverTime: ChartData[];
        linesChangedWeekly: ChartData[];
        activityHeatmap: HeatmapData[];
        languageDistribution: ChartData[];
    };
    aiSummary?: string;
    generatedAt: string;
}

export interface ChartData {
    name: string;
    value: number;
    additions?: number;
    deletions?: number;
}

export interface HeatmapData {
    date: string;
    count: number;
}

export interface FileChange {
    filename: string;
    modifications: number;
    additions: number;
    deletions: number;
    language: string;
}
