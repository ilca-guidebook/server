import mongoose from 'mongoose';

import { roles } from '../enums/Users';

const UserSchema = new mongoose.Schema({
    username: { type: String },
    password: { type: String },
    name: {
        first: { type: String },
        last: { type: String },
    },
    email: {
        isVerified: { type: Boolean },
        address: { type: String },
    },
    phone: {
        isVerified: { type: Boolean },
        number: { type: String },
    },
    role: { type: String, enum: roles }
});

export default mongoose.model('User', UserSchema);
