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
 * @param {number} size - Image size (32, 64, 96, 128, 256, or 384 for full size)
 * @returns {string} Path to star image
 */
function getStarImage(level, state, size = 384) {
  if (state === 'broken') {
    const sizeStr = size === 384 ? '' : `_${size}`;
    return `assets/images/star_broken_384${sizeStr}.png`;
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
  const sizeStr = size === 384 ? '' : `_${size}`;
  
  return `assets/images/star_${color}_384${frozen}${sizeStr}.png`;
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
  
  // Define the star types and their corresponding level/state
  const starTypes = [
    { key: 'broken', level: 0, state: 'broken', count: summary.broken },
    { key: 'outline', level: 0, state: 'active', count: summary.outline },
    { key: 'yellow', level: 1, state: 'active', count: summary.yellow },
    { key: 'pink', level: 2, state: 'active', count: summary.pink },
    { key: 'blue', level: 3, state: 'active', count: summary.blue },
    { key: 'purple', level: 4, state: 'active', count: summary.purple },
    { key: 'golden', level: 5, state: 'active', count: summary.golden }
  ];
  
  container.innerHTML = starTypes.map(star => {
    const imagePath = getStarImage(star.level, star.state, 32);
    return `
      <div class="summary-item">
        <img src="${imagePath}" alt="${star.key} star" class="summary-star-icon" />
        <span class="count">${star.count}</span>
      </div>
    `;
  }).join('');
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
  const inlineOkContainer = document.getElementById('inline-ok-container');
  
  // Clear previous content
  questionEl.innerHTML = '';
  inlineOkContainer.innerHTML = '';
  
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
      const optionContainer = document.createElement('div');
      optionContainer.className = 'option-container';
      
      const button = document.createElement('button');
      button.className = 'option-button';
      button.textContent = option;
      button.dataset.answer = option;
      
      optionContainer.appendChild(button);
      answerEl.appendChild(optionContainer);
    });
  } else {
    // Create a container for input with icon and inline OK button
    const inputRow = document.createElement('div');
    inputRow.className = 'input-row';
    
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
    
    // Add inline OK button
    const okButton = document.createElement('button');
    okButton.id = 'ok-button';
    okButton.className = 'ok-button-inline';
    okButton.textContent = 'OK';
    
    inputRow.appendChild(inputContainer);
    inputRow.appendChild(okButton);
    
    answerEl.appendChild(inputRow);
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
 * Animate star transition with enhanced effects
 * @param {string} transitionType - Type of transition (levelUp, freeze, break, unfreeze, reset, recover)
 */
export function animateStarTransition(transitionType) {
  const starElement = document.querySelector('.current-star-display');
  if (!starElement) return;
  
  const starImage = starElement.querySelector('.star-image');
  if (!starImage) return;
  
  switch (transitionType) {
    case 'levelUp':
      animateLevelUp(starElement, starImage);
      break;
    case 'freeze':
      animateFreeze(starElement, starImage);
      break;
    case 'unfreeze':
      // Defrost uses same animation as level-up
      animateLevelUp(starElement, starImage);
      break;
    case 'break':
      animateBreak(starElement, starImage);
      break;
    case 'reset':
      starElement.classList.add('star-reset');
      setTimeout(() => starElement.classList.remove('star-reset'), 600);
      break;
    case 'recover':
      starElement.classList.add('star-recover');
      setTimeout(() => starElement.classList.remove('star-recover'), 600);
      break;
  }
}

/**
 * Animate level-up: bounce new star in with sparkles
 * @param {HTMLElement} starElement - Star container element
 * @param {HTMLElement} starImage - Star image element
 */
function animateLevelUp(starElement, starImage) {
  // Apply bounce-in animation to the newly rendered star
  starImage.style.animation = 'starBounceIn 0.6s ease-out forwards';
  
  // Create sparkle effect
  createSparkles(starElement);
  
  // Clean up
  setTimeout(() => {
    starImage.style.animation = '';
  }, 600);
}

/**
 * Animate freeze: 3-step opacity transition
 * @param {HTMLElement} starElement - Star container element
 * @param {HTMLElement} starImage - Star image element
 */
function animateFreeze(starElement, starImage) {
  const container = starImage.parentElement;
  
  // The star image is already the frozen version, so we need to:
  // 1. Temporarily show the non-frozen version
  // 2. Overlay with the frozen version at increasing opacity
  
  const frozenSrc = starImage.src;
  const nonFrozenSrc = frozenSrc.replace('_frozen', '');
  
  // Temporarily swap to non-frozen image
  starImage.src = nonFrozenSrc;
  
  // Create ice overlay element with the frozen version
  const iceOverlay = document.createElement('img');
  iceOverlay.className = 'ice-overlay';
  iceOverlay.style.position = 'absolute';
  iceOverlay.style.top = '0';
  iceOverlay.style.left = '0';
  iceOverlay.style.width = '100%';
  iceOverlay.style.height = '100%';
  iceOverlay.style.opacity = '0';
  iceOverlay.style.transition = 'opacity 0.15s ease';
  iceOverlay.style.pointerEvents = 'none';
  iceOverlay.src = frozenSrc;
  
  container.style.position = 'relative';
  container.appendChild(iceOverlay);
  
  // Step 1: 33% opacity
  setTimeout(() => {
    iceOverlay.style.opacity = '0.33';
  }, 50);
  
  // Step 2: 66% opacity
  setTimeout(() => {
    iceOverlay.style.opacity = '0.66';
  }, 200);
  
  // Step 3: 100% opacity
  setTimeout(() => {
    iceOverlay.style.opacity = '1';
  }, 350);
  
  // After animation, swap back to frozen image and remove overlay
  setTimeout(() => {
    starImage.src = frozenSrc;
    iceOverlay.remove();
  }, 500);
}

/**
 * Animate break: broken star bounces in, outline pushed away
 * @param {HTMLElement} starElement - Star container element
 * @param {HTMLElement} starImage - Star image element
 */
function animateBreak(starElement, starImage) {
  // Apply broken star animation
  starElement.classList.add('star-break');
  
  setTimeout(() => {
    starElement.classList.remove('star-break');
  }, 600);
}

/**
 * Create sparkle particle effects around the star
 * @param {HTMLElement} container - Container element for sparkles
 */
function createSparkles(container) {
  const sparkleCount = 8;
  const containerRect = container.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;
  
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-particle';
    
    // Calculate random direction
    const angle = (i / sparkleCount) * 2 * Math.PI;
    const distance = 40 + Math.random() * 20;
    const xOffset = Math.cos(angle) * distance;
    const yOffset = Math.sin(angle) * distance;
    
    sparkle.style.setProperty('--sparkle-x', `${xOffset}px`);
    sparkle.style.setProperty('--sparkle-y', `${yOffset}px`);
    sparkle.style.left = `${centerX}px`;
    sparkle.style.top = `${centerY}px`;
    
    container.style.position = 'relative';
    container.appendChild(sparkle);
    
    // Remove sparkle after animation
    setTimeout(() => {
      sparkle.remove();
    }, 600);
  }
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
 * @param {Function} onClick - Click handler (no longer used, handled by event delegation)
 */
export function setOkButton(text, onClick) {
  const button = document.getElementById('ok-button');
  if (button) {
    button.textContent = text;
  }
}

/**
 * Get star display for dictionary (real star image)
 * @param {Object} verbState - State of the verb
 * @returns {string} Star image HTML
 */
export function getStarDisplayForDictionary(verbState) {
  const imagePath = getStarImage(verbState.level, verbState.state, 64);
  const frozenClass = verbState.state === 'frozen' ? 'frozen-dict' : '';
  return `<img src="${imagePath}" alt="star" class="dictionary-star-image ${frozenClass}" />`;
}
