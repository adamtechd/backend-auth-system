
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB conectado');
  app.listen(3001, () => console.log('Servidor rodando em http://localhost:3001'));
}).catch(err => console.error('Erro ao conectar ao MongoDB:', err));
