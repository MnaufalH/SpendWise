import { createContext, useContext, useState } from "react"

const createdContext = createContext()

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(
        {
            fullName: 'Ervan Setyatama',
            username: 'Tama',
            email: 'tama@gg.com',
            password: 'tama1234',
            budgets: [
                // { id: 'bud-1', name: 'Makan', used: 50000, allocation: 100000 },
                // { id: 'bud-2', name: 'Transport', used: 0, allocation: 50000 },
                // { id: 'bud-3', name: 'Kost', used: 650000, allocation: 750000 }
            ],
            wallets: [
                { name: "BCA", amount: 1000000 },
                { name: "Cash", amount: 300000 },
                { name: "OVO", amount: 500000 },
                { name: "Dana", amount: 400000 },
            ],
            transactions: [
                // {
                //     id: 'tr-1',
                //     type: 'Pengeluaran',
                //     descript: 'Makan',
                //     amount: -100000,
                //     category: 'Makan',
                //     date: '2025-12-12',
                //     wallet: 'BCA'
                // },
                // {
                //     id: 'tr-2',
                //     type: 'Pemasukan',
                //     descript: 'Ambil duit',
                //     amount: 100000,
                //     category: 'Makan',
                //     date: '2025-12-12',
                //     wallet: 'BCA'
                // }
            ]
        }
    )

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

    const addTransactions = (newTransaction) => {
        setUser((prev) => {
            return {
                ...prev,
                budgets: prev.budgets.map((budget) => {
                    if (budget.name !== newTransaction.category) return budget
                    else return {
                        ...budget,
                        used: budget.used - newTransaction.amount
                    }
                }),
                wallets: prev.wallets.map((wallet) => {
                    if (wallet.name !== newTransaction.wallet) return wallet

                    const newAmount = wallet.amount + newTransaction.amount

                    return { name: wallet.name, amount: newAmount }
                }),
                transactions: [
                    ...prev.transactions,
                    newTransaction
                ]
            }
        })
    }

    const updateTransaction = (oldTransaction, newTransaction) => {
        setUser((prev) => {
            return {
                ...prev,
                wallets: oldTransaction.wallet === newTransaction.wallet ? (
                    prev.wallets.map((wallet) => {
                        if (wallet.name !== newTransaction.wallet) return wallet

                        const newAmount = (wallet.amount - oldTransaction.amount) + newTransaction.amount

                        return { ...wallet, amount: newAmount }
                    })
                ) : (
                    prev.wallets.map((wallet) => {
                        if (wallet.name === oldTransaction.wallet) {
                            return { ...wallet, amount: (wallet.amount - oldTransaction.amount) }
                        }
                        if (wallet.name === newTransaction.wallet) {
                            return { ...wallet, amount: (wallet.amount + newTransaction.amount) }
                        }
                        if (wallet.name !== oldTransaction.wallet && wallet.name !== newTransaction.wallet) {
                            return wallet
                        }
                    })
                ),
                transactions: prev.transactions.map((transaction) => {
                    if (transaction.id !== newTransaction.id) return transaction
                    else return newTransaction
                })
            }
        })
    }

    const deleteTransaction = (transactionCandidate) => {
        setUser((prev) => {
            return {
                ...prev,
                wallets: prev.wallets.map((wallet) => {
                    if (wallet.name !== transactionCandidate.wallet) return wallet

                    const newAmount = wallet.amount - transactionCandidate.amount

                    return { name: wallet.name, amount: newAmount }
                }),
                transactions: prev.transactions.filter((transaction) => transaction.id !== transactionCandidate.id)
            }
        })
    }

    return (
        <createdContext.Provider value={{ user, addTransactions, updateTransaction, deleteTransaction, addBudget, updateBudget }}>
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