import express from 'express';
import Shelf from '../models/Shelf.js';
import Video from '../models/Video.js';

const router = express.Router();

// GET all shelves with video counts
router.get('/', async (req, res) => {
  try {
    const shelves = await Shelf.find().sort({ order: 1, createdAt: -1 });
    const shelvesWithCounts = await Promise.all(
      shelves.map(async (shelf) => {
        const count = await Video.countDocuments({ shelf: shelf._id });
        return { ...shelf.toObject(), videoCount: count };
      })
    );
    res.json(shelvesWithCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single shelf with its videos
router.get('/:id', async (req, res) => {
  try {
    const shelf = await Shelf.findById(req.params.id);
    if (!shelf) return res.status(404).json({ message: 'Shelf not found' });
    const videos = await Video.find({ shelf: shelf._id }).sort({ order: 1, createdAt: -1 });
    res.json({ ...shelf.toObject(), videos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create shelf
router.post('/', async (req, res) => {
  try {
    const { name, description, accentColor } = req.body;
    const count = await Shelf.countDocuments();
    const shelf = new Shelf({ name, description, accentColor, order: count });
    await shelf.save();
    res.status(201).json(shelf);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update shelf
router.patch('/:id', async (req, res) => {
  try {
    const shelf = await Shelf.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shelf) return res.status(404).json({ message: 'Shelf not found' });
    res.json(shelf);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE shelf and its videos
router.delete('/:id', async (req, res) => {
  try {
    await Video.deleteMany({ shelf: req.params.id });
    await Shelf.findByIdAndDelete(req.params.id);
    res.json({ message: 'Shelf deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
