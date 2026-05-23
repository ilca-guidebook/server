import express from 'express';
import mongoose from 'mongoose';
import moment from 'moment';

import PartnerRequestModel from '../models/PartnerRequest.js';
import PartnerSearchModel, { TPartnerSearchStatus } from '../models/PartnerSearch.js';
import { notifyRequestAccepted, notifyRequestDeclined, notifyRequestReceived } from '../utils/notifications.js';

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

    await notifyRequestReceived({
      recipientId: request.recipientId,
      requestId: request._id,
      searchId: request.searchId,
    });

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
    const today = moment.utc().format('YYYY-MM-DD');

    const requests = await PartnerRequestModel.find({
      recipientId: userId,
      status: 'pending',
    }).sort({ createdAt: -1 });

    const searchIds = requests.map((r) => r.searchId);
    const activeSearches = await PartnerSearchModel.find({ _id: { $in: searchIds }, date: { $gte: today } }, '_id');
    const activeSearchIdSet = new Set(activeSearches.map((s) => s._id.toString()));
    const filtered = requests.filter((r) => activeSearchIdSet.has(r.searchId));

    return res.json({ requests: filtered.map((r) => r.toJSON()) });
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
    const today = moment.utc().format('YYYY-MM-DD');

    const requests = await PartnerRequestModel.find({
      requesterId: userId,
    }).sort({ createdAt: -1 });

    const searchIds = requests.map((r) => r.searchId);
    const activeSearches = await PartnerSearchModel.find({ _id: { $in: searchIds }, date: { $gte: today } }, '_id');
    const activeSearchIdSet = new Set(activeSearches.map((s) => s._id.toString()));
    const filtered = requests.filter((r) => activeSearchIdSet.has(r.searchId));

    return res.json({ requests: filtered.map((r) => r.toJSON()) });
  } catch (e) {
    console.log('Error fetching outgoing partner requests', e);
    return res.sendStatus(500);
  }
});

/**
 * Accepts a request on a search.
 * User A posted a search, and user B sent a request.
 * User A accepts the request.
 * All other pending requests for the same search are declined.
 * User A's pending requests for other searches are deleted as well.
 */
router.put('/:id/accept', async (req, res) => {
  const {
    auth: { id: recipientId },
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

    const { requesterId, searchId, _id: requestId } = request;

    const search = await PartnerSearchModel.findById(searchId);

    if (!search) {
      return res.sendStatus(404);
    }

    if (search.userId !== recipientId) {
      return res.sendStatus(403);
    }

    await session.withTransaction(async () => {
      search.status = 'matched';
      search.matchedWithUserId = requesterId;
      await search.save({ session });

      request.status = 'accepted';
      await request.save({ session });

      // Decline all other pending requests for the same search.
      await PartnerRequestModel.updateMany(
        { searchId, _id: { $ne: request._id }, status: 'pending' },
        { $set: { status: 'declined' } },
        { session }
      );

      // Delete all other pending requests for the requester (in case they also sent requests)
      await PartnerRequestModel.deleteMany({ requesterId, _id: { $ne: request._id }, status: 'pending' }, { session });

      // Delete active search on the same date for the requester (in case they also posted a search for the same date)
      await PartnerSearchModel.deleteOne(
        { userId: requesterId, status: TPartnerSearchStatus.ACTIVE, date: search.date },
        { session }
      );

      // Delete all other pending requests for the recipient (if they sent any)
      await PartnerRequestModel.deleteMany(
        { recipientId: requesterId, _id: { $ne: request._id }, status: 'pending' },
        { session }
      );
    });

    await notifyRequestAccepted({
      requesterId,
      requestId,
      searchId,
    });

    // TODO: Notify declined requests as well.

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
    auth: { id: searcherId },
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

    if (search.userId !== searcherId) {
      return res.sendStatus(403);
    }

    request.status = 'declined';
    await request.save();

    await notifyRequestDeclined({
      requesterId: request.requesterId,
      requestId: request._id,
      searchId: request.searchId,
    });

    return res.json({ request: request.toJSON() });
  } catch (e) {
    console.log('Error declining partner request', e);
    return res.sendStatus(500);
  }
});

router.delete('/:id', async (req, res) => {
  const {
    auth: { id: currentUserId },
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

    if (request.requesterId !== currentUserId && request.recipientId !== currentUserId) {
      return res.sendStatus(403);
    }

    const search = await PartnerSearchModel.findById(request.searchId);

    await session.withTransaction(async () => {
      search.status = 'active';
      search.matchedWithUserId = null;
      await search.save({ session });

      await PartnerRequestModel.deleteOne({ _id: request._id });
    });

    return res.sendStatus(204);
  } catch (e) {
    console.log('Error deleting partner request', e);
    return res.sendStatus(500);
  } finally {
    session.endSession();
  }
});

export default router;
