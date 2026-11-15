
const API_URL = 'http://localhost:3000/api';

// Obter o ID do quiz através do URL
const params = new URLSearchParams(window.location.search);
const quizId = params.get('id');

// Elementos HTML
const quizTitle = document.getElementById('quiz-title');
const questionProgress = document.getElementById('question-progress');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const progress = document.getElementById('progress');

const previousBtn = document.getElementById('previous-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');

const timerElement = document.getElementById('timer');
const errorMessage = document.getElementById('error-message');

let initialTime = 0;

// Estado do quiz
let questions = [];
let currentQuestionIndex = 0;
let answers = {};

let timeRemaining = 0;
let timerInterval = null;

// Carregar perguntas
async function loadQuiz() {
    try {
        if (!quizId || !Number.isInteger(Number(quizId)) || Number(quizId) <= 0) {
            throw new Error('ID do quiz inválido.');
        }

        const response = await fetch(
            `${API_URL}/quizzes/${quizId}/questions`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Erro ao carregar quiz.');
        }

        questions = result.data;

        quizTitle.textContent = result.quiz.title;

        if (questions.length === 0) {
            throw new Error('Este quiz ainda não possui perguntas.');
        }

        timeRemaining = result.quiz.duration * 60;
        initialTime = timeRemaining;

        displayQuestion();

        startTimer();

    } catch (error) {
        errorMessage.textContent = error.message;
        questionText.textContent = 'Não foi possível carregar o quiz.';
    }
}

// Mostrar pergunta actual
function displayQuestion() {
    const question = questions[currentQuestionIndex];

    questionText.textContent = question.question_text;

    questionProgress.textContent =
        `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;

    // Actualizar barra de progresso
    const percentage =
        ((currentQuestionIndex + 1) / questions.length) * 100;

    progress.style.width = `${percentage}%`;

    // Mostrar opções
    optionsList.innerHTML = '';

    question.options.forEach(option => {

        const label = document.createElement('label');

        label.className = 'option-item';

        const input = document.createElement('input');

        input.type = 'radio';
        input.name = 'answer';
        input.value = option.id;

        // Verificar se já existe uma resposta seleccionada
        if (answers[question.id] === option.id) {
            input.checked = true;
            label.classList.add('selected');
        }

        input.addEventListener('change', () => {
            answers[question.id] = option.id;

            document.querySelectorAll('.option-item').forEach(item => {
                item.classList.remove('selected');
            });

            label.classList.add('selected');
        });

        const text = document.createElement('span');

        text.textContent = option.option_text;

        label.appendChild(input);
        label.appendChild(text);

        optionsList.appendChild(label);
    });

    // Controlar botões
    previousBtn.disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.hidden = true;
        submitBtn.hidden = false;
    } else {
        nextBtn.hidden = false;
        submitBtn.hidden = true;
    }
}

// Pergunta seguinte
nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
});

// Pergunta anterior
previousBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
});

// Temporizador
function startTimer() {
    updateTimer();

    timerInterval = setInterval(() => {
        timeRemaining--;

        updateTimer();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }

    }, 1000);
}

// Actualizar apresentação do tempo
function updateTimer() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Submeter respostas
async function submitQuiz() {
    clearInterval(timerInterval);

    const unanswered = questions.filter(question => {
        return !answers[question.id];
    });

    if (unanswered.length > 0 && timeRemaining > 0) {
        errorMessage.textContent =
            `Ainda tens ${unanswered.length} pergunta(s) sem resposta.`;

        return;
    }

    try {
        submitBtn.disabled = true;
        nextBtn.disabled = true;
        previousBtn.disabled = true;

        errorMessage.textContent = 'A corrigir as respostas...';

        const formattedAnswers = questions.map(question => ({
            question_id: question.id,
            option_id: answers[question.id]
        }));

        const response = await fetch(
            `${API_URL}/quizzes/${quizId}/submit`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    answers: formattedAnswers,
                    time_taken: (initialTime - timeRemaining) +
                        (Number(document.getElementById('timer').textContent.split(':')[0]) * 60) +
                        Number(document.getElementById('timer').textContent.split(':')[1])
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Erro ao submeter quiz.');
        }

        sessionStorage.setItem(
            'quizResult',
            JSON.stringify(result.result)
        );

        window.location.href = 'results.html';

    } catch (error) {
        errorMessage.textContent = error.message;

        submitBtn.disabled = false;
        nextBtn.disabled = false;
        previousBtn.disabled = false;
    }
}

// Evento do botão submeter
submitBtn.addEventListener('click', submitQuiz);

// Iniciar aplicação
loadQuiz();
