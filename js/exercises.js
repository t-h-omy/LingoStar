// exercises.js - Manages verb and exercise selection

let verbs = [];
let exerciseData = {};

/**
 * Load verbs from JSON file
 * @returns {Promise<Array>} Array of verb objects
 */
export async function loadVerbs() {
  try {
    const response = await fetch('data/verbs.json');
    verbs = await response.json();
    return verbs;
  } catch (e) {
    console.error('Failed to load verbs:', e);
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
  const wrongOptions = verbs
    .filter(v => v.infinitive !== verb.infinitive)
    .map(v => v.past)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
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
  const germanSentences = [
    { de: `Ich ${verb.translation.split(',')[0].trim()} gestern.`, en: `I ${verb.past} yesterday.` },
    { de: `Er ${verb.translation.split(',')[0].trim()} letzte Woche.`, en: `He ${verb.past} last week.` },
    { de: `Sie ${verb.translation.split(',')[0].trim()} vor einem Jahr.`, en: `She ${verb.past} a year ago.` }
  ];
  
  const sentence = germanSentences[Math.floor(Math.random() * germanSentences.length)];
  
  return {
    type: EXERCISE_TYPES.TRANSLATION,
    question: `Translate to English: "${sentence.de}"`,
    hint: `Use the past simple form of "${verb.infinitive}"`,
    correctAnswer: sentence.en
  };
}

/**
 * Generate a sentence gap exercise
 * @param {Object} verb - Target verb
 * @returns {Object} Exercise data
 */
function generateSentenceGap(verb) {
  const sentences = [
    `Yesterday, I ___ to the store.`,
    `Last week, she ___ a new book.`,
    `He ___ his homework yesterday.`,
    `They ___ to the park last Sunday.`,
    `We ___ a great time at the party.`
  ];
  
  const sentence = sentences[Math.floor(Math.random() * sentences.length)];
  
  return {
    type: EXERCISE_TYPES.SENTENCE_GAP,
    question: `Fill in the gap with the past simple form of "${verb.infinitive}":`,
    sentence: sentence,
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
 * @param {string} correctAnswer - Correct answer
 * @returns {boolean} Whether the answer is correct
 */
export function checkAnswer(userAnswer, correctAnswer) {
  const normalize = (str) => str.toLowerCase().trim();
  return normalize(userAnswer) === normalize(correctAnswer);
}
