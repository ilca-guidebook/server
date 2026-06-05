import { Expo } from 'expo-server-sdk';

import UserModel from '../models/User.js';
import NotificationTrackerModel, { type TNotificationType, ENotificationType } from '../models/NotificationTracker.ts';

const expo = new Expo({ useFcmV1: true });

const sendPush = async ({
  to,
  body,
  data,
}: {
  to?: string | null;
  body: string;
  data: { type: TNotificationType; requestId: string; searchId: string; userId: string };
}) => {
  if (!to || !Expo.isExpoPushToken(to)) {
    throw new Error(`No valid push tokens found`);
  }

  await expo.sendPushNotificationsAsync([{ to, sound: 'default', body, data }]);

  const notificationTracker = new NotificationTrackerModel({ userId: data.userId, type: data.type });
  await notificationTracker.save();
};

export const notifyRequestReceived = async ({
  userId,
  requestId,
  searchId,
}: {
  userId: string;
  requestId: string;
  searchId: string;
}) => {
  try {
    const user = await UserModel.findById(userId).select('pushToken').lean();

    await sendPush({
      to: user?.pushToken,
      body: "🧗 Someone's interested in your climb. Want to take a look?",
      data: {
        type: ENotificationType.REQUEST_RECEIVED,
        requestId: String(requestId),
        searchId: String(searchId),
        userId,
      },
    });
  } catch (err) {
    console.error('[notifications] notifyRequestReceived failed', err);
  }
};

export const notifyRequestAccepted = async ({
  userId,
  requestId,
  searchId,
}: {
  userId: string;
  requestId: string;
  searchId: string;
}) => {
  try {
    const user = await UserModel.findById(userId).select('pushToken').lean();

    await sendPush({
      to: user?.pushToken,
      body: "🤙 You're on! Your climbing partner accepted your request.",
      data: {
        type: ENotificationType.REQUEST_ACCEPTED,
        requestId: String(requestId),
        searchId: String(searchId),
        userId,
      },
    });
  } catch (err) {
    console.error('[notifications] notifyRequestAccepted failed', err);
  }
};

export const notifyRequestDeclined = async ({
  userId,
  requestId,
  searchId,
}: {
  userId: string;
  requestId: string;
  searchId: string;
}) => {
  try {
    const user = await UserModel.findById(userId).select('pushToken').lean();

    await sendPush({
      to: user?.pushToken,
      body: "Your request for this climb didn't work out this time - keep looking 🤙",
      data: {
        type: ENotificationType.REQUEST_DECLINED,
        requestId: String(requestId),
        searchId: String(searchId),
        userId,
      },
    });
  } catch (err) {
    console.error('[notifications] notifyRequestDeclined failed', err);
  }
};
