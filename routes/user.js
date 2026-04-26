import express from 'express';

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

  const testAccounts = JSON.parse(process.env.TEST_ACCOUNTS || '[]');
  const isTestAccount = testAccounts.includes(idNumber);

  if (!isTestAccount) {
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
    body: { firstName, lastName, avatar },
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

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    return res.json({ user: user.toJSON() });
  } catch (e) {
    console.log('Error updating user', e);
    return res.sendStatus(500);
  }
});

export default router;
