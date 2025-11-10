// storage.js - Manages localStorage for verb progress

const STORAGE_KEY = 'lingostar_progress';

/**
 * Load progress from localStorage
 * @returns {Object} Progress data with verb states
 */
export function loadProgress() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored progress:', e);
      return {};
    }
  }
  return {};
}

/**
 * Save progress to localStorage
 * @param {Object} progress - Progress data to save
 */
export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

/**
 * Get or initialize verb state
 * @param {Object} progress - Current progress object
 * @param {string} infinitive - Verb infinitive form
 * @returns {Object} Verb state {level: 0-5, state: 'active'|'frozen'|'broken'}
 */
export function getVerbState(progress, infinitive) {
  if (!progress[infinitive]) {
    progress[infinitive] = { level: 0, state: 'active' };
  }
  return progress[infinitive];
}

/**
 * Update verb state after an answer
 * @param {Object} progress - Current progress object
 * @param {string} infinitive - Verb infinitive form
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {boolean} shouldRepeat - Whether the same exercise should repeat
 */
export function updateVerbState(progress, infinitive, isCorrect) {
  const state = getVerbState(progress, infinitive);
  let shouldRepeat = false;
  
  if (isCorrect) {
    if (state.state === 'broken') {
      // Fix for broken star recovery: correct answer on broken star → neutral outlined star
      state.state = 'active';
      state.level = 0;
    } else if (state.state === 'frozen') {
      // Unfreeze on correct answer while frozen - keep the same level
      state.state = 'active';
    } else if (state.state === 'active' && state.level < 5) {
      // Increase level on correct answer with active star
      state.level++;
    }
  } else {
    // Wrong answer
    if (state.state === 'broken') {
      // Already broken, stay broken
      // No repeat needed
    } else if (state.level === 0 && state.state === 'active') {
      // No star yet (neutral outlined) - show broken star
      state.state = 'broken';
    } else if (state.state === 'active' && state.level > 0) {
      // Freeze the colored star (new frozen behavior)
      state.state = 'frozen';
      shouldRepeat = true; // Repeat the same exercise immediately
    } else if (state.state === 'frozen') {
      // Second fail while frozen - reset to neutral outlined
      state.level = 0;
      state.state = 'active';
    }
  }
  
  saveProgress(progress);
  return shouldRepeat;
}

/**
 * Get summary of star levels
 * @param {Object} progress - Current progress object
 * @param {Array} verbs - List of all verbs
 * @returns {Object} Count of each star level and state
 */
export function getStarSummary(progress, verbs) {
  const summary = {
    broken: 0,
    outline: 0,
    yellow: 0,  // level 1
    pink: 0,    // level 2
    blue: 0,    // level 3
    purple: 0,  // level 4
    golden: 0   // level 5
  };
  
  verbs.forEach(verb => {
    const state = getVerbState(progress, verb.infinitive);
    if (state.state === 'broken') {
      summary.broken++;
    } else if (state.level === 0) {
      summary.outline++;
    } else if (state.level === 1) {
      summary.yellow++;
    } else if (state.level === 2) {
      summary.pink++;
    } else if (state.level === 3) {
      summary.blue++;
    } else if (state.level === 4) {
      summary.purple++;
    } else if (state.level === 5) {
      summary.golden++;
    }
  });
  
  return summary;
}

/**
 * Initialize progress for any new verbs not in current progress
 * @param {Object} progress - Current progress object
 * @param {Array} verbs - List of all verbs from JSON
 * @returns {Object} Updated progress with new verbs initialized
 */
export function syncNewVerbs(progress, verbs) {
  let updated = false;
  verbs.forEach(verb => {
    if (!progress[verb.infinitive]) {
      progress[verb.infinitive] = { level: 0, state: 'active' };
      updated = true;
    }
  });
  
  if (updated) {
    saveProgress(progress);
  }
  
  return progress;
}
