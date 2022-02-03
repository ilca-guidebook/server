import express from 'express';

import UserModel from '../models/User';
import { isUserPartOfILCA } from '../apis/loglig';
import { encryptIdNumber } from '../utils/encryption';

const router = express.Router();

router.post('/login', async (req, res) => {
    const {
        body: { idNumber, dateOfBirth },
    } = req;

    if (!idNumber || !dateOfBirth) {
        return res.status(422).json({
            errors: { idNumber: 'is required' },
        });
    }

    const isIlcaMember = await isUserPartOfILCA(idNumber, dateOfBirth);
    if (!isIlcaMember) {
        return res.sendStatus(400);
    }

    try {
        const encryptedIdNumber = encryptIdNumber(idNumber);
        const user = await UserModel.findOne({ 'idNumber': encryptedIdNumber }).exec();

        if (user) {
            return res.json({ user: user.toJSON(), token: user.generateJWT() });
        }

        const newUser = new UserModel({ idNumber: encryptedIdNumber });
        await newUser.save();
        return res.json({ user: newUser.toJSON(), token: newUser.generateJWT() });
    } catch (e) {
        console.log('nitzanDev e', e);

        return res.sendStatus(500);
    }
});

router.get('/', async (req, res) => {
    const { user: { id } } = req;

    const user = await UserModel.findById(id);

    if (!user) {
        return res.sendStatus(400);
    }

    return res.json({ user: user.toJSON() });
});

export default router;
