import express from 'express';
import mongoose from 'mongoose';

import FavoriteModel from '../models/Favorites.js';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  const {
    auth: { id: userId },
  } = req;

  try {
    const favorites = await FavoriteModel.find({ userId }).sort({ createdAt: -1 });
    return res.json({ favorites: favorites.map((item) => item.toJSON()) });
  } catch (e) {
    console.log('Error fetching favorites', e);
    return res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  const {
    auth: { id: userId },
    body: { routeId },
  } = req;

  if (!routeId) {
    return res.status(422).json({ errors: { routeId: 'is required' } });
  }

  try {
    const favorite = new FavoriteModel({
      userId,
      routeId,
    });

    await favorite.save();
    return res.json({ favorite: favorite.toJSON() });
  } catch (e) {
    console.log('Error creating favorite', e);
    return res.sendStatus(500);
  }
});

router.delete('/:favoriteId', async (req, res) => {
  const {
    auth: { id: userId },
    params: { favoriteId },
  } = req;

  if (!mongoose.isValidObjectId(favoriteId)) {
    return res.sendStatus(404);
  }

  try {
    const result = await FavoriteModel.deleteOne({ _id: favoriteId, userId });

    if (result.deletedCount === 0) {
      return res.sendStatus(404);
    }

    return res.sendStatus(204);
  } catch (e) {
    console.log('Error deleting favorite', e);
    return res.sendStatus(500);
  }
});

export default router;
