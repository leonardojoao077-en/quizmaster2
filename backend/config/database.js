
const Database = require('better-sqlite3');
const path = require('path');

// Caminho da base de dados
const dbPath = path.join(__dirname, '../database/quizmaster.db');

// Criar conexão
const db = new Database(dbPath);

// Ativar chaves estrangeiras
db.pragma('foreign_keys = ON');

// Ativar modo WAL
db.pragma('journal_mode = WAL');

// Criar tabelas
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        difficulty TEXT CHECK (
            difficulty IN ('easy', 'medium', 'hard')
        ),
        duration INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,

        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        option_text TEXT NOT NULL,
        is_correct INTEGER NOT NULL DEFAULT 0
            CHECK (is_correct IN (0, 1)),

        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        quiz_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        time_taken INTEGER,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_questions_quiz
    ON questions(quiz_id);

    CREATE INDEX IF NOT EXISTS idx_options_question
    ON options(question_id);

    CREATE INDEX IF NOT EXISTS idx_results_user
    ON results(user_id);
`);

console.log('SQLite conectado e tabelas verificadas!');

module.exports = db;
