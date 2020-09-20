import passport from 'passport';
import LocalStrategy from 'passport-local';

import UserModel from '../models/User';

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, async (email, password, done) => {
    try {
        const user = await UserModel.findOne({ 'email.address': email }).exec();
        const passwordValidated = await user.validatePassword(password);

        if(!user || !passwordValidated) {
            return done(null, false, { errors: { 'email or password': 'is invalid' } });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));
