/**
 * CS5008 Guide - Progress Tracking System
 * Tracks user progress through modules, sections, and quizzes
 * All data persisted in localStorage
 */

const ProgressTracker = {
    STORAGE_KEY: 'cs5008_progress',

    /**
     * Default progress structure for a module
     */
    defaultModuleProgress: {
        visited: false,
        lastVisited: null,
        sectionsExpanded: [],
        sectionsCompleted: [],
        quizzesCompleted: [],
        quizScores: {},
        percentComplete: 0
    },

    /**
     * Initialize the progress tracker
     */
    init() {
        this.progress = this.loadProgress();
    },

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading progress:', e);
        }
        return {
            modules: {},
            lastModule: null,
            totalQuizzesCompleted: 0,
            startDate: new Date().toISOString()
        };
    },

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progress));
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    },

    /**
     * Get progress for a specific module
     */
    getModuleProgress(moduleId) {
        if (!this.progress.modules[moduleId]) {
            this.progress.modules[moduleId] = { ...this.defaultModuleProgress };
        }
        return this.progress.modules[moduleId];
    },

    /**
     * Mark a module as visited
     */
    visitModule(moduleId) {
        const moduleProgress = this.getModuleProgress(moduleId);
        moduleProgress.visited = true;
        moduleProgress.lastVisited = new Date().toISOString();
        this.progress.lastModule = moduleId;
        this.saveProgress();
    },

    /**
     * Record a section being expanded
     */
    expandSection(moduleId, sectionId) {
        const moduleProgress = this.getModuleProgress(moduleId);
        if (!moduleProgress.sectionsExpanded.includes(sectionId)) {
            moduleProgress.sectionsExpanded.push(sectionId);
            this.updateModuleCompletion(moduleId);
            this.saveProgress();
        }
    },

    /**
     * Mark a section as completed (user read it)
     */
    completeSection(moduleId, sectionId) {
        const moduleProgress = this.getModuleProgress(moduleId);
        if (!moduleProgress.sectionsCompleted.includes(sectionId)) {
            moduleProgress.sectionsCompleted.push(sectionId);
            this.updateModuleCompletion(moduleId);
            this.saveProgress();
        }
    },

    /**
     * Record a quiz completion
     */
    completeQuiz(moduleId, quizId, score, totalQuestions) {
        const moduleProgress = this.getModuleProgress(moduleId);

        if (!moduleProgress.quizzesCompleted.includes(quizId)) {
            moduleProgress.quizzesCompleted.push(quizId);
            this.progress.totalQuizzesCompleted++;
        }

        moduleProgress.quizScores[quizId] = {
            score,
            totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            completedAt: new Date().toISOString()
        };

        this.updateModuleCompletion(moduleId);
        this.saveProgress();
    },

    /**
     * Update module completion percentage
     */
    updateModuleCompletion(moduleId) {
        const moduleProgress = this.getModuleProgress(moduleId);
        const module = MODULES.find(m => m.id === moduleId);

        if (!module) return;

        // Simple heuristic: visited + some sections expanded = progress
        // This could be refined based on actual section count per module
        let progress = 0;

        if (moduleProgress.visited) progress += 20;
        if (moduleProgress.sectionsExpanded.length > 0) {
            progress += Math.min(40, moduleProgress.sectionsExpanded.length * 10);
        }
        if (moduleProgress.sectionsCompleted.length > 0) {
            progress += Math.min(30, moduleProgress.sectionsCompleted.length * 10);
        }
        if (moduleProgress.quizzesCompleted.length > 0) {
            progress += 10;
        }

        moduleProgress.percentComplete = Math.min(100, progress);
    },

    /**
     * Get the last visited module
     */
    getLastModule() {
        return this.progress.lastModule;
    },

    /**
     * Get overall course progress
     */
    getOverallProgress() {
        const unlockedModules = window.UnlockSystem ?
            window.UnlockSystem.getUnlockedModules() : [];

        if (unlockedModules.length === 0) return 0;

        let totalProgress = 0;
        let count = 0;

        unlockedModules.forEach(moduleId => {
            const moduleProgress = this.getModuleProgress(moduleId);
            totalProgress += moduleProgress.percentComplete;
            count++;
        });

        return count > 0 ? Math.round(totalProgress / count) : 0;
    },

    /**
     * Get count of completed modules (>= 80% progress)
     */
    getCompletedModulesCount() {
        let count = 0;
        Object.values(this.progress.modules).forEach(moduleProgress => {
            if (moduleProgress.percentComplete >= 80) {
                count++;
            }
        });
        return count;
    },

    /**
     * Check if a module is completed
     */
    isModuleCompleted(moduleId) {
        const moduleProgress = this.getModuleProgress(moduleId);
        return moduleProgress.percentComplete >= 80;
    },

    /**
     * Get modules sorted by last visited
     */
    getRecentModules(limit = 5) {
        const visitedModules = Object.entries(this.progress.modules)
            .filter(([_, progress]) => progress.visited && progress.lastVisited)
            .sort((a, b) => new Date(b[1].lastVisited) - new Date(a[1].lastVisited))
            .slice(0, limit)
            .map(([moduleId, _]) => moduleId);

        return visitedModules;
    },

    /**
     * Reset all progress (for testing)
     */
    reset() {
        this.progress = {
            modules: {},
            lastModule: null,
            totalQuizzesCompleted: 0,
            startDate: new Date().toISOString()
        };
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    ProgressTracker.init();
});

// Export
if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
}
