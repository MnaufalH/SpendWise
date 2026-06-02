import TransactionsRepositories from "../repositories/transactions-repositories.js"
import response from '../../../utils/response.js'
import WalletsRepositories from "../../wallets/repositories/wallets-repositories.js"
import BudgetRepositories from "../../budgeting/repositories/budget-repositories.js"

const createTransaction = async (req, res, next) => {
    const { id: user_id } = req.user
    const { newTransaction } = req.body
    const { type, descript, amount, category, wallet, date } = newTransaction
    const finalCategory = category || ""

    // Pre-flight check: Wallet must exist
    const wallets = await WalletsRepositories.getAllWallets(user_id)
    const walletExists = wallets.some(w => w.name === wallet)
    if (!walletExists) {
        return response(res, 400, 'Wallet tidak ditemukan')
    }

    // Pre-flight check: If Pengeluaran, budget category must exist
    if (type === 'Pengeluaran') {
        if (!finalCategory) {
            return response(res, 400, 'Kategori pengeluaran harus diisi')
        }
        const hasBudget = await BudgetRepositories.searchBudgeting(user_id, finalCategory)
        if (!hasBudget) {
            return response(res, 400, 'Budget untuk kategori ini belum dibuat')
        }
    }

    const walletSucces = await WalletsRepositories.updateWalletByTransaction(user_id, wallet, amount)
    if (!walletSucces) {
        return response(res, 400, 'Gagal memperbarui wallet')
    }

    if (type === 'Pengeluaran') {
        const budgetSuccess = await BudgetRepositories.updateByTransaction(user_id, finalCategory, amount)
        if (!budgetSuccess) {
            // Rollback wallet update
            await WalletsRepositories.updateWalletByTransaction(user_id, wallet, -amount)
            return response(res, 400, 'Gagal memperbarui budget')
        }
    }

    const transactionId = await TransactionsRepositories.createTransaction(user_id, type, descript, amount, finalCategory, wallet, date)
    if (!transactionId) {
        // Rollback budget and wallet updates
        if (type === 'Pengeluaran') {
            await BudgetRepositories.updateByTransaction(user_id, finalCategory, -amount)
        }
        await WalletsRepositories.updateWalletByTransaction(user_id, wallet, -amount)
        return response(res, 400, 'Gagal membuat transaksi')
    }

    return response(res, 201, 'Berhasil menambahkan transaksi', { id: transactionId })
}

const getAllTransactions = async (req, res, next) => {
    const { id: user_id } = req.user
    const transactions = await TransactionsRepositories.getAllTransaction(user_id)

    return response(res, 200, 'Berhasil ', { transactions })
}

const getTransactionById = async (req, res, next) => {
    const { transaction_id } = req.params
    const foundedTransaction = await TransactionsRepositories.getTransactionById(transaction_id)
    if (!foundedTransaction) {
        return response(res, 404, 'Transaksi tidak ditemukan')
    }

    return response(res, 200, 'Berhasil menampilkan transaksi', foundedTransaction)
}

const updateTransactions = async (req, res, next) => {
    const { transaction_id } = req.params
    const { oldTransaction, newTransaction } = req.body
    const { id: user_id } = req.user

    // Ensure category is sanitized
    newTransaction.category = newTransaction.category || ""
    oldTransaction.category = oldTransaction.category || ""

    // Pre-flight check: If new transaction type is Pengeluaran, budget category must exist
    if (newTransaction.type === 'Pengeluaran') {
        if (!newTransaction.category) {
            return response(res, 400, 'Kategori pengeluaran harus diisi')
        }
        const hasBudget = await BudgetRepositories.searchBudgeting(user_id, newTransaction.category)
        if (!hasBudget) {
            return response(res, 400, 'Budget untuk kategori ini belum dibuat')
        }
    }

    const updateWalletSuccess = await WalletsRepositories.updateByEditTransaction(user_id, oldTransaction, newTransaction)
    if (!updateWalletSuccess) {
        return response(res, 400, 'Gagal update wallet')
    }

    const updateBudgetSucces = await BudgetRepositories.updateByEditTransaction(user_id, oldTransaction, newTransaction)
    if (!updateBudgetSucces) {
        // Rollback wallet edit
        await WalletsRepositories.updateByEditTransaction(user_id, newTransaction, oldTransaction)
        return response(res, 400, 'Gagal update budget')
    }

    const updateTransactionSuccess = await TransactionsRepositories.updateTransaction(transaction_id, user_id, newTransaction)
    if (!updateTransactionSuccess) {
        // Rollback budget and wallet edits
        await BudgetRepositories.updateByEditTransaction(user_id, newTransaction, oldTransaction)
        await WalletsRepositories.updateByEditTransaction(user_id, newTransaction, oldTransaction)
        return response(res, 400, 'Gagal memperbarui transaksi')
    }

    return response(res, 200, 'Berhasil memperbarui transaksi')
}

const deleteTransaction = async (req, res, next) => {
    const { id: user_id } = req.user
    const { transaction_id } = req.params
    const foundedTransaction = await TransactionsRepositories.getTransactionById(transaction_id)
    if (!foundedTransaction) {
        return response(res, 404, 'Transaksi tidak ditemukan')
    }

    const { type, amount, category, wallet } = foundedTransaction

    const updateWalletSuccess = await WalletsRepositories.updateWalletByTransaction(user_id, wallet, -(amount))
    if (!updateWalletSuccess) {
        return response(res, 400, 'Gagal memperbarui wallet')
    }

    if (type === 'Pengeluaran') {
        const updateBudgetSuccess = await BudgetRepositories.updateByTransaction(user_id, category, -(amount))
        if (!updateBudgetSuccess) {
            return response(res, 400, 'Gagal meperbarui budget')
        }
    }

    await TransactionsRepositories.deleteTransaction(transaction_id)

    return response(res, 200, 'Berhasil menghapus transaction')
}

const getIncomeAndExpense = async (req, res, next) => {
    const { id: user_id } = req.user
    const { bulan, tahun } = req.params

    const transactions = await TransactionsRepositories.getIncomeAndExpense(user_id, bulan, tahun)
    return response(res, 200, 'Berhasil menampilkan data', transactions)
}


export {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransactions,
    deleteTransaction,
    getIncomeAndExpense,
}