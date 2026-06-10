import moment from 'moment';

import PartnerSearchModel from '../models/PartnerSearch';
import PartnerRequestModel from '../models/PartnerRequest';
import { notifyRequestDeclined } from './notifications';
import mongoose from 'mongoose';

export const filterActiveRequests = async (requests) => {
  const searchIds = requests.map((r) => r.searchId);

  const today = moment.utc().format('YYYY-MM-DD');

  const activeSearches = await PartnerSearchModel.find({ _id: { $in: searchIds }, date: { $gte: today } }, '_id');
  const activeSearchIdSet = new Set(activeSearches.map((s) => s._id.toString()));
  const filtered = requests.filter((r) => activeSearchIdSet.has(r.searchId));

  return filtered.map((r) => r.toJSON());
};

export const declinePendingRequestsOfSearch = async (
  searchId: string,
  currentRequestId: string,
  session: mongoose.mongo.ClientSession
) => {
  const requestsToSearchToDecline = await PartnerRequestModel.find(
    { searchId, _id: { $ne: currentRequestId }, status: 'pending' },
    { requesterId: 1 },
    { session }
  );
  await PartnerRequestModel.updateMany(
    { _id: { $in: requestsToSearchToDecline.map((r) => r._id) } },
    { $set: { status: 'declined' } },
    { session }
  );

  // Notify declined requests
  await Promise.all(
    requestsToSearchToDecline.map(({ requesterId, _id }) =>
      notifyRequestDeclined({
        userId: requesterId,
        requestId: _id.toString(),
        searchId,
      })
    )
  );
};

/**
 * Deletes all pending requests of the recipient for the given date.
 */
export const deleteRecpientPendingRequestsOfDate = async (recipientId, date, session) => {
  await PartnerRequestModel.deleteMany(
    {
      requesterId: recipientId,
      status: 'pending',
      date,
    },
    { session }
  );
};
