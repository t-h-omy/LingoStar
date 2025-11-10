// main.js - Game flow and state machine

import * as storage from './storage.js';
import * as exercises from './exercises.js';
import * as ui from './ui.js';

// Game state
let progress = {};
let currentVerb = null;
let currentExercise = null;
let awaitingNextExercise = false;
let exerciseCount = 0;
let deferredPrompt = null;

/**
 * Initialize the app
 */
async function init() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
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
  
  // Sync new verbs (initialize any new verbs added to JSON)
  progress = storage.syncNewVerbs(progress, verbs);
  
  // Update summary
  updateStarSummary();
  
  // Start first exercise
  startNewExercise();
  
  // Set up event listeners
  setupEventListeners();
  
  // Set up PWA install prompt
  setupPWAInstallPrompt();
}

/**
 * Set up PWA install prompt
 */
function setupPWAInstallPrompt() {
  // Capture the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default prompt
    e.preventDefault();
    // Store the event for later use
    deferredPrompt = e;
    console.log('Install prompt available');
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
  });
}

/**
 * Show PWA install prompt after several exercises
 */
function maybeShowInstallPrompt() {
  // Show after 10 exercises, if not already installed and prompt is available
  if (exerciseCount === 10 && deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
    const installPrompt = confirm('Add LingoStar to your home screen for quick access?');
    
    if (installPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
      });
    }
  }
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
  
  // Increment exercise count
  exerciseCount++;
  
  // Maybe show install prompt
  maybeShowInstallPrompt();
  
  // Select verb and generate exercise
  currentVerb = exercises.selectVerb(progress);
  currentExercise = exercises.generateExercise(currentVerb);
  
  // Update UI
  const verbState = storage.getVerbState(progress, currentVerb.infinitive);
  ui.renderCurrentStar(verbState, currentVerb.infinitive);
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
  ui.renderCurrentStar(newState, currentVerb.infinitive);
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
  
  // Global Enter key handler for OK button
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Return') {
      const okButton = document.getElementById('ok-button');
      const activeElement = document.activeElement;
      
      // Don't trigger if already handled by input field
      if (activeElement && activeElement.id === 'answer-input') {
        return;
      }
      
      // Trigger OK button
      if (okButton) {
        e.preventDefault();
        okButton.click();
      }
    }
  });
  
  // Handle mobile keyboard visibility with visual viewport
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportResize);
    window.visualViewport.addEventListener('scroll', handleViewportScroll);
  }
}

/**
 * Handle viewport resize (mobile keyboard appearance)
 */
function handleViewportResize() {
  const viewport = window.visualViewport;
  const input = document.getElementById('answer-input');
  const okButton = document.getElementById('ok-button');
  
  if (!viewport) return;
  
  // Check if keyboard is likely visible (viewport height significantly reduced)
  const viewportHeight = viewport.height;
  const windowHeight = window.innerHeight;
  const keyboardVisible = viewportHeight < windowHeight * 0.75;
  
  if (keyboardVisible && input) {
    // Scroll input and button into view
    setTimeout(() => {
      const bottomBar = document.getElementById('bottom-bar');
      if (bottomBar) {
        bottomBar.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  }
}

/**
 * Handle viewport scroll (additional keyboard handling)
 */
function handleViewportScroll() {
  // Ensure input stays visible when viewport scrolls
  handleViewportResize();
}

// Start the app
init();
