
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { nome, email, senha, role } = req.body;
  try {
    const hash = await bcrypt.hash(senha, 10);
    const novoUsuario = new User({ nome, email, senha: hash, role });
    await novoUsuario.save();
    res.status(201).json({ mensagem: 'Usuário criado com sucesso.' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) return res.status(401).json({ erro: 'Senha incorreta' });

    const token = jwt.sign(
      { id: usuario._id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, usuario: { nome: usuario.nome, email: usuario.email, role: usuario.role } });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};
