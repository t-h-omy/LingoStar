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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Validate JSON structure
    if (!Array.isArray(data)) {
      throw new Error('Verbs data must be an array');
    }
    
    // Validate each verb has required fields
    data.forEach((verb, index) => {
      if (!verb.infinitive || !verb.past || !verb.translation) {
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
  // Use simple template-based German-to-English translations
  // Note: These are simplified for 6th graders and focus on the verb form
  const germanVerb = getGermanVerb(verb);
  
  // Handle "be" specially since it has different forms
  let pastForm1, pastForm2, pastForm3;
  if (verb.infinitive === 'be') {
    pastForm1 = 'was';  // I was
    pastForm2 = 'was';  // he was
    pastForm3 = 'was';  // she was
  } else {
    pastForm1 = verb.past;
    pastForm2 = verb.past;
    pastForm3 = verb.past;
  }
  
  const templates = [
    { 
      de: `Gestern ${germanVerb} ich.`, 
      en: `Yesterday I ${pastForm1}.` 
    },
    { 
      de: `Letzte Woche ${germanVerb} er.`, 
      en: `Last week he ${pastForm2}.` 
    },
    { 
      de: `Sie ${germanVerb} vor einem Jahr.`, 
      en: `She ${pastForm3} a year ago.` 
    }
  ];
  
  const sentence = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    type: EXERCISE_TYPES.TRANSLATION,
    question: `Translate to English: "${sentence.de}"`,
    hint: `Use the past simple form of "${verb.infinitive}"`,
    correctAnswer: sentence.en
  };
}

/**
 * Get a simplified German verb form for translation exercises
 * @param {Object} verb - Target verb
 * @returns {string} German verb representation
 */
function getGermanVerb(verb) {
  // Simplified German verb mapping for educational purposes
  const germanVerbs = {
    'go': 'ging',
    'come': 'kam',
    'see': 'sah',
    'have': 'hatte',
    'do': 'machte',
    'make': 'machte',
    'get': 'bekam',
    'take': 'nahm',
    'give': 'gab',
    'find': 'fand',
    'think': 'dachte',
    'know': 'wusste',
    'tell': 'erzählte',
    'say': 'sagte',
    'write': 'schrieb',
    'read': 'las',
    'eat': 'aß',
    'drink': 'trank',
    'run': 'lief',
    'be': 'war'
  };
  
  return germanVerbs[verb.infinitive] || verb.infinitive;
}

/**
 * Generate a sentence gap exercise
 * @param {Object} verb - Target verb
 * @returns {Object} Exercise data
 */
function generateSentenceGap(verb) {
  // Define sentences with subject-verb agreement
  const sentenceTemplates = [
    { text: `Yesterday, I ___ to the store.`, subject: 'I' },
    { text: `Last week, she ___ a new book.`, subject: 'she' },
    { text: `He ___ his homework yesterday.`, subject: 'he' },
    { text: `They ___ to the park last Sunday.`, subject: 'they' },
    { text: `We ___ a great time at the party.`, subject: 'we' }
  ];
  
  const template = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
  
  // Handle "be" with correct form based on subject
  let correctAnswer = verb.past;
  if (verb.infinitive === 'be') {
    if (template.subject === 'I' || template.subject === 'he' || template.subject === 'she') {
      correctAnswer = 'was';
    } else {
      correctAnswer = 'were';
    }
  }
  
  return {
    type: EXERCISE_TYPES.SENTENCE_GAP,
    question: `Fill in the gap with the past simple form of "${verb.infinitive}":`,
    sentence: template.text,
    correctAnswer: correctAnswer
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
  const normalizedUser = normalize(userAnswer);
  const normalizedCorrect = normalize(correctAnswer);
  
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
    const alternatives = normalizedCorrect.split('/').map(alt => normalize(alt));
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
