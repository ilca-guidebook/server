import express from 'express';

import UserModel from '../models/User.js';

const router = express.Router();

router.get('/getById', async (req, res) => {
  const {
    body: { userId },
  } = req;

  const user = await UserModel.findById(userId);

  if (!user) {
    return res.sendStatus(404);
  }

  return res.json({ user: user.toJSONView() });
});

router.get('/getByIds', async (req, res) => {
  const {
    body: { ids },
  } = req;

  const users = await UserModel.find({
    _id: { $in: ids },
  });

  if (!users.length) {
    return res.sendStatus(404);
  }

  return res.json({ users: users.map((user) => user.toJSONView()) });
});

export default router;
