/* 
 * token
 */

class AuthenticationsRepositories {
    constructor() {
        this.auth = []
    }

    addRefreshToken(token) {
        const newRefreshToken = { token }
        this.auth.push(newRefreshToken)
    }

    verifyRefreshToken(token) {
        return this.auth.some((item) => item.token === token)
    }

    deleteRefreshToken(token) {
        const newAuth = this.auth.filter((item) => item.token !== token)
        this.auth = newAuth
    }
}

export default new AuthenticationsRepositories()