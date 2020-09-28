import express from 'express';

import UserModel from '../models/User';
import { sendAuthCodeEmail } from '../services/sendgrid';

const router = express.Router();

const CODE_LENGTH = 900000 - 1; // 6 DIGIT NUMBER BETWEEN 0 TO 900000
const ADD_TO_CODE = 100000;

router.post('/register', async (req, res, next) => {
    const { body: { email, firstName, lastName, phone } } = req;

    const existingUser = await UserModel.findOne({ 'email.address': email }).exec();
    if (existingUser) {
        return res.sendStatus(409);
    }

    if(!email) {
        return res.status(422).json({
            errors: { email: 'is required' },
        });
    }

    const user = new UserModel({
        email: { address: email },
        phone: { number: phone },
        name: { first: firstName, last: lastName },
    });
   
    const code = `${Math.floor(ADD_TO_CODE + Math.random() * CODE_LENGTH)}`;
    await sendAuthCodeEmail(email, code);
    
    if (process.env.ENVIRONMENT === 'dev') {
        console.log('code', code);
    }

    await user.setAuthCode(code);
    await user.save();

    return res.json({ user: user.toJSON() });
});

router.post('/login', async (req, res) => {
    const { body: { email } } = req;
  
    if(!email) {
        return res.status(422).json({
            errors: { email: 'is required' },
        });
    }

    const user = await UserModel.findOne({ 'email.address': email }).exec();
  
    if(user) {
        const code = `${Math.floor(ADD_TO_CODE + Math.random() * CODE_LENGTH)}`;
        await sendAuthCodeEmail(email, code);
        if (process.env.ENVIRONMENT === 'dev') {
            console.log('code', code);
        }

        await user.setAuthCode(code);
        await user.save();

        return res.json({ user: user.toJSON() });
    }

    return res.sendStatus(400);
});

router.get('/validateAuthCode', async (req, res) => {
    const { query: { email, code } } = req;

    const user = await UserModel.findOne({ 'email.address': email }).exec();
    const codeValidated = await user.validateAuthCode(code);

    if (!codeValidated) {
        return res.sendStatus(401);
    }

    res.append('token', user.generateJWT());
    return res.json({ user: user.toJSON() });
});

router.get('/me', async (req, res, next) => {
    const { user: { id } } = req;
    const user = await UserModel.findById(id);

    if (!user) {
        return res.sendStatus(400);
    }

    return res.json({ user: user.toJSON() });
});

export default router;
