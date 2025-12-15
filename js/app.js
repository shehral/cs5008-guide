/**
 * CS5008 Guide - Main Application (v2 Creative)
 * Orchestrates all components with gamification elements
 */

const App = {
    XP_PER_MODULE: 100,

    /**
     * Initialize the application
     */
    init() {
        this.waitForSystems().then(() => {
            this.renderModuleGrid();
            this.updateStats();
            this.updateGamification();
            // setupThemeToggle is called separately before init
            this.setupSearch();
            this.setupContinueBanner();
            this.setupKeyboardShortcuts();
            this.setupTAUnlock();
        });
    },

    /**
     * Wait for dependent systems to initialize
     */
    waitForSystems() {
        return new Promise(resolve => {
            const check = () => {
                if (window.UnlockSystem && window.ProgressTracker && window.SearchSystem) {
                    UnlockSystem.init();
                    ProgressTracker.init();
                    SearchSystem.init();
                    resolve();
                } else {
                    setTimeout(check, 10);
                }
            };
            check();
        });
    },

    /**
     * Render the module grid with creative cards
     */
    renderModuleGrid() {
        const grid = document.getElementById('moduleGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Filter out foundation modules - they appear in Study Tools
        const weeklyModules = MODULES.filter(m => !m.isFoundation);

        weeklyModules.forEach((module, index) => {
            const card = this.createModuleCard(module, index);
            grid.appendChild(card);
        });
    },

    /**
     * Create a creative module card element
     */
    createModuleCard(module, index) {
        const isUnlocked = UnlockSystem.isModuleUnlocked(module.id);
        const isCompleted = ProgressTracker.isModuleCompleted(module.id);
        const progress = ProgressTracker.getModuleProgress(module.id);

        const card = document.createElement('div');
        card.className = `module-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}`;
        card.dataset.moduleId = module.id;
        card.style.animationDelay = `${index * 50}ms`;

        // Determine XP (completed modules show earned, others show potential)
        const xp = isCompleted ? this.XP_PER_MODULE : `+${this.XP_PER_MODULE}`;

        // Build tags HTML
        const tagsHtml = module.topics.slice(0, 3).map(topic =>
            `<span class="module-tag">${topic}</span>`
        ).join('');

        // Determine week label based on module type
        const weekLabel = module.isFoundation ? '📚 Foundation' :
            module.isAdvanced ? '🚀 Extra Credit' :
                `Week ${module.week}`;
        const moduleNumber = module.week || '📚';

        // Card content
        card.innerHTML = `
      <div class="module-number">${moduleNumber}</div>
      <div class="module-content">
        <div class="module-week">${weekLabel}</div>
        <h3 class="module-title">${module.title}</h3>
        <p class="module-description">${module.description}</p>
        <div class="module-tags">${tagsHtml}</div>
        <div class="module-meta">
          <span class="module-meta-item">⏱️ ${module.estimatedTime}</span>
          ${module.hasCodeContent ? '<span class="module-meta-item">💻 Code</span>' : ''}
          <span class="module-xp">${xp} XP</span>
        </div>
        ${isUnlocked ? `
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${progress.percentComplete}%"></div>
          </div>
        ` : ''}
      </div>
      ${!isUnlocked ? `
        <div class="lock-overlay">
          <div class="lock-icon">🔐</div>
          <input type="password" class="unlock-input" placeholder="Enter password" data-module="${module.id}">
          <button class="unlock-btn" data-module="${module.id}">Unlock Module</button>
          <div class="unlock-error" id="error-${module.id}">Incorrect password</div>
        </div>
      ` : ''}
    `;

        // Add click handlers
        if (isUnlocked) {
            card.addEventListener('click', () => {
                this.navigateToModule(module.id);
            });
        } else {
            // Handle unlock
            const input = card.querySelector('.unlock-input');
            const btn = card.querySelector('.unlock-btn');
            const error = card.querySelector('.unlock-error');

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleUnlock(module.id, input.value, error, card);
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.stopPropagation();
                    this.handleUnlock(module.id, input.value, error, card);
                }
            });

            input.addEventListener('click', (e) => e.stopPropagation());
        }

        return card;
    },

    /**
     * Handle module unlock attempt with celebration
     */
    handleUnlock(moduleId, password, errorEl, card) {
        const result = UnlockSystem.tryUnlock(moduleId, password);

        if (result.success) {
            // Success animation
            card.classList.remove('locked');
            card.classList.add('unlocked');
            card.style.animation = 'none';
            card.offsetHeight; // Trigger reflow
            card.style.animation = 'unlockCelebrate 0.6s ease-out';

            // Remove lock overlay
            const overlay = card.querySelector('.lock-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                overlay.style.transform = 'scale(1.1)';
                setTimeout(() => overlay.remove(), 300);
            }

            // Add module number with new style
            const moduleNum = card.querySelector('.module-number');
            if (moduleNum) {
                moduleNum.style.background = 'var(--gradient-secondary)';
            }

            // Add progress bar
            const progress = ProgressTracker.getModuleProgress(moduleId);
            const content = card.querySelector('.module-content');
            if (content && !content.querySelector('.progress-bar')) {
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.innerHTML = `<div class="progress-bar-fill" style="width: ${progress.percentComplete}%"></div>`;
                content.appendChild(progressBar);
            }

            // Add click handler
            card.addEventListener('click', () => {
                this.navigateToModule(moduleId);
            });

            // Update everything
            this.updateStats();
            this.updateGamification();
            SearchSystem.rebuildIndex();

            // Confetti effect (simple version)
            this.showConfetti();

        } else {
            // Show error with shake
            errorEl.classList.add('show');
            errorEl.textContent = result.message;
            card.style.animation = 'shake 0.5s ease-out';

            setTimeout(() => {
                card.style.animation = '';
                errorEl.classList.remove('show');
            }, 2500);
        }
    },

    /**
     * Simple confetti effect
     */
    showConfetti() {
        const confetti = ['🎉', '✨', '⚡', '🚀', '💫'];
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = confetti[Math.floor(Math.random() * confetti.length)];
                particle.style.cssText = `
          position: fixed;
          top: 50%;
          left: ${30 + Math.random() * 40}%;
          font-size: ${1 + Math.random()}rem;
          pointer-events: none;
          z-index: 1000;
          animation: confettiFall 1.5s ease-out forwards;
        `;
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 1500);
            }, i * 50);
        }
    },

    /**
     * Navigate to a module page
     */
    navigateToModule(moduleId) {
        const module = MODULES.find(m => m.id === moduleId);
        if (module && module.contentFile) {
            ProgressTracker.visitModule(moduleId);
            window.location.href = `content/${module.contentFile}`;
        }
    },

    /**
     * Update stats display
     */
    updateStats() {
        const completedEl = document.getElementById('modulesCompleted');
        const progressEl = document.getElementById('overallProgress');
        const totalXPEl = document.getElementById('totalXP');

        const completed = ProgressTracker.getCompletedModulesCount();
        const progress = ProgressTracker.getOverallProgress();
        const totalXP = completed * this.XP_PER_MODULE;

        if (completedEl) completedEl.textContent = completed;
        if (progressEl) progressEl.textContent = `${progress}%`;
        if (totalXPEl) totalXPEl.textContent = totalXP;
    },

    /**
     * Update gamification elements (XP badge, streak)
     */
    updateGamification() {
        const xpBadge = document.getElementById('xpBadge');
        const streakBadge = document.getElementById('streakBadge');

        const completed = ProgressTracker.getCompletedModulesCount();
        const totalXP = completed * this.XP_PER_MODULE;

        // Calculate streak (simplified - just count visited days)
        const streak = this.calculateStreak();

        if (xpBadge) xpBadge.textContent = `${totalXP} XP`;
        if (streakBadge) {
            streakBadge.textContent = streak === 1 ? '1 day' : `${streak} days`;
        }
    },

    /**
     * Calculate learning streak
     */
    calculateStreak() {
        const progress = ProgressTracker.progress;
        if (!progress.lastVisit) {
            progress.lastVisit = new Date().toISOString();
            progress.streak = 1;
            ProgressTracker.saveProgress();
            return 1;
        }

        const lastVisit = new Date(progress.lastVisit);
        const today = new Date();
        const diffDays = Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Same day
            return progress.streak || 1;
        } else if (diffDays === 1) {
            // Next day - increment streak
            progress.streak = (progress.streak || 0) + 1;
            progress.lastVisit = today.toISOString();
            ProgressTracker.saveProgress();
            return progress.streak;
        } else {
            // Streak broken
            progress.streak = 1;
            progress.lastVisit = today.toISOString();
            ProgressTracker.saveProgress();
            return 1;
        }
    },

    /**
     * Setup theme toggle
     */
    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;

        const savedTheme = localStorage.getItem('cs5008_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        toggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('cs5008_theme', next);
            toggle.textContent = next === 'dark' ? '🌙' : '☀️';
        });
    },

    /**
     * Setup search functionality
     */
    setupSearch() {
        const btn = document.getElementById('searchBtn');
        const backdrop = document.getElementById('searchBackdrop');
        const input = document.getElementById('searchInput');

        if (!btn || !backdrop || !input) return;

        btn.addEventListener('click', () => this.openSearch());

        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) this.closeSearch();
        });

        input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    },

    openSearch() {
        const backdrop = document.getElementById('searchBackdrop');
        const input = document.getElementById('searchInput');
        backdrop.classList.add('open');
        input.focus();
        input.value = '';
        this.handleSearch('');
    },

    closeSearch() {
        const backdrop = document.getElementById('searchBackdrop');
        backdrop.classList.remove('open');
    },

    handleSearch(query) {
        const resultsEl = document.getElementById('searchResults');
        if (!resultsEl) return;

        if (!query || query.length < 2) {
            resultsEl.innerHTML = '<div class="search-empty">Start typing to search across all unlocked content...</div>';
            return;
        }

        const searchResults = SearchSystem.search(query);

        if (searchResults.length === 0) {
            resultsEl.innerHTML = '<div class="search-empty">No results found 😕</div>';
            return;
        }

        resultsEl.innerHTML = searchResults.map(result => `
      <div class="search-result" data-module="${result.moduleId}">
        <div class="search-result-title">${result.highlight || result.title}</div>
        <div class="search-result-snippet">
          ${result.type === 'topic' ? `📚 ${result.moduleTitle}` : result.description || ''}
        </div>
      </div>
    `).join('');

        resultsEl.querySelectorAll('.search-result').forEach(el => {
            el.addEventListener('click', () => {
                this.closeSearch();
                this.navigateToModule(el.dataset.module);
            });
        });
    },

    /**
     * Setup continue banner
     */
    setupContinueBanner() {
        const banner = document.getElementById('continueBanner');
        const link = document.getElementById('continueLink');

        if (!banner || !link) return;

        const lastModuleId = ProgressTracker.getLastModule();
        if (!lastModuleId) return;

        const module = MODULES.find(m => m.id === lastModuleId);
        if (!module || !UnlockSystem.isModuleUnlocked(lastModuleId)) return;

        link.textContent = module.title;
        link.href = `content/${module.contentFile}`;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToModule(lastModuleId);
        });

        banner.style.display = 'flex';
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });
    },

    /**
     * Setup TA code unlock functionality
     */
    setupTAUnlock() {
        const input = document.getElementById('taCodeInput');
        const btn = document.getElementById('taUnlockBtn');
        const message = document.getElementById('taUnlockMessage');

        if (!input || !btn || !message) return;

        const handleUnlock = () => {
            const code = input.value.trim();
            if (!code) {
                message.textContent = 'Please enter a code';
                message.style.color = 'var(--accent-yellow)';
                return;
            }

            const result = UnlockSystem.tryUnlockTAContent(code);

            if (result.success) {
                message.textContent = `✅ ${result.message}`;
                message.style.color = 'var(--accent-green)';
                input.value = '';

                // Show which modules were unlocked
                if (result.unlockedContent.length > 0) {
                    const moduleNames = result.unlockedContent.map(id => {
                        const weekNum = id.replace('week-', '').replace('-code', '');
                        return `Week ${weekNum}`;
                    }).join(', ');
                    message.textContent += ` (${moduleNames})`;
                }
            } else {
                message.textContent = `❌ ${result.message}`;
                message.style.color = 'var(--accent-red)';
            }

            setTimeout(() => {
                message.textContent = '';
            }, 5000);
        };

        btn.addEventListener('click', handleUnlock);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUnlock();
        });
    }
};

// Add confetti animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes confettiFall {
    0% {
      opacity: 1;
      transform: translateY(0) rotate(0deg) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-200px) rotate(720deg) scale(0);
    }
  }
  
  @keyframes unlockCelebrate {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(16, 185, 129, 0.5); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Setup theme toggle immediately - don't wait for other systems
    App.setupThemeToggle();
    // Then init the rest which waits for other systems
    App.init();
});

if (typeof window !== 'undefined') {
    window.App = App;
}
