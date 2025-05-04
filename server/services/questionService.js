const Question = require('../models/Question');

async function getQuestions(call, callback) {
  const { page = 1, pageSize = 10 } = call.request;
  
  try {
    const totalQuestions = await Question.countDocuments();
    const questions = await Question.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    
    callback(null, { 
      questions, 
      total: totalQuestions 
    });
  } catch (error) {
    callback(error);
  }
}

module.exports = { getQuestions };