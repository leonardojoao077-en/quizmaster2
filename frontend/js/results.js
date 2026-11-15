
const resultData = sessionStorage.getItem('quizResult');

const quizTitle = document.getElementById('quiz-title');
const scoreElement = document.getElementById('score');
const percentageElement = document.getElementById('percentage');
const resultMessage = document.getElementById('result-message');

const correctAnswers = document.getElementById('correct-answers');
const incorrectAnswers = document.getElementById('incorrect-answers');
const timeTaken = document.getElementById('time-taken');

// Verificar se existem resultados
if (!resultData) {
    window.location.href = 'index.html';
} else {
    const result = JSON.parse(resultData);

    const score = result.score;
    const total = result.total_questions;
    const percentage = Math.round((score / total) * 100);

    quizTitle.textContent = 'Resultado do teu quiz';

    scoreElement.textContent = `${score}/${total}`;
    percentageElement.textContent = `${percentage}%`;

    correctAnswers.textContent = score;
    incorrectAnswers.textContent = total - score;

    // Converter segundos para minutos e segundos
    
    const totalSeconds = Number(result.time_taken) || 0;

const minutes = Math.floor(totalSeconds / 60);
const seconds = totalSeconds % 60;

timeTaken.textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    // Mensagem conforme a pontuação
    if (percentage >= 80) {
        resultMessage.textContent = 'Excelente trabalho! Continua assim!';
    } else if (percentage >= 50) {
        resultMessage.textContent = 'Bom esforço! Podes melhorar ainda mais.';
    } else {
        resultMessage.textContent = 'Não desistas! Continua a praticar.';
    }
}
