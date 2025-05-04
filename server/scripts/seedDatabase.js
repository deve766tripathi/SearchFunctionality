const mongoose = require('mongoose');
const Question = require('../models/Question');
const questionsData = require('../../questions.json');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function transformQuestionData(questions) {
  return questions.map(question => {
    const transformedQuestion = { ...question };
    
    if (transformedQuestion._id && transformedQuestion._id.$oid) {
      transformedQuestion._id = transformedQuestion._id.$oid;
    }

    if (transformedQuestion.siblingId && transformedQuestion.siblingId.$oid) {
      transformedQuestion.siblingId = transformedQuestion.siblingId.$oid;
    }

    return transformedQuestion;
  });
}

async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in the environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB Connected for Seeding');

    const transformedQuestions = transformQuestionData(questionsData);

    await Question.deleteMany({});

    const insertedQuestions = await Question.insertMany(transformedQuestions);
    
    console.log(`Seeded ${insertedQuestions.length} questions successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Database Seeding Error:', error);
    console.error('Detailed Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();