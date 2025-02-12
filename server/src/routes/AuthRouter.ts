import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import {
    ensureOneOfEmailUsernamePhone,
    loginSchema,
    registrationSchema,
    resetPasswordSchema,
} from '../utils/payload_validator/AuthSchema';

const router = Router();

// POST /auth/login
router.post(
    '/login',
    loginSchema,
    ensureOneOfEmailUsernamePhone,
    AuthController.login
);

// POST /auth/register
router.post('/register', registrationSchema, AuthController.register);

// POST /auth/forgot-password
router.post(
    '/forgot-password',
    resetPasswordSchema,
    AuthController.forgotPassword
);

// POST /auth/reset-password
router.post('/reset-password', AuthController.resetPassword);

// POST /auth/logout
router.post('/logout', AuthController.logout);

export default router;
