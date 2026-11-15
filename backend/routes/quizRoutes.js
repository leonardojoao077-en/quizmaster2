
const express = require('express');
const router = express.Router();

const {
    getAllQuizzes,
    getQuizQuestions,
    submitQuiz
} = require('../controllers/quizController');

router.get('/', getAllQuizzes);
router.get('/:id/questions', getQuizQuestions);
router.post('/:id/submit', submitQuiz);

module.exports = router;
