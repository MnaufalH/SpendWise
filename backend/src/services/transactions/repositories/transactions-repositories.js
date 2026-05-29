import { nanoid } from 'nanoid'

/* 
 * id
 * user_id
 * type
 * descript
 * amount
 * category
 * wallet
 * created_at */

class TransactionsRepositories {
    constructor() {
        this.transactions = []
    }

    createTransaction(user_id, type, descript, amount, category, wallet, date) {
        const id = `trs-${nanoid(16)}`

        const newTransaction = { id, user_id, type, descript, amount, category, wallet, date }

        this.transactions.push(newTransaction)

        return id
    }

    getTransactionById(id) {
        return this.transactions.find(trans => trans.id === id)
    }

    getAllTransaction(user_id) {
        return this.transactions.filter(trans => trans.user_id === user_id)
    }

    updateTransaction(id, user_id, newTransaction) {
        const index = this.transactions.findIndex(trans => trans.id === id)
        if (index === -1) {
            return false
        }

        this.transactions[index] = { id, user_id, ...newTransaction }
        return true
    }

    deleteTransaction(id) {
        const newTransactionList = this.transactions.filter(trans => trans.id !== id)

        this.transactions = newTransactionList
    }
}

export default new TransactionsRepositories()