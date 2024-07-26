const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
});

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  aboutCompany: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  addresses: {
    type: [addressSchema],
    required: true,
    validate: [arrayLimit, "{PATH} exceeds the limit of 10"],
  },
  logoName: {
    type: String,
  },
});

function arrayLimit(val) {
  return val.length <= 10;
}

module.exports = mongoose.model("Company", companySchema);
