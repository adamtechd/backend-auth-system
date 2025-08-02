
import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ erro: 'Token não fornecido' });

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado;
    next();
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido' });
  }
};

export const apenasAdmin = (req, res, next) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }
  next();
};
