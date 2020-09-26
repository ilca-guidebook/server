import express from 'express';
import passport from 'passport';

import UserModel from '../models/User';

const router = express.Router();

router.post('/register', async (req, res, next) => {
    const { body: { email, password, firstName, lastName, phone } } = req;

    const existingUser = await UserModel.findOne({ 'email.address': email }).exec();
    if (existingUser) {
        return res.sendStatus(409);
    }

    if(!email) {
        return res.status(422).json({
            errors: { email: 'is required' },
        });
    }

    if(!password) {
        return res.status(422).json({
            errors: { password: 'is required' },
        });
    }

    const finalUser = new UserModel({
        email: { address: email },
        phone: { number: phone },
        password,
        name: { first: firstName, last: lastName },
    });

    await finalUser.setPassword(password);
    await finalUser.save();

    return res.json({ user: finalUser.toAuthJSON() });
});

router.post('/login', (req, res, next) => {
    const { body: { email, password } } = req;
  
    if(!email) {
        return res.status(422).json({
            errors: { email: 'is required' },
        });
    }
  
    if(!password) {
      return res.status(422).json({
            errors: { password: 'is required' },
      });
    }
  
    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if(err) {
            return next(err);
        }
  
        if(passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();
    
            return res.json({ user: user.toAuthJSON() });
        }
  
        return res.sendStatus(400);
    })(req, res, next);
});

router.get('/current', async (req, res, next) => {
    const { user: { id } } = req;
    const user = await UserModel.findById(id);

    if (!user) {
        return res.sendStatus(400);
    }

    return res.json({ user: user.toAuthJSON() });
});

export default router;
