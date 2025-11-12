// animationConfig.js - Centralized animation balancing parameters

/**
 * Animation balancing configuration
 * All timing values are in milliseconds unless otherwise specified
 */
export const ANIMATION_CONFIG = {
  // Swivel animation (level-up / defrost)
  swivel: {
    rotations: 15,              // Number of full rotations
    duration: 600,              // Total duration in ms
    easing: 'ease-in',          // CSS easing function
    scaleXStart: 1,             // Starting scaleX value
    scaleXMid: 0,               // Middle scaleX value (creates rotation effect)
    scaleXEnd: 1                // Ending scaleX value
  },
  
  // Pop/bounce animation (after swivel)
  pop: {
    duration: 400,              // Total duration in ms
    easing: 'ease-out',         // CSS easing function
    stages: [
      { scale: 0.5, delay: 0 },
      { scale: 1.2, delay: 0 },
      { scale: 0.9, delay: 0 },
      { scale: 1.15, delay: 0 },
      { scale: 0.95, delay: 0 },
      { scale: 1.1, delay: 0 },
      { scale: 1, delay: 0 }
    ],
    wobbleAmplitude: 3,         // Vertical wobble in pixels
    wobbleDuration: 100         // Duration per wobble cycle in ms
  },
  
  // Particle effects
  particles: {
    count: 30,                  // Number of particles per burst
    minLifetime: 300,           // Minimum particle lifetime in ms
    maxLifetime: 600,           // Maximum particle lifetime in ms
    minSize: 4,                 // Minimum particle size in pixels
    maxSize: 10,                // Maximum particle size in pixels
    minDistance: 30,            // Minimum travel distance in pixels
    maxDistance: 60,            // Maximum travel distance in pixels
    spreadAngle: 360,           // Spread angle in degrees (360 = full circle)
    fadeOutStart: 0.5,          // When to start fading (0-1, relative to lifetime)
    colors: [
      '#FFD700',                // Gold
      '#FFA500',                // Orange
      '#FFFF00',                // Yellow
      '#FFE4B5'                 // Light yellow
    ]
  },
  
  // Freeze animation
  freeze: {
    stepDuration: 250,          // Duration of each opacity step in ms
    steps: [
      { opacity: 0, delay: 0 },
      { opacity: 0.33, delay: 250 },
      { opacity: 0.66, delay: 500 },
      { opacity: 1, delay: 750 }
    ],
    totalDuration: 1000,        // Total freeze animation duration
    easing: 'ease'              // CSS easing function
  },
  
  // Broken star animation
  broken: {
    duration: 500,              // Total duration in ms
    bounceHeight: 30,           // Initial bounce height in pixels
    easing: 'ease-out',         // CSS easing function
    stages: [
      { scale: 0, translateY: 30, opacity: 0 },
      { scale: 1.2, translateY: -5, opacity: 1 },
      { scale: 0.9, translateY: 2, opacity: 1 },
      { scale: 1, translateY: 0, opacity: 1 }
    ]
  },
  
  // Global timing multiplier (for easy speed adjustment)
  globalSpeedMultiplier: 1.0,   // 1.0 = normal speed, 0.5 = half speed, 2.0 = double speed
  
  // Performance settings
  performance: {
    useCanvas: false,           // Use canvas for particles (better performance)
    reducedMotion: false,       // Respect prefers-reduced-motion
    maxParticlesOnScreen: 100   // Maximum concurrent particles for performance
  }
};

/**
 * Get adjusted duration based on global speed multiplier
 * @param {number} duration - Base duration in ms
 * @returns {number} - Adjusted duration
 */
export function getAdjustedDuration(duration) {
  return duration / ANIMATION_CONFIG.globalSpeedMultiplier;
}

/**
 * Get adjusted value based on global speed multiplier
 * @param {number} value - Base value
 * @returns {number} - Adjusted value
 */
export function getAdjustedValue(value) {
  return value * ANIMATION_CONFIG.globalSpeedMultiplier;
}
