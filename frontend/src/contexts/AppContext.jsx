import { createContext, useContext, useState } from "react"
import {
    createTransaction,
    deleteTransaction as deleteTransactionApi,
    getTransactions,
    getWallets,
    updateTransaction as updateTransactionApi
} from "../utils/api"

export const createdContext = createContext()

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const loadBackendData = async () => {
        const walletResult = await getWallets()
        const transactionResult = await getTransactions()

        return {
            wallets: walletResult.data,
            transactions: transactionResult.data
        }
    }

    const refreshUserData = async () => {
        const backendData = await loadBackendData()

        setUser((prev) => {
            if (!prev) return prev

            return {
                ...prev,
                wallets: backendData.wallets,
                transactions: backendData.transactions
            }
        })
    }

    const addBudget = (newBudget) => {
        setUser((prev) => {
            return {
                ...prev,
                budgets: [...prev.budgets, newBudget]
            }
        })
    }

    const updateBudget = (newBudget) => {
        setUser((prev) => {
            return {
                ...prev,
                budgets: prev.budgets.map((budget) => {
                    if (budget.id !== newBudget.id) return budget
                    else return {
                        ...budget,
                        name: newBudget.name,
                        allocation: newBudget.allocation
                    }
                })
            }
        })
    }

    const addTransactions = async (newTransaction) => {
        await createTransaction(newTransaction)
        await refreshUserData()
    }

    const updateTransaction = async (oldTransaction, newTransaction) => {
        await updateTransactionApi(oldTransaction.id, newTransaction)
        await refreshUserData()
    }

    const deleteTransaction = async (transactionCandidate) => {
        await deleteTransactionApi(transactionCandidate.id)
        await refreshUserData()
    }

    const login = async (email, password) => {
        const backendData = await loadBackendData()

        setUser(
            {
                fullName: 'I\'m Tama',
                username: 'Tama',
                email,
                password,
                budgets: [],
                wallets: backendData.wallets,
                transactions: backendData.transactions
            })
    }

    const signin = async (fullName, username, email, password) => {
        const backendData = await loadBackendData()

        setUser({
            fullName,
            username,
            email,
            password,
            budgets: [],
            wallets: backendData.wallets,
            transactions: backendData.transactions
        })
    }

    const logout = () => {
        setUser(null)
    }

    return (
        <createdContext.Provider value={{ user, addTransactions, updateTransaction, deleteTransaction, addBudget, updateBudget, login, signin, logout, refreshUserData }}>
            {children}
        </createdContext.Provider>
    )
}

const useAppContext = () => {
    const context = useContext(createdContext)

    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider')
    }

    return context
}

export default useAppContext