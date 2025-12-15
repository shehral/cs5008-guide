# CS5008 Learning Guide

An interactive, progressive learning platform for Northeastern's CS5008 course: *Data Structures, Algorithms, and Their Applications within Computer Systems*.

![CS5008 Guide](https://img.shields.io/badge/CS5008-Fall%202025-0A84FF?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue?style=for-the-badge)
![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-FF453A?style=for-the-badge)

## 🌐 Live Demo

**Visit the live site:** **[cs5008.shehral.com](https://cs5008.shehral.com)**

> An interactive learning platform featuring 15 weekly modules, 2 foundational deep-dives, study tools, and a progressive unlock system to guide you from C fundamentals to building a complete compiler.

---

## ✨ Features

- **📚 15-Week Curriculum** – From C fundamentals to building a complete compiler
- **🧠 2 Foundation Deep Dives** – Memory & Pointers, Data Structures modules
- **🔐 Two-Tier Unlock System** – Student module passwords + TA-only implementation hints
- **📝 Interactive Quizzes** – Self-check questions with immediate feedback
- **📊 Progress Tracking** – Resume where you left off (saved locally)
- **🌙 Dark/Light Mode** – OLED-optimized dark theme by default
- **🔍 Full-Text Search** – Find topics instantly (Cmd/Ctrl + K)
- **🎴 Study Tools** – Flashcards (73 cards), Quick Reference, Practice Problems (17+)
- **📹 Rich Media** – Intro video, course infographic, comprehensive PDF guide

---

## 🚀 Quick Start

### View the Live Site
Simply visit: **[cs5008.shehral.com](https://cs5008.shehral.com)**

### Local Development

```bash
# Clone the repository
git clone https://github.com/shehral/cs5008-guide.git
cd cs5008-guide

# Start local server
python3 -m http.server 8000
# Open http://localhost:8000
```

> **Note:** Must use a local server (not `file://`) for password prompts to work properly.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Design**: Custom design system with dark/light themes
- **Hosting**: GitHub Pages with custom domain (cs5008.shehral.com)
- **Storage**: LocalStorage for progress tracking & unlock state
- **Deployment**: GitHub Actions (auto-deploy on push to `main`)
- **No build step**: Pure static site, runs anywhere

---

## 📁 Project Structure

```
cs5008-guide/
├── index.html                 # Landing page with video/PDF + module grid
├── LICENSE
├── README.md
├── CNAME
│
├── assets/                    # All media and data files
│   ├── images/
│   │   └── course_infographic.png
│   ├── videos/
│   │   └── How_Code_Becomes_a_Program.mp4
│   ├── pdfs/
│   │   └── From_Abstraction_to_Architecture.pdf
│   └── data/
│       └── flashcards.csv
│
├── content/                   # 17 module pages (15 weeks + 2 foundations)
│   ├── week-01-overview.html
│   ├── week-02-intro-c.html
│   ├── week-03-cpu.html
│   ├── week-04-assembly.html
│   ├── week-05-lexer.html
│   ├── week-06-parser.html
│   ├── week-07-expressions.html
│   ├── week-08-variables.html
│   ├── week-09-functions.html
│   ├── week-10-builtins.html
│   ├── week-11-review.html
│   ├── week-12-control-flow.html
│   ├── week-13-types.html
│   ├── week-14-arrays.html
│   ├── week-15-advanced.html
│   ├── memory-pointers.html   # Foundation module
│   └── data-structures.html   # Foundation module
│
├── study-tools/               # Study aids and supplementary resources
│   ├── flashcards.html        # Flashcard study mode (73 cards)
│   ├── practice.html          # Practice problems (17+ problems)
│   └── reference.html         # Quick reference tables & diagrams
│
├── css/
│   └── styles.css             # Design system + theme + TA content styling
│
└── js/
    ├── modules-data.js        # Module definitions + passwords
    ├── unlock.js              # Two-tier unlock system
    ├── progress.js            # Progress tracking (localStorage)
    ├── search.js              # Full-text search
    ├── quiz.js                # Quiz component
    └── app.js                 # Main application logic
```

---

## 🔐 Module Unlock Status

> **Note**: These are demo/development passwords shown for reference. For production use in an actual course, update passwords in `js/modules-data.js` before each semester.

| Week | Topic | Status | Demo Password |
|------|-------|--------|---------------|
| 1 | Course Overview | ✅ Unlocked | — |
| 2 | C Basics | ✅ Unlocked | — |
| - | Memory & Pointers | ✅ Unlocked | — |
| - | Data Structures | ✅ Unlocked | — |
| 3 | CPU Architecture | 🔒 Locked | `Week3` |
| 4 | Assembly | ✅ Unlocked | — |
| 5 | Lexer | 🔒 Locked | `Week5` |
| 6 | Parser | ✅ Unlocked | — |
| 7 | Expressions | 🔒 Locked | `Week7` |
| 8 | Variables | ✅ Unlocked | — |
| 9 | Functions | 🔒 Locked | `Week9` |
| 10 | Builtins | ✅ Unlocked | — |
| 11 | Midterm Review | 🔒 Locked | `Week11` |
| 12 | Control Flow | ✅ Unlocked | — |
| 13 | Types | 🔒 Locked | `Week13` |
| 14 | Arrays | ✅ Unlocked | — |
| 15 | Strings (EC) | 🔒 Locked | `Advanced` |

### TA-Only Implementation Code Passwords

Use these codes in the **"🔐 TA Code Access"** section on the main page to unlock implementation hints:

| Week | Content | TA Code |
|------|---------| ---------|
| 5 | Lexer Implementation | `Lexer2025` |
| 6 | Parser Implementation | `Parser2025` |
| 7 | Expression Parsing | `Stack2025` |
| 8 | Symbol Table | `Vars2025` |
| 9 | Function Calls | `Funcs2025` |
| 10 | print_int Assembly | `Builtin2025` |
| 12 | Control Flow Codegen | `Flow2025` |
| 13 | Type Checker | `Types2025` |
| 14 | Array Codegen | `Arrays2025` |
| 15 | String Lexing | `Strings2025` |

---

## 🚀 Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions on every push to `main`.

- **Live URL**: [cs5008.shehral.com](https://cs5008.shehral.com)
- **Custom Domain**: Configured via CNAME record pointing to `shehral.github.io`
- **HTTPS**: Automatic SSL certificate from GitHub (auto-renews)
- **Deploy Time**: ~1-2 minutes per update

To deploy changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Actions will automatically build and deploy the site.

---

## 🎨 Customization

### Updating Passwords for Next Semester

Edit `/js/modules-data.js`:

```javascript
// Module passwords (students)
{
  id: 'week-05',
  password: 'NewPassword2026',  // Change this
}

// TA passwords
const TA_PASSWORDS = {
  'Lexer2026': ['week-05-code'],  // Update year
  // ...
};
```

### Updating Theme Colors

Edit `/css/styles.css`:

```css
:root {
  --accent-purple: #7c3aed;  /* Primary accent */
  --accent-cyan: #06b6d4;    /* Secondary accent */
  --accent-green: #10b981;   /* Success/completed */
}
```

### Adding New Content

1. Create a new HTML file in `/content/` following the existing template structure
2. Add module entry to `MODULES` array in `/js/modules-data.js`
3. Update passwords if the module should be locked
4. Add TA-only content sections if implementation hints are needed
5. Commit and push – GitHub Actions deploys automatically

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Test locally with `python3 -m http.server 8000`
5. Commit with descriptive messages
6. Push and open a Pull Request

---

## 📝 License

[MIT License](LICENSE) – Free to use and modify for educational purposes.

---

## 🙏 Credits

**Developed by [Ali Shehral](https://www.shehral.com)** – MSCS Align Student, Northeastern University

With AI pair programming assistance from **Claude** (Anthropic) and **Gemini** (Google DeepMind)

Based on the course content by **Dr. Lothar D Narins**

---

*Fall 2025 Edition*
