import express from 'express';
import Video from '../models/Video.js';

const router = express.Router();

// GET all videos (optionally filtered by shelf)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.shelf ? { shelf: req.query.shelf } : {};
    const videos = await Video.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add video to shelf
router.post('/', async (req, res) => {
  try {
    const { youtubeId, title, channelName, thumbnail, duration, shelf, notes } = req.body;
    const count = await Video.countDocuments({ shelf });
    const video = new Video({ youtubeId, title, channelName, thumbnail, duration, shelf, notes, order: count });
    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update video (move to different shelf, update notes)
router.patch('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE video
router.delete('/:id', async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
