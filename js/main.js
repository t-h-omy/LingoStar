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
let soundEnabled = true; // Sound setting
let okButtonHandler = null; // Track the current OK button handler

/**
 * Initialize the app
 */
async function init() {
  // Register service worker with update handling
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registered');
      
      // Handle updates
      setupServiceWorkerUpdateHandler(registration);
    } catch (e) {
      console.log('Service Worker registration failed:', e);
    }
  }
  
  // Load sound setting from localStorage
  const savedSound = localStorage.getItem('lingostar_sound_enabled');
  soundEnabled = savedSound === null ? true : savedSound === 'true';
  updateSoundToggle();
  
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
 * Set up service worker update handler
 * @param {ServiceWorkerRegistration} registration - Service worker registration
 */
function setupServiceWorkerUpdateHandler(registration) {
  // Check for updates periodically
  setInterval(() => {
    registration.update();
  }, 60000); // Check every minute
  
  // Handle update found
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker installed, show update notification
        showUpdateNotification(newWorker);
      }
    });
  });
  
  // Handle controller change (when new SW takes over)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Reload page to show new version
    window.location.reload();
  });
}

/**
 * Show update notification to user
 * @param {ServiceWorker} newWorker - The new service worker
 */
function showUpdateNotification(newWorker) {
  const notification = document.getElementById('update-notification');
  const updateButton = document.getElementById('update-button');
  
  // Show the notification
  notification.style.display = 'block';
  
  // Handle update button click
  updateButton.onclick = () => {
    // Tell the new service worker to skip waiting
    newWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // Hide the notification
    notification.style.display = 'none';
  };
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
    
    // Show prompt after a short delay if not already shown this session
    setTimeout(() => {
      maybeShowInstallPrompt();
    }, 2000);
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
    sessionStorage.setItem('lingostar_install_prompt_shown', 'true');
  });
}

/**
 * Show PWA install prompt
 */
function maybeShowInstallPrompt() {
  // Don't show if already shown this session
  if (sessionStorage.getItem('lingostar_install_prompt_shown')) {
    return;
  }
  
  // Don't show if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }
  
  // Don't show if prompt not available
  if (!deferredPrompt) {
    return;
  }
  
  // Mark as shown for this session
  sessionStorage.setItem('lingostar_install_prompt_shown', 'true');
  
  // Show the prompt
  const installPrompt = confirm('Install LingoStar as an App?\n\nAdd LingoStar to your home screen for quick access and offline use.');
  
  if (installPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      deferredPrompt = null;
    });
  } else {
    deferredPrompt = null;
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
  
  // Select verb and generate exercise
  currentVerb = exercises.selectVerb(progress);
  currentExercise = exercises.generateExercise(currentVerb);
  
  // Update UI
  const verbState = storage.getVerbState(progress, currentVerb.infinitive);
  ui.renderCurrentStar(verbState, currentVerb.infinitive);
  ui.renderExercise(currentExercise);
  ui.enableAnswerInput();
  
  // Set OK button to submit answer
  okButtonHandler = handleSubmitAnswer;
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
  const shouldRepeat = storage.updateVerbState(progress, currentVerb.infinitive, isCorrect);
  const newState = storage.getVerbState(progress, currentVerb.infinitive);
  
  // Update UI
  ui.showFeedback(isCorrect, currentExercise.correctAnswer);
  
  // Play appropriate sound effect
  playSoundForStateChange(oldState, newState, isCorrect);
  
  ui.disableAnswerInput();
  
  // Animate star transition
  animateStateTransition(oldState, newState, isCorrect);
  
  // Update displays
  ui.renderCurrentStar(newState, currentVerb.infinitive);
  updateStarSummary();
  
  // If frozen star behavior triggered, we need to repeat the same exercise
  if (shouldRepeat) {
    // Change button to "Try Again" and repeat same exercise
    okButtonHandler = handleRetryExercise;
    ui.setOkButton('Try Again', handleRetryExercise);
  } else {
    // Change button to "Next"
    okButtonHandler = handleSubmitAnswer;
    ui.setOkButton('Next', handleSubmitAnswer);
  }
  awaitingNextExercise = true;
}

/**
 * Handle retry of the same exercise (for frozen star behavior)
 */
function handleRetryExercise() {
  awaitingNextExercise = false;
  ui.clearFeedback();
  
  // Generate the same type of exercise for the same verb
  currentExercise = exercises.generateExercise(currentVerb, currentExercise.type);
  
  // Update UI
  const verbState = storage.getVerbState(progress, currentVerb.infinitive);
  ui.renderCurrentStar(verbState, currentVerb.infinitive);
  ui.renderExercise(currentExercise);
  ui.enableAnswerInput();
  
  // Set OK button to submit answer
  okButtonHandler = handleSubmitAnswer;
  ui.setOkButton('OK', handleSubmitAnswer);
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
 * Play sound effect based on state change
 * @param {Object} oldState - Previous state
 * @param {Object} newState - New state
 * @param {boolean} isCorrect - Whether answer was correct
 */
function playSoundForStateChange(oldState, newState, isCorrect) {
  if (!soundEnabled) return; // Don't play if sound is disabled
  
  if (isCorrect) {
    if (oldState.state === 'frozen' && newState.state === 'active') {
      // Frozen star unfrozen
      ui.playSound('unfreeze');
    } else {
      // Any other correct answer
      ui.playSound('correct');
    }
  } else {
    if (oldState.state === 'active' && oldState.level > 0 && newState.state === 'frozen') {
      // Colored star frozen
      ui.playSound('freeze');
    } else {
      // Any other incorrect answer
      ui.playSound('incorrect');
    }
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
    if (oldState.state === 'broken' && newState.state === 'active') {
      // Broken star recovered to neutral
      ui.animateStarTransition('recover');
    } else if (oldState.state === 'frozen' && newState.state === 'active') {
      // Frozen star unfrozen
      ui.animateStarTransition('unfreeze');
    } else if (newState.level > oldState.level) {
      // Level up
      ui.animateStarTransition('levelUp');
    }
  } else {
    if (oldState.state === 'active' && oldState.level === 0 && newState.state === 'broken') {
      // Neutral star broke
      ui.animateStarTransition('break');
    } else if (oldState.state === 'active' && oldState.level > 0 && newState.state === 'frozen') {
      // Colored star frozen
      ui.animateStarTransition('freeze');
    } else if (oldState.state === 'frozen' && newState.state === 'active' && newState.level === 0) {
      // Frozen star reset to neutral
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
      const optionContainer = e.target.parentElement;
      const answerArea = document.getElementById('answer-area');
      
      // Remove previous OK buttons and deselect all
      document.querySelectorAll('.option-button').forEach(btn => {
        btn.classList.remove('selected');
        const container = btn.parentElement;
        const existingOk = container.querySelector('.ok-button-inline');
        if (existingOk) existingOk.remove();
      });
      
      // Select clicked option
      e.target.classList.add('selected');
      
      // Add inline OK button next to selected option
      const okButton = document.createElement('button');
      okButton.id = 'ok-button';
      okButton.className = 'ok-button-inline';
      okButton.textContent = 'OK';
      optionContainer.appendChild(okButton);
      
      // Shrink the option button to make room
      e.target.classList.add('with-ok-button');
    }
  });
  
  // Delegate click for dynamically created OK buttons
  document.addEventListener('click', (e) => {
    if (e.target.id === 'ok-button' || e.target.classList.contains('ok-button-inline')) {
      // Call the current handler function
      if (okButtonHandler) {
        okButtonHandler();
      }
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
      if (okButton && okButtonHandler) {
        e.preventDefault();
        okButtonHandler();
      }
    }
  });
  
  // Handle mobile keyboard visibility with visual viewport
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportResize);
    window.visualViewport.addEventListener('scroll', handleViewportScroll);
  }
  
  // Burger menu
  setupBurgerMenu();
}

/**
 * Handle viewport resize (mobile keyboard appearance)
 */
function handleViewportResize() {
  // Since OK button is now inline with the input/options, no special handling needed
  // The viewport will naturally adjust with the inline button staying in place
}

/**
 * Handle viewport scroll (additional keyboard handling)
 */
function handleViewportScroll() {
  // Ensure button stays in correct position when viewport scrolls
  handleViewportResize();
}

/**
 * Set up burger menu event listeners
 */
function setupBurgerMenu() {
  const burgerIcon = document.getElementById('burger-menu-icon');
  const burgerMenu = document.getElementById('burger-menu');
  const burgerClose = document.getElementById('burger-menu-close');
  const soundToggle = document.getElementById('sound-toggle');
  const dictionaryButton = document.getElementById('dictionary-button');
  const deleteSaveButton = document.getElementById('delete-save-button');
  
  // Open menu
  burgerIcon.addEventListener('click', () => {
    burgerMenu.style.display = 'flex';
  });
  
  // Close menu
  burgerClose.addEventListener('click', () => {
    burgerMenu.style.display = 'none';
  });
  
  // Close menu when clicking outside
  burgerMenu.addEventListener('click', (e) => {
    if (e.target === burgerMenu) {
      burgerMenu.style.display = 'none';
    }
  });
  
  // Sound toggle
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('lingostar_sound_enabled', soundEnabled.toString());
    updateSoundToggle();
  });
  
  // Dictionary
  dictionaryButton.addEventListener('click', () => {
    burgerMenu.style.display = 'none';
    showDictionary();
  });
  
  // Delete save game
  deleteSaveButton.addEventListener('click', () => {
    burgerMenu.style.display = 'none';
    showDeleteConfirmation();
  });
}

/**
 * Update sound toggle UI
 */
function updateSoundToggle() {
  const soundToggle = document.getElementById('sound-toggle');
  const icon = soundToggle.querySelector('.toggle-icon');
  
  if (soundEnabled) {
    soundToggle.classList.add('on');
    soundToggle.classList.remove('off');
    icon.textContent = '🔊';
  } else {
    soundToggle.classList.add('off');
    soundToggle.classList.remove('on');
    icon.textContent = '🔇';
  }
}

/**
 * Show dictionary modal
 */
function showDictionary() {
  const modal = document.getElementById('dictionary-modal');
  const closeButton = document.getElementById('dictionary-close');
  const listContainer = document.getElementById('dictionary-list');
  
  // Get all verbs and their states
  const verbs = exercises.getVerbs();
  
  // Sort by infinitive
  const sortedVerbs = [...verbs].sort((a, b) => a.infinitive.localeCompare(b.infinitive));
  
  // Build dictionary list
  listContainer.innerHTML = sortedVerbs.map(verb => {
    const state = storage.getVerbState(progress, verb.infinitive);
    const starDisplay = ui.getStarDisplayForDictionary(state);
    
    return `
      <div class="dictionary-item">
        <div class="dictionary-star">${starDisplay}</div>
        <div class="dictionary-info">
          <div class="dictionary-infinitive">${verb.infinitive}</div>
          <div class="dictionary-past">${verb.past}</div>
          <div class="dictionary-translation">${verb.translation}</div>
        </div>
      </div>
    `;
  }).join('');
  
  // Show modal
  modal.style.display = 'flex';
  
  // Close button
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/**
 * Show delete confirmation modal
 */
function showDeleteConfirmation() {
  const modal = document.getElementById('confirmation-modal');
  const message = document.getElementById('confirmation-message');
  const cancelButton = document.getElementById('confirmation-cancel');
  const confirmButton = document.getElementById('confirmation-confirm');
  
  message.textContent = 'Are you sure you want to delete your current save game?';
  
  // Show modal
  modal.style.display = 'flex';
  
  // Cancel button
  const cancelHandler = () => {
    modal.style.display = 'none';
    cancelButton.removeEventListener('click', cancelHandler);
    confirmButton.removeEventListener('click', confirmHandler);
  };
  
  // Confirm button
  const confirmHandler = () => {
    // Delete all progress
    localStorage.removeItem('lingostar_progress');
    progress = {};
    
    // Sync verbs (reinitialize)
    const verbs = exercises.getVerbs();
    progress = storage.syncNewVerbs(progress, verbs);
    
    // Update UI
    updateStarSummary();
    startNewExercise();
    
    // Close modal
    modal.style.display = 'none';
    cancelButton.removeEventListener('click', cancelHandler);
    confirmButton.removeEventListener('click', confirmHandler);
  };
  
  cancelButton.addEventListener('click', cancelHandler);
  confirmButton.addEventListener('click', confirmHandler);
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cancelHandler();
    }
  });
}

// Start the app
init();
