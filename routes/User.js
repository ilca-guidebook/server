import express from 'express';
import passport from 'passport';

import UserModel from '../models/User';

const router = express.Router();

router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if (err) {
            console.log('error on [POST] user/register', err);
        }

        if (info) {
            console.log(info.message);
            return res.send(info.message);
        }

        req.logIn(user, async (err) => {
            const { firstName, lastName, email, phone } = req.body;

            const userData = {
                name: { first: firstName, last: lastName },
                email: { isVerified: false, address: email },
                phone: { isVerified: false, number: phone },
            }
            const dbUser = await UserModel.findOneAndUpdate({ username: user.username }, userData, { new: true });

            return res.json({ user: dbUser });
        });
    })(req, res, next);
});

router.get('/login', async (req, res) => {
    const { data } = req.body;
    const user = await new UserModel({ ...data }).save();

    return res.json({ user });
});

export default router;
