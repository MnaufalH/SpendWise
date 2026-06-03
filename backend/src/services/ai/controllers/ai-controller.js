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
    let summary;
    try {
        const { id: user_id } = req.user;
        summary = await getTransactionSummary(user_id);
        const lang = req.query.lang === 'en' ? 'English' : 'Indonesian';

        const prompt = `You are a Senior Personal Finance Advisor. Analyze the user's financial data for ${summary.month} ${summary.year} and provide exactly 3 deep, highly personalized, and actionable monthly insights.

User's Financial Profile:
- Monthly Income: Rp ${summary.totalIncome}
- Total Expenses: Rp ${summary.totalExpenses}
- Net Savings: Rp ${summary.savings}
- Detailed Category Spending:
  * Rent (Sewa tempat tinggal): Rp ${summary.categorySums['Sewa tempat tinggal']}
  * Loan (Pembayaran cicilan): Rp ${summary.categorySums['Pembayaran cicilan']}
  * Insurance (Asuransi): Rp ${summary.categorySums['Asuransi']}
  * Groceries (Belanja bahan makan): Rp ${summary.categorySums['Belanja bahan makan']}
  * Transport: Rp ${summary.categorySums['Transport']}
  * Eating Out (Makan di luar): Rp ${summary.categorySums['Makan di luar']}
  * Entertainment (Hiburan): Rp ${summary.categorySums['Hiburan']}
  * Utilities (Tagihan listrik atau air): Rp ${summary.categorySums['Tagihan listrik atau air']}
  * Healthcare (Kesehatan): Rp ${summary.categorySums['Kesehatan']}
  * Education (Pendidikan): Rp ${summary.categorySums['Pendidikan']}
  * Miscellaneous (Lainnya): Rp ${summary.categorySums['Lainnya']}

Rules for generating the 3 insights:
1. Every insight MUST reference specific categories, amounts, or percentages from the user's data. Avoid generic templates.
2. Tone: Analytical, professional, empathetic, and constructive.
3. Insight 1 (Savings & Cash Flow): Analyze the overall savings rate (Savings divided by Income). If the savings rate is critical/negative/low (e.g. less than 10%), give a warning and cite the exact numbers. If it's healthy (above 20%), commend them warmly.
4. Insight 2 (Category Spotlight): Identify the largest discretionary spending category (e.g. Eating Out, Entertainment, Miscellaneous) or high fixed cost (e.g. Rent, Loans) and evaluate its percentage of income. Point out if it exceeds typical healthy thresholds (e.g., Rent > 30%, Groceries > 20%, or discretionary spending > 15%).
5. Insight 3 (Strategic Recommendation): Provide a concrete, highly actionable step they can take next month to optimize their cash flow (e.g. suggesting specific budget limits on their top categories, negotiating rates, or allocating savings first).

Language: Write the output strictly in ${lang}.
Output Format: A raw JSON array containing exactly 3 strings (representing the 3 insights). Do not include markdown formatting or backticks.`;

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
        
        // Dynamic fallback generator based on actual user data to provide high-quality insights even on API failure
        const isEnglish = req.query.lang === 'en';
        const savingsRate = summary.savings / (summary.totalIncome || 1);
        const expenseRate = Math.round((summary.totalExpenses / (summary.totalIncome || 1)) * 100);
        
        let maxCat = 'Lainnya';
        let maxVal = 0;
        for (const cat in summary.categorySums) {
            if (summary.categorySums[cat] > maxVal) {
                maxVal = summary.categorySums[cat];
                maxCat = cat;
            }
        }
        const maxCatPercentage = Math.round((maxVal / (summary.totalIncome || 1)) * 100);

        let fallbacks = [];
        if (isEnglish) {
            if (savingsRate < 0.1) {
                fallbacks.push(`Your spending this month consumes ${expenseRate}% of your income, leaving very little room for savings. Try to review discretionary costs.`);
            } else {
                fallbacks.push(`Excellent! You successfully saved ${Math.round(savingsRate * 100)}% of your income this month. Keep up this healthy habit!`);
            }
            fallbacks.push(`Your highest spending category is "${maxCat}" at Rp ${maxVal.toLocaleString('id-ID')} (${maxCatPercentage}% of your total income).`);
            fallbacks.push("For next month, we recommend using the 'Pay Yourself First' rule: transfer 15% of your income to a separate savings account immediately upon receiving it.");
        } else {
            if (savingsRate < 0.1) {
                fallbacks.push(`Pengeluaran Anda bulan ini menghabiskan ${expenseRate}% dari total pemasukan. Sisa tabungan Anda cukup kritis, disarankan membatasi pengeluaran non-esensial.`);
            } else {
                fallbacks.push(`Luar biasa! Anda berhasil menyisihkan ${Math.round(savingsRate * 100)}% dari total pemasukan sebagai tabungan bulan ini. Pertahankan kebiasaan sehat ini!`);
            }
            fallbacks.push(`Pengeluaran tertinggi Anda berada pada kategori "${maxCat}" sebesar Rp ${maxVal.toLocaleString('id-ID')} (setara dengan ${maxCatPercentage}% dari total pemasukan Anda).`);
            fallbacks.push("Untuk bulan depan, kami menyarankan metode 'Pay Yourself First': sisihkan langsung 10-20% pemasukan di awal bulan sebelum dialokasikan untuk kebutuhan lain.");
        }

        return res.status(200).json({ success: true, insights: fallbacks });
    }
};

export const getNextMonthPrediction = async (req, res) => {
    let predictionData = { status: "Moderate", confidence: 75.0 };
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
                status: "Moderate",
                confidence: 75.0
            };
        }

        // Calculate next month expected spending based on status class
        expectedSpending = summary.totalExpenses;
        if (predictionData.status === "Sehat") {
            expectedSpending = Math.round(summary.totalExpenses * 0.9);
        } else if (predictionData.status === "Moderate") {
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
                status: predictionData.status,
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
                    status: predictionData.status,
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
