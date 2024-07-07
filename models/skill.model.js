const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SkillSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skill: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Skill = mongoose.model('Skill', SkillSchema);

module.exports = Skill;
