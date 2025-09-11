document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const welcomeScreen = document.getElementById('welcome-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const usernameInput = document.getElementById('username-input');
    const startButton = document.getElementById('start-button');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextButton = document.getElementById('next-button');
    const finalMessage = document.getElementById('final-message');
    const scoreDisplay = document.getElementById('score-display');
    const timeDisplay = document.getElementById('time-display');
    const restartButton = document.getElementById('restart-button');

    // Variáveis de estado
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let startTime;
    let username;

    // Função para carregar as perguntas do JSON
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            questions = await response.json();
        } catch (error) {
            console.error('Erro ao carregar as perguntas:', error);
        }
    }

    // Função para iniciar o quizz
    function startQuiz() {
        username = usernameInput.value.trim();
        if (!username) {
            alert('Por favor, digite seu nome para começar.');
            return;
        }

        localStorage.setItem('username', username);
        startTime = new Date();
        welcomeScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        currentQuestionIndex = 0;
        score = 0;
        showQuestion();
    }

    // Função para exibir a pergunta atual
    function showQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        questionText.textContent = currentQuestion.question;
        optionsContainer.innerHTML = ''; // Limpa as opções anteriores
        nextButton.classList.add('hidden');

        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option-button');
            button.addEventListener('click', () => selectOption(index, currentQuestion.answerIndex));
            optionsContainer.appendChild(button);
        });
    }

    // Função para tratar a seleção de uma opção
    function selectOption(selectedIndex, correctIndex) {
        const options = optionsContainer.querySelectorAll('.option-button');
        options.forEach(button => {
            button.disabled = true; // Desabilita os botões após a escolha
        });

        if (selectedIndex === correctIndex) {
            options[selectedIndex].classList.add('correct');
            score++;
        } else {
            options[selectedIndex].classList.add('wrong');
            options[correctIndex].classList.add('correct');
        }
        nextButton.classList.remove('hidden');
    }

    // Função para passar para a próxima pergunta ou finalizar o quizz
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            endQuiz();
        }
    }

    // Função para finalizar o quizz e mostrar os resultados
    function endQuiz() {
        const endTime = new Date();
        const totalTime = Math.floor((endTime - startTime) / 1000); // Tempo em segundos

        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        finalMessage.textContent = `${username}, você completou o Quizz!`;
        scoreDisplay.textContent = `${score} de ${questions.length}`;
        timeDisplay.textContent = `${totalTime} segundos`;

        // Salvar os dados do jogo no localStorage
        localStorage.setItem('lastScore', score);
        localStorage.setItem('totalTime', totalTime);
    }

    // Função para reiniciar o quizz
    function restartQuiz() {
        resultScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
        usernameInput.value = ''; // Limpa o campo de nome
    }

    // Event Listeners
    startButton.addEventListener('click', startQuiz);
    nextButton.addEventListener('click', nextQuestion);
    restartButton.addEventListener('click', restartQuiz);

    // Carregar as perguntas quando a página for carregada
    loadQuestions();
});