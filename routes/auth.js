
import express from 'express';
import { register, login } from '../controllers/authController.js';
import { verificarToken, apenasAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', verificarToken, apenasAdmin, register);
router.post('/login', login);
router.get('/me', verificarToken, (req, res) => {
  res.json({ usuario: req.usuario });
});

export default router;
