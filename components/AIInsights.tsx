import React from 'react';
import styles from './AIInsights.module.css';
import { AIAnalysisResult, XYZFeedback } from '@/lib/ai-analyzer';

interface AIInsightsProps {
    analysis: AIAnalysisResult | null;
    loading: boolean;
    error: string | null;
    onAnalyze: () => void;
    disabled: boolean;
}

export default function AIInsights({
    analysis,
    loading,
    error,
    onAnalyze,
    disabled
}: AIInsightsProps) {
    const getTypeIcon = (type: XYZFeedback['type']) => {
        switch (type) {
            case 'positive': return '✅';
            case 'improvement': return '💡';
            case 'neutral': return '📊';
            default: return '📝';
        }
    };

    const getTypeClass = (type: XYZFeedback['type']) => {
        switch (type) {
            case 'positive': return styles.positive;
            case 'improvement': return styles.improvement;
            case 'neutral': return styles.neutral;
            default: return '';
        }
    };

    const getScoreClass = (score: number) => {
        if (score >= 80) return styles.scoreExcellent;
        if (score >= 60) return styles.scoreGood;
        if (score >= 40) return styles.scoreFair;
        return styles.scoreNeedsWork;
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excelente';
        if (score >= 60) return 'Bom';
        if (score >= 40) return 'Regular';
        return 'Precisa melhorar';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <span className={styles.aiIcon}>🤖</span>
                    Análise com IA
                </h2>
                <p className={styles.subtitle}>
                    Insights gerados usando o padrão XYZ do Google
                </p>
            </div>

            {!analysis && !loading && (
                <div className={styles.promptSection}>
                    <p className={styles.promptText}>
                        Clique no botão abaixo para gerar uma análise detalhada das suas contribuições
                        usando Inteligência Artificial.
                    </p>
                    <button
                        onClick={onAnalyze}
                        className={styles.analyzeButton}
                        disabled={disabled || loading}
                    >
                        <span>🧠</span>
                        Gerar Análise com IA
                    </button>
                </div>
            )}

            {loading && (
                <div className={styles.loadingSection}>
                    <div className={styles.loadingSpinner}></div>
                    <p className={styles.loadingText}>Analisando contribuições com IA...</p>
                    <p className={styles.loadingSubtext}>
                        Isso pode levar alguns segundos
                    </p>
                </div>
            )}

            {error && (
                <div className={styles.errorSection}>
                    <span className={styles.errorIcon}>⚠️</span>
                    <p className={styles.errorText}>{error}</p>
                    <button
                        onClick={onAnalyze}
                        className={styles.retryButton}
                        disabled={disabled}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {analysis && !loading && (
                <div className={styles.resultsSection}>
                    {/* Productivity Score */}
                    <div className={styles.scoreCard}>
                        <div className={styles.scoreHeader}>
                            <span className={styles.scoreLabel}>Pontuação de Produtividade</span>
                        </div>
                        <div className={styles.scoreDisplay}>
                            <div className={`${styles.scoreValue} ${getScoreClass(analysis.productivityScore)}`}>
                                {analysis.productivityScore}
                            </div>
                            <span className={styles.scoreMax}>/100</span>
                        </div>
                        <div className={`${styles.scoreIndicator} ${getScoreClass(analysis.productivityScore)}`}>
                            {getScoreLabel(analysis.productivityScore)}
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <div className={styles.summaryCard}>
                        <h3 className={styles.cardTitle}>
                            <span>📋</span> Resumo Executivo
                        </h3>
                        <p className={styles.summaryText}>{analysis.executiveSummary}</p>
                    </div>

                    {/* Implemented Features */}
                    {analysis.implementedFeatures && analysis.implementedFeatures.length > 0 && (
                        <div className={styles.featuresCard}>
                            <h3 className={styles.cardTitle}>
                                <span>🚀</span> Funcionalidades Implementadas/Melhoradas
                            </h3>
                            <p className={styles.featuresSubtitle}>
                                Baseado na análise do código real (diffs dos commits)
                            </p>
                            <div className={styles.featuresList}>
                                {analysis.implementedFeatures.map((feature, index) => (
                                    <div key={index} className={styles.featureItem}>
                                        <span className={styles.featureIcon}>✨</span>
                                        <p>{feature}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* XYZ Feedback Section */}
                    <div className={styles.xyzSection}>
                        <h3 className={styles.cardTitle}>
                            <span>🎯</span> Feedback XYZ (Padrão Google)
                        </h3>
                        <div className={styles.xyzGrid}>
                            {analysis.xyzFeedback.map((feedback, index) => (
                                <div
                                    key={index}
                                    className={`${styles.xyzCard} ${getTypeClass(feedback.type)}`}
                                >
                                    <div className={styles.xyzHeader}>
                                        <span className={styles.xyzIcon}>{getTypeIcon(feedback.type)}</span>
                                        <span className={styles.xyzType}>
                                            {feedback.type === 'positive' ? 'Ponto Positivo' :
                                                feedback.type === 'improvement' ? 'Oportunidade de Melhoria' :
                                                    'Observação'}
                                        </span>
                                    </div>
                                    <div className={styles.xyzContent}>
                                        <div className={styles.xyzItem}>
                                            <span className={styles.xyzLabel}>X - Situação:</span>
                                            <p>{feedback.situation}</p>
                                        </div>
                                        <div className={styles.xyzItem}>
                                            <span className={styles.xyzLabel}>Y - Comportamento:</span>
                                            <p>{feedback.behavior}</p>
                                        </div>
                                        <div className={styles.xyzItem}>
                                            <span className={styles.xyzLabel}>Z - Impacto:</span>
                                            <p>{feedback.impact}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className={styles.twoColumnGrid}>
                        <div className={`${styles.listCard} ${styles.strengthsCard}`}>
                            <h3 className={styles.cardTitle}>
                                <span>💪</span> Pontos Fortes
                            </h3>
                            <ul className={styles.list}>
                                {analysis.strengths.map((strength, index) => (
                                    <li key={index} className={styles.listItem}>
                                        <span className={styles.checkIcon}>✓</span>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={`${styles.listCard} ${styles.improvementsCard}`}>
                            <h3 className={styles.cardTitle}>
                                <span>📈</span> Áreas de Melhoria
                            </h3>
                            <ul className={styles.list}>
                                {analysis.areasOfImprovement.map((area, index) => (
                                    <li key={index} className={styles.listItem}>
                                        <span className={styles.arrowIcon}>→</span>
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Commit Quality Analysis */}
                    <div className={styles.qualityCard}>
                        <h3 className={styles.cardTitle}>
                            <span>📝</span> Qualidade das Mensagens de Commit
                        </h3>
                        <div className={styles.qualityMetrics}>
                            <div className={styles.qualityMetric}>
                                <div className={styles.metricValue}>
                                    {analysis.commitQualityAnalysis.averageMessageLength}
                                </div>
                                <div className={styles.metricLabel}>Caracteres em média</div>
                            </div>
                            <div className={styles.qualityMetric}>
                                <div className={styles.metricValue}>
                                    {analysis.commitQualityAnalysis.conventionalCommitsUsage}%
                                </div>
                                <div className={styles.metricLabel}>Conventional Commits</div>
                            </div>
                            <div className={styles.qualityMetric}>
                                <div className={`${styles.metricValue} ${getScoreClass(analysis.commitQualityAnalysis.descriptiveScore)}`}>
                                    {analysis.commitQualityAnalysis.descriptiveScore}
                                </div>
                                <div className={styles.metricLabel}>Score Descritivo</div>
                            </div>
                        </div>

                        {analysis.commitQualityAnalysis.suggestions.length > 0 && (
                            <div className={styles.suggestions}>
                                <h4 className={styles.suggestionsTitle}>Sugestões para melhorar:</h4>
                                <ul className={styles.suggestionsList}>
                                    {analysis.commitQualityAnalysis.suggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    <div className={styles.recommendationsCard}>
                        <h3 className={styles.cardTitle}>
                            <span>🚀</span> Recomendações
                        </h3>
                        <div className={styles.recommendationsList}>
                            {analysis.recommendations.map((rec, index) => (
                                <div key={index} className={styles.recommendation}>
                                    <span className={styles.recNumber}>{index + 1}</span>
                                    <p>{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Regenerate Button */}
                    <div className={styles.regenerateSection}>
                        <button
                            onClick={onAnalyze}
                            className={styles.regenerateButton}
                            disabled={disabled || loading}
                        >
                            <span>🔄</span>
                            Gerar Nova Análise
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
