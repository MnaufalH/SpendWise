import WalletsRepositories from "../repositories/wallets-repositories.js"
import response from '../../../utils/response.js'

const getAllWallets = (req, res, next) => {
    const { id: user_id } = req.user

    const wallets = WalletsRepositories.getAllWallets(user_id)

    return response(res, 200, 'Berhasil menampilkan wallets', { wallets })
}

export {
    getAllWallets
}