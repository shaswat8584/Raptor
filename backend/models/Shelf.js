import mongoose from 'mongoose';

const shelfSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  accentColor: { type: String, default: '#F0EDE8' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Shelf', shelfSchema);
