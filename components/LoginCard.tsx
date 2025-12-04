import React from 'react';
import { signIn } from 'next-auth/react';
import styles from './LoginCard.module.css';

export default function LoginCard() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.icon}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="url(#gradient)" />
                        <defs>
                            <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22">
                                <stop offset="0%" stopColor="#7c3aed" />
                                <stop offset="100%" stopColor="#c026d3" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h1 className={styles.title}>GitHub Analytics</h1>
                <p className={styles.subtitle}>
                    Analise suas contribuições e gere relatórios detalhados de seus repositórios
                </p>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📊</span>
                        <span>Estatísticas Detalhadas</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📈</span>
                        <span>Gráficos Interativos</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📄</span>
                        <span>Exportação em PDF</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🤖</span>
                        <span>Resumo com IA</span>
                    </div>
                </div>

                <button
                    className={styles.loginButton}
                    onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    Entrar com GitHub
                </button>

                <p className={styles.privacy}>
                    Seus dados estão seguros. Apenas acessamos informações públicas dos repositórios.
                </p>
            </div>
        </div>
    );
}
