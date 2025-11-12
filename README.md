# LingoStar ⭐

A Progressive Web App (PWA) for learning English irregular verbs, designed for 6th graders practicing Past Simple tense.

## 📖 Overview

LingoStar is an interactive, gamified English learning application that helps students master irregular verbs through a progressive star-based reward system. The app features multiple exercise types, sound effects, and offline support through PWA technology.

### Key Features

- 🎯 **Four Exercise Types**: Multiple Choice, Input Field, Translation, Sentence Gap
- ⭐ **Progressive Star System**: Advance from outline to golden stars (6 levels)
- 🔄 **Smart Error Handling**: Frozen and broken star states for mistakes
- 💾 **Progress Tracking**: All progress saved in localStorage
- 📱 **Progressive Web App**: Installable and works offline
- 📱 **Mobile-Optimized**: Responsive design with keyboard support and safe-area insets
- 🎨 **Kid-Friendly UI**: Colorful, engaging interface
- 🔊 **Sound Effects**: Audio feedback for all interactions
- 🔄 **Auto-Sync**: New verbs automatically synced from JSON

## 🚀 Getting Started

### Prerequisites

LingoStar is a static web application that requires no build process. You only need:
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server for development

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/t-h-omy/LingoStar.git
   cd LingoStar
   ```

2. **Start a local web server**
   
   Using Python 3:
   ```bash
   python3 -m http.server 8080
   ```
   
   Using Node.js (with npx):
   ```bash
   npx http-server -p 8080
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8080
   ```

3. **Open in browser**
   
   Navigate to `http://localhost:8080`

### Deployment

#### GitHub Pages

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select your deployment source (e.g., main branch)
4. GitHub Pages will automatically serve your app

The app will be available at: `https://[username].github.io/[repository-name]/`

#### Other Static Hosts

LingoStar can be deployed to any static hosting service:
- Netlify: Drag and drop the folder
- Vercel: Import from GitHub
- Firebase Hosting: Use Firebase CLI
- Cloudflare Pages: Connect your repository

## 🎮 How to Play

1. **Read the Question**: Translation, multiple choice, gap fill, or input exercise
2. **Answer**: Select or type your answer
3. **Check**: Click "OK" to submit
4. **Get Feedback**: Immediate feedback with correct answer shown if wrong
5. **Continue**: Click "Next" to proceed to the next exercise

### Star System Progression

- **Outline Star (☆)**: No correct answers yet
- **Yellow Star (★)**: 1 correct answer
- **Pink Star (★)**: 2 correct answers
- **Blue Star (★)**: 3 correct answers
- **Purple Star (★)**: 4 correct answers
- **Golden Star (★)**: 5 correct answers (mastered!)

### Error Handling Logic

- **First Wrong Answer**: Star becomes **broken** (gray, faded)
- **Wrong with Active Star**: Star becomes **frozen** (blurred overlay)
- **Wrong with Frozen Star**: **Reset** all progress to broken
- **Correct with Frozen Star**: **Unfreeze** and keep current level

Words with broken stars appear more frequently for extra practice!

## 📱 Progressive Web App (PWA)

### Installing as an App

**On Desktop (Chrome/Edge):**
1. Click the install icon (⊕) in the address bar
2. Click "Install" in the popup
3. The app will open in its own window

**On Android:**
1. Open the app in Chrome
2. Tap the menu (⋮) → "Add to Home screen"
3. Name the app and tap "Add"
4. Launch from your home screen

**On iOS (iPhone/iPad):**
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name the app and tap "Add"
5. Launch from your home screen

### Offline Support

Once installed, LingoStar works completely offline thanks to service worker caching. All verbs, images, sounds, and code are cached locally.

### Updates

When a new version is available, you'll see a notification banner. Click "New Version Available" to update and reload the app.

## 🧪 Testing on Android

### USB Debugging

1. **Enable Developer Mode on Android:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → System → Developer Options
   - Enable "USB Debugging"

2. **Connect Device:**
   - Connect your Android device via USB
   - On your computer, open Chrome
   - Navigate to `chrome://inspect#devices`
   - You should see your device listed

3. **Test the App:**
   - Make sure the app is running on your computer (e.g., `http://localhost:8080`)
   - On your Android device, open Chrome and navigate to your computer's IP:
     - Find your computer's local IP (e.g., `192.168.1.5`)
     - On Android Chrome, go to `http://[YOUR-IP]:8080`
   - Install the PWA using "Add to Home Screen"

### Testing Service Worker Updates

1. Make a change to the cache version in `service-worker.js`
2. Reload the page
3. The update notification should appear
4. Click the update button to apply the new version

## 📁 Project Structure

```
LingoStar/
├── index.html              # Main HTML file
├── styles.css              # All styling (kid-friendly theme)
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
├── lingostar_verbs.json    # Verb database (infinitive, past, translation)
├── js/
│   ├── main.js             # Game flow & state machine
│   ├── ui.js               # DOM updates & rendering
│   ├── storage.js          # localStorage management
│   ├── exercises.js        # Exercise generation & selection
│   └── animationConfig.js  # Animation configuration
└── assets/
    ├── sounds/             # Sound effects (SFX)
    │   ├── sfx_correct.mp3
    │   ├── sfx_incorrect.mp3
    │   ├── sfx_freeze.mp3
    │   ├── sfx_unfreeze.mp3
    │   └── sfx_break.mp3
    ├── images/             # Star images (various states and sizes)
    └── appicon/            # App icons (various sizes)
```

## 🔧 Configuration

### Adding New Verbs

Edit `lingostar_verbs.json` and add new entries:

```json
{
  "infinitive": "go",
  "past": "went",
  "translation": "gehen"
}
```

The app will automatically sync new verbs on the next load.

### Customizing Sounds

Replace the sound files in `assets/sounds/` with your own MP3 files:
- Keep files short (< 1 second recommended)
- Use MP3 format for best browser compatibility
- Maintain the same file names

### Adjusting Animations

Edit `js/animationConfig.js` to customize:
- Animation durations
- Particle effects
- Freeze/unfreeze transitions
- Global speed multiplier

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow existing code style
   - Test on desktop and mobile
   - Ensure PWA functionality still works
4. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

### Reporting Issues

Found a bug or have a suggestion? Please [open an issue](https://github.com/t-h-omy/LingoStar/issues) with:
- Clear description of the problem
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Browser and device information

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Credits

- **Developer**: [t-h-omy](https://github.com/t-h-omy)
- **Sound Effects**: Custom SFX created for LingoStar
- **Icons & Graphics**: Original designs for star progression system

## 📞 Support

Need help? Have questions?
- Open an issue on GitHub
- Check existing issues for solutions
- Review the code comments for implementation details

---

Made with ❤️ for English learners everywhere!
