
const quizRoutes = require('./routes/quizRoutes');
const express = require('express');
const resultRoutes = require('./routes/resultRoutes');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );

    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// Servir os ficheiros do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);

// Rota de teste da API
app.get('/api/health', (req, res) => {
    try {
        db.prepare('SELECT 1').get();

        res.status(200).json({
            success: true,
            message: 'QuizMaster API está a funcionar!',
            database: 'connected',
            status: 'online'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro na conexão com a base de dados.',
            database: 'disconnected'
        });
    }
});

// Rota não encontrada
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota da API não encontrada.'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`QuizMaster a funcionar em http://localhost:${PORT}`);
});
