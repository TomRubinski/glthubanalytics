import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

export default function LoadingSpinner({ message = 'Carregando...', size = 'medium' }: LoadingSpinnerProps) {
    return (
        <div className={styles.container}>
            <div className={`${styles.spinner} ${styles[size]}`}>
                <div className={styles.ring}></div>
                <div className={styles.ring}></div>
                <div className={styles.ring}></div>
                <div className={styles.ring}></div>
            </div>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}
