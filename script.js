// Variáveis globais
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let isAnswered = false;
let timer = null;
let timeLeft = 20;
let hintUsed = false;
let totalHintsUsed = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;

// Dicas para cada questão
const hints = [
    "Lembre-se: com he/she/it, o verbo no present simple ganha -s",
    "Para 'they', use a forma base do verbo no present simple",
    "Para he/she/it negativo, use 'doesn't' + verbo base",
    "Right now indica present continuous (be + -ing)",
    "At the moment sempre pede present continuous",
    "Now indica ação acontecendo agora = present continuous",
    "I think + will para predições futuras",
    "Will + verbo base para futuro simples",
    "Will + verbo base para futuro",
    "What pergunta sobre coisas/objetos",
    "Where pergunta sobre lugares",
    "Why pergunta sobre razões/motivos",
    "Para he/she/it em perguntas, use 'Does'",
    "Are + -ing para perguntas no present continuous",
    "Yesterday indica passado, use 'Did'",
    "Todas as três (let, var, const) declaram variáveis",
    "=== é igualdade estrita (valor e tipo)",
    "Todos os listados são tipos de dados do JavaScript",
    "console.log() mostra mensagens no console do navegador",
    "// é usado para comentários de uma linha"
];

// Carregar questões do arquivo JSON
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        quizData = await response.json();
        return true;
    } catch (error) {
        console.error('Erro ao carregar questões:', error);
        return false;
    }
}

// Iniciar o quiz
async function startQuiz() {
    const loaded = await loadQuestions();
    if (!loaded) {
        alert('Erro ao carregar as questões. Por favor, recarregue a página.');
        return;
    }
    
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    initQuiz();
}

// Inicializar quiz
function initQuiz() {
    shuffleArray(quizData);
    document.getElementById('totalQuestions').textContent = quizData.length;
    updateStats();
    displayQuestion();
    startTimer();
}

// Embaralhar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Iniciar timer
function startTimer() {
    timeLeft = 20;
    hintUsed = false;
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft === 10 && !hintUsed && !isAnswered) {
            showHintModal();
        } else if (timeLeft === 0 && !isAnswered) {
            timeUp();
        }
    }, 1000);
}

// Atualizar display do timer
function updateTimerDisplay() {
    const timerCircle = document.getElementById('timerCircle');
    const timeLeftElement = document.getElementById('timeLeft');
    
    timeLeftElement.textContent = timeLeft;
    
    if (timeLeft <= 5) {
        timerCircle.className = 'timer-circle danger';
    } else if (timeLeft <= 10) {
        timerCircle.className = 'timer-circle warning';
    } else {
        timerCircle.className = 'timer-circle';
    }
    
    const percentage = (timeLeft / 20) * 360;
    const color = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#667eea';
    timerCircle.style.background = `conic-gradient(${color} ${percentage}deg, #e0e7ff ${percentage}deg)`;
}

// Mostrar modal de dica
function showHintModal() {
    const modal = document.getElementById('hintModal');
    const hintText = document.getElementById('hintText');
    
    hintText.textContent = hints[currentQuestionIndex] || "Analise as opções com cuidado!";
    modal.classList.add('show');
}

// Usar dica
function useHint() {
    const modal = document.getElementById('hintModal');
    modal.classList.remove('show');
    
    hintUsed = true;
    totalHintsUsed++;
    timeLeft += 10;
    updateStats();
    updateTimerDisplay();
}

// Exibir questão
function displayQuestion() {
    const question = quizData[currentQuestionIndex];
    
    document.getElementById('category').textContent = question.category;
    document.getElementById('question').textContent = question.question;
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    
    const progress = ((currentQuestionIndex) / quizData.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.onclick = () => selectAnswer(option.letter, optionDiv);
        
        const letterDiv = document.createElement('div');
        letterDiv.className = 'option-letter';
        letterDiv.textContent = option.letter;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'option-text';
        textDiv.textContent = option.text;
        
        optionDiv.appendChild(letterDiv);
        optionDiv.appendChild(textDiv);
        optionsContainer.appendChild(optionDiv);
    });
    
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('feedback').style.display = 'none';
    selectedAnswer = null;
    isAnswered = false;
    
    clearInterval(timer);
    startTimer();
}

// Selecionar resposta
function selectAnswer(answerLetter, optionElement) {
    if (isAnswered) return;
    
    clearInterval(timer);
    
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    optionElement.classList.add('selected');
    selectedAnswer = answerLetter;
    document.getElementById('nextBtn').disabled = false;
}

// Próxima questão
function nextQuestion() {
    if (selectedAnswer === null && !isAnswered) return;
    
    if (!isAnswered) {
        const question = quizData[currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;
        
        if (isCorrect) {
            score++;
            correctAnswers++;
        } else {
            incorrectAnswers++;
        }
        
        showFeedback(isCorrect, question);
        isAnswered = true;
        updateStats();
        
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.add('disabled');
        });
    }
    
    const nextBtn = document.getElementById('nextBtn');
    if (currentQuestionIndex < quizData.length - 1) {
        nextBtn.textContent = 'Próxima';
        nextBtn.onclick = () => {
            currentQuestionIndex++;
            displayQuestion();
            nextBtn.textContent = 'Próxima';
            nextBtn.onclick = nextQuestion;
        };
    } else {
        nextBtn.textContent = 'Ver Resultado';
        nextBtn.onclick = showResults;
    }
}

// Mostrar feedback
function showFeedback(isCorrect, question, timeExpired = false) {
    const feedback = document.getElementById('feedback');
    const options = document.querySelectorAll('.option');
    
    options.forEach(option => {
        const letter = option.querySelector('.option-letter').textContent;
        if (letter === question.correctAnswer) {
            option.classList.add('correct');
        }
        if (letter === selectedAnswer && !isCorrect) {
            option.classList.add('incorrect');
        }
    });
    
    feedback.style.display = 'block';
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    
    const selectedExplanation = selectedAnswer ? 
        question.options.find(opt => opt.letter === selectedAnswer)?.explanation || '' : '';
    const correctExplanation = question.options.find(opt => opt.letter === question.correctAnswer)?.explanation || '';
    
    if (timeExpired) {
        feedback.innerHTML = `
            <strong>⏰ Tempo esgotado!</strong>
            <div class="explanation">
                <div class="explanation-title">Resposta correta (${question.correctAnswer}):</div>
                ${correctExplanation}
            </div>
        `;
    } else if (isCorrect) {
        let bonusText = '';
        if (hintUsed) {
            bonusText = '<br><small>💡 Dica utilizada</small>';
        } else if (timeLeft > 15) {
            bonusText = '<br><small>⚡ Resposta rápida!</small>';
        }
        
        feedback.innerHTML = `
            <strong>✅ Correto! Parabéns!</strong>${bonusText}
            <div class="explanation">
                <div class="explanation-title">Explicação:</div>
                ${correctExplanation}
            </div>
        `;
    } else {
        feedback.innerHTML = `
            <strong>❌ Resposta incorreta</strong>
            <div class="explanation">
                <div class="explanation-title">Sua resposta (${selectedAnswer}):</div>
                ${selectedExplanation}
                <br><br>
                <div class="explanation-title">Resposta correta (${question.correctAnswer}):</div>
                ${correctExplanation}
            </div>
        `;
    }
}

// Tempo esgotado
function timeUp() {
    if (!isAnswered) {
        clearInterval(timer);
        incorrectAnswers++;
        isAnswered = true;
        
        const question = quizData[currentQuestionIndex];
        const options = document.querySelectorAll('.option');
        
        options.forEach(option => {
            const letter = option.querySelector('.option-letter').textContent;
            if (letter === question.correctAnswer) {
                option.classList.add('correct');
            }
            option.classList.add('disabled');
        });
        
        showFeedback(false, question, true);
        updateStats();
        
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.disabled = false;
        if (currentQuestionIndex < quizData.length - 1) {
            nextBtn.textContent = 'Próxima';
            nextBtn.onclick = () => {
                currentQuestionIndex++;
                displayQuestion();
                nextBtn.textContent = 'Próxima';
                nextBtn.onclick = nextQuestion;
            };
        } else {
            nextBtn.textContent = 'Ver Resultado';
            nextBtn.onclick = showResults;
        }
    }
}

// Atualizar estatísticas
function updateStats() {
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('incorrectCount').textContent = incorrectAnswers;
    document.getElementById('hintsUsed').textContent = totalHintsUsed;
}

// Mostrar resultados
function showResults() {
    clearInterval(timer);
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    const percentage = Math.round((score / quizData.length) * 100);
    document.getElementById('finalScore').textContent = `${score}/${quizData.length}`;
    
    let performance;
    if (percentage >= 90) {
        performance = "🏆 Excelente! Você domina o assunto!";
    } else if (percentage >= 70) {
        performance = "👏 Muito bom! Continue praticando!";
    } else if (percentage >= 50) {
        performance = "👍 Bom trabalho! Há espaço para melhorar.";
    } else {
        performance = "💪 Continue estudando! Você vai conseguir!";
    }
    
    if (totalHintsUsed > 0) {
        performance += ` Dicas utilizadas: ${totalHintsUsed}`;
    }
    
    document.getElementById('performance').textContent = performance;
    document.getElementById('progressBar').style.width = '100%';
}

// Reiniciar quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    isAnswered = false;
    totalHintsUsed = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    
    clearInterval(timer);
    
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('quizContent').style.display = 'block';
    document.getElementById('results').style.display = 'none';
}

// Inicialização
window.onload = function() {
    document.getElementById('hintModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });
};