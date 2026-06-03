import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { BsCalendarMonth, BsInfoCircle, BsGraphUpArrow, BsLightbulb } from 'react-icons/bs';
import { FaRobot } from 'react-icons/fa';
import { getAIInsights, getAIPrediction } from '../utils/requestAPi.js';

export default function Suggestion() {
    const [lang, setLang] = useState('id');
    const [insights, setInsights] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(true);
    const [loadingPrediction, setLoadingPrediction] = useState(true);
    const [error, setError] = useState('');

    const t = {
        id: {
            title: "Analisis Keuangan",
            subtitle: "Analisis pintar pola pengeluaran dan kebiasaan finansial Anda",
            monthlyInsights: "Insight Bulanan",
            basedOnMonth: "Berdasarkan data bulan ini",
            analyzing: "Menganalisis data transaksi Anda...",
            generating: "Menghasilkan prediksi dengan model AI...",
            aiPredictions: "Prediksi Berbasis AI",
            nextMonthPred: "Prediksi Bulan Depan",
            modelPred: "Prediksi Model",
            confidence: "keyakinan",
            expectedSpending: "Estimasi Pengeluaran",
            aiAnalysis: "Analisis AI",
            recommendedActions: "Rekomendasi Tindakan:",
            footer: "Prediksi didukung oleh Machine Learning dan dianalisis oleh AI",
            loadError: "Gagal memuat insights"
        },
        en: {
            title: "Financial Insights",
            subtitle: "Smart analysis of your spending patterns and financial habits",
            monthlyInsights: "Monthly Insights",
            basedOnMonth: "Based on this month's data",
            analyzing: "Analyzing your transaction data...",
            generating: "Generating predictions with AI model...",
            aiPredictions: "AI-Powered Predictions",
            nextMonthPred: "Next Month's Prediction",
            modelPred: "Model Prediction",
            confidence: "confidence",
            expectedSpending: "Expected Spending",
            aiAnalysis: "AI Analysis",
            recommendedActions: "Recommended Actions:",
            footer: "Predictions powered by Machine Learning and analyzed by AI",
            loadError: "Failed to load insights"
        }
    }[lang];

    useEffect(() => {
        const fetchInsights = async () => {
            setLoadingInsights(true);
            try {
                const res = await getAIInsights(lang);
                if (res.data.success) {
                    setInsights(res.data.insights);
                }
            } catch (err) {
                console.error(err);
                setError(t.loadError);
            } finally {
                setLoadingInsights(false);
            }
        };

        const fetchPrediction = async () => {
            setLoadingPrediction(true);
            try {
                const res = await getAIPrediction(lang);
                if (res.data.success) {
                    setPrediction(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingPrediction(false);
            }
        };

        fetchInsights();
        fetchPrediction();
    }, [lang]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <article className='p-4' style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <div>
                    <h2 className='m-0 fs-3 fw-bold' style={{ color: '#2c3e50' }}>{t.title}</h2>
                    <p className='m-0 text-muted'>{t.subtitle}</p>
                </div>
                <div className="btn-group" role="group" aria-label="Language selection" style={{ border: '1px solid #a855f7', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                            backgroundColor: lang === 'id' ? '#a855f7' : 'transparent',
                            color: lang === 'id' ? '#fff' : '#a855f7',
                            fontWeight: '600',
                            border: 'none',
                            padding: '6px 16px',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => setLang('id')}
                    >
                        ID
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                            backgroundColor: lang === 'en' ? '#a855f7' : 'transparent',
                            color: lang === 'en' ? '#fff' : '#a855f7',
                            fontWeight: '600',
                            border: 'none',
                            padding: '6px 16px',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => setLang('en')}
                    >
                        EN
                    </button>
                </div>
            </div>

            <Row className="mb-5">
                <Col md={12} lg={8}>
                    <Card className="shadow-sm border-0 rounded-4 h-100" style={{ borderTop: '4px solid #a855f7' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4">
                                <BsCalendarMonth className="fs-5 text-purple me-2" style={{ color: '#a855f7' }} />
                                <h5 className="m-0 fw-bold">{t.monthlyInsights}</h5>
                            </div>
                            
                            {loadingInsights ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" style={{ color: '#a855f7' }} />
                                    <p className="mt-2 text-muted">{t.analyzing}</p>
                                </div>
                            ) : error ? (
                                <p className="text-danger">{error}</p>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {insights.map((insight, idx) => (
                                        <div key={idx} className="p-3 rounded-3" style={{ backgroundColor: idx % 2 === 0 ? '#f3e8ff' : '#e0e7ff', borderLeft: `4px solid ${idx % 2 === 0 ? '#a855f7' : '#4f46e5'}` }}>
                                            <div className="d-flex">
                                                <BsInfoCircle className="mt-1 me-2" style={{ color: idx % 2 === 0 ? '#a855f7' : '#4f46e5' }} />
                                                <p className="m-0" style={{ fontSize: '14px', color: '#4b5563' }}>{insight}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="mt-4 mb-0 text-muted" style={{ fontSize: '12px', fontStyle: 'italic' }}>{t.basedOnMonth}</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className='mb-3 d-flex align-items-center'>
                <FaRobot className="fs-4 me-2 text-primary" />
                <h3 className='m-0 fs-4 fw-bold' style={{ color: '#2c3e50' }}>{t.aiPredictions}</h3>
            </div>

            <Row>
                <Col md={12} lg={8}>
                    <Card className="shadow-sm border-0 rounded-4" style={{ borderTop: '4px solid #a855f7' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex align-items-center">
                                    <BsCalendarMonth className="fs-5 text-purple me-2" style={{ color: '#a855f7' }} />
                                    <h5 className="m-0 fw-bold">{t.nextMonthPred}</h5>
                                </div>
                            </div>

                            {loadingPrediction ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" style={{ color: '#a855f7' }} />
                                    <p className="mt-2 text-muted">{t.generating}</p>
                                </div>
                                                        ) : prediction ? (
                                <>
                                    {/* Status Highlight Banner */}
                                    {(() => {
                                        const status = prediction.prediction.status;
                                        let bg, color, text, border, iconColor, desc;
                                        if (status === "Sehat") {
                                            bg = 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
                                            color = '#15803d';
                                            border = '1px solid #86efac';
                                            iconColor = '#16a34a';
                                            text = lang === 'id' ? 'Sehat (Kondisi Keuangan Sangat Baik)' : 'Healthy (Excellent Financial Condition)';
                                            desc = lang === 'id' ? 'Pengeluaran Anda seimbang dengan pendapatan. Pertahankan kebiasaan menabung Anda!' : 'Your spending is well-balanced with your income. Keep up your saving habits!';
                                        } else if (status === "Moderate") {
                                            bg = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                                            color = '#b45309';
                                            border = '1px solid #fcd34d';
                                            iconColor = '#d97706';
                                            text = lang === 'id' ? 'Moderate (Kondisi Keuangan Cukup Stabil)' : 'Moderate (Fair Financial Stability)';
                                            desc = lang === 'id' ? 'Pengeluaran Anda stabil, namun beberapa kategori memerlukan pengawasan ekstra agar tidak berlebih.' : 'Your spending is stable, but a few categories require extra monitoring to avoid overspending.';
                                        } else { // Rentan
                                            bg = 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)';
                                            color = '#b91c1c';
                                            border = '1px solid #fda4af';
                                            iconColor = '#dc2626';
                                            text = lang === 'id' ? 'Rentan (Kondisi Keuangan Perlu Perhatian)' : 'Vulnerable (Financial Condition Needs Attention)';
                                            desc = lang === 'id' ? 'Tingkat pengeluaran Anda terlalu tinggi dibanding pendapatan Anda. Segera lakukan penyesuaian anggaran!' : 'Your spending level is too high relative to your income. Adjust your budget immediately!';
                                        }
                                        return (
                                            <div className="p-4 rounded-4 mb-4 shadow-sm d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3" 
                                                 style={{ background: bg, border: border, color: color }}>
                                                <div>
                                                    <div className="d-flex align-items-center mb-1">
                                                        <FaRobot className="fs-4 me-2" style={{ color: iconColor }} />
                                                        <span className="fw-bold fs-5">{text}</span>
                                                    </div>
                                                    <p className="m-0 opacity-90" style={{ fontSize: '13.5px', lineHeight: '1.4' }}>{desc}</p>
                                                </div>
                                                <div className="text-sm-end px-3 py-2 rounded-3 bg-white bg-opacity-50 border border-white" style={{ minWidth: '130px' }}>
                                                    <span className="d-block fw-semibold text-uppercase opacity-75" style={{ fontSize: '10px', letterSpacing: '1px' }}>{t.confidence}</span>
                                                    <h3 className="m-0 fw-bold" style={{ fontSize: '24px', letterSpacing: '-0.5px' }}>{prediction.prediction.confidence}%</h3>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: '#f9fafb' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="d-flex align-items-center">
                                                <BsInfoCircle className="text-muted me-2" />
                                                <span className="fw-semibold text-muted" style={{ fontSize: '14px' }}>{t.modelPred}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <span className="text-muted" style={{ fontSize: '12px' }}>{t.expectedSpending}</span>
                                            <div className="d-flex align-items-end">
                                                <h3 className="m-0 fw-bold me-2">{formatCurrency(prediction.prediction.expectedSpending)}</h3>
                                                {prediction.prediction.status === "Sehat" ? (
                                                    <span className="text-success mb-1" style={{ fontSize: '13px', fontWeight: '600' }}>
                                                        <BsGraphUpArrow className="me-1" style={{ transform: 'rotate(180deg)', display: 'inline-block' }}/> -10%
                                                    </span>
                                                ) : prediction.prediction.status === "Moderate" ? (
                                                    <span className="text-warning mb-1" style={{ fontSize: '13px', fontWeight: '600' }}>
                                                        <BsGraphUpArrow className="me-1"/> +5%
                                                    </span>
                                                ) : (
                                                    <span className="text-danger mb-1" style={{ fontSize: '13px', fontWeight: '600' }}>
                                                        <BsGraphUpArrow className="me-1"/> +25%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2 flex-wrap">
                                            {prediction.prediction.topCategories.map((cat, idx) => (
                                                <span key={idx} className="badge bg-light text-secondary border px-2 py-1" style={{ fontSize: '11px', fontWeight: '500' }}>{cat}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-3 d-flex align-items-center">
                                        <FaRobot className="me-2 text-primary" />
                                        <span className="fw-bold" style={{ color: '#374151' }}>{t.aiAnalysis}</span>
                                    </div>
                                    <div className="text-muted mb-4" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                        {prediction.analysis.split('\n').map((paragraph, idx) => (
                                            <p key={idx} className="mb-2">{paragraph}</p>
                                        ))}
                                    </div>

                                    <div className="mb-2">
                                        <span className="fw-bold" style={{ color: '#374151', fontSize: '14px' }}>{t.recommendedActions}</span>
                                    </div>
                                    <ul className="text-muted mb-0 pl-3" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                        {prediction.recommendedActions.map((action, idx) => (
                                            <li key={idx} className="mb-1">{action}</li>
                                        ))}
                                    </ul>
                                </>
                            ) : null}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <p className="mt-4 text-muted" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                {t.footer}
            </p>
        </article>
    );
}
