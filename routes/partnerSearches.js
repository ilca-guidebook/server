import express from 'express';
import mongoose from 'mongoose';
import moment from 'moment';

import PartnerSearchModel, { RIDE_ROLES, ERIDE_ROLE } from '../models/PartnerSearch.js';
import PartnerRequestModel from '../models/PartnerRequest.js';

const router = express.Router({ mergeParams: true });

const HOUR_REGEX = /^(flexible|([01]\d|2[0-3]):[0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const validateSearchInput = (body) => {
  const { cragIds, date, leaveHomeHour, leaveCragHour, rideRole, leaveFromAddress } = body;
  const errors = {};

  if (!Array.isArray(cragIds) || cragIds.length === 0) {
    errors.cragIds = 'is required';
  }

  if (!date || !DATE_REGEX.test(date) || !moment.utc(date, 'YYYY-MM-DD', true).isValid()) {
    errors.date = 'is invalid';
  }

  if (!rideRole || !RIDE_ROLES.includes(rideRole)) {
    errors.rideRole = 'is invalid';
  }

  if (rideRole !== ERIDE_ROLE.SELF && (!leaveFromAddress || !leaveFromAddress.trim())) {
    errors.leaveFromAddress = 'is required';
  }

  if (!leaveHomeHour || !HOUR_REGEX.test(leaveHomeHour)) {
    errors.leaveHomeHour = 'is invalid';
  }

  if (!leaveCragHour || !HOUR_REGEX.test(leaveCragHour)) {
    errors.leaveCragHour = 'is invalid';
  }

  return Object.keys(errors).length ? errors : null;
};

router.get('/', async (req, res) => {
  const {
    auth: { id: userId },
  } = req;

  try {
    const today = moment.utc().format('YYYY-MM-DD');

    const searches = await PartnerSearchModel.find({
      status: 'active',
      date: { $gte: today },
      userId: { $ne: userId },
    }).sort({ createdAt: -1 });

    return res.json({ searches: searches.map((s) => s.toJSON()) });
  } catch (e) {
    console.log('Error fetching partner searches', e);
    return res.sendStatus(500);
  }
});

router.get('/me', async (req, res) => {
  const {
    auth: { id: userId },
  } = req;

  try {
    const search = await PartnerSearchModel.findOne({
      userId,
      status: { $in: ['active', 'matched'] },
    });

    return res.json({ search: search ? search.toJSON() : null });
  } catch (e) {
    console.log('Error fetching own partner search', e);
    return res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  const {
    auth: { id: userId },
    body,
  } = req;

  const errors = validateSearchInput(body);

  if (errors) {
    return res.status(422).json({ errors });
  }

  try {
    const existing = await PartnerSearchModel.findOne({
      userId,
      status: { $in: ['active', 'matched'] },
    });

    if (existing) {
      return res.status(409).json({ error: 'search already exists' });
    }

    const search = new PartnerSearchModel({
      userId,
      cragIds: body.cragIds,
      date: body.date,
      leaveHomeHour: body.leaveHomeHour,
      leaveCragHour: body.leaveCragHour,
      rideRole: body.rideRole,
      leaveFromAddress: body.leaveFromAddress,
      status: 'active',
    });

    await search.save();
    return res.json({ search: search.toJSON() });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ error: 'search already exists' });
    }
    console.log('Error creating partner search', e);
    return res.sendStatus(500);
  }
});

router.put('/:id', async (req, res) => {
  const {
    auth: { id: userId },
    params: { id },
    body,
  } = req;

  if (!mongoose.isValidObjectId(id)) {
    return res.sendStatus(404);
  }

  const errors = validateSearchInput(body);
  if (errors) {
    return res.status(422).json({ errors });
  }

  try {
    const search = await PartnerSearchModel.findById(id);

    if (!search) {
      return res.sendStatus(404);
    }

    if (search.userId !== userId) {
      return res.sendStatus(403);
    }

    if (search.status === 'matched') {
      return res.status(409).json({ error: 'cannot edit a matched search' });
    }

    search.cragIds = body.cragIds;
    search.date = body.date;
    search.leaveHomeHour = body.leaveHomeHour;
    search.leaveCragHour = body.leaveCragHour;
    search.rideRole = body.rideRole;
    search.leaveFromAddress = body.leaveFromAddress;

    await search.save();
    return res.json({ search: search.toJSON() });
  } catch (e) {
    console.log('Error updating partner search', e);
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

  const session = await mongoose.startSession();

  try {
    const search = await PartnerSearchModel.findById(id);

    if (!search) {
      return res.sendStatus(404);
    }

    if (search.userId !== userId) {
      return res.sendStatus(403);
    }

    await session.withTransaction(async () => {
      await PartnerRequestModel.deleteMany({ searchId: id }, { session });
      await PartnerSearchModel.deleteOne({ _id: id }, { session });
    });

    return res.sendStatus(204);
  } catch (e) {
    console.log('Error deleting partner search', e);
    return res.sendStatus(500);
  } finally {
    session.endSession();
  }
});

export default router;
