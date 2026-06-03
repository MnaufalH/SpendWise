import { nanoid } from 'nanoid'
import prisma from '../../../utils/prisma.js'

class WalletsRepositories {
    async getAllWallets(user_id) {
        return await prisma.wallet.findMany({
            where: { userId: user_id }
        })
    }

    async addWallets(user_id) {
        const names = ["BCA", "Cash", "OVO", "Dana", "Mandiri"]
        for (const name of names) {
            await prisma.wallet.create({
                data: {
                    id: `wlt-${nanoid(16)}`,
                    userId: user_id,
                    name,
                    amount: 0.0
                }
            })
        }
    }

    async updateWalletByTransaction(user_id, name, amount) {
        try {
            const wallet = await prisma.wallet.findUnique({
                where: {
                    userId_name: {
                        userId: user_id,
                        name
                    }
                }
            })
            if (!wallet) return false

            await prisma.wallet.update({
                where: { id: wallet.id },
                data: {
                    amount: wallet.amount + parseFloat(amount)
                }
            })
            return true
        } catch (error) {
            console.error("updateWalletByTransaction error:", error)
            return false
        }
    }

    async updateByEditTransaction(user_id, oldTransaction, newTransaction) {
        try {
            // First revert the old transaction
            const revertSuccess = await this.updateWalletByTransaction(
                user_id,
                oldTransaction.wallet,
                -parseFloat(oldTransaction.amount)
            )
            if (!revertSuccess) return false

            // Then apply the new transaction
            const applySuccess = await this.updateWalletByTransaction(
                user_id,
                newTransaction.wallet,
                parseFloat(newTransaction.amount)
            )
            return applySuccess
        } catch (error) {
            console.error("updateByEditTransaction error:", error)
            return false
        }
    }
}

export default new WalletsRepositories()