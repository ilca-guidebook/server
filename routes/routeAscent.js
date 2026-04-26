import express from 'express';
import mongoose from 'mongoose';
import isNumber from 'lodash/isNumber.js';
import moment from 'moment';

import RouteAscentModel, { ASCENT_TYPES } from '../models/RouteAscent.js';

const router = express.Router({ mergeParams: true });

const normalizeAscentDate = (date) => {
  return moment.utc(date, 'YYYY-MM-DD').startOf('day').toDate();
};

router.get('/', async (req, res) => {
  const {
    auth: { id: userId },
  } = req;

  try {
    const ascents = await RouteAscentModel.find({ userId }).sort({ ascentDate: -1 });
    return res.json({ ascents: ascents.map((a) => a.toJSON()) });
  } catch (e) {
    console.log('Error fetching ascents', e);
    return res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  const {
    auth: { id: userId },
    body: { routeId, numOfAttempts, ascentDate, ascentType, stars, comment },
  } = req;

  if (!routeId) {
    return res.status(422).json({ errors: { routeId: 'is required' } });
  }

  if (!isNumber(numOfAttempts)) {
    return res.status(422).json({ errors: { numOfAttempts: 'is required' } });
  }

  if (!ascentDate) {
    return res.status(422).json({ errors: { ascentDate: 'is required' } });
  }

  if (ascentType && !ASCENT_TYPES.includes(ascentType)) {
    return res.status(422).json({ errors: { ascentType: 'is invalid' } });
  }

  try {
    const ascent = new RouteAscentModel({
      userId,
      routeId,
      numOfAttempts,
      ascentDate: normalizeAscentDate(ascentDate),
      ascentType,
      stars,
      comment,
    });
    await ascent.save();
    return res.json({ ascent: ascent.toJSON() });
  } catch (e) {
    console.log('Error creating ascent', e);
    return res.sendStatus(500);
  }
});

router.put('/:ascentId', async (req, res) => {
  const {
    auth: { id: userId },
    params: { ascentId },
    body: { routeId, numOfAttempts, ascentDate, ascentType, stars, comment },
  } = req;

  if (!mongoose.isValidObjectId(ascentId)) {
    return res.sendStatus(404);
  }

  // 0 is also invalid
  if (!!numOfAttempts && !isNumber(numOfAttempts)) {
    return res.status(422).json({ errors: { numOfAttempts: 'is invalid' } });
  }

  if (!!ascentType && !ASCENT_TYPES.includes(ascentType)) {
    return res.status(422).json({ errors: { ascentType: 'is invalid' } });
  }

  try {
    const ascent = await RouteAscentModel.findOne({ _id: ascentId, userId });

    if (!ascent) {
      return res.sendStatus(404);
    }

    if (routeId !== undefined) ascent.routeId = routeId;
    if (numOfAttempts !== undefined) ascent.numOfAttempts = numOfAttempts;
    if (ascentDate !== undefined) ascent.ascentDate = normalizeAscentDate(ascentDate);
    if (ascentType !== undefined) ascent.ascentType = ascentType;
    if (stars !== undefined) ascent.stars = stars;
    if (comment !== undefined) ascent.comment = comment;

    await ascent.save();
    return res.json({ ascent: ascent.toJSON() });
  } catch (e) {
    console.log('Error updating ascent', e);
    return res.sendStatus(500);
  }
});

router.delete('/:ascentId', async (req, res) => {
  const {
    auth: { id: userId },
    params: { ascentId },
  } = req;

  if (!mongoose.isValidObjectId(ascentId)) {
    return res.sendStatus(404);
  }

  try {
    const result = await RouteAscentModel.deleteOne({ _id: ascentId, userId });

    if (result.deletedCount === 0) {
      return res.sendStatus(404);
    }

    return res.sendStatus(204);
  } catch (e) {
    console.log('Error deleting ascent', e);
    return res.sendStatus(500);
  }
});

export default router;
