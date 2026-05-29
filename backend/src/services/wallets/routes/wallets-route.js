import { Router } from "express";
import authenticateToken from '../../../middlewares/authentication.js'
import {
    getAllWallets
} from "../controllers/wallets-controller.js";

const router = Router()

router.use(authenticateToken)

router.get('/', getAllWallets)

export default router