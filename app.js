// Irregular verbs database
const irregularVerbs = [
    { base: "be", past: "was/were", meaning: "ser/estar" },
    { base: "begin", past: "began", meaning: "comenzar" },
    { base: "break", past: "broke", meaning: "romper" },
    { base: "bring", past: "brought", meaning: "traer" },
    { base: "buy", past: "bought", meaning: "comprar" },
    { base: "catch", past: "caught", meaning: "atrapar" },
    { base: "choose", past: "chose", meaning: "elegir" },
    { base: "come", past: "came", meaning: "venir" },
    { base: "do", past: "did", meaning: "hacer" },
    { base: "drink", past: "drank", meaning: "beber" },
    { base: "drive", past: "drove", meaning: "conducir" },
    { base: "eat", past: "ate", meaning: "comer" },
    { base: "fall", past: "fell", meaning: "caer" },
    { base: "feel", past: "felt", meaning: "sentir" },
    { base: "find", past: "found", meaning: "encontrar" },
    { base: "fly", past: "flew", meaning: "volar" },
    { base: "forget", past: "forgot", meaning: "olvidar" },
    { base: "get", past: "got", meaning: "obtener" },
    { base: "give", past: "gave", meaning: "dar" },
    { base: "go", past: "went", meaning: "ir" },
    { base: "have", past: "had", meaning: "tener" },
    { base: "hear", past: "heard", meaning: "oír" },
    { base: "know", past: "knew", meaning: "saber" },
    { base: "leave", past: "left", meaning: "dejar/salir" },
    { base: "lose", past: "lost", meaning: "perder" },
    { base: "make", past: "made", meaning: "hacer" },
    { base: "meet", past: "met", meaning: "encontrar" },
    { base: "pay", past: "paid", meaning: "pagar" },
    { base: "read", past: "read", meaning: "leer" },
    { base: "run", past: "ran", meaning: "correr" },
    { base: "say", past: "said", meaning: "decir" },
    { base: "see", past: "saw", meaning: "ver" },
    { base: "sell", past: "sold", meaning: "vender" },
    { base: "send", past: "sent", meaning: "enviar" },
    { base: "sing", past: "sang", meaning: "cantar" },
    { base: "sit", past: "sat", meaning: "sentarse" },
    { base: "sleep", past: "slept", meaning: "dormir" },
    { base: "speak", past: "spoke", meaning: "hablar" },
    { base: "spend", past: "spent", meaning: "gastar" },
    { base: "stand", past: "stood", meaning: "estar de pie" },
    { base: "swim", past: "swam", meaning: "nadar" },
    { base: "take", past: "took", meaning: "tomar" },
    { base: "teach", past: "taught", meaning: "enseñar" },
    { base: "tell", past: "told", meaning: "contar" },
    { base: "think", past: "thought", meaning: "pensar" },
    { base: "understand", past: "understood", meaning: "entender" },
    { base: "wear", past: "wore", meaning: "llevar/usar" },
    { base: "win", past: "won", meaning: "ganar" },
    { base: "write", past: "wrote", meaning: "escribir" }
];

// Star levels
const starLevels = ['outline', 'yellow', 'pink', 'blue', 'purple', 'gold'];

// State management
let currentExercise = null;
let currentVerb = null;
let currentScore = 0;
let selectedAnswer = null;
let wordProgress = {};

// Initialize app
function init() {
    loadProgress();
    updateHomeSummary();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {
            console.log('Service worker registration failed');
        });
    }
}

// Progress management
function loadProgress() {
    const saved = localStorage.getItem('lingostar_progress');
    if (saved) {
        wordProgress = JSON.parse(saved);
    } else {
        // Initialize progress
        irregularVerbs.forEach(verb => {
            wordProgress[verb.base] = {
                stars: 0,
                attempts: 0,
                mistakes: 0
            };
        });
        saveProgress();
    }
}

function saveProgress() {
    localStorage.setItem('lingostar_progress', JSON.stringify(wordProgress));
    updateHomeSummary();
}

function updateHomeSummary() {
    let totalStars = 0;
    let wordsMastered = 0;
    
    Object.values(wordProgress).forEach(progress => {
        totalStars += progress.stars;
        if (progress.stars === 5) {
            wordsMastered++;
        }
    });
    
    document.getElementById('total-stars').textContent = totalStars;
    document.getElementById('words-mastered').textContent = wordsMastered;
}

// Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goHome() {
    showScreen('home-screen');
    currentScore = 0;
}

function showExercise(type) {
    currentExercise = type;
    currentScore = 0;
    showScreen('exercise-screen');
    nextQuestion();
}

function showProgress() {
    showScreen('progress-screen');
    displayProgressList();
}

function displayProgressList() {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    
    irregularVerbs.forEach(verb => {
        const progress = wordProgress[verb.base];
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        
        const stars = getStarDisplay(progress.stars);
        
        wordItem.innerHTML = `
            <div class="word-name">${verb.base}</div>
            <div class="word-forms">${verb.past}</div>
            <div class="word-stars">${stars}</div>
        `;
        
        wordList.appendChild(wordItem);
    });
}

function getStarDisplay(level) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < level) {
            const starClass = starLevels[level];
            stars += `<span class="star-icon ${starClass}">⭐</span>`;
        } else {
            stars += `<span class="star-icon outline">☆</span>`;
        }
    }
    return stars;
}

// Exercise logic
function nextQuestion() {
    // Select random verb
    currentVerb = irregularVerbs[Math.floor(Math.random() * irregularVerbs.length)];
    selectedAnswer = null;
    
    // Update display
    document.getElementById('current-verb').textContent = currentVerb.base;
    document.getElementById('current-score').textContent = currentScore;
    
    // Update star display
    const progress = wordProgress[currentVerb.base];
    const starDisplay = document.getElementById('star-display');
    starDisplay.innerHTML = getStarDisplay(progress.stars);
    
    // Clear feedback
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('show', 'correct', 'incorrect');
    
    // Show check button, hide next button
    document.getElementById('check-btn').style.display = 'block';
    document.getElementById('next-btn').style.display = 'none';
    
    // Generate question based on exercise type
    switch(currentExercise) {
        case 'multiple-choice':
            generateMultipleChoice();
            break;
        case 'input':
            generateInputQuestion();
            break;
        case 'translation':
            generateTranslationQuestion();
            break;
        case 'gap':
            generateGapQuestion();
            break;
    }
}

function generateMultipleChoice() {
    const questionText = document.getElementById('question-text');
    questionText.textContent = 'What is the past simple of this verb?';
    
    const answerArea = document.getElementById('answer-area');
    answerArea.innerHTML = '';
    
    // Generate options (correct answer + 3 wrong answers)
    const options = [currentVerb.past];
    const wrongAnswers = irregularVerbs
        .filter(v => v.base !== currentVerb.base)
        .map(v => v.past)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    options.push(...wrongAnswers);
    options.sort(() => Math.random() - 0.5);
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = option;
        btn.onclick = () => selectChoice(btn, option);
        answerArea.appendChild(btn);
    });
}

function selectChoice(btn, answer) {
    // Deselect all
    document.querySelectorAll('.choice-btn').forEach(b => {
        b.classList.remove('selected');
    });
    // Select clicked
    btn.classList.add('selected');
    selectedAnswer = answer;
}

function generateInputQuestion() {
    const questionText = document.getElementById('question-text');
    questionText.textContent = 'Type the past simple form:';
    
    const answerArea = document.getElementById('answer-area');
    answerArea.innerHTML = '<input type="text" class="input-answer" id="input-answer" placeholder="Type your answer...">';
    
    const input = document.getElementById('input-answer');
    input.focus();
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

function generateTranslationQuestion() {
    const questionText = document.getElementById('question-text');
    questionText.textContent = `What does "${currentVerb.base}" mean in Spanish?`;
    
    const answerArea = document.getElementById('answer-area');
    answerArea.innerHTML = '';
    
    // Generate options
    const options = [currentVerb.meaning];
    const wrongAnswers = irregularVerbs
        .filter(v => v.base !== currentVerb.base)
        .map(v => v.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    options.push(...wrongAnswers);
    options.sort(() => Math.random() - 0.5);
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = option;
        btn.onclick = () => selectChoice(btn, option);
        answerArea.appendChild(btn);
    });
}

function generateGapQuestion() {
    const questionText = document.getElementById('question-text');
    questionText.textContent = 'Fill in the blank with the past simple:';
    
    const sentences = [
        `Yesterday I ___ to the park.`,
        `Last week she ___ a new book.`,
        `They ___ dinner at 7 PM.`,
        `He ___ his homework yesterday.`,
        `We ___ a great movie last night.`
    ];
    
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    
    const answerArea = document.getElementById('answer-area');
    answerArea.innerHTML = `
        <div class="gap-sentence">
            ${sentence.replace('___', '<input type="text" class="gap-input" id="gap-input" placeholder="...">')}
        </div>
    `;
    
    const input = document.getElementById('gap-input');
    input.focus();
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

function checkAnswer() {
    let userAnswer = '';
    let correctAnswer = '';
    
    // Get user answer based on exercise type
    if (currentExercise === 'multiple-choice' || currentExercise === 'translation') {
        if (!selectedAnswer) {
            return;
        }
        userAnswer = selectedAnswer;
        correctAnswer = currentExercise === 'multiple-choice' ? currentVerb.past : currentVerb.meaning;
    } else if (currentExercise === 'input') {
        const input = document.getElementById('input-answer');
        userAnswer = input.value.trim().toLowerCase();
        correctAnswer = currentVerb.past.toLowerCase();
    } else if (currentExercise === 'gap') {
        const input = document.getElementById('gap-input');
        userAnswer = input.value.trim().toLowerCase();
        correctAnswer = currentVerb.past.toLowerCase();
    }
    
    const isCorrect = checkAnswerCorrect(userAnswer, correctAnswer);
    
    // Show feedback
    const feedback = document.getElementById('feedback');
    feedback.classList.add('show');
    
    const wordCard = document.querySelector('.word-card');
    
    if (isCorrect) {
        feedback.textContent = '🎉 Correct! Great job!';
        feedback.classList.add('correct');
        wordCard.classList.add('bounce');
        setTimeout(() => wordCard.classList.remove('bounce'), 500);
        
        // Update progress
        updateProgress(currentVerb.base, true);
        currentScore++;
        
        // Highlight correct answer
        if (currentExercise === 'multiple-choice' || currentExercise === 'translation') {
            document.querySelectorAll('.choice-btn').forEach(btn => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }
        
        playSound('correct');
    } else {
        feedback.textContent = `❌ Oops! The correct answer is: ${correctAnswer}`;
        feedback.classList.add('incorrect');
        wordCard.classList.add('shake');
        setTimeout(() => wordCard.classList.remove('shake'), 500);
        
        // Update progress
        updateProgress(currentVerb.base, false);
        
        // Highlight correct and incorrect answers
        if (currentExercise === 'multiple-choice' || currentExercise === 'translation') {
            document.querySelectorAll('.choice-btn').forEach(btn => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add('correct');
                } else if (btn.classList.contains('selected')) {
                    btn.classList.add('incorrect');
                }
            });
        }
        
        playSound('incorrect');
    }
    
    // Update star display
    const progress = wordProgress[currentVerb.base];
    const starDisplay = document.getElementById('star-display');
    starDisplay.innerHTML = getStarDisplay(progress.stars);
    
    // Update score display
    document.getElementById('current-score').textContent = currentScore;
    
    // Show next button, hide check button
    document.getElementById('check-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'block';
}

function checkAnswerCorrect(userAnswer, correctAnswer) {
    // Handle special cases like "was/were"
    const correctAnswers = correctAnswer.split('/').map(a => a.trim().toLowerCase());
    const normalized = userAnswer.toLowerCase().trim();
    return correctAnswers.some(answer => answer === normalized);
}

function updateProgress(verbBase, correct) {
    const progress = wordProgress[verbBase];
    progress.attempts++;
    
    if (correct) {
        // Move up star levels
        if (progress.stars < 5) {
            progress.stars++;
        }
    } else {
        // Record mistake and potentially move down
        progress.mistakes++;
        if (progress.stars > 0 && progress.mistakes % 2 === 0) {
            // Lose a star every 2 mistakes
            progress.stars--;
        }
    }
    
    saveProgress();
}

// Sound effects (simple beep using Web Audio API)
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'correct') {
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } else {
            oscillator.frequency.value = 200;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', init);
