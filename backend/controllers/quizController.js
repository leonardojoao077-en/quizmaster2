
const db = require('../config/database');

const getAllQuizzes = (req, res) => {
    try {
        const quizzes = db.prepare(`
            SELECT
                q.id,
                q.title,
                q.description,
                q.category,
                q.difficulty,
                q.duration,
                COUNT(DISTINCT qu.id) AS total_questions
            FROM quizzes q
            LEFT JOIN questions qu ON qu.quiz_id = q.id
            GROUP BY q.id
            ORDER BY q.created_at DESC
        `).all();

        res.status(200).json({
            success: true,
            total: quizzes.length,
            data: quizzes
        });

    } catch (error) {
        console.error('Erro ao carregar quizzes:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao carregar os quizzes.'
        });
    }
};


const getQuizQuestions = (req, res) => {
    try {
        const quizId = Number(req.params.id);

        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID do quiz inválido.'
            });
        }

        const quiz = db.prepare(`
            SELECT id, title, duration
            FROM quizzes
            WHERE id = ?
        `).get(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz não encontrado.'
            });
        }

        const questions = db.prepare(`
            SELECT
                q.id,
                q.question_text,
                o.id AS option_id,
                o.option_text
            FROM questions q
            INNER JOIN options o ON o.question_id = q.id
            WHERE q.quiz_id = ?
            ORDER BY q.id, o.id
        `).all(quizId);

        const formattedQuestions = [];

        for (const row of questions) {
            let question = formattedQuestions.find(
                item => item.id === row.id
            );

            if (!question) {
                question = {
                    id: row.id,
                    question_text: row.question_text,
                    options: []
                };

                formattedQuestions.push(question);
            }

            question.options.push({
                id: row.option_id,
                option_text: row.option_text
            });
        }

        res.status(200).json({
            success: true,
            quiz,
            total_questions: formattedQuestions.length,
            data: formattedQuestions
        });

    } catch (error) {
        console.error('Erro ao carregar perguntas:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao carregar as perguntas.'
        });
    }
};


const submitQuiz = (req, res) => {
    try {
        const quizId = Number(req.params.id);
        const { answers, time_taken } = req.body;

        // Validar o ID do quiz
        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID do quiz inválido.'
            });
        }

        // Validar as respostas recebidas
        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Deve submeter pelo menos uma resposta.'
            });
        }

        // Verificar se o quiz existe
        const quiz = db.prepare(`
            SELECT id FROM quizzes WHERE id = ?
        `).get(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz não encontrado.'
            });
        }

        // Buscar as perguntas e respostas correctas
        const correctAnswers = db.prepare(`
            SELECT
                q.id AS question_id,
                o.id AS correct_option_id
            FROM questions q
            INNER JOIN options o ON o.question_id = q.id
            WHERE q.quiz_id = ?
            AND o.is_correct = 1
        `).all(quizId);

        // Verificar se todas as perguntas foram respondidas
        if (answers.length !== correctAnswers.length) {
            return res.status(400).json({
                success: false,
                message: 'Deve responder a todas as perguntas.'
            });
        }

        const answerMap = new Map();

        for (const answer of answers) {
            if (
                !Number.isInteger(answer.question_id) ||
                !Number.isInteger(answer.option_id) ||
                answerMap.has(answer.question_id)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato das respostas inválido.'
                });
            }

            answerMap.set(answer.question_id, answer.option_id);
        }

        // Calcular a pontuação
        let score = 0;

        for (const correct of correctAnswers) {
            const selectedOption = answerMap.get(correct.question_id);

            const optionBelongsToQuestion = db.prepare(`
                SELECT id
                FROM options
                WHERE id = ? AND question_id = ?
            `).get(selectedOption, correct.question_id);

            if (!optionBelongsToQuestion) {
                return res.status(400).json({
                    success: false,
                    message: 'Uma ou mais opções são inválidas.'
                });
            }

            if (selectedOption === correct.correct_option_id) {
                score++;
            }
        }

        const totalQuestions = correctAnswers.length;
        const percentage = Math.round(
            (score / totalQuestions) * 100
        );

        // Guardar o resultado
        const result = db.prepare(`
            INSERT INTO results (
                quiz_id,
                score,
                total_questions,
                time_taken
            )
            VALUES (?, ?, ?, ?)
        `).run(
            quizId,
            score,
            totalQuestions,
            Number.isInteger(time_taken) && time_taken >= 0
                ? time_taken
                : null
        );

        res.status(201).json({
            success: true,
            message: 'Quiz submetido com sucesso!',
            result: {
                id: Number(result.lastInsertRowid),
                score,
                total_questions: totalQuestions,
                percentage
            }
        });

    } catch (error) {
        console.error('Erro ao submeter quiz:', error);

        res.status(500).json({
            success: false,
            message: 'Erro ao corrigir o quiz.'
        });
    }
};


module.exports = {
    getAllQuizzes,
    getQuizQuestions,
    submitQuiz
};