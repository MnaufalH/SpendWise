import { nanoid } from 'nanoid'

/* 
 * user_id
 * name
 * amount */

class WalletsRepositories {
    constructor() {
        this.wallets = []
    }

    getAllWallets(user_id) {
        const user_wallets = this.wallets.filter(wallet => wallet.user_id === user_id)

        return user_wallets
    }

    addWallets(user_id) {
        const BCAWallet = { user_id, name: "BCA", amount: 0 }
        const CashWallet = { user_id, name: "Cash", amount: 0 }
        const OVOWallet = { user_id, name: "OVO", amount: 0 }
        const DanaWallet = { user_id, name: "Dana", amount: 0 }
        const MandiriWallet = { user_id, name: "Mandiri", amount: 0 }


        this.wallets.push(BCAWallet)
        this.wallets.push(CashWallet)
        this.wallets.push(OVOWallet)
        this.wallets.push(DanaWallet)
        this.wallets.push(MandiriWallet)
    }

    updateWalletByTransaction(user_id, name, amount) {
        const index = this.wallets.findIndex(wallet => wallet.user_id === user_id && wallet.name === name)
        if (index === -1) {
            return false
        }

        this.wallets[index].amount += amount
        return true
    }

    updateByEditTransaction(oldTransaction, newTransaction) {
        let index = -1

        if (oldTransaction.type === 'Pemasukan' && newTransaction.type === 'Pemasukan') {
            if (oldTransaction.wallet === newTransaction.wallet) {
                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === newTransaction.wallet)
                if (index === -1) {
                    return false
                }

                this.wallets[index].amount -= oldTransaction.amount
                this.wallets[index].amount += newTransaction.amount
            } else {
                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === oldTransaction.wallet)
                if (index === -1) {
                    return false
                }
                this.wallets[index].amount -= oldTransaction.amount

                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === newTransaction.wallet)
                if (index === -1) {
                    return false
                }
                this.wallets[index].amount += newTransaction.amount
            }
        } else if (oldTransaction.type === 'Pemasukan' && newTransaction.type === 'Pengeluaran') {
            if (oldTransaction.wallet === newTransaction.wallet) {
                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === oldTransaction.wallet)
                if (index === -1) {
                    return false
                }

                this.wallets[index].amount -= oldTransaction.amount
                this.wallets[index].amount += newTransaction.amount
            } else {
                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === oldTransaction.wallet)
                if (index === -1) {
                    return false
                }
                this.wallets[index].amount -= oldTransaction.amount

                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === newTransaction.wallet)
                if (index === -1) {
                    return false
                }
                this.wallets[index].amount += newTransaction.amount
            }
        } else if (oldTransaction.type === 'Pengeluaran' && newTransaction.type === 'Pemasukan') {
            if (oldTransaction.wallet === newTransaction.wallet) {
                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === oldTransaction.wallet)
                if (index === -1) {
                    return false
                }

                this.wallets[index].amount -= oldTransaction.amount
                this.wallets[index].amount += newTransaction.amount
            } else {
                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === oldTransaction.wallet)
                if (index === -1) {
                    return false
                }
                this.wallets[index].amount -= oldTransaction.amount

                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === newTransaction.wallet)
                if (index === -1) {
                    return false
                }
                this.wallets[index].amount += newTransaction.amount
            }
        } else {
            if (oldTransaction.wallet === newTransaction.wallet) {
                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === oldTransaction.wallet)
                if (index === -1) {
                    return false
                }

                this.wallets[index].amount -= oldTransaction.amount
                this.wallets[index].amount += newTransaction.amount
            } else {
                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === oldTransaction.wallet)
                if (index === -1) {
                    return false
                }
                this.wallets[index].amount -= oldTransaction.amount

                index = this.wallets.findIndex(wallet => wallet.user_id === oldTransaction.user_id && wallet.name === newTransaction.wallet)
                if (index === -1) {
                    return false
                }
                this.wallets[index].amount += newTransaction.amount
            }
        }
        return true
    }
}

export default new WalletsRepositories()