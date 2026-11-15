
const API_URL = 'http://localhost:3000/api';

const historyList = document.getElementById('history-list');
const totalAttempts = document.getElementById('total-attempts');
const averageScore = document.getElementById('average-score');
const historyMessage = document.getElementById('history-message');

async function loadHistory() {
    try {
        const response = await fetch(`${API_URL}/results`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Erro ao carregar histórico.');
        }

        const results = result.data;

        totalAttempts.textContent = results.length;

        if (results.length === 0) {
            historyList.innerHTML = `
                <tr>
                    <td colspan="5">
                        Ainda não existem tentativas registadas.
                    </td>
                </tr>
            `;

            averageScore.textContent = '0%';
            return;
        }

        // Calcular a média de aproveitamento
        const totalPercentage = results.reduce((sum, item) => {
            return sum + Number(item.percentage);
        }, 0);

        const average = Math.round(totalPercentage / results.length);

        averageScore.textContent = `${average}%`;

        // Apresentar resultados na tabela
        historyList.innerHTML = results.map(item => {
            const totalSeconds = Number(item.time_taken) || 0;

            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            const formattedTime =
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            const date = new Date(item.completed_at);

            const formattedDate = date.toLocaleString('pt-PT');

            return `
                <tr>
                    <td>${item.quiz_title}</td>
                    <td>${item.score}/${item.total_questions}</td>
                    <td>${item.percentage}%</td>
                    <td>${formattedTime}</td>
                    <td>${formattedDate}</td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Erro:', error);

        historyList.innerHTML = `
            <tr>
                <td colspan="5">Não foi possível carregar o histórico.</td>
            </tr>
        `;

        historyMessage.textContent =
            `${error.message} Verifique se o servidor está ligado.`;
    }
}

loadHistory();
