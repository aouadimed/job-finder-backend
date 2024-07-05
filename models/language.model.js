const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LanguageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  language: {
    type: Number,
    required: true,
  },
  proficiencyIndex: {
    type: Number,
  },
}, { timestamps: true });

const Language = mongoose.model('Language', LanguageSchema);

module.exports = Language;
