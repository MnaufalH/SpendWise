import { nanoid } from "nanoid";

/* 
 * id
 * user_id
 * name
 * used
 * allocation
 */

class BudgetRepositories {
    constructor() {
        this.budgets = []
    }

    addBudget(user_id, name, allocation) {
        const id = `bud-${nanoid(16)}`
        const created_at = new Date().toISOString()

        const newBudget = { id, user_id, name, used: 0, allocation, created_at }

        this.budgets.push(newBudget)

        return id
    }

    getAllBudgeting(user_id, namaBulan, stringTahun) {
        const mapBulan = {
            'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
            'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
        };

        const targetBulan = mapBulan[namaBulan];
        const targetTahun = Number(stringTahun);

        if (targetBulan === undefined || isNaN(targetTahun)) {
            return [];
        }

        return this.budgets.filter(budget => {
            if (budget.user_id !== user_id) return false;

            const date = new Date(budget.created_at);

            return date.getFullYear() === targetTahun && date.getMonth() === targetBulan;
        });
    }

    getAllBudget() {
        return this.budgets
    }

    getBudgetById(id) {
        const budget = this.budgets.find(budget => budget.id === id)

        return budget
    }

    editBudget(budget_id, name, allocation) {
        const editedBudget = this.budgets.map((budget) => {
            if (budget.id !== budget_id) return budget

            return { ...budget, name, allocation }
        })

        this.budgets = editedBudget
    }

    updateByTransaction(user_id, name, amount) {
        const index = this.budgets.findIndex(budget => budget.user_id === user_id && budget.name === name)
        if (index === -1) {
            return false
        }

        this.budgets[index].used -= amount
        return true
    }

    updateByEditTransaction(oldTransaction, newTransaction) {
        let index = -1

        if (oldTransaction.type === 'Pemasukan' && newTransaction.type === 'Pemasukan') {
            return true
        } else if (oldTransaction.type === 'Pemasukan' && newTransaction.type === 'Pengeluaran') {
            index = this.budgets.findIndex(budget => budget.user_id === oldTransaction.user_id && budget.name === newTransaction.category)
            if (index === -1) {
                return false
            }
            this.budgets[index].used -= newTransaction.amount
        } else if (oldTransaction.type === 'Pengeluaran' && newTransaction.type === 'Pemasukan') {
            index = this.budgets.findIndex(budget => budget.user_id === oldTransaction.user_id && budget.name === oldTransaction.category)
            if (index === -1) {
                return false
            }
            this.budgets[index].used += oldTransaction.amount
        } else {
            if (oldTransaction.category === newTransaction.category) {
                index = this.budgets.findIndex(budget => budget.user_id === oldTransaction.user_id && budget.name === newTransaction.category)
                if (index === -1) {
                    return false
                }
                this.budgets[index].used += oldTransaction.amount
                this.budgets[index].used -= newTransaction.amount
            } else {
                index = this.budgets.findIndex(budget => budget.user_id === oldTransaction.user_id && budget.name === oldTransaction.category)
                if (index === -1) {
                    return false
                }
                this.budgets[index].used += oldTransaction.amount

                index = this.budgets.findIndex(budget => budget.user_id === newTransaction.user_id && budget.name === newTransaction.category)
                if (index === -1) {
                    return false
                }
                this.budgets[index].used -= oldTransaction.amount
            }
        }
        return true
    }

    searchBudgeting(name) {
        return this.budgets.some(budget => budget.name === name)
    }

    deleteBudget(id) {
        const deletedBudget = this.budgets.filter(budget => budget.id !== id)

        this.budgets = deletedBudget
    }
}

export default new BudgetRepositories()