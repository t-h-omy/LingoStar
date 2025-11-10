// ui.js - Manages DOM updates and rendering

/**
 * Get star color based on level
 * @param {number} level - Star level (0-5)
 * @returns {string} Color name
 */
function getStarColor(level) {
  const colors = {
    0: 'outline',
    1: 'yellow',
    2: 'pink',
    3: 'blue',
    4: 'purple',
    5: 'golden'
  };
  return colors[level] || 'outline';
}

/**
 * Render star summary in top bar
 * @param {Object} summary - Star summary object
 */
export function renderStarSummary(summary) {
  const container = document.getElementById('star-summary');
  
  container.innerHTML = `
    <div class="summary-item">
      <span class="star-icon broken">★</span>
      <span class="count">${summary.broken}</span>
    </div>
    <div class="summary-item">
      <span class="star-icon outline">☆</span>
      <span class="count">${summary.outline}</span>
    </div>
    <div class="summary-item">
      <span class="star-icon yellow">★</span>
      <span class="count">${summary.yellow}</span>
    </div>
    <div class="summary-item">
      <span class="star-icon pink">★</span>
      <span class="count">${summary.pink}</span>
    </div>
    <div class="summary-item">
      <span class="star-icon blue">★</span>
      <span class="count">${summary.blue}</span>
    </div>
    <div class="summary-item">
      <span class="star-icon purple">★</span>
      <span class="count">${summary.purple}</span>
    </div>
    <div class="summary-item">
      <span class="star-icon golden">★</span>
      <span class="count">${summary.golden}</span>
    </div>
  `;
}

/**
 * Render current star for active verb
 * @param {Object} verbState - State of current verb
 */
export function renderCurrentStar(verbState) {
  const container = document.getElementById('current-star');
  const color = getStarColor(verbState.level);
  const starSymbol = verbState.level === 0 ? '☆' : '★';
  const frozenClass = verbState.state === 'frozen' ? 'frozen' : '';
  const brokenClass = verbState.state === 'broken' ? 'broken' : '';
  
  container.innerHTML = `
    <div class="current-star-display ${frozenClass} ${brokenClass}">
      <span class="star-icon ${color}">${starSymbol}</span>
    </div>
  `;
  
  // Trigger animation
  const starElement = container.querySelector('.current-star-display');
  starElement.classList.add('star-appear');
}

/**
 * Render exercise question and answer area
 * @param {Object} exercise - Exercise data
 */
export function renderExercise(exercise) {
  const questionEl = document.getElementById('question-text');
  const answerEl = document.getElementById('answer-area');
  
  questionEl.textContent = exercise.question;
  
  if (exercise.hint) {
    questionEl.innerHTML += `<div class="hint">${exercise.hint}</div>`;
  }
  
  if (exercise.sentence) {
    questionEl.innerHTML += `<div class="sentence">${exercise.sentence}</div>`;
  }
  
  answerEl.innerHTML = '';
  
  if (exercise.type === 'multiple_choice') {
    exercise.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option-button';
      button.textContent = option;
      button.dataset.answer = option;
      answerEl.appendChild(button);
    });
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answer-input';
    input.className = 'answer-input';
    input.placeholder = 'Type your answer here...';
    answerEl.appendChild(input);
  }
}

/**
 * Show feedback message
 * @param {boolean} isCorrect - Whether answer was correct
 * @param {string} correctAnswer - The correct answer (shown on wrong)
 */
export function showFeedback(isCorrect, correctAnswer = '') {
  const feedbackEl = document.getElementById('feedback-text');
  
  if (isCorrect) {
    feedbackEl.textContent = '✓ Correct!';
    feedbackEl.className = 'feedback correct';
  } else {
    feedbackEl.textContent = `✗ Wrong! The correct answer is: ${correctAnswer}`;
    feedbackEl.className = 'feedback wrong';
  }
  
  feedbackEl.classList.add('feedback-appear');
}

/**
 * Clear feedback
 */
export function clearFeedback() {
  const feedbackEl = document.getElementById('feedback-text');
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
}

/**
 * Play sound effect
 * @param {boolean} isCorrect - Whether to play correct or wrong sound
 */
export function playSound(isCorrect) {
  const sound = new Audio(isCorrect ? 'sounds/correct.mp3' : 'sounds/wrong.mp3');
  sound.play().catch(e => console.log('Sound play failed:', e));
}

/**
 * Animate star transition
 * @param {string} transitionType - Type of transition (levelUp, freeze, break, reset)
 */
export function animateStarTransition(transitionType) {
  const starElement = document.querySelector('.current-star-display');
  if (!starElement) return;
  
  starElement.classList.add(`star-${transitionType}`);
  
  setTimeout(() => {
    starElement.classList.remove(`star-${transitionType}`);
  }, 600);
}

/**
 * Disable answer input during feedback
 */
export function disableAnswerInput() {
  const buttons = document.querySelectorAll('.option-button');
  const input = document.getElementById('answer-input');
  
  buttons.forEach(btn => btn.disabled = true);
  if (input) input.disabled = true;
}

/**
 * Enable answer input
 */
export function enableAnswerInput() {
  const buttons = document.querySelectorAll('.option-button');
  const input = document.getElementById('answer-input');
  
  buttons.forEach(btn => btn.disabled = false);
  if (input) {
    input.disabled = false;
    input.focus();
  }
}

/**
 * Set OK button state
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 */
export function setOkButton(text, onClick) {
  const button = document.getElementById('ok-button');
  button.textContent = text;
  button.onclick = onClick;
}
