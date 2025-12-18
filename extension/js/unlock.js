/**
 * CS5008 Guide - Unlock System
 * Handles password-based content unlocking with two tiers:
 * 1. Weekly content (concepts, practice questions)
 * 2. TA-discretion content (code snippets, solutions)
 */

const UnlockSystem = {
    STORAGE_KEY: 'cs5008_unlocked_modules',
    TA_STORAGE_KEY: 'cs5008_ta_unlocked',

    /**
     * Initialize the unlock system
     */
    async init() {
        // Check if in extension context and need async load
        if (typeof chrome !== 'undefined' && chrome.storage) {
            try {
                const result = await chrome.storage.local.get([this.STORAGE_KEY, this.TA_STORAGE_KEY]);
                this.unlockedModules = result[this.STORAGE_KEY] || [];
                this.taUnlocked = result[this.TA_STORAGE_KEY] || [];
                console.log('Loaded unlock state from chrome.storage:', {
                    modules: this.unlockedModules.length,
                    taContent: this.taUnlocked.length
                });
            } catch (e) {
                console.error('Error loading from chrome.storage:', e);
                this.unlockedModules = [];
                this.taUnlocked = [];
            }
        } else {
            // Web context - use sync load
            this.unlockedModules = this.loadUnlockedModules();
            this.taUnlocked = this.loadTAUnlocked();
        }
    },

    /**
     * Load unlocked modules from chrome.storage (extension) or localStorage (web)
     */
    loadUnlockedModules() {
        try {
            // Check if chrome.storage is available (extension context)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                // Return empty for now, will be loaded async in init()
                return [];
            }
            // Fallback to localStorage (web context)
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading unlocked modules:', e);
            return [];
        }
    },

    /**
     * Load TA-unlocked content from chrome.storage (extension) or localStorage (web)
     */
    loadTAUnlocked() {
        try {
            // Check if chrome.storage is available (extension context)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                // Return empty for now, will be loaded async in init()
                return [];
            }
            // Fallback to localStorage (web context)
            const stored = localStorage.getItem(this.TA_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading TA unlocked content:', e);
            return [];
        }
    },

    /**
     * Save unlocked modules to chrome.storage (extension) or localStorage (web)
     */
    async saveUnlockedModules() {
        try {
            // Check if chrome.storage is available (extension context)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({
                    [this.STORAGE_KEY]: this.unlockedModules
                });
                return;
            }
            // Fallback to localStorage (web context)
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.unlockedModules));
        } catch (e) {
            console.error('Error saving unlocked modules:', e);
        }
    },

    /**
     * Save TA-unlocked content to chrome.storage (extension) or localStorage (web)
     */
    async saveTAUnlocked() {
        try {
            // Check if chrome.storage is available (extension context)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({
                    [this.TA_STORAGE_KEY]: this.taUnlocked
                });
                return;
            }
            // Fallback to localStorage (web context)
            localStorage.setItem(this.TA_STORAGE_KEY, JSON.stringify(this.taUnlocked));
        } catch (e) {
            console.error('Error saving TA unlocked content:', e);
        }
    },

    /**
     * Check if a module is unlocked
     */
    isModuleUnlocked(moduleId) {
        const module = MODULES.find(m => m.id === moduleId);
        if (!module) return false;

        // Default unlocked modules are always accessible
        if (module.defaultUnlocked) return true;

        return this.unlockedModules.includes(moduleId);
    },

    /**
     * Check if TA content is unlocked for a module
     */
    isTAContentUnlocked(contentId) {
        return this.taUnlocked.includes(contentId);
    },

    /**
     * Try to unlock a module with a password
     * Returns { success: boolean, message: string }
     */
    tryUnlock(moduleId, password) {
        const module = MODULES.find(m => m.id === moduleId);

        if (!module) {
            return { success: false, message: 'Module not found' };
        }

        if (module.defaultUnlocked || this.isModuleUnlocked(moduleId)) {
            return { success: true, message: 'Module already unlocked' };
        }

        // Check if password matches
        if (module.password && password === module.password) {
            this.unlockedModules.push(moduleId);
            this.saveUnlockedModules();

            // Rebuild chatbot content index if available
            if (window.ContentIndexer && window.ContentIndexer.isIndexed) {
                console.log('Rebuilding content index after module unlock...');
                window.ContentIndexer.rebuildIndex().catch(err => {
                    console.error('Failed to rebuild content index:', err);
                });
            }

            return { success: true, message: 'Module unlocked!' };
        }

        return { success: false, message: 'Incorrect password' };
    },

    /**
     * Try to unlock TA content with a password
     * Returns { success: boolean, message: string, unlockedContent: string[] }
     */
    tryUnlockTAContent(password) {
        if (TA_PASSWORDS[password]) {
            const contentIds = TA_PASSWORDS[password];
            let newlyUnlocked = [];

            contentIds.forEach(contentId => {
                if (!this.taUnlocked.includes(contentId)) {
                    this.taUnlocked.push(contentId);
                    newlyUnlocked.push(contentId);
                }
            });

            if (newlyUnlocked.length > 0) {
                this.saveTAUnlocked();
                return {
                    success: true,
                    message: `Unlocked ${newlyUnlocked.length} code section(s)!`,
                    unlockedContent: newlyUnlocked
                };
            } else {
                return {
                    success: true,
                    message: 'Content already unlocked',
                    unlockedContent: []
                };
            }
        }

        return { success: false, message: 'Invalid TA code', unlockedContent: [] };
    },

    /**
     * Get all unlocked module IDs
     */
    getUnlockedModules() {
        // Combine default unlocked with user-unlocked
        const defaultUnlocked = MODULES
            .filter(m => m.defaultUnlocked)
            .map(m => m.id);

        return [...new Set([...defaultUnlocked, ...this.unlockedModules])];
    },

    /**
     * Get count of unlocked modules
     */
    getUnlockedCount() {
        return this.getUnlockedModules().length;
    },

    /**
     * Reset all unlock progress (for testing)
     */
    reset() {
        this.unlockedModules = [];
        this.taUnlocked = [];
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.TA_STORAGE_KEY);
    },

    /**
     * Navigate to a module, prompting for password if locked
     * @param {string} moduleId - The module ID (e.g., 'week-02')
     * @param {string} url - The URL to navigate to
     */
    navigateToModule(moduleId, url) {
        if (this.isModuleUnlocked(moduleId)) {
            window.location.href = url;
            return;
        }

        // Show password prompt
        const password = prompt(`🔒 Module "${moduleId}" is locked.\n\nEnter password to unlock:`);

        if (password === null) {
            // User cancelled
            return;
        }

        const result = this.tryUnlock(moduleId, password);

        if (result.success) {
            alert('✅ ' + result.message);
            window.location.href = url;
        } else {
            alert('❌ ' + result.message);
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    UnlockSystem.init();

    // Keyboard navigation for module pages
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Escape key to close modals
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.active, .search-modal.active');
            if (modal) {
                modal.classList.remove('active');
            }
            return;
        }

        // Arrow keys for module navigation
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            // Find current module from URL or page data
            const path = window.location.pathname;
            const match = path.match(/week-(\d+)/);
            if (!match) return;

            const currentWeek = parseInt(match[1]);
            let targetWeek;

            if (e.key === 'ArrowLeft' && currentWeek > 1) {
                targetWeek = currentWeek - 1;
            } else if (e.key === 'ArrowRight' && currentWeek < 15) {
                targetWeek = currentWeek + 1;
            } else {
                return;
            }

            // Find the module and navigate
            const weekStr = targetWeek.toString().padStart(2, '0');
            const moduleId = `week-${weekStr}`;
            const module = typeof MODULES !== 'undefined' ?
                MODULES.find(m => m.id === moduleId) : null;

            if (module && module.contentFile) {
                e.preventDefault();
                UnlockSystem.navigateToModule(moduleId, module.contentFile);
            }
        }
    });
});

// Export
if (typeof window !== 'undefined') {
    window.UnlockSystem = UnlockSystem;
}
