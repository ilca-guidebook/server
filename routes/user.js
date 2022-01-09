import express from 'express';

import UserModel from '../models/User';
import { isUserPartOfILCA } from '../apis/loglig';

const router = express.Router();

router.post('/login', async (req, res) => {
    const {
        body: { idNumber, password },
    } = req;

    if (!idNumber || !password) {
        return res.status(422).json({
            errors: { idNumber: 'is required' },
        });
    }

    if (!isUserPartOfILCA(idNumber, password)) {
        return res.sendStatus(400);
    }

    try {
        const user = await UserModel.findOne({ 'idNumber': idNumber }).exec();

        if (user) {
            return res.json({ user: user.toJSON(), token: user.generateJWT() });
        }

        const newUser = new UserModel({ idNumber });
        await newUser.save();
        return res.json({ user: newUser.toJSON(), token: newUser.generateJWT() });
    } catch (e) {
        console.log('nitzanDev e', e);

        return res.sendStatus(500);
    }
});

router.get('/me', async (req, res, next) => {
    const {
        user: { id },
    } = req;
    const user = await UserModel.findById(id);

    if (!user) {
        return res.sendStatus(400);
    }

    return res.json({ user: user.toJSON() });
});

export default router;
