import mongoose from 'mongoose';

import { roles } from '../enums/Users';

const UserSchema = new mongoose.Schema({
    name: {
        first: { type: String },
        last: { type: String },
    },
    username: { type: String },
    password: { type: String },
    email: { type: String },
    role: { type: String, enum: roles }
});

export default mongoose.model('User', UserSchema);
