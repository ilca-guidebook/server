import jwt from 'express-jwt';

const getTokenFromHeaders = (req) => {
    const { headers: { authorization } } = req;

    if (authorization && authorization.split(' ')[0] === 'Token') {
        return authorization.split(' ')[1];
    }

    return null;
};

const auth = {
    required: jwt({
        secret: process.env.JWT_SECRET,
        userProperty: 'user',
        getToken: getTokenFromHeaders,
        algorithms: ['HS256'],
    }),
    optional: jwt({
        secret: process.env.JWT_SECRET,
        userProperty: 'user',
        getToken: getTokenFromHeaders,
        credentialsRequired: false,
        algorithms: ['HS256'],
    }),
};

export default auth;
