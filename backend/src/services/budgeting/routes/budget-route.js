import { Router } from 'express'
import authenticateToken from '../../../middlewares/authentication.js'
import {
    addBudgeting,
    deleteBudgeting,
    editBudgeting,
    getAllBudgeting,
    getAllBudgetiWithoutRange,
    getBudgetById
} from '../controllers/budget-controller.js'

const router = Router()

router.use(authenticateToken)

router.post('/', addBudgeting)
router.get('/', getAllBudgetiWithoutRange)
router.post('/in', getAllBudgeting)
router.get('/:budget_id', getBudgetById)
router.put('/:budget_id', editBudgeting)
router.delete('/:budget_id', deleteBudgeting)

export default router