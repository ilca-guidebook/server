// TODO: Make some order in routes
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import imageToBase64 from 'image-to-base64';

import auth from './middleware/express/auth';
import User from './routes/user';
import Contentful from './routes/contentful';
import { hasNewerVersion } from './utils/versionControl';

// Constants
const PORT = process.env.PORT || 3000;

// App
const app = express();
app.use(express.json());

app.use(cors());

// JWT
app.use(
  auth.required.unless({
    path: ['/', '/user/login', '/crags/recursive', '/needUpdate'],
  })
);

mongoose.connect(process.env.MONGO_CONNECTION, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Debug Mongoose
// mongoose.set('debug', true);
mongoose.Promise = global.Promise; // Use native promises as mongoose promises

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/user', User);
app.use('/content', Contentful);

app.get('/needUpdate', (req, res) => {
  const {
    query: { clientVersion },
  } = req;

  const needUpdate = hasNewerVersion(clientVersion);

  const result = { needUpdate };

  if (needUpdate) {
    result.updateUrl = '';
  }

  return res.json(result);
});

// Client can't do this at the moment, so moving logic to server.
app.get('/convertImage', async (req, res) => {
  const {
    query: { imageUrl },
  } = req;

  try {
    const base64Image = await imageToBase64(decodeURIComponent(imageUrl));

    res.json(base64Image);
  } catch (error) {
    console.log('error in base64 image', error);
    res.sendStatus(500);
  }
});

app.listen(PORT);
console.log('Up and running');
