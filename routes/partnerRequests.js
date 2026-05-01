import express from 'express';
import mongoose from 'mongoose';

import PartnerRequestModel from '../models/PartnerRequest.js';
import PartnerSearchModel from '../models/PartnerSearch.js';

const router = express.Router({ mergeParams: true });

router.post('/', async (req, res) => {
  const {
    auth: { id: userId },
    body: { searchId },
  } = req;

  if (!searchId) {
    return res.status(422).json({ errors: { searchId: 'is required' } });
  }

  if (!mongoose.isValidObjectId(searchId)) {
    return res.sendStatus(404);
  }

  try {
    const search = await PartnerSearchModel.findById(searchId);

    if (!search) {
      return res.sendStatus(404);
    }

    if (search.userId === userId) {
      return res.status(409).json({ error: 'cannot request own search' });
    }

    if (search.status === 'matched') {
      return res.status(409).json({ error: 'search is already matched' });
    }

    const existing = await PartnerRequestModel.findOne({
      searchId,
      requesterId: userId,
      status: 'pending',
    });

    if (existing) {
      return res.status(409).json({ error: 'pending request already exists' });
    }

    const request = new PartnerRequestModel({
      searchId,
      requesterId: userId,
      recipientId: search.userId,
      status: 'pending',
    });

    await request.save();
    return res.json({ request: request.toJSON() });
  } catch (e) {
    console.log('Error creating partner request', e);
    return res.sendStatus(500);
  }
});

router.get('/incoming', async (req, res) => {
  const {
    auth: { id: userId },
  } = req;

  try {
    const requests = await PartnerRequestModel.find({
      recipientId: userId,
      status: 'pending',
    }).sort({ createdAt: -1 });

    return res.json({ requests: requests.map((r) => r.toJSON()) });
  } catch (e) {
    console.log('Error fetching incoming partner requests', e);
    return res.sendStatus(500);
  }
});

router.get('/outgoing', async (req, res) => {
  const {
    auth: { id: userId },
  } = req;

  try {
    const requests = await PartnerRequestModel.find({ requesterId: userId }).sort({
      createdAt: -1,
    });

    return res.json({ requests: requests.map((r) => r.toJSON()) });
  } catch (e) {
    console.log('Error fetching outgoing partner requests', e);
    return res.sendStatus(500);
  }
});

router.put('/:id/accept', async (req, res) => {
  const {
    auth: { id: userId },
    params: { id },
  } = req;

  if (!mongoose.isValidObjectId(id)) {
    return res.sendStatus(404);
  }

  const session = await mongoose.startSession();

  try {
    const request = await PartnerRequestModel.findById(id);

    if (!request) {
      return res.sendStatus(404);
    }

    const search = await PartnerSearchModel.findById(request.searchId);

    if (!search) {
      return res.sendStatus(404);
    }

    if (search.userId !== userId) {
      return res.sendStatus(403);
    }

    await session.withTransaction(async () => {
      search.status = 'matched';
      search.matchedWithUserId = request.requesterId;
      await search.save({ session });

      request.status = 'accepted';
      await request.save({ session });

      await PartnerRequestModel.updateMany(
        { searchId: request.searchId, _id: { $ne: request._id }, status: 'pending' },
        { $set: { status: 'declined' } },
        { session }
      );
    });

    return res.json({ search: search.toJSON(), request: request.toJSON() });
  } catch (e) {
    console.log('Error accepting partner request', e);
    return res.sendStatus(500);
  } finally {
    session.endSession();
  }
});

router.put('/:id/decline', async (req, res) => {
  const {
    auth: { id: userId },
    params: { id },
  } = req;

  if (!mongoose.isValidObjectId(id)) {
    return res.sendStatus(404);
  }

  try {
    const request = await PartnerRequestModel.findById(id);

    if (!request) {
      return res.sendStatus(404);
    }

    const search = await PartnerSearchModel.findById(request.searchId);

    if (!search) {
      return res.sendStatus(404);
    }

    if (search.userId !== userId) {
      return res.sendStatus(403);
    }

    request.status = 'declined';
    await request.save();

    return res.json({ request: request.toJSON() });
  } catch (e) {
    console.log('Error declining partner request', e);
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
    const request = await PartnerRequestModel.findById(id);

    if (!request) {
      return res.sendStatus(404);
    }

    if (request.requesterId !== userId && request.recipientId !== userId) {
      return res.sendStatus(403);
    }

    await PartnerRequestModel.deleteOne({ _id: request._id });
    return res.sendStatus(204);
  } catch (e) {
    console.log('Error deleting partner request', e);
    return res.sendStatus(500);
  }
});

export default router;
