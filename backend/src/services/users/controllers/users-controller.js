import UsersRepositories from '../repositories/users-repositories.js';
import response from '../../../utils/response.js';
import WalletsRepositories from '../../wallets/repositories/wallets-repositories.js';

const createUser = async (req, res, next) => {
    const { fullName, userName, email, password } = req.body

    const existingUser = await UsersRepositories.getUserByEmail(email)
    if (existingUser) {
        return response(res, 409, 'Gagal melakukan register karena email sudah digunakan')
    }

    const user = await UsersRepositories.createUser(fullName, userName, email, password)
    await WalletsRepositories.addWallets(user)

    return response(res, 201, 'Berhasil melakukan Registrasi', { id: user })
}

const getAllUsers = async (req, res, next) => {
    const users = await UsersRepositories.getAllUsers()
    if (users.length < 1) {
        return response(res, 200, 'Data users kosong', { users })
    }

    return response(res, 200, 'Berhasil menampilkan users', { users })
}

const deleteUser = async (req, res, next) => {
    const { user_id } = req.params

    await UsersRepositories.deleteUser(user_id)

    return response(res, 200, 'Berhasil menghapus akun')
}

const getUserById = async (req, res, next) => {
    const { id: user_id } = req.user

    const user = await UsersRepositories.getUserById(user_id)
    if (!user) {
        return response(res, 401, 'Harus login terlebih dahulu', null)
    }
    
    return response(res, 200, 'Berhasil login dan mengambil data', user)
}

export {
    createUser,
    getAllUsers,
    deleteUser,
    getUserById
}