import { Expo } from 'expo-server-sdk';

import UserModel from '../models/User.js';

const expo = new Expo({ useFcmV1: true });

const sendPush = async ({ to, body, data }) => {
  if (!Expo.isExpoPushToken(to)) {
    throw new Error(`Push token ${to} is not valid`);
  }

  await expo.sendPushNotificationsAsync([{ to, sound: 'default', body, data }]);
};

export const notifyRequestReceived = async ({ recipientId, requestId, searchId }) => {
  try {
    const user = await UserModel.findById(recipientId).select('pushToken').lean();
    if (!user?.pushToken) return;
    await sendPush({
      to: user.pushToken,
      body: "🧗 Someone's interested in your climb. Want to take a look?",
      data: { type: 'request_received', requestId: String(requestId), searchId: String(searchId) },
    });
  } catch (err) {
    console.error('[notifications] notifyRequestReceived failed', err);
  }
};

export const notifyRequestAccepted = async ({ requesterId, requestId, searchId }) => {
  try {
    const user = await UserModel.findById(requesterId).select('pushToken').lean();

    if (user?.pushToken) {
      await sendPush({
        to: user.pushToken,
        body: "🤙 You're on! Your climbing partner accepted your request.",
        data: { type: 'request_accepted', requestId: String(requestId), searchId: String(searchId) },
      });
    }
  } catch (err) {
    console.error('[notifications] notifyRequestAccepted failed', err);
  }
};

export const notifyRequestDeclined = async ({ requesterId, requestId, searchId }) => {
  try {
    const user = await UserModel.findById(requesterId).select('pushToken').lean();
    if (!user?.pushToken) return;
    await sendPush({
      to: user.pushToken,
      body: "Your request for this climb didn't work out this time - keep looking 🤙",
      data: { type: 'request_declined', requestId: String(requestId), searchId: String(searchId) },
    });
  } catch (err) {
    console.error('[notifications] notifyRequestDeclined failed', err);
  }
};
