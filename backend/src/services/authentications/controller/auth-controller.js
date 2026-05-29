import TokenManager from "../../../security/token-manager.js"
import response from "../../../utils/response.js"
import UsersRepositories from "../../users/repositories/users-repositories.js"
import AuthRepositories from "../repositories/auth-repositories.js"


const login = async (req, res, next) => {
    const { email, password } = req.body

    const userId = await UsersRepositories.verifyUsersCredential(email, password)
    if (userId === null) {
        return response(res, 400, 'Kamu salah memasukan email dan password')
    }

    const accessToken = await TokenManager.generateAccessToken({ id: userId })
    const refreshToken = await TokenManager.generateRefreshToken({ id: userId })

    AuthRepositories.addRefreshToken(refreshToken)

    response(res, 200, 'Berhasil melakukan login', { accessToken, refreshToken })
}

const logout = async (req, res, next) => {
    const { refreshToken } = req.body

    const tokenIsvalid = await AuthRepositories.verifyRefreshToken(refreshToken)
    if (!tokenIsvalid) {
        return response(res, 400, 'Refresh Token tidak valid')
    }

    await AuthRepositories.deleteRefreshToken(refreshToken)

    return response(res, 200, 'Refresh token berhasil dihapus')
}

export {
    login,
    logout
}