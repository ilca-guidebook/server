import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import auth from './middleware/express/auth';
import User from './routes/user';
import Contentful from './routes/contentful';

// Constants
const PORT = process.env.PORT || 3000;

// App
const app = express();
app.use(express.json());

app.use(cors());

// JWT
app.use(
    auth.required.unless({
        path: [
            '/',
            '/user/login',
            '/crags/recursive',
        ],
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

app.listen(PORT);
console.log('Up and running');
