import { expressjwt } from 'express-jwt';

const getTokenFromHeaders = (req) => {
  const {
    headers: { authorization },
  } = req;

  if (authorization && authorization.split(' ')[0] === 'Bearer') {
    return authorization.split(' ')[1];
  }

  return null;
};

const auth = {
  required: expressjwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'user',
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
};

export default auth;
