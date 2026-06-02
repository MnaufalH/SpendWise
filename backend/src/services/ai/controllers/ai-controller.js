import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import TransactionsRepositories from '../../transactions/repositories/transactions-repositories.js';

// Initialize Gemini SDK lazily so dotenv has time to load the environment variables
let ai;
const getAI = () => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
};

const getCurrentMonthAndYear = () => {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const now = new Date();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear().toString();
    return { month: monthName, year };
};

const cleanJsonString = (str) => {
    let cleaned = str.trim();
    if (cleaned.startsWith('```')) {
        // Strip leading ```json or ```
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
        // Strip trailing ```
        cleaned = cleaned.replace(/\s*```$/, '');
    }
    return cleaned.trim();
};

const getTransactionSummary = async (user_id) => {
    const { month, year } = getCurrentMonthAndYear();
    let data = await TransactionsRepositories.getIncomeAndExpense(user_id, month, year);
    let targetMonth = month;
    let targetYear = year;
    
    // Fallback: If no transactions this month, search for any transactions for this user
    if (data.income.length === 0 && data.expense.length === 0) {
        const allTrans = await TransactionsRepositories.getAllTransaction(user_id);
        if (allTrans.length > 0) {
            const mostRecentDate = allTrans[0].date; // YYYY-MM-DD
            const parts = mostRecentDate.split('-');
            if (parts.length >= 2) {
                targetYear = parts[0];
                const mIndex = parseInt(parts[1]) - 1;
                const months = [
                    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                ];
                targetMonth = months[mIndex] || month;
                data = await TransactionsRepositories.getIncomeAndExpense(user_id, targetMonth, targetYear);
            }
        }
    }

    const categoriesMap = {
        'Sewa tempat tinggal': 'Rent_Ratio',
        'Pembayaran cicilan': 'Loan_Repayment_Ratio',
        'Asuransi': 'Insurance_Ratio',
        'Belanja bahan makan': 'Groceries_Ratio',
        'Transport': 'Transport_Ratio',
        'Makan di luar': 'Eating_Out_Ratio',
        'Hiburan': 'Entertainment_Ratio',
        'Tagihan listrik atau air': 'Utilities_Ratio',
        'Kesehatan': 'Healthcare_Ratio',
        'Pendidikan': 'Education_Ratio',
        'Lainnya': 'Miscellaneous_Ratio'
    };

    let totalIncome = 0;
    let totalExpenses = 0;
    let categorySums = {};

    for (const cat in categoriesMap) {
        categorySums[cat] = 0;
    }

    if (data.income.length > 0 || data.expense.length > 0) {
        totalIncome = data.income.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        totalExpenses = data.expense.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        for (const t of data.expense) {
            const cat = t.category;
            if (categorySums[cat] !== undefined) {
                categorySums[cat] += Math.abs(t.amount);
            } else {
                categorySums['Lainnya'] += Math.abs(t.amount);
            }
        }
    } else {
        // Fallback default mock data for brand new users with no history
        totalIncome = 10000000;
        totalExpenses = 6000000;
        categorySums['Belanja bahan makan'] = 2000000;
        categorySums['Makan di luar'] = 1500000;
        categorySums['Transport'] = 800000;
        categorySums['Tagihan listrik atau air'] = 700000;
        categorySums['Lainnya'] = 1000000;
    }

    const savings = totalIncome - totalExpenses;

    return {
        month: targetMonth,
        year: targetYear,
        totalIncome,
        totalExpenses,
        savings,
        categorySums,
        categoriesMap
    };
};

export const getMonthlyInsights = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const summary = await getTransactionSummary(user_id);
        const lang = req.query.lang === 'en' ? 'English' : 'Indonesian';

        const prompt = `You are a financial advisor for an app called PocketWise/SpendWise. 
Based on the following user's monthly spending data for ${summary.month} ${summary.year}:
Income: Rp ${summary.totalIncome}
Expenses:
- Rent (Sewa tempat tinggal): Rp ${summary.categorySums['Sewa tempat tinggal']}
- Loan (Pembayaran cicilan): Rp ${summary.categorySums['Pembayaran cicilan']}
- Insurance (Asuransi): Rp ${summary.categorySums['Asuransi']}
- Groceries (Belanja bahan makan): Rp ${summary.categorySums['Belanja bahan makan']}
- Transport: Rp ${summary.categorySums['Transport']}
- Eating Out (Makan di luar): Rp ${summary.categorySums['Makan di luar']}
- Entertainment (Hiburan): Rp ${summary.categorySums['Hiburan']}
- Utilities (Tagihan listrik atau air): Rp ${summary.categorySums['Tagihan listrik atau air']}
- Healthcare (Kesehatan): Rp ${summary.categorySums['Kesehatan']}
- Education (Pendidikan): Rp ${summary.categorySums['Pendidikan']}
- Miscellaneous (Lainnya): Rp ${summary.categorySums['Lainnya']}
Savings: Rp ${summary.savings}

Provide exactly 3 brief, distinct, and actionable monthly insights based heavily on this specific data. Focus on trends like high online shopping/entertainment or food delivery/eating out costs, and commend the savings.
You MUST write all insights in ${lang}.
Return the result as a JSON array of strings. Do not use markdown blocks, just raw JSON.`;

        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const insightsText = cleanJsonString(response.text);
        const insights = JSON.parse(insightsText);
        
        return res.status(200).json({ success: true, insights });
    } catch (error) {
        console.error('Error generating insights:', error);
        if (error.status === 429 || (error.message && error.message.includes('quota')) || (error.message && error.message.includes('limit'))) {
            const isEnglish = req.query.lang === 'en';
            const fallbacks = isEnglish ? [
                "You have been active in tracking your finances this month. Keep up the good habit!",
                "Monitor your largest expense categories to optimize your remaining balance.",
                "Set aside at least 10-20% of your income for savings or investments at the beginning of the month."
            ] : [
                "Anda telah aktif mencatat keuangan bulan ini. Teruskan kebiasaan baik ini!",
                "Perhatikan pengeluaran kategori terbesar Anda untuk mengoptimalkan sisa saldo.",
                "Sisihkan minimal 10-20% dari pendapatan Anda untuk tabungan atau investasi di awal bulan."
            ];
            return res.status(200).json({ success: true, insights: fallbacks });
        }
        return res.status(500).json({ success: false, message: 'Failed to generate insights' });
    }
};

export const getNextMonthPrediction = async (req, res) => {
    let predictionData = { status: "Warning", confidence: 75.0 };
    let expectedSpending = 0;
    let topCategories = ["Lainnya"];
    try {
        const { id: user_id } = req.user;
        const summary = await getTransactionSummary(user_id);
        const lang = req.query.lang === 'en' ? 'English' : 'Indonesian';

        // Calculate ratios for the 11 features
        const denom = summary.totalIncome > 0 ? summary.totalIncome : 1;
        const ratios = {};
        for (const cat in summary.categoriesMap) {
            const ratioKey = summary.categoriesMap[cat];
            ratios[ratioKey] = summary.categorySums[cat] / denom;
        }

        // Send request to Python Flask AI API
        try {
            const predictResponse = await axios.post('http://localhost:5000/predict', { ratios });
            predictionData = predictResponse.data;
        } catch (apiError) {
            console.error("Failed to connect to Python AI API. Using default fallback prediction:", apiError.message);
            // Fallback prediction if Flask server is down
            predictionData = {
                success: true,
                class: 1,
                status: "Warning",
                confidence: 75.0
            };
        }

        // Calculate next month expected spending based on status class
        expectedSpending = summary.totalExpenses;
        if (predictionData.status === "Healthy") {
            expectedSpending = Math.round(summary.totalExpenses * 0.9);
        } else if (predictionData.status === "Warning") {
            expectedSpending = Math.round(summary.totalExpenses * 1.05);
        } else {
            expectedSpending = Math.round(summary.totalExpenses * 1.25);
        }

        // Get top categories sorted by spending amount
        const derivedTop = Object.keys(summary.categorySums)
            .filter(cat => summary.categorySums[cat] > 0)
            .sort((a, b) => summary.categorySums[b] - summary.categorySums[a])
            .slice(0, 4);

        if (derivedTop.length > 0) {
            topCategories = derivedTop;
        }

        const prompt = `You are a financial advisor AI. The user's expected spending for next month is projected to be Rp ${expectedSpending} with a confidence of ${predictionData.confidence}%. Their financial status classification is "${predictionData.status}".
Their top spending categories are projected to be: ${topCategories.join(", ")}.

Provide a brief AI Analysis (around 2-3 short paragraphs) summarizing this expected spending and its implications.
Then, provide a list of 3 short Recommended Actions.

You MUST write the AI Analysis and the Recommended Actions in ${lang}.

Return the result as a raw JSON object with this exact structure:
{
    "analysis": "String containing the AI analysis paragraphs.",
    "recommendedActions": ["action 1", "action 2", "action 3"]
}
Do not use markdown blocks, just raw JSON.`;

        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const geminiText = cleanJsonString(response.text);
        const geminiData = JSON.parse(geminiText);

        return res.status(200).json({
            success: true,
            prediction: {
                expectedSpending,
                confidence: predictionData.confidence,
                topCategories
            },
            analysis: geminiData.analysis,
            recommendedActions: geminiData.recommendedActions
        });
    } catch (error) {
        console.error('Error generating prediction analysis:', error);
        if (error.status === 429 || (error.message && error.message.includes('quota')) || (error.message && error.message.includes('limit'))) {
            const isEnglish = req.query.lang === 'en';
            const fallbackAnalysis = isEnglish 
                ? `Based on your transaction history, you are projected to have a "${predictionData.status}" financial status next month with a confidence level of ${predictionData.confidence}%. Your largest expenses are expected to be in the categories: ${topCategories.join(", ")}.`
                : `Berdasarkan riwayat transaksi, Anda diproyeksikan memiliki status finansial "${predictionData.status}" untuk bulan depan dengan tingkat keyakinan ${predictionData.confidence}%. Pengeluaran terbesar Anda diperkirakan berada pada kategori ${topCategories.join(", ")}.`;
            const fallbackActions = isEnglish ? [
                "Review budget allocation for your highest spending categories.",
                "Reduce non-essential spending and focus on primary needs first.",
                "Use the budget alert feature to avoid overspending."
            ] : [
                "Tinjau alokasi budget pada kategori pengeluaran tertinggi Anda.",
                "Kurangi belanja non-esensial dan fokus pada kebutuhan utama terlebih dahulu.",
                "Gunakan fitur peringatan budget untuk menghindari pengeluaran berlebih."
            ];
            return res.status(200).json({
                success: true,
                prediction: {
                    expectedSpending,
                    confidence: predictionData.confidence,
                    topCategories
                },
                analysis: fallbackAnalysis,
                recommendedActions: fallbackActions
            });
        }
        return res.status(500).json({ success: false, message: 'Failed to generate prediction' });
    }
};
