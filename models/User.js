// TODO: cleanup - db.users.updateMany({}, { $unset: { favorites: "", tickList: "" } })
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema(
  {
    name: {
      first: { type: String },
      last: { type: String },
    },
    avatar: {
      publicId: { type: String },
      crop: {
        x: { type: Number },
        y: { type: Number },
        width: { type: Number },
        height: { type: Number },
        zoom: { type: Number },
      },
    },
    emailAddress: { type: String },
    phoneNumber: { type: String },
    idNumber: { type: String },
    pushToken: { type: String },
    lastActiveAt: { type: Date },
  },
  { timestamps: true }
);

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
    avatar: this.avatar,
  };
};

UserSchema.methods.toJSONView = function () {
  return {
    id: this._id,
    name: this.name,
    avatar: this.avatar,
  };
};

export default mongoose.model('User', UserSchema);
