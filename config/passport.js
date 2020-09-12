import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as localStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';

const jwtSecret = process.env.JWT_SECRET;

const BCRYPT_SALT_ROUNDS = 12;

passport.use(
    'register',
    new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false,
    },
    async (username, password, done) => {
        try {
            const checkUser = await User.findOne({ username }).exec();
            if (checkUser) {
                console.log('username already taken');
                return done(null, false, { message: 'username already taken' });
            }

            const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
            const user = await new User({ username, password: hashedPassword }).save();

            console.log('User created');
            return done(null, user);
        } catch (e) {
            done(e);
        }
    }),
);

passport.use(
    'login',
    new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false,
    },
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username }).exec();
            if (!user) {
                console.log('bad username');
                return done(null, false, { message: 'bad username' });
            }

            const passwordCheck = await bcrypt.compare(password, user.password);
            if (!passwordCheck) {
                console.log('Passwords do not match');
                return done(null, false, { message: 'Passwords do not match' });
            }

            console.log('user authenticated');
            return done(null, user);
        } catch (e) {
            done(e);
        }
    }),
);

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JTW'),
    secretOrKey: jwtSecret,
}

passport.use(
    'jwt',
    new JWTStrategy(opts, async (jwtPayload, done) => {
        try {
            const user = await User.findOne({ username: jwtPayload.id }).exec();

            if (!user) {
                console.log('user not found in DB');
                done(null, false);
            } else {
                console.log('user found in DB');
                done(null, user);
            }
        } catch (e) {
            done(e);
        }
    }),
);
