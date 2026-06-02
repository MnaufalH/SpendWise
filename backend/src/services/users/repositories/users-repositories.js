import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import prisma from '../../../utils/prisma.js';

class Users {
    async createUser(fullName, userName, email, password) {
        const id = `user-${nanoid(16)}`
        const hashedPass = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                id,
                fullName,
                userName,
                email,
                password: hashedPass
            }
        });
        return id
    }

    async getUserByEmail(email) {
        return await prisma.user.findUnique({
            where: { email }
        })
    }

    async getAllUsers() {
        return await prisma.user.findMany()
    }

    async deleteUser(id) {
        try {
            await prisma.user.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async verifyUsersCredential(email, password) {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return null
        }

        const passwordIsTrue = await bcrypt.compare(password, user.password)
        if (!passwordIsTrue) {
            return null
        }

        return user.id
    }

    async getUserById(id) {
        return await prisma.user.findUnique({
            where: { id }
        });
    }
}

export default new Users()