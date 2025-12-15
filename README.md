# CS5008 Learning Guide

An interactive, progressive learning platform for Northeastern's CS5008 course: *Data Structures, Algorithms, and Their Applications within Computer Systems*.

![CS5008 Guide](https://img.shields.io/badge/CS5008-Fall%202025-0A84FF?style=for-the-badge)
![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-FF453A?style=for-the-badge)

## 🚀 Quick Start (Demo)

```bash
cd website_content
python3 -m http.server 8000
# Open http://localhost:8000
```

> **Note:** Must use a local server (not `file://`) for password prompts to work.

## ✨ Features

- **📚 15-Week Curriculum** – From C fundamentals to building a complete compiler
- **🔐 Two-Tier Unlock System** – Student module passwords + TA-only implementation hints
- **📝 Interactive Quizzes** – Self-check questions with immediate feedback
- **📊 Progress Tracking** – Resume where you left off (saved locally)
- **🌙 Dark/Light Mode** – OLED-optimized dark theme by default
- **🔍 Full-Text Search** – Find topics instantly (Cmd/Ctrl + K)
- **� Study Tools** – Flashcards, Quick Reference, Practice Problems
- **🧠 Foundations Deep Dive** – Memory & Pointers, Data Structures modules

## 🔐 Module Unlock Status (Demo)

| Week | Topic | Status | Password |
|------|-------|--------|----------|
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

#### TA-Only Implementation Code Passwords

Use these codes in the **"🔐 TA Code Access"** section on the main page:

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

## 📁 Project Structure

```
website_content/
├── index.html                 # Landing page with module grid
├── flashcards.html            # Flashcard study mode (73 cards)
├── reference.html             # Quick reference tables & diagrams
├── practice.html              # Practice problems (17+ problems)
├── README.md                  # This file
│
├── css/
│   └── styles.css             # Design system + theme + TA content
│
├── js/
│   ├── modules-data.js        # Module definitions + passwords
│   ├── unlock.js              # Two-tier unlock system
│   ├── progress.js            # Progress tracking (localStorage)
│   ├── search.js              # Full-text search
│   ├── quiz.js                # Quiz component
│   └── app.js                 # Main application logic
│
├── content/                   # Weekly module pages
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
├── assets/                    # Images and media
├── course_infographic.png     # Course visual overview
├── From_Abstraction_to_Architecture.pdf
└── How_Code_Becomes_a_Program.mp4
```

### Adding New Content

1. Create a new HTML file in `/content/` following the template
2. Add module entry in `/js/modules-data.js`
3. Update passwords if needed
4. Commit and push – GitHub Actions will deploy automatically

## 📖 Content Format

### Collapsible Sections

```html
<div class="section" id="section-unique-id">
  <div class="section-header" onclick="toggleSection('section-unique-id')">
    <h3 class="section-title">📌 Section Title</h3>
    <span class="section-toggle">▶</span>
  </div>
  <div class="section-content">
    <!-- Content here -->
  </div>
</div>
```

### Quizzes

```html
<div class="quiz" 
     data-correct="1" 
     data-quiz-id="q1" 
     data-module-id="week-01"
     data-explanation="Explanation shown after answering">
  <div class="quiz-question">Question text?</div>
  <div class="quiz-options">
    <div class="quiz-option" data-value="0">
      <div class="quiz-radio"></div>
      <span>Option A</span>
    </div>
    <div class="quiz-option" data-value="1">
      <div class="quiz-radio"></div>
      <span>Option B (correct)</span>
    </div>
  </div>
  <div class="quiz-feedback"></div>
</div>
```

### TA-Only Content Sections

Add hidden implementation hints that TAs can unlock:

```html
<!-- TA-Only: Implementation Hints -->
<div class="ta-only-content" id="ta-content-week-XX" data-content-id="week-XX-code">
    <div class="ta-only-header">
        <span>💡</span>
        Implementation Pseudocode
    </div>
    <pre><code>// Your pseudocode here</code></pre>
</div>
```

Then add the unlock check in the page's script:

```javascript
function checkTAContent() {
    if (window.UnlockSystem) {
        document.querySelectorAll('.ta-only-content').forEach(el => {
            if (UnlockSystem.isTAContentUnlocked(el.dataset.contentId)) {
                el.classList.add('unlocked');
            }
        });
    }
}
// Call on DOMContentLoaded
if (window.UnlockSystem) { UnlockSystem.init(); checkTAContent(); }
```

## 🎨 Customization

### Updating Passwords for Next Semester

Edit `/js/modules-data.js`:

```javascript
// Module passwords (students)
{
  id: 'week-05',
  password: 'NewPassword',  // Change this
}

// TA passwords
const TA_PASSWORDS = {
  'Lexer2026': 'week-05-code',  // Update year
  // ...
};
```

### Updating Theme Colors

Edit `/css/styles.css`:

```css
:root {
  --accent-primary: #0A84FF;  /* Change primary color */
  --accent-success: #30D158;  /* Progress/completed color */
}
```

## 📝 License

MIT License – Free to use and modify for educational purposes.

## 🙏 Credits

**Developed by [Ali Shehral](https://www.shehral.com)** – MSCS Align Student, Northeastern University

With AI pair programming assistance from **Claude** (Anthropic) and **Gemini** (Google DeepMind)

Based on the course content by **Dr. Lothar D Narins**

---

*Fall 2025 Edition*
