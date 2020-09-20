import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { roles } from '../enums/Users';

const BCRYPT_SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema({
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
    role: { type: String, enum: roles },
});

UserSchema.methods.setPassword = async function(password) {
    this.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};
  
UserSchema.methods.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
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
  
UserSchema.methods.toAuthJSON = function() {
    return {
        _id: this._id,
        token: this.generateJWT(),
        name: this.name,
        email: this.email,
        phone: this.phone,
    };
};

export default mongoose.model('User', UserSchema);
