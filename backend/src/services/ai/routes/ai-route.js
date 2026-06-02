import { Router } from 'express';
import { getMonthlyInsights, getNextMonthPrediction } from '../controllers/ai-controller.js';
import authenticateToken from '../../../middlewares/authentication.js';

const router = Router();

router.get('/insights', authenticateToken, getMonthlyInsights);
router.get('/prediction', authenticateToken, getNextMonthPrediction);

export default router;
