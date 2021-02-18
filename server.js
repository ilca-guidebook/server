import express from 'express';
import mongoose from 'mongoose';

import auth from './middleware/express/auth';

import ClimbingRoutes from './routes/climbingRoutes';
import User from './routes/user';
import Crags from './routes/crags';
import Sectors from './routes/sectors';

// Constants
const PORT = process.env.PORT || 3000;

// App
const app = express();
app.use(express.json());

// JWT
app.use(auth.required.unless({
  path: [
    '/user/register',
    '/user/login',
    '/user/validateAuthCode',
  ],
}));

mongoose.connect(process.env.MONGO_CONNECTION, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// Debug Mongoose
// mongoose.set('debug', true);
mongoose.Promise = global.Promise; // Use native promises as mongoose promises

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/climbingroutes', ClimbingRoutes);
app.use('/user', User);
app.use('/crags', Crags);
app.use('/sectors', Sectors);

app.listen(PORT);
console.log(`Up and running`);
