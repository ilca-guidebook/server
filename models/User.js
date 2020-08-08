import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        first: { type: String },
        last: { type: String },
    },
    email: { type: String },
});

export default mongoose.model('User', UserSchema);
