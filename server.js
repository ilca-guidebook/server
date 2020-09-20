import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';

import './config/passport';

import ClimbingRoutes from './routes/ClimbingRoutes';
import User from './routes/User';
import Crags from './routes/Crags';
import Sectors from './routes/Sectors';

// Constants
const PORT = process.env.PORT || 3000;

// App
const app = express();
app.use(express.json());
app.use(passport.initialize());

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
