const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const totalQuestions = await Question.countDocuments();
    const questions = await Question.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json({
      questions,
      total: totalQuestions,
      currentPage: page,
      totalPages: Math.ceil(totalQuestions / pageSize)
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching questions', 
      error: error.message 
    });
  }
};

exports.searchQuestions = async (req, res) => {
  try {
    const { query } = req.query;
    const questions = await Question.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { 'options.text': { $regex: query, $options: 'i' } }
      ]
    }).limit(50);

    res.json(questions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error searching questions', 
      error: error.message 
    });
  }
};