const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    expertise: {
      type: [Number],
      validate: {
        validator: function(value) {
          return value.every(val => val >= 0 && val <= 6);
        },
        message: 'Invalid expertise value. Valid values are integers between 0 and 6.',
      },
      default: [],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profileImg: {
      type: String,
      default: "https://firebasestorage.googleapis.com/v0/b/jobfinder-ada04.appspot.com/o/jobhub%2F1c7c0380-1abb-11ee-88ab-7122405954e9.jpg?alt=media&token=4c3f5eb9-5f72-4434-b86d-f4dae9e0fea2",
    },
    active: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpired: Date,
    passwordResetVerified: Boolean,
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
  } catch (error) {
    return next(error);
  }

  next();
});

module.exports = mongoose.model('User', UserSchema);
