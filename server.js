import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import ClimbingRoutes from './routes/ClimbingRoutes';
import Users from './routes/Users';
import Crags from './routes/Crags';
import Sectors from './routes/Sectors';

// Constants
const PORT = 3000;
const HOST = 'localhost';

// App
const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_CONNECTION || 'mongodb://localhost:27017/database', {
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
console.log(`Running on http://${HOST}:${PORT}`);
