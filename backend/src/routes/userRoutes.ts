import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import {
  register,
  login,
  logout,
  getMe,
  enable2FA,
  verify2FA,
  disable2FA,
  requestPasswordReset,
  resetPassword
} from '../controllers/userController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {validateRequest} from "../middlewares/validateRequest";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and authentication
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: The user was successfully created
 *       400:
 *         description: Bad request
 */
router.post(
  '/register',
  [
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validateRequest,
  register
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful logout
 *       500:
 *         description: Failed to logout
 */
router.post('/logout', logout);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the logged-in user's information
 *     tags: [User]
 *     responses:
 *       200:
 *         description: The user's information
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateAll, getMe);

/**
 * @swagger
 * /users/2fa/enable:
 *   post:
 *     summary: Enable 2FA for the logged-in user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: QR code URL for 2FA setup
 *       500:
 *         description: Failed to generate QR code
 */
router.post('/2fa/enable', authenticateAll, enable2FA);

/**
 * @swagger
 * /users/2fa/verify:
 *   post:
 *     summary: Verify 2FA for the logged-in user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA verified successfully
 *       400:
 *         description: Invalid token
 */
router.post(
  '/2fa/verify',
  [check('token').notEmpty().withMessage('Token is required')],
  validateRequest,
  verify2FA
);

/**
 * @swagger
 * /users/2fa/disable:
 *   post:
 *     summary: Disable 2FA for the logged-in user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Failed to disable 2FA
 */
router.post('/2fa/disable', authenticateAll, disable2FA);

/**
 * @swagger
 * /users/request-reset:
 *   post:
 *     summary: Request a password reset
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email sent for password reset
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to send email
 */
router.post(
  '/request-reset',
  [check('email').isEmail().withMessage('Please provide a valid email')],
  validateRequest,
  requestPasswordReset
);

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password has been reset
 *       400:
 *         description: Password reset token is invalid or has expired
 */
router.post(
  '/reset-password',
  [
    check('token').notEmpty().withMessage('Token is required'),
    check('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validateRequest,
  resetPassword
);

export { router as userRouter };


