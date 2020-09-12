import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import ClimbingRoutes from './routes/ClimbingRoutes';
import Users from './routes/Users';
import Crags from './routes/Crags';
import Sectors from './routes/Sectors';

// Constants
const PORT = 3000;

// App
dotenv.config();
const app = express();
app.use(express.json());

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
app.use('/users', Users);
app.use('/crags', Crags);
app.use('/sectors', Sectors);

app.listen(PORT);
console.log(`Up and running`);
