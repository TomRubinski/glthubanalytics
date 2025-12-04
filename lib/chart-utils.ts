import { CommitStats, ChartData, HeatmapData, Commit, CommitFile } from '@/types';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

export function prepareCommitsOverTimeData(
    commitsByDay: Record<string, number>,
    startDate: string,
    endDate: string
): ChartData[] {
    const days = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
    });

    return days.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        return {
            name: format(day, 'dd/MM'),
            value: commitsByDay[dateKey] || 0,
        };
    });
}

export function prepareLinesChangedWeeklyData(
    commits: Commit[]
): ChartData[] {
    const weeklyData = new Map<string, { additions: number; deletions: number }>();

    commits.forEach((commit) => {
        const date = new Date(commit.commit.author.date);
        const weekStart = getWeekStart(date);
        const weekKey = format(weekStart, 'dd/MM');

        if (!weeklyData.has(weekKey)) {
            weeklyData.set(weekKey, { additions: 0, deletions: 0 });
        }

        const week = weeklyData.get(weekKey)!;
        week.additions += commit.stats?.additions || 0;
        week.deletions += commit.stats?.deletions || 0;
    });

    return Array.from(weeklyData.entries()).map(([name, data]) => ({
        name,
        additions: data.additions,
        deletions: data.deletions,
        value: data.additions + data.deletions,
    }));
}

export function prepareActivityHeatmapData(
    commitsByDay: Record<string, number>
): HeatmapData[] {
    return Object.entries(commitsByDay).map(([date, count]) => ({
        date,
        count,
    }));
}

export function prepareLanguageDistributionData(
    languageDistribution: Record<string, number>
): ChartData[] {
    return Object.entries(languageDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
}

export function prepareHourlyActivityData(
    commitsByHour: Record<number, number>
): ChartData[] {
    const data: ChartData[] = [];

    for (let hour = 0; hour < 24; hour++) {
        data.push({
            name: `${hour.toString().padStart(2, '0')}:00`,
            value: commitsByHour[hour] || 0,
        });
    }

    return data;
}

export function prepareWeekdayActivityData(
    commitsByWeekday: Record<string, number>
): ChartData[] {
    const weekdayOrder = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado',
    ];

    return weekdayOrder.map((day) => ({
        name: day.charAt(0).toUpperCase() + day.slice(1, 3),
        value: commitsByWeekday[day] || 0,
    }));
}

function getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
}

export function calculateProductivityScore(stats: CommitStats): number {
    // Simple scoring algorithm
    const commitScore = Math.min(stats.totalCommits / 10, 10);
    const changeScore = Math.min(stats.netChanges / 1000, 10);
    const consistencyScore = Object.keys(stats.commitsByDay).length / 7;

    return Math.round(((commitScore + changeScore + consistencyScore) / 3) * 10);
}

export function getMostProductiveTime(commitsByHour: Record<number, number>): string {
    const entries = Object.entries(commitsByHour);
    if (entries.length === 0) return 'N/A';

    const [hour] = entries.reduce((max, curr) =>
        curr[1] > max[1] ? curr : max
    );

    const hourNum = parseInt(hour);
    if (hourNum >= 6 && hourNum < 12) return 'Manhã';
    if (hourNum >= 12 && hourNum < 18) return 'Tarde';
    if (hourNum >= 18 && hourNum < 24) return 'Noite';
    return 'Madrugada';
}

export function getTopFiles(commits: Commit[]): Array<{ name: string; changes: number }> {
    const fileChanges = new Map<string, number>();

    commits.forEach((commit) => {
        commit.files?.forEach((file: CommitFile) => {
            const current = fileChanges.get(file.filename) || 0;
            fileChanges.set(file.filename, current + file.changes);
        });
    });

    return Array.from(fileChanges.entries())
        .map(([name, changes]) => ({ name, changes }))
        .sort((a, b) => b.changes - a.changes)
        .slice(0, 10);
}
