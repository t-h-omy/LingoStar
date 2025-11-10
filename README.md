# LingoStar
An English learning app for irregular verbs (Past Simple practice for 6th graders)

## Features
- 🎯 Four exercise types: Multiple Choice, Input Field, Translation, Sentence Gap
- ⭐ Progressive star system (outline → yellow → pink → blue → purple → golden)
- 🔄 Error handling with frozen and broken stars
- 💾 Progress saved in localStorage
- 📱 Progressive Web App (installable)
- 🎨 Kid-friendly, colorful UI
- 🔊 Sound effects for feedback

## Running the App

### Local Development
1. Start a local web server in the project directory:
   ```bash
   python3 -m http.server 8080
   ```
2. Open http://localhost:8080 in your browser

### GitHub Pages Deployment
The app is designed to be deployed on GitHub Pages. Simply push to your repository and enable GitHub Pages in the settings.

## Setup Notes

### Sound Files
The `sounds/` directory contains placeholder MP3 files. To add real sound effects:
1. Replace `sounds/correct.mp3` with a positive sound effect (e.g., chime, success sound)
2. Replace `sounds/wrong.mp3` with a negative sound effect (e.g., buzz, error sound)

Recommended: Use short (< 1 second) audio files in MP3 format.

### PWA Icons
Replace the placeholder icon files with actual PNG images:
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

## File Structure
```
LingoStar/
├── index.html              # Main HTML file
├── styles.css              # Kid-friendly styling
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
├── data/
│   └── verbs.json         # Verb database (infinitive, past, translation)
├── js/
│   ├── main.js            # Game flow & state machine
│   ├── ui.js              # DOM updates & rendering
│   ├── storage.js         # localStorage management
│   └── exercises.js       # Exercise generation & selection
└── sounds/
    ├── correct.mp3        # Positive feedback sound
    └── wrong.mp3          # Negative feedback sound
```

## How to Play
1. Read the question (translation, multiple choice, gap fill, or input)
2. Select or type your answer
3. Click "OK" to check your answer
4. Get immediate feedback and see your star progress
5. Click "Next" to continue with another exercise

## Star System
- **Outline Star (☆)**: No correct answers yet
- **Yellow Star (★)**: 1 correct answer
- **Pink Star (★)**: 2 correct answers
- **Blue Star (★)**: 3 correct answers
- **Purple Star (★)**: 4 correct answers
- **Golden Star (★)**: 5 correct answers (mastered!)

### Error Handling
- First wrong answer: Star becomes **broken** (gray, faded)
- Wrong answer with active star: Star becomes **frozen** (blurred)
- Wrong answer with frozen star: **Reset** all progress (back to broken)
- Correct answer with frozen star: **Unfreeze** (keep current level)

Words with broken stars appear more frequently for extra practice!
