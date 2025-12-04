import React from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import styles from './Charts.module.css';

const COLORS = [
    '#7c3aed',
    '#c026d3',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#f97316',
];

interface ChartData {
    name: string;
    value: number;
    additions?: number;
    deletions?: number;
}

interface CommitsOverTimeChartProps {
    data: ChartData[];
}

export function CommitsOverTimeChart({ data }: CommitsOverTimeChartProps) {
    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>Commits ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <defs>
                        <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 15, 26, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#7c3aed"
                        strokeWidth={3}
                        fill="url(#colorCommits)"
                        dot={{ fill: '#7c3aed', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

interface LinesChangedChartProps {
    data: ChartData[];
}

export function LinesChangedChart({ data }: LinesChangedChartProps) {
    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>Linhas Adicionadas vs Removidas</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 15, 26, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                        }}
                    />
                    <Legend />
                    <Bar dataKey="additions" fill="#10b981" name="Adicionadas" />
                    <Bar dataKey="deletions" fill="#ef4444" name="Removidas" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

interface LanguageDistributionChartProps {
    data: ChartData[];
}

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>Distribuição por Linguagem</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 15, 26, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

interface HourlyActivityChartProps {
    data: ChartData[];
}

export function HourlyActivityChart({ data }: HourlyActivityChartProps) {
    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>Atividade por Horário</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <defs>
                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c026d3" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#c026d3" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 15, 26, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                        }}
                    />
                    <Bar dataKey="value" fill="url(#colorActivity)" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
