const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: false }
});

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  questions: [questionSchema]
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  projects: [projectSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
