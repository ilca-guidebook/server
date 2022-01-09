import express from 'express';

import UserModel from '../models/User';
import { isUserPartOfILCA } from '../apis/loglig';
import { encryptIdNumber } from '../utils/encryption';

const router = express.Router();

// router.post('/register', async (req, res) => {
//     const {
//         body: { email, firstName, lastName, phone },
//     } = req;

//     const existingUser = await UserModel.findOne({
//         'email.address': email,
//     }).exec();
//     if (existingUser) {
//         return res.sendStatus(409);
//     }

//     if (!email) {
//         return res.status(422).json({
//             errors: { email: 'is required' },
//         });
//     }

//     const user = new UserModel({
//         email: { address: email },
//         phone: { number: phone },
//         name: { first: firstName, last: lastName },
//     });

//     await user.save();

//     return res.json({ user: user.toJSON() });
// });

/**
 * -router.get('/validateAuthCode', async (req, res) => {
-    const {
-        query: { email, code },
-    } = req;
-
-    const user = await UserModel.findOne({ 'email.address': email }).exec();
-    const codeValidated = await user.validateAuthCode(code);
-
-    if (!codeValidated) {
-        return res.sendStatus(401);
-    }
-
-    res.append('token', user.generateJWT());
-    return res.json({ user: user.toJSON() });
-});
 */

router.post('/login', async (req, res) => {
    const {
        body: { idNumber },
    } = req;

    if (!idNumber) {
        return res.status(422).json({
            errors: { idNumber: 'is required' },
        });
    }

    if (!isUserPartOfILCA()) {
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
