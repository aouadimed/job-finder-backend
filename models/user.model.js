const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    address: {
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
      enum: ["recruiter", "user"],
      default: "user",
    },
    expertise: {
      type: [Number],
      validate: {
        validator: function (value) {
          return value.every((val) => val >= 0 && val <= 6);
        },
        message:
          "Invalid expertise value. Valid values are integers between 0 and 6.",
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
      default: "",
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
  } catch (error) {
    return next(error);
  }

  next();
});

module.exports = mongoose.model("User", UserSchema);
