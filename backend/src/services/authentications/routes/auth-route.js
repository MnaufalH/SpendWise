import { Router } from 'express';
import authenticateToken from '../../../middlewares/authentication.js'
import {
    login,
    logout
} from '../controller/auth-controller.js';

const router = Router()

router.post('/', login)
router.delete('/', authenticateToken, logout);

export default router