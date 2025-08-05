import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  senha: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' }
});

export default mongoose.model('User', userSchema);