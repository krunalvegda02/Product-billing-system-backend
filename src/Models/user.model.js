import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import MESSAGE from '../Constants/message.js';

const userSchema = new mongoose.Schema(
  {
    Avatar: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      trim: true,
      index: true,
      minlength: [2 , MESSAGE.ENTER_VALID_USERNAME],
      maxlength: [100 , MESSAGE.ENTER_VALID_USERNAME],
    },
    contact: {
      type: String,
      required: true,
      unique: true,
      length:[10, [100 , MESSAGE.ENTER_VALID_CONTACT]]
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength:4,
      maxlength:10,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "WAITER", "CUSTOMER"],
      default: 'CUSTOMER',
    },
    dob: {
      type: Date,
      // required: true,
    },
    refreshToken: {
      type: String
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } else {
    next();
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function () {
  // console.log(process.env.ACCESS_TOKEN_SECRET, " process.env.ACCESS_TOKEN_SECRET");
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model('User', userSchema);
export default User;
