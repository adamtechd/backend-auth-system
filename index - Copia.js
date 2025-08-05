import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/auth.js';
import User from './models/User.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Rota de Autenticação
app.use('/api/auth', authRoutes);

// ROTA ESPECIAL PARA CRIAR OU ATUALIZAR O ADMIN
app.get('/api/setup-admin', async (req, res) => {
  try {
    const adminEmail = "adamsaldanha1@gmail.com";
    const newPassword = "Adam8843"; // A senha que queremos garantir
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Encontra o usuário pelo email e ATUALIZA, ou CRIA se não existir.
    const user = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        $set: {
          nome: "Adam Admin",
          senha: hashedPassword,
          role: "admin"
        }
      },
      {
        upsert: true, // Cria o documento se ele não existir
        new: true     // Retorna o documento atualizado
      }
    );

    res.status(200).send(`Usuário admin (${user.email}) foi configurado com sucesso. Tente logar com a senha: ${newPassword}`);

  } catch (error) {
    res.status(500).send('Erro ao configurar usuário admin: ' + error.message);
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));