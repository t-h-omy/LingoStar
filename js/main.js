// main.js - Game flow and state machine

import * as storage from './storage.js';
import * as exercises from './exercises.js';
import * as ui from './ui.js';

// Game state
let progress = {};
let currentVerb = null;
let currentExercise = null;
let awaitingNextExercise = false;

/**
 * Initialize the app
 */
async function init() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered');
    } catch (e) {
      console.log('Service Worker registration failed:', e);
    }
  }
  
  // Load verbs and progress
  const verbs = await exercises.loadVerbs();
  progress = storage.loadProgress();
  
  if (verbs.length === 0) {
    console.error('No verbs loaded');
    return;
  }
  
  // Update summary
  updateStarSummary();
  
  // Start first exercise
  startNewExercise();
  
  // Set up event listeners
  setupEventListeners();
}

/**
 * Update star summary display
 */
function updateStarSummary() {
  const verbs = exercises.getVerbs();
  const summary = storage.getStarSummary(progress, verbs);
  ui.renderStarSummary(summary);
}

/**
 * Start a new exercise
 */
function startNewExercise() {
  awaitingNextExercise = false;
  ui.clearFeedback();
  
  // Select verb and generate exercise
  currentVerb = exercises.selectVerb(progress);
  currentExercise = exercises.generateExercise(currentVerb);
  
  // Update UI
  const verbState = storage.getVerbState(progress, currentVerb.infinitive);
  ui.renderCurrentStar(verbState);
  ui.renderExercise(currentExercise);
  ui.enableAnswerInput();
  
  // Set OK button to submit answer
  ui.setOkButton('OK', handleSubmitAnswer);
}

/**
 * Handle answer submission
 */
function handleSubmitAnswer() {
  if (awaitingNextExercise) {
    // Move to next exercise
    startNewExercise();
    return;
  }
  
  // Get user answer
  const userAnswer = getUserAnswer();
  if (!userAnswer) {
    return; // No answer provided
  }
  
  // Check answer
  const isCorrect = exercises.checkAnswer(userAnswer, currentExercise.correctAnswer);
  
  // Update verb state
  const oldState = JSON.parse(JSON.stringify(storage.getVerbState(progress, currentVerb.infinitive)));
  storage.updateVerbState(progress, currentVerb.infinitive, isCorrect);
  const newState = storage.getVerbState(progress, currentVerb.infinitive);
  
  // Update UI
  ui.showFeedback(isCorrect, currentExercise.correctAnswer);
  ui.playSound(isCorrect);
  ui.disableAnswerInput();
  
  // Animate star transition
  animateStateTransition(oldState, newState, isCorrect);
  
  // Update displays
  ui.renderCurrentStar(newState);
  updateStarSummary();
  
  // Change button to "Next"
  ui.setOkButton('Next', handleSubmitAnswer);
  awaitingNextExercise = true;
}

/**
 * Get user's answer from UI
 * @returns {string} User's answer
 */
function getUserAnswer() {
  if (currentExercise.type === 'multiple_choice') {
    const selected = document.querySelector('.option-button.selected');
    return selected ? selected.dataset.answer : null;
  } else {
    const input = document.getElementById('answer-input');
    return input ? input.value.trim() : null;
  }
}

/**
 * Animate state transition
 * @param {Object} oldState - Previous state
 * @param {Object} newState - New state
 * @param {boolean} isCorrect - Whether answer was correct
 */
function animateStateTransition(oldState, newState, isCorrect) {
  if (isCorrect) {
    if (oldState.state === 'frozen' && newState.state === 'active') {
      ui.animateStarTransition('unfreeze');
    } else if (newState.level > oldState.level) {
      ui.animateStarTransition('levelUp');
    }
  } else {
    if (newState.state === 'broken') {
      ui.animateStarTransition('break');
    } else if (newState.state === 'frozen') {
      ui.animateStarTransition('freeze');
    }
    if (newState.level < oldState.level) {
      ui.animateStarTransition('reset');
    }
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Multiple choice button selection
  document.getElementById('answer-area').addEventListener('click', (e) => {
    if (e.target.classList.contains('option-button')) {
      // Deselect all
      document.querySelectorAll('.option-button').forEach(btn => {
        btn.classList.remove('selected');
      });
      // Select clicked
      e.target.classList.add('selected');
    }
  });
  
  // Enter key on input field
  document.getElementById('answer-area').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'answer-input') {
      handleSubmitAnswer();
    }
  });
}

// Start the app
init();
