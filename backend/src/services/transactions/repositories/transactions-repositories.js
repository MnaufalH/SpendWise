import { nanoid } from 'nanoid'
import prisma from '../../../utils/prisma.js'

class TransactionsRepositories {
    async createTransaction(user_id, type, descript, amount, category, wallet, date) {
        const id = `trs-${nanoid(16)}`
        await prisma.transaction.create({
            data: {
                id,
                userId: user_id,
                type,
                descript,
                amount: parseFloat(amount),
                category,
                wallet,
                date
            }
        })
        return id
    }

    async getTransactionById(id) {
        return await prisma.transaction.findUnique({
            where: { id }
        })
    }

    async getAllTransaction(user_id) {
        return await prisma.transaction.findMany({
            where: { userId: user_id },
            orderBy: { date: 'desc' }
        })
    }

    async updateTransaction(id, user_id, newTransaction) {
        try {
            await prisma.transaction.update({
                where: { id },
                data: {
                    type: newTransaction.type,
                    descript: newTransaction.descript,
                    amount: parseFloat(newTransaction.amount),
                    category: newTransaction.category,
                    wallet: newTransaction.wallet,
                    date: newTransaction.date
                }
            })
            return true
        } catch (error) {
            console.error("updateTransaction error:", error)
            return false
        }
    }

    async deleteTransaction(id) {
        try {
            await prisma.transaction.delete({
                where: { id }
            })
            return true
        } catch (error) {
            return false
        }
    }

    async getIncomeAndExpense(user_id, bulan, tahun) {
        const mapBulan = {
            'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04', 'Mei': '05', 'Juni': '06',
            'Juli': '07', 'Agustus': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        };
        const targetBulan = mapBulan[bulan]

        if (targetBulan === undefined) {
            return { income: [], expense: [] }
        }

        const periode = `${tahun}-${targetBulan}`

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: user_id,
                date: {
                    startsWith: periode
                }
            }
        })

        const income = transactions.filter(trans => trans.type === 'Pemasukan')
        const expense = transactions.filter(trans => trans.type === 'Pengeluaran')

        return { income, expense }
    }
}

export default new TransactionsRepositories()