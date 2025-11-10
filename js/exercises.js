// exercises.js - Manages verb and exercise selection

let verbs = [];
let exerciseData = {};

/**
 * Load verbs from JSON file
 * @returns {Promise<Array>} Array of verb objects
 */
export async function loadVerbs() {
  try {
    const response = await fetch('lingostar_verbs.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Validate JSON structure
    if (!Array.isArray(data)) {
      throw new Error('Verbs data must be an array');
    }
    
    // Validate each verb has required fields including exercises
    data.forEach((verb, index) => {
      if (!verb.infinitive || !verb.past || !verb.translation || !verb.exercises) {
        console.warn(`Verb at index ${index} is missing required fields:`, verb);
      }
    });
    
    verbs = data;
    console.log(`Loaded ${verbs.length} verbs successfully`);
    return verbs;
  } catch (e) {
    console.error('Failed to load verbs:', e);
    // Show user-friendly error message
    alert('Failed to load exercises. Please refresh the page or check your internet connection.');
    return [];
  }
}

/**
 * Get all loaded verbs
 * @returns {Array} Array of verb objects
 */
export function getVerbs() {
  return verbs;
}

/**
 * Select a verb for practice based on progress
 * @param {Object} progress - Current progress object
 * @returns {Object} Selected verb
 */
export function selectVerb(progress) {
  if (verbs.length === 0) return null;
  
  // Words with broken stars should be selected more frequently
  const brokenVerbs = verbs.filter(v => {
    const state = progress[v.infinitive];
    return state && state.state === 'broken';
  });
  
  // 70% chance to pick broken verb if any exist
  if (brokenVerbs.length > 0 && Math.random() < 0.7) {
    return brokenVerbs[Math.floor(Math.random() * brokenVerbs.length)];
  }
  
  // Otherwise pick randomly from all verbs
  return verbs[Math.floor(Math.random() * verbs.length)];
}

/**
 * Exercise types
 */
const EXERCISE_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  INPUT_FIELD: 'input_field',
  TRANSLATION: 'translation',
  SENTENCE_GAP: 'sentence_gap'
};

/**
 * Select an exercise type randomly
 * @returns {string} Exercise type
 */
export function selectExerciseType() {
  const types = Object.values(EXERCISE_TYPES);
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Generate a multiple choice exercise
 * @param {Object} verb - Target verb
 * @returns {Object} Exercise data
 */
function generateMultipleChoice(verb) {
  // Use exercise data from JSON if available
  if (verb.exercises && verb.exercises.multiple_choice) {
    const exercise = verb.exercises.multiple_choice;
    return {
      type: EXERCISE_TYPES.MULTIPLE_CHOICE,
      question: exercise.question,
      options: exercise.options,
      correctAnswer: exercise.answer
    };
  }
  
  // Fallback to generated exercises (should not be needed with complete JSON)
  const wrongOptions = verbs
    .filter(v => v.infinitive !== verb.infinitive)
    .map(v => v.past)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  
  const options = [verb.past, ...wrongOptions].sort(() => Math.random() - 0.5);
  
  return {
    type: EXERCISE_TYPES.MULTIPLE_CHOICE,
    question: `What is the past simple form of "${verb.infinitive}"?`,
    options: options,
    correctAnswer: verb.past
  };
}

/**
 * Generate an input field exercise
 * @param {Object} verb - Target verb
 * @returns {Object} Exercise data
 */
function generateInputField(verb) {
  // Use exercise data from JSON if available
  if (verb.exercises && verb.exercises.input) {
    const exercise = verb.exercises.input;
    return {
      type: EXERCISE_TYPES.INPUT_FIELD,
      question: exercise.question,
      correctAnswer: exercise.answer
    };
  }
  
  // Fallback
  return {
    type: EXERCISE_TYPES.INPUT_FIELD,
    question: `Type the past simple form of "${verb.infinitive}":`,
    correctAnswer: verb.past
  };
}

/**
 * Generate a translation exercise
 * @param {Object} verb - Target verb
 * @returns {Object} Exercise data
 */
function generateTranslation(verb) {
  // Use exercise data from JSON if available
  if (verb.exercises && verb.exercises.translation) {
    const exercise = verb.exercises.translation;
    return {
      type: EXERCISE_TYPES.TRANSLATION,
      question: exercise.question,
      correctAnswer: exercise.answer
    };
  }
  
  // Fallback: simple translation exercise
  return {
    type: EXERCISE_TYPES.TRANSLATION,
    question: `Translate the past form of "${verb.infinitive}" (German: ${verb.translation})`,
    correctAnswer: verb.past
  };
}

/**
 * Generate a sentence gap exercise
 * @param {Object} verb - Target verb
 * @returns {Object} Exercise data
 */
function generateSentenceGap(verb) {
  // Use exercise data from JSON if available
  if (verb.exercises && verb.exercises.gap) {
    const exercise = verb.exercises.gap;
    const sentence = exercise.before_gap + '___' + exercise.after_gap;
    return {
      type: EXERCISE_TYPES.SENTENCE_GAP,
      question: `Fill in the gap ${exercise.infinitive_hint}:`,
      sentence: sentence,
      correctAnswer: exercise.answer
    };
  }
  
  // Fallback
  return {
    type: EXERCISE_TYPES.SENTENCE_GAP,
    question: `Fill in the gap with the past simple form of "${verb.infinitive}":`,
    sentence: `Yesterday, I ___ something.`,
    correctAnswer: verb.past
  };
}

/**
 * Generate an exercise for a verb
 * @param {Object} verb - Target verb
 * @param {string} type - Exercise type (optional, random if not provided)
 * @returns {Object} Exercise data
 */
export function generateExercise(verb, type = null) {
  const exerciseType = type || selectExerciseType();
  
  switch (exerciseType) {
    case EXERCISE_TYPES.MULTIPLE_CHOICE:
      return generateMultipleChoice(verb);
    case EXERCISE_TYPES.INPUT_FIELD:
      return generateInputField(verb);
    case EXERCISE_TYPES.TRANSLATION:
      return generateTranslation(verb);
    case EXERCISE_TYPES.SENTENCE_GAP:
      return generateSentenceGap(verb);
    default:
      return generateMultipleChoice(verb);
  }
}

/**
 * Check if an answer is correct
 * @param {string} userAnswer - User's answer
 * @param {string|Array} correctAnswer - Correct answer (string or array of valid answers)
 * @returns {boolean} Whether the answer is correct
 */
export function checkAnswer(userAnswer, correctAnswer) {
  const normalize = (str) => str.toLowerCase().trim();
  const normalizedUser = normalize(userAnswer);
  
  // Handle array of correct answers (new feature)
  if (Array.isArray(correctAnswer)) {
    // Check if user's answer matches any item in the array (case-insensitive)
    return correctAnswer.some(answer => checkSingleAnswer(normalizedUser, normalize(answer)));
  }
  
  // Handle single answer (backward compatibility)
  const normalizedCorrect = normalize(correctAnswer);
  return checkSingleAnswer(normalizedUser, normalizedCorrect);
}

/**
 * Check if user answer matches a single correct answer
 * @param {string} normalizedUser - Normalized user answer
 * @param {string} normalizedCorrect - Normalized correct answer
 * @returns {boolean} Whether the answer matches
 */
function checkSingleAnswer(normalizedUser, normalizedCorrect) {
  // Exact match
  if (normalizedUser === normalizedCorrect) {
    return true;
  }
  
  // Remove trailing punctuation for comparison (be lenient with periods, exclamation marks, etc.)
  const removePunctuation = (str) => str.replace(/[.,!?;:]$/g, '');
  const userNoPunct = removePunctuation(normalizedUser);
  const correctNoPunct = removePunctuation(normalizedCorrect);
  
  if (userNoPunct === correctNoPunct) {
    return true;
  }
  
  // Handle alternatives separated by "/" (e.g., "was/were")
  if (normalizedCorrect.includes('/')) {
    const alternatives = normalizedCorrect.split('/').map(alt => alt.trim());
    if (alternatives.includes(normalizedUser)) {
      return true;
    }
    
    // Also check if user answer contains any of the alternatives
    for (const alt of alternatives) {
      if (normalizedUser.includes(alt)) {
        // Check if it's the verb part (simple heuristic)
        const words = normalizedUser.split(/\s+/);
        if (words.includes(alt)) {
          return true;
        }
      }
    }
  }
  
  return false;
}
