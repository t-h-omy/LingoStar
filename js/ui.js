// ui.js - Manages DOM updates and rendering

// Preload sound effects
const sounds = {
  correct: new Audio('assets/sounds/sfx_correct.mp3'),
  incorrect: new Audio('assets/sounds/sfx_incorrect.mp3'),
  freeze: new Audio('assets/sounds/sfx_freeze.mp3'),
  unfreeze: new Audio('assets/sounds/sfx_unfreeze.mp3')
};

// Preload all sounds
Object.values(sounds).forEach(sound => {
  sound.preload = 'auto';
  sound.load();
});

/**
 * Get star image path based on level and state
 * @param {number} level - Star level (0-5)
 * @param {string} state - Star state (active, frozen, broken)
 * @returns {string} Path to star image
 */
function getStarImage(level, state) {
  if (state === 'broken') {
    return 'assets/images/star_broken_384.png';
  }
  
  const colorMap = {
    0: 'neutral',
    1: 'yellow',
    2: 'rosa',     // pink
    3: 'blue',
    4: 'purple',
    5: 'orange'    // golden/orange for max level
  };
  
  const color = colorMap[level] || 'neutral';
  const frozen = (state === 'frozen') ? '_frozen' : '';
  
  return `assets/images/star_${color}_384${frozen}.png`;
}

/**
 * Get star color based on level (for summary display)
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
 * @param {string} infinitive - Infinitive form of the verb
 */
export function renderCurrentStar(verbState, infinitive) {
  const container = document.getElementById('current-star');
  const starImage = getStarImage(verbState.level, verbState.state);
  const frozenClass = verbState.state === 'frozen' ? 'frozen' : '';
  const brokenClass = verbState.state === 'broken' ? 'broken' : '';
  
  container.innerHTML = `
    <div class="current-star-display ${frozenClass} ${brokenClass}">
      <div class="current-word">${infinitive}</div>
      <img src="${starImage}" alt="Star" class="star-image" />
    </div>
  `;
  
  // Trigger animation
  const starElement = container.querySelector('.current-star-display');
  starElement.classList.add('star-appear');
}

/**
 * Get task type icon based on exercise type
 * @param {string} exerciseType - Type of exercise
 * @returns {string} Icon emoji
 */
function getTaskIcon(exerciseType) {
  const icons = {
    'input_field': '✏️',
    'translation': '🌍',
    'sentence_gap': '💬',
    'multiple_choice': '🎯'
  };
  return icons[exerciseType] || '✏️';
}

/**
 * Render exercise question and answer area
 * @param {Object} exercise - Exercise data
 */
export function renderExercise(exercise) {
  const questionEl = document.getElementById('question-text');
  const answerEl = document.getElementById('answer-area');
  
  // Clear previous content
  questionEl.innerHTML = '';
  
  // For input_field and translation exercises, format with instruction and target on separate lines
  if (exercise.type === 'input_field' && exercise.targetWord) {
    const instructionText = exercise.question.replace(`"${exercise.targetWord}"`, '').replace(/:\s*$/, '');
    questionEl.innerHTML = `
      <div class="instruction">${instructionText.trim()}:</div>
      <div class="target-word">'${exercise.targetWord}'</div>
    `;
  } else if (exercise.type === 'translation' && exercise.targetSentence) {
    const instructionMatch = exercise.question.match(/^([^:]+):/);
    const instruction = instructionMatch ? instructionMatch[1] : 'Translate and write the sentence in simple past';
    questionEl.innerHTML = `
      <div class="instruction">${instruction}:</div>
      <div class="target-sentence">'${exercise.targetSentence}'</div>
    `;
  } else {
    questionEl.textContent = exercise.question;
  }
  
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
    // Create a container for input with icon
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    
    // Add icon
    const icon = document.createElement('span');
    icon.className = 'input-icon';
    icon.textContent = getTaskIcon(exercise.type);
    inputContainer.appendChild(icon);
    
    // Add input field
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answer-input';
    input.className = 'answer-input';
    input.placeholder = 'Type your answer here...';
    inputContainer.appendChild(input);
    
    answerEl.appendChild(inputContainer);
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
 * @param {string} soundType - Type of sound to play: 'correct', 'incorrect', 'freeze', 'unfreeze'
 */
export function playSound(soundType) {
  const sound = sounds[soundType];
  if (sound) {
    // Stop any currently playing instance and reset
    sound.pause();
    sound.currentTime = 0;
    // Play the sound
    sound.play().catch(e => console.log('Sound play failed:', e));
  }
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

/**
 * Get star display for dictionary (emoji representation)
 * @param {Object} verbState - State of the verb
 * @returns {string} Star emoji
 */
export function getStarDisplayForDictionary(verbState) {
  if (verbState.state === 'broken') {
    return '💔'; // Broken heart/star
  } else if (verbState.state === 'frozen') {
    return '❄️'; // Frozen
  } else if (verbState.level === 0) {
    return '☆'; // Outline star
  } else {
    // Colored stars based on level
    const colors = ['', '⭐', '💗', '💙', '💜', '🌟'];
    return colors[verbState.level] || '☆';
  }
}
