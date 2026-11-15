
const API_URL = 'http://localhost:3000/api';

const quizList = document.getElementById('quiz-list');
const quizCount = document.getElementById('quiz-count');

async function loadQuizzes() {
    try {
        const response = await fetch(`${API_URL}/quizzes`);

        if (!response.ok) {
            throw new Error('Não foi possível carregar os quizzes.');
        }

        const result = await response.json();

        quizCount.textContent = `${result.total} quizzes`;

        if (result.data.length === 0) {
            quizList.innerHTML = '<p>Não existem quizzes disponíveis.</p>';
            return;
        }

        quizList.innerHTML = result.data.map(quiz => `
            <article class="quiz-card">
                <p class="quiz-category">${quiz.category || 'Geral'}</p>

                <h3>${quiz.title}</h3>

                <p class="quiz-description">
                    ${quiz.description || 'Sem descrição disponível.'}
                </p>

                <div class="quiz-info">
                    <span>${quiz.total_questions} perguntas</span>
                    <span>${quiz.duration} minutos</span>
                </div>

                <div class="quiz-info">
                    <span class="difficulty">
                        ${formatDifficulty(quiz.difficulty)}
                    </span>
                </div>

                <a href="quiz.html?id=${quiz.id}" class="quiz-button">
                    Começar quiz
                </a>
            </article>
        `).join('');

    } catch (error) {
        quizList.innerHTML = `
            <p class="error-message">
                ${error.message}
                Verifique se o servidor está ligado.
            </p>
        `;

        quizCount.textContent = 'Erro ao carregar';
    }
}

function formatDifficulty(difficulty) {
    const levels = {
        easy: 'Fácil',
        medium: 'Médio',
        hard: 'Difícil'
    };

    return levels[difficulty] || 'Não definida';
}

loadQuizzes();
