// ui.js - Manages DOM updates and rendering

import { ANIMATION_CONFIG, getAdjustedDuration } from './animationConfig.js';

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
 * Animate level-up: swivel (scaleX rotation) then pop/bounce with sparkles
 * @param {HTMLElement} starElement - Star container element
 * @param {HTMLElement} starImage - Star image element
 */
function animateLevelUp(starElement, starImage) {
  const config = ANIMATION_CONFIG.swivel;
  const popConfig = ANIMATION_CONFIG.pop;
  
  // Get star bounding rect for centering particles
  const rect = starImage.getBoundingClientRect();
  const starCenterX = rect.left + rect.width / 2;
  const starCenterY = rect.top + rect.height / 2;
  
  // Phase 1: Swivel animation (scaleX rotation)
  const swivelDuration = getAdjustedDuration(config.duration);
  
  // Create swivel effect using scaleX with multiple iterations
  const swivelKeyframes = [];
  const iterations = config.rotations;
  for (let i = 0; i <= iterations; i++) {
    const progress = i / iterations;
    const scaleX = i % 2 === 0 ? config.scaleXStart : config.scaleXMid;
    swivelKeyframes.push({
      transform: `scaleX(${scaleX})`,
      offset: progress
    });
  }
  
  const swivelAnimation = starImage.animate(swivelKeyframes, {
    duration: swivelDuration,
    easing: config.easing,
    fill: 'forwards'
  });
  
  // Phase 2: Pop/bounce animation after swivel
  swivelAnimation.onfinish = () => {
    const popDuration = getAdjustedDuration(popConfig.duration);
    
    // Build pop keyframes from config
    const popKeyframes = popConfig.stages.map((stage, index) => ({
      transform: `scale(${stage.scale}) translateY(${-popConfig.wobbleAmplitude * Math.sin(index * Math.PI / 3)}px)`,
      offset: index / (popConfig.stages.length - 1)
    }));
    
    starImage.animate(popKeyframes, {
      duration: popDuration,
      easing: popConfig.easing,
      fill: 'forwards'
    });
    
    // Create sparkle particles
    createSparkles(starElement, starCenterX, starCenterY);
  };
}

/**
 * Animate freeze: 3-step opacity transition with perfect alignment
 * @param {HTMLElement} starElement - Star container element
 * @param {HTMLElement} starImage - Star image element
 */
function animateFreeze(starElement, starImage) {
  const config = ANIMATION_CONFIG.freeze;
  const container = starImage.parentElement;
  
  // Get the frozen version of the current star
  const frozenSrc = starImage.src;
  const nonFrozenSrc = frozenSrc.replace('_frozen', '');
  
  // Temporarily swap to non-frozen image
  starImage.src = nonFrozenSrc;
  
  // Create ice overlay element with exact same dimensions
  const iceOverlay = document.createElement('img');
  iceOverlay.className = 'ice-overlay';
  iceOverlay.src = frozenSrc;
  
  // Match exact dimensions and position
  const rect = starImage.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  iceOverlay.style.width = `${rect.width}px`;
  iceOverlay.style.height = `${rect.height}px`;
  iceOverlay.style.left = `${rect.left - containerRect.left}px`;
  iceOverlay.style.top = `${rect.top - containerRect.top}px`;
  iceOverlay.style.opacity = '0';
  iceOverlay.style.transition = 'none';
  
  container.style.position = 'relative';
  container.appendChild(iceOverlay);
  
  // Animate through 3 opacity steps
  config.steps.forEach((step, index) => {
    setTimeout(() => {
      iceOverlay.style.transition = `opacity ${config.stepDuration}ms ${config.easing}`;
      iceOverlay.style.opacity = step.opacity.toString();
    }, step.delay);
  });
  
  // After animation completes, swap to frozen image and remove overlay
  setTimeout(() => {
    starImage.src = frozenSrc;
    iceOverlay.remove();
  }, getAdjustedDuration(config.totalDuration));
}

/**
 * Animate break: simple bounce in, no second animation
 * @param {HTMLElement} starElement - Star container element
 * @param {HTMLElement} starImage - Star image element
 */
function animateBreak(starElement, starImage) {
  const config = ANIMATION_CONFIG.broken;
  const duration = getAdjustedDuration(config.duration);
  
  // Build broken star keyframes from config
  const keyframes = config.stages.map((stage, index) => ({
    transform: `scale(${stage.scale}) translateY(${stage.translateY}px)`,
    opacity: stage.opacity,
    offset: index / (config.stages.length - 1)
  }));
  
  // Only animate the star image, not the word
  starImage.animate(keyframes, {
    duration: duration,
    easing: config.easing,
    fill: 'forwards'
  });
}

/**
 * Create sparkle particle effects emanating from star center
 * @param {HTMLElement} container - Container element for sparkles
 * @param {number} centerX - Absolute X position of star center
 * @param {number} centerY - Absolute Y position of star center
 */
function createSparkles(container, centerX, centerY) {
  const config = ANIMATION_CONFIG.particles;
  const particleCount = config.count;
  
  // Get container position for relative positioning
  const containerRect = container.getBoundingClientRect();
  const relativeX = centerX - containerRect.left;
  const relativeY = centerY - containerRect.top;
  
  for (let i = 0; i < particleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-particle';
    
    // Random properties from config
    const angle = (Math.random() * config.spreadAngle - config.spreadAngle / 2) * Math.PI / 180;
    const distance = config.minDistance + Math.random() * (config.maxDistance - config.minDistance);
    const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
    const lifetime = config.minLifetime + Math.random() * (config.maxLifetime - config.minLifetime);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    
    // Calculate end position
    const xOffset = Math.cos(angle) * distance;
    const yOffset = Math.sin(angle) * distance;
    
    // Set sparkle styles
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${relativeX}px`;
    sparkle.style.top = `${relativeY}px`;
    sparkle.style.color = color;
    sparkle.style.setProperty('--sparkle-x', `${xOffset}px`);
    sparkle.style.setProperty('--sparkle-y', `${yOffset}px`);
    
    container.style.position = 'relative';
    container.appendChild(sparkle);
    
    // Animate sparkle
    const adjustedLifetime = getAdjustedDuration(lifetime);
    sparkle.style.animation = `sparkle ${adjustedLifetime}ms ease-out forwards`;
    
    // Remove sparkle after animation
    setTimeout(() => {
      sparkle.remove();
    }, adjustedLifetime);
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
