import express from 'express';
import isNumber from 'lodash/isNumber.js';

import UserModel from '../models/User.js';
import { isUserPartOfILCA } from '../apis/loglig/index.js';
import { encryptIdNumber } from '../utils/encryption.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const {
    body: { idNumber, dateOfBirth, pushToken },
  } = req;

  if (!idNumber || !dateOfBirth) {
    return res.status(422).json({
      errors: { idNumber: 'is required' },
    });
  }

  const isGooglePlayDemo =
    idNumber === process.env.GOOGLE_PLAY_DEMO_USER && dateOfBirth === process.env.GOOGLE_PLAY_DEMO_BIRTH;

  if (!isGooglePlayDemo) {
    const isIlcaMember = await isUserPartOfILCA(idNumber, dateOfBirth);
    if (!isIlcaMember) {
      return res.sendStatus(400);
    }
  }

  try {
    const encryptedIdNumber = encryptIdNumber(idNumber);
    const user = await UserModel.findOne({ idNumber: encryptedIdNumber }).exec();

    if (user) {
      // Update pushToken on login
      user.pushToken = pushToken;
      await user.save();

      return res.json({ user: user.toJSON(), token: user.generateJWT() });
    }

    const newUser = new UserModel({ idNumber: encryptedIdNumber, pushToken });
    await newUser.save();
    return res.json({ user: newUser.toJSON(), token: newUser.generateJWT() });
  } catch (e) {
    console.log('nitzanDev e', e);

    return res.sendStatus(500);
  }
});

router.get('/', async (req, res) => {
  const {
    auth: { id },
    query: { pushToken },
  } = req;

  const user = await UserModel.findById(id);

  if (!user) {
    return res.sendStatus(400);
  }

  if (pushToken) {
    user.pushToken = pushToken;
  }

  user.lastActiveAt = new Date();
  await user.save();

  return res.json({ user: user.toJSON() });
});

router.put('/', async (req, res) => {
  const {
    auth: { id },
    body: { firstName, lastName, avatarUrl },
  } = req;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.sendStatus(400);
    }

    if (firstName) {
      user.name.first = firstName;
    }

    if (lastName) {
      user.name.last = lastName;
    }

    if (avatarUrl) {
      user.avatarUrl = avatarUrl;
    }

    await user.save();

    return res.json({ user: user.toJSON() });
  } catch (e) {
    console.log('Error updating user', e);
    return res.sendStatus(500);
  }
});

router.get('/favorites', async (req, res) => {
  const {
    auth: { id },
  } = req;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.sendStatus(400);
    }

    return res.json({ favorites: user.favorites || [] });
  } catch (e) {
    console.log('Error fetching favorites', e);
    return res.sendStatus(500);
  }
});

router.post('/favorites', async (req, res) => {
  const {
    auth: { id },
    body: { routeId },
  } = req;

  if (!routeId) {
    return res.status(422).json({
      errors: { routeId: 'is required' },
    });
  }

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.sendStatus(400);
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    if (!user.favorites.includes(routeId)) {
      user.favorites.push(routeId);
      await user.save();
    }

    return res.json({ favorites: user.favorites });
  } catch (e) {
    console.log('Error adding favorite', e);
    return res.sendStatus(500);
  }
});

router.delete('/favorites', async (req, res) => {
  const {
    auth: { id },
    body: { routeId },
  } = req;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.sendStatus(400);
    }

    if (user.favorites) {
      user.favorites = user.favorites.filter((fav) => fav !== routeId);
      await user.save();
    }

    return res.json({ favorites: user.favorites || [] });
  } catch (e) {
    console.log('Error removing favorite', e);
    return res.sendStatus(500);
  }
});

router.get('/tickList', async (req, res) => {
  const {
    auth: { id },
  } = req;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.sendStatus(400);
    }

    return res.json({ tickList: user.tickList || [] });
  } catch (e) {
    console.log('Error fetching tickList', e);
    return res.sendStatus(500);
  }
});

router.post('/tickList', async (req, res) => {
  const {
    auth: { id },
    body: { routeId, numOfAttempts, lastAttemptAt },
  } = req;

  if (!routeId) {
    return res.status(422).json({
      errors: { routeId: 'is required' },
    });
  }

  if (!isNumber(numOfAttempts)) {
    return res.status(422).json({
      errors: { numOfAttempts: 'is required' },
    });
  }

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.sendStatus(400);
    }

    if (!user.tickList) {
      user.tickList = [];
    }

    // Check if route already exists in tickList
    const existingIndex = user.tickList.findIndex((item) => item.routeId === routeId);

    if (existingIndex !== -1) {
      // Update existing entry - replace numOfAttempts
      user.tickList[existingIndex].numOfAttempts = numOfAttempts;
    } else {
      // Add new entry
      user.tickList.push({
        routeId,
        numOfAttempts,
        lastAttemptAt: lastAttemptAt || new Date(),
      });
    }

    await user.save();
    return res.json({ tickList: user.tickList });
  } catch (e) {
    console.log('Error adding/updating tickList item', e);
    return res.sendStatus(500);
  }
});

router.put('/tickList', async (req, res) => {
  const {
    auth: { id },
    body: { routeId, numOfAttempts, lastAttemptAt },
  } = req;

  if (!isNumber(numOfAttempts)) {
    return res.status(422).json({
      errors: { numOfAttempts: 'is required' },
    });
  }

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.sendStatus(400);
    }

    if (!user.tickList) {
      return res.status(404).json({
        errors: { routeId: 'not found in tickList' },
      });
    }

    const existingIndex = user.tickList.findIndex((item) => item.routeId === routeId);

    if (existingIndex === -1) {
      return res.status(404).json({
        errors: { routeId: 'not found in tickList' },
      });
    }

    user.tickList[existingIndex].numOfAttempts = numOfAttempts;
    user.tickList[existingIndex].lastAttemptAt = lastAttemptAt || new Date();
    await user.save();

    return res.json({ tickList: user.tickList });
  } catch (e) {
    console.log('Error updating tickList item', e);
    return res.sendStatus(500);
  }
});

router.delete('/tickList/:routeId', async (req, res) => {
  const {
    auth: { id },
    params: { routeId },
  } = req;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.sendStatus(400);
    }

    if (user.tickList) {
      user.tickList = user.tickList.filter((item) => item.routeId !== routeId);
      await user.save();
    }

    return res.json({ tickList: user.tickList || [] });
  } catch (e) {
    console.log('Error removing tickList item', e);
    return res.sendStatus(500);
  }
});

export default router;
