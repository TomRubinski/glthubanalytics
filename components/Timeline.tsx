import React from 'react';
import { TimelineEvent } from '@/types';
import styles from './Timeline.module.css';

interface TimelineProps {
    events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Timeline de Commits</h3>
            <div className={styles.timeline}>
                {events.slice(0, 10).map((event, index) => (
                    <div key={index} className={styles.event} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className={styles.date}>
                            <div className={styles.dateDay}>{new Date(event.date).getDate()}</div>
                            <div className={styles.dateMonth}>
                                {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}
                            </div>
                        </div>
                        <div className={styles.connector}>
                            <div className={styles.dot}></div>
                            {index < events.length - 1 && <div className={styles.line}></div>}
                        </div>
                        <div className={styles.content}>
                            <div className={styles.commits}>
                                {event.commits.slice(0, 3).map((commit, commitIndex) => (
                                    <div key={commitIndex} className={styles.commit}>
                                        <div className={styles.commitHeader}>
                                            <span className={styles.commitSha}>{commit.sha}</span>
                                            <div className={styles.commitStats}>
                                                <span className={styles.additions}>+{commit.additions}</span>
                                                <span className={styles.deletions}>-{commit.deletions}</span>
                                                <span className={styles.files}>{commit.files} arquivo{commit.files !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                        <div className={styles.commitMessage}>{commit.message}</div>
                                    </div>
                                ))}
                                {event.commits.length > 3 && (
                                    <div className={styles.moreCommits}>
                                        +{event.commits.length - 3} commit{event.commits.length - 3 !== 1 ? 's' : ''} adicional{event.commits.length - 3 !== 1 ? 'is' : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
