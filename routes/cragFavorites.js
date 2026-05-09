import express from 'express';
import mongoose from 'mongoose';

import CragFavoriteModel from '../models/CragFavorite.js';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  const {
    auth: { id: userId },
  } = req;

  try {
    const favorites = await CragFavoriteModel.find({ userId }).sort({ createdAt: -1 });
    return res.json({ favorites: favorites.map((item) => item.toJSON()) });
  } catch (e) {
    console.log('Error fetching crag favorites', e);
    return res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  const {
    auth: { id: userId },
    body: { cragId },
  } = req;

  if (!cragId) {
    return res.status(422).json({ errors: { cragId: 'is required' } });
  }

  try {
    const favorite = new CragFavoriteModel({
      userId,
      cragId,
    });

    await favorite.save();
    return res.json({ favorite: favorite.toJSON() });
  } catch (e) {
    console.log('Error creating crag favorite', e);
    return res.sendStatus(500);
  }
});

router.delete('/:id', async (req, res) => {
  const {
    auth: { id: userId },
    params: { id },
  } = req;

  if (!mongoose.isValidObjectId(id)) {
    return res.sendStatus(404);
  }

  try {
    const result = await CragFavoriteModel.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return res.sendStatus(404);
    }

    return res.sendStatus(204);
  } catch (e) {
    console.log('Error deleting crag favorite', e);
    return res.sendStatus(500);
  }
});

export default router;
