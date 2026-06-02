import { nanoid } from "nanoid"
import prisma from '../../../utils/prisma.js'

class BudgetRepositories {
    async addBudget(user_id, name, allocation) {
        const id = `bud-${nanoid(16)}`
        await prisma.budget.create({
            data: {
                id,
                userId: user_id,
                name,
                used: 0,
                allocation: parseFloat(allocation),
                createdAt: new Date()
            }
        })
        return id
    }

    async getAllBudgeting(user_id, namaBulan, stringTahun) {
        const mapBulan = {
            'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
            'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
        };

        const targetBulan = mapBulan[namaBulan]
        const targetTahun = Number(stringTahun)

        if (targetBulan === undefined || isNaN(targetTahun)) {
            return []
        }

        const budgets = await prisma.budget.findMany({
            where: { userId: user_id }
        })

        return budgets.filter(budget => {
            const date = new Date(budget.createdAt)
            return date.getFullYear() === targetTahun && date.getMonth() === targetBulan
        })
    }

    async getAllBudget(user_id) {
        return await prisma.budget.findMany({
            where: { userId: user_id }
        })
    }

    async getBudgetById(id) {
        return await prisma.budget.findUnique({
            where: { id }
        })
    }

    async editBudget(budget_id, name, allocation) {
        await prisma.budget.update({
            where: { id: budget_id },
            data: {
                name,
                allocation: parseFloat(allocation)
            }
        })
    }

    async updateByTransaction(user_id, name, amount) {
        try {
            const budget = await prisma.budget.findFirst({
                where: { userId: user_id, name },
                orderBy: { createdAt: 'desc' }
            })
            if (!budget) return false

            await prisma.budget.update({
                where: { id: budget.id },
                data: {
                    used: budget.used - parseFloat(amount)
                }
            })
            return true
        } catch (error) {
            console.error("updateByTransaction budget error:", error)
            return false
        }
    }

    async updateByEditTransaction(user_id, oldTransaction, newTransaction) {
        try {
            // Revert old transaction if it was Pengeluaran
            if (oldTransaction.type === 'Pengeluaran') {
                const revertSuccess = await this.updateByTransaction(
                    user_id,
                    oldTransaction.category,
                    -parseFloat(oldTransaction.amount)
                )
                if (!revertSuccess) return false
            }
            // Apply new transaction if it is Pengeluaran
            if (newTransaction.type === 'Pengeluaran') {
                const applySuccess = await this.updateByTransaction(
                    user_id,
                    newTransaction.category,
                    parseFloat(newTransaction.amount)
                )
                if (!applySuccess) return false
            }
            return true
        } catch (error) {
            console.error("updateByEditTransaction budget error:", error)
            return false
        }
    }

    async searchBudgeting(user_id, name) {
        const count = await prisma.budget.count({
            where: { userId: user_id, name }
        })
        return count > 0
    }

    async deleteBudget(id) {
        try {
            await prisma.budget.delete({
                where: { id }
            })
            return true
        } catch (error) {
            return false
        }
    }
}

export default new BudgetRepositories()