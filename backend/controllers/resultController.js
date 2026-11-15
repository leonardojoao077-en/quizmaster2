
const db = require('../config/database');

const getAllResults = (req, res) => {
    try {
        const results = db.prepare(`
            SELECT
                r.id,
                r.quiz_id,
                q.title AS quiz_title,
                r.score,
                r.total_questions,
                ROUND(
                    (CAST(r.score AS REAL) /
                    r.total_questions) * 100
                ) AS percentage,
                r.time_taken,
                r.completed_at
            FROM results r
            INNER JOIN quizzes q ON q.id = r.quiz_id
            ORDER BY r.completed_at DESC
        `).all();

        res.status(200).json({
            success: true,
            total: results.length,
            data: results
        });

    } catch (error) {
        console.error('Erro ao carregar resultados:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao carregar o histórico.'
        });
    }
};

module.exports = {
    getAllResults
};
