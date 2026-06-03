import prisma from '../../../utils/prisma.js'

class AuthenticationsRepositories {
    async addRefreshToken(token) {
        await prisma.authentications.create({
            data: { token }
        })
    }

    async verifyRefreshToken(token) {
        const auth = await prisma.authentications.findUnique({
            where: { token }
        })
        return auth !== null
    }

    async deleteRefreshToken(token) {
        try {
            await prisma.authentications.delete({
                where: { token }
            })
            return true
        } catch (error) {
            return false
        }
    }
}

export default new AuthenticationsRepositories()