import { Router } from "express";
import {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById
} from "../controllers/users-controller.js";
import authenticateToken from "../../../middlewares/authentication.js";

const router = Router()

router.post('/', createUser)
router.get('/', getAllUsers)
router.get('/me', authenticateToken, getUserById)
router.delete('/:user_id', deleteUser)

export default router