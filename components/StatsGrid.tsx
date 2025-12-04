import React from 'react';
import { CommitStats } from '@/types';
import { formatNumber } from '@/lib/pdf-generator';
import styles from './StatsGrid.module.css';

interface StatsGridProps {
    stats: CommitStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
    const statCards = [
        {
            label: 'Total de Commits',
            value: formatNumber(stats.totalCommits),
            icon: '📝',
            color: 'primary',
        },
        {
            label: 'Linhas Adicionadas',
            value: formatNumber(stats.totalAdditions),
            icon: '➕',
            color: 'success',
        },
        {
            label: 'Linhas Removidas',
            value: formatNumber(stats.totalDeletions),
            icon: '➖',
            color: 'error',
        },
        {
            label: 'Mudança Líquida',
            value: formatNumber(stats.netChanges),
            icon: '📊',
            color: stats.netChanges >= 0 ? 'success' : 'error',
        },
        {
            label: 'Arquivos Modificados',
            value: formatNumber(stats.filesModified),
            icon: '📄',
            color: 'secondary',
        },
        {
            label: 'Tamanho Médio do Commit',
            value: formatNumber(Math.round(stats.averageCommitSize)),
            icon: '📏',
            color: 'accent',
        },
    ];

    return (
        <div className={styles.grid}>
            {statCards.map((card, index) => (
                <div
                    key={index}
                    className={`${styles.card} ${styles[card.color]}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className={styles.icon}>{card.icon}</div>
                    <div className={styles.content}>
                        <div className={styles.value}>{card.value}</div>
                        <div className={styles.label}>{card.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
