import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { HeatmapData } from '@/types';
import styles from './ActivityHeatmap.module.css';

interface ActivityHeatmapProps {
    data: HeatmapData[];
    startDate: string;
    endDate: string;
}

export default function ActivityHeatmap({ data, startDate, endDate }: ActivityHeatmapProps) {
    const getColorClass = (count: number) => {
        if (count === 0) return styles.color0;
        if (count <= 2) return styles.color1;
        if (count <= 5) return styles.color2;
        if (count <= 10) return styles.color3;
        return styles.color4;
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Mapa de Calor de Atividade</h3>
            <div className={styles.heatmap}>
                <CalendarHeatmap
                    startDate={new Date(startDate)}
                    endDate={new Date(endDate)}
                    values={data}
                    classForValue={(value) => {
                        if (!value) return styles.color0;
                        return getColorClass(value.count);
                    }}
                    tooltipDataAttrs={((value: unknown) => {
                        const heatmapValue = value as HeatmapData | undefined;
                        if (!heatmapValue || !heatmapValue.date) {
                            return { 'data-tip': 'Sem dados' };
                        }
                        return {
                            'data-tip': `${heatmapValue.date}: ${heatmapValue.count} commit${heatmapValue.count !== 1 ? 's' : ''}`,
                        };
                    }) as unknown as ((value: unknown) => Record<string, string>)}
                    showWeekdayLabels
                />
            </div>
            <div className={styles.legend}>
                <span className={styles.legendLabel}>Menos</span>
                <div className={styles.legendColors}>
                    <div className={`${styles.legendBox} ${styles.color0}`}></div>
                    <div className={`${styles.legendBox} ${styles.color1}`}></div>
                    <div className={`${styles.legendBox} ${styles.color2}`}></div>
                    <div className={`${styles.legendBox} ${styles.color3}`}></div>
                    <div className={`${styles.legendBox} ${styles.color4}`}></div>
                </div>
                <span className={styles.legendLabel}>Mais</span>
            </div>
        </div>
    );
}
