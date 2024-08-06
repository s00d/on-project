import { Router } from 'express';
import {
  register,
  login,
  getMe,
  enable2FA,
  verify2FA,
  disable2FA,
  requestPasswordReset, resetPassword
} from '../controllers/userController';
import { authenticateAll } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.post('/2fa/enable', authenticateAll, enable2FA);
router.post('/2fa/verify', authenticateAll, verify2FA);
router.post('/2fa/disable', authenticateAll, disable2FA);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export { router as userRouter };
