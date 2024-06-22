import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  name: {
    first: { type: String },
    last: { type: String },
  },
  emailAddress: { type: String },
  phoneNumber: { type: String },
  idNumber: { type: String },
  pushToken: { type: String },
});

UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      idNumber: this.idNumber,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    },
    process.env.JWT_SECRET
  );
};

UserSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    emailAddress: this.emailAddress,
    phoneNumber: this.phoneNumber,
  };
};

export default mongoose.model('User', UserSchema);
