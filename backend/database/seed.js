
const fs = require('fs');
const path = require('path');

const db = require('../config/database');

// Caminho do ficheiro JSON
const filePath = path.join(__dirname, 'quizzes.json');

// Ler os dados do ficheiro
const quizzes = JSON.parse(
    fs.readFileSync(filePath, 'utf8')
);

// Preparar comandos SQL
const findQuiz = db.prepare(`
    SELECT id FROM quizzes WHERE title = ?
`);

const insertQuiz = db.prepare(`
    INSERT INTO quizzes
    (title, description, category, difficulty, duration)
    VALUES (?, ?, ?, ?, ?)
`);

const insertQuestion = db.prepare(`
    INSERT INTO questions (quiz_id, question_text)
    VALUES (?, ?)
`);

const insertOption = db.prepare(`
    INSERT INTO options
    (question_id, option_text, is_correct)
    VALUES (?, ?, ?)
`);

// Inserir os quizzes numa transação
const seedDatabase = db.transaction(() => {

    let insertedCount = 0;
    let skippedCount = 0;

    for (const quiz of quizzes) {

        // Evitar inserir quizzes com títulos repetidos
        if (findQuiz.get(quiz.title)) {
            console.log(`Quiz "${quiz.title}" já existe. Ignorado.`);
            skippedCount++;
            continue;
        }

        // Validar os dados básicos
        if (
            !quiz.title ||
            !quiz.description ||
            !quiz.category ||
            !['easy', 'medium', 'hard'].includes(quiz.difficulty) ||
            !Number.isInteger(quiz.duration) ||
            !Array.isArray(quiz.questions) ||
            quiz.questions.length === 0
        ) {
            throw new Error(`Dados inválidos no quiz: ${quiz.title || 'Sem título'}`);
        }

        const quizId = insertQuiz.run(
            quiz.title,
            quiz.description,
            quiz.category,
            quiz.difficulty,
            quiz.duration
        ).lastInsertRowid;

        for (const question of quiz.questions) {

            if (
                !question.text ||
                !Array.isArray(question.options) ||
                question.options.length < 2 ||
                question.options.filter(option => option.is_correct === true).length !== 1
            ) {
                throw new Error(
                    `Pergunta inválida no quiz "${quiz.title}": ${question.text || 'Sem texto'}`
                );
            }

            const questionId = insertQuestion.run(
                quizId,
                question.text
            ).lastInsertRowid;

            for (const option of question.options) {

                if (!option.text || typeof option.is_correct !== 'boolean') {
                    throw new Error(
                        `Opção inválida na pergunta: ${question.text}`
                    );
                }

                insertOption.run(
                    questionId,
                    option.text,
                    option.is_correct ? 1 : 0
                );
            }
        }

        console.log(`Quiz "${quiz.title}" inserido com sucesso!`);
        insertedCount++;
    }

    console.log('\n----- Resultado -----');
    console.log(`Quizzes inseridos: ${insertedCount}`);
    console.log(`Quizzes ignorados: ${skippedCount}`);
});

try {
    seedDatabase();
} catch (error) {
    console.error('Erro ao inserir quizzes:', error.message);
    process.exitCode = 1;
} finally {
    db.close();
}
