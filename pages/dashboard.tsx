import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import StatsGrid from '@/components/StatsGrid';
import {
    CommitsOverTimeChart,
    LinesChangedChart,
    LanguageDistributionChart,
    HourlyActivityChart,
} from '@/components/Charts';
import { CommitStats, Repository } from '@/types';
import { generatePDFReport } from '@/lib/pdf-generator';
import {
    prepareCommitsOverTimeData,
    prepareLinesChangedWeeklyData,
    prepareLanguageDistributionData,
    prepareHourlyActivityData,
} from '@/lib/chart-utils';
import styles from './dashboard.module.css';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string>('');
    const [branches, setBranches] = useState<string[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [stats, setStats] = useState<CommitStats | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            fetchRepositories();
        }
    }, [session]);

    useEffect(() => {
        if (selectedRepo) {
            fetchBranches();
        }
    }, [selectedRepo]);

    const fetchRepositories = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/repositories?username=${session?.login}`);
            if (!response.ok) throw new Error('Failed to fetch repositories');
            const data = await response.json();
            setRepositories(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        if (!selectedRepo) return;

        const [owner, repo] = selectedRepo.split('/');
        try {
            const response = await fetch(`/api/branches?owner=${owner}&repo=${repo}`);
            if (!response.ok) throw new Error('Failed to fetch branches');
            const data = await response.json();
            setBranches(data);
            if (data.length > 0) {
                setSelectedBranch(data.find((b: string) => b === 'main' || b === 'master') || data[0]);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedRepo || !startDate || !endDate) {
            setError('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setAnalyzing(true);
        setError('');

        try {
            const [owner, repo] = selectedRepo.split('/');
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner,
                    repo,
                    author: session?.login || '',
                    since: new Date(startDate).toISOString(),
                    until: new Date(endDate).toISOString(),
                    branch: selectedBranch || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            const data = await response.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleExportPDF = async () => {
        if (!stats || !selectedRepo) return;

        const [owner, repo] = selectedRepo.split('/');
        const report = {
            params: {
                owner,
                repo,
                author: session?.login || '',
                since: startDate,
                until: endDate,
                branch: selectedBranch,
            },
            stats,
            timeline: [],
            charts: {
                commitsOverTime: prepareCommitsOverTimeData(stats.commitsByDay, startDate, endDate),
                linesChangedWeekly: [],
                activityHeatmap: [],
                languageDistribution: prepareLanguageDistributionData(stats.languageDistribution),
            },
            generatedAt: new Date().toISOString(),
        };

        await generatePDFReport(report);
    };

    if (status === 'loading' || loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.logo}>
                        <span className={styles.logoIcon}>📊</span>
                        GitHub Analytics
                    </h1>
                    <div className={styles.userSection}>
                        <img
                            src={(session?.user as any)?.image || '/default-avatar.png'}
                            alt="User avatar"
                            className={styles.avatar}
                        />
                        <span className={styles.username}>{(session?.user as any)?.name}</span>
                        <button onClick={() => signOut()} className={styles.logoutBtn}>
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.controls}>
                    <h2 className={styles.sectionTitle}>Configurar Análise</h2>

                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Repositório</label>
                            <select
                                value={selectedRepo}
                                onChange={(e) => setSelectedRepo(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">Selecione um repositório</option>
                                {repositories.map((repo) => (
                                    <option key={repo.id} value={repo.full_name}>
                                        {repo.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Branch (Opcional)</label>
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className={styles.select}
                                disabled={!selectedRepo}
                            >
                                <option value="">Selecione uma branch</option>
                                {branches.map((branch) => (
                                    <option key={branch} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Data Inicial</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Data Final</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.actions}>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing || !selectedRepo || !startDate || !endDate}
                            className={styles.analyzeBtn}
                        >
                            {analyzing ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Analisando...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    Analisar
                                </>
                            )}
                        </button>

                        {stats && (
                            <button onClick={handleExportPDF} className={styles.exportBtn}>
                                <span>📄</span>
                                Exportar PDF
                            </button>
                        )}
                    </div>
                </div>

                {stats && (
                    <div className={styles.results}>
                        <h2 className={styles.sectionTitle}>Resultados da Análise</h2>

                        <StatsGrid stats={stats} />

                        <div className={styles.chartsGrid}>
                            <CommitsOverTimeChart
                                data={prepareCommitsOverTimeData(stats.commitsByDay, startDate, endDate)}
                            />
                            <LanguageDistributionChart
                                data={prepareLanguageDistributionData(stats.languageDistribution)}
                            />
                            <HourlyActivityChart
                                data={prepareHourlyActivityData(stats.commitsByHour)}
                            />
                        </div>

                        <div className={styles.insights}>
                            <h3 className={styles.insightsTitle}>Insights</h3>
                            <div className={styles.insightsGrid}>
                                <div className={styles.insightCard}>
                                    <span className={styles.insightIcon}>🏆</span>
                                    <div>
                                        <div className={styles.insightLabel}>Maior Commit</div>
                                        <div className={styles.insightValue}>
                                            {stats.largestCommit.changes.toLocaleString('pt-BR')} mudanças
                                        </div>
                                        <div className={styles.insightDetail}>
                                            {stats.largestCommit.message.substring(0, 50)}...
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.insightCard}>
                                    <span className={styles.insightIcon}>📅</span>
                                    <div>
                                        <div className={styles.insightLabel}>Dias Ativos</div>
                                        <div className={styles.insightValue}>
                                            {Object.keys(stats.commitsByDay).length} dias
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.insightCard}>
                                    <span className={styles.insightIcon}>💻</span>
                                    <div>
                                        <div className={styles.insightLabel}>Linguagens Usadas</div>
                                        <div className={styles.insightValue}>
                                            {Object.keys(stats.languageDistribution).length} linguagens
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
