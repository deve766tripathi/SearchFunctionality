const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const type = req.query.type;

    const filter = type ? { type } : {};

    const totalQuestions = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json({
      questions,
      total: totalQuestions,
      page,
      pageSize
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching questions', 
      error: error.message 
    });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const searchConditions = {
      $and: [
        type ? { type } : {},
        query ? {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { solution: { $regex: query, $options: 'i' } },
            { 'options.text': { $regex: query, $options: 'i' } },
            { 'blocks.text': { $regex: query, $options: 'i' } }
          ]
        } : {}
      ]
    };

    const totalQuestions = await Question.countDocuments(searchConditions);
    const questions = await Question.find(searchConditions)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json({
      questions,
      total: totalQuestions,
      page,
      pageSize,
      query
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error searching questions', 
      error: error.message 
    });
  }
});

module.exports = router;