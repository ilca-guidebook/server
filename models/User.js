import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { roles } from '../enums/Users';

const BCRYPT_SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: Object.values(roles),
        default: roles.CLIMBER,
    },
    authCode: { type: String },
});

UserSchema.methods.setAuthCode = async function(code) {
    this.authCode = await bcrypt.hash(code, BCRYPT_SALT_ROUNDS);
};
  
UserSchema.methods.validateAuthCode = async function(code) {
    return await bcrypt.compare(code, this.authCode);
};
  
UserSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        email: this.email.address,
        id: this._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, process.env.JWT_SECRET);
};

UserSchema.methods.toJSON = function() {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
    };
};

export default mongoose.model('User', UserSchema);
