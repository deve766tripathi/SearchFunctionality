const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  type: String,
  anagramType: String,
  blocks: [{
    text: String,
    showInOption: Boolean,
    isAnswer: Boolean
  }],
  options: [{
    text: String,
    isCorrectAnswer: Boolean
  }],
  siblingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  solution: String,
  title: String
}, {
  
  strict: false
});

module.exports = mongoose.model('Question', questionSchema);