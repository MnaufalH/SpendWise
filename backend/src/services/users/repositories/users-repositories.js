import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
/* 
 * id
 * fullName
 * userName
 * email
 * password 
 */

// export const users = []


class Users {
    constructor() {
        this.users = []
    }

    async createUser(fullName, userName, email, password) {
        const id = `user-${nanoid(16)}`
        const hashedPass = await bcrypt.hash(password, 10)
        const created_at = new Date().toISOString()

        const newUser = { id, fullName, userName, email, password: hashedPass, created_at }

        this.users.push(newUser)
        return id
    }

    getAllUsers() {
        return this.users
    }

    deleteUser(id) {
        const index = this.users.findIndex(user => user.id === id)
        if (index === -1) {
            return false
        }

        this.users.splice(index, 1)
    }

    async verifyUsersCredential(email, password) {
        const user = this.users.find(user => user.email === email)
        if (!user) {
            return null
        }

        const { id, password: passEncrypted } = user
        const passwordIsTrue = await bcrypt.compare(password, passEncrypted)
        if (!passwordIsTrue) {
            return null
        }

        return id
    }

    getUserById(id) {
        return this.users.find(user => user.id === id)
    }
}

export default new Users()