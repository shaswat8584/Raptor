import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  youtubeId: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  channelName: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  duration: { type: String, default: '' },
  shelf: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelf', required: true },
  order: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Video', videoSchema);
