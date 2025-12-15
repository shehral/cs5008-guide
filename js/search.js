/**
 * CS5008 Guide - Search System
 * Full-text search across unlocked module content
 */

const SearchSystem = {
    searchIndex: [],
    isInitialized: false,

    /**
     * Initialize the search system
     */
    init() {
        // Build search index from unlocked modules
        this.buildIndex();
        this.isInitialized = true;
    },

    /**
     * Build the search index from module data
     * In a full implementation, this would index actual content
     */
    buildIndex() {
        this.searchIndex = [];

        MODULES.forEach(module => {
            // Only index unlocked modules
            if (!UnlockSystem.isModuleUnlocked(module.id)) return;

            // Add module itself
            this.searchIndex.push({
                type: 'module',
                moduleId: module.id,
                title: module.title,
                description: module.description,
                topics: module.topics,
                searchText: `${module.title} ${module.description} ${module.topics.join(' ')}`.toLowerCase()
            });

            // Add topics as separate entries
            module.topics.forEach(topic => {
                this.searchIndex.push({
                    type: 'topic',
                    moduleId: module.id,
                    moduleTitle: module.title,
                    title: topic,
                    searchText: topic.toLowerCase()
                });
            });
        });
    },

    /**
     * Search for a query
     * Returns array of results with relevance scores
     */
    search(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const queryLower = query.toLowerCase().trim();
        const queryWords = queryLower.split(/\s+/);

        const results = [];

        this.searchIndex.forEach(item => {
            let score = 0;

            // Exact match in title
            if (item.title.toLowerCase().includes(queryLower)) {
                score += 10;
            }

            // Partial word matches
            queryWords.forEach(word => {
                if (item.searchText.includes(word)) {
                    score += 2;
                }
                if (item.title.toLowerCase().includes(word)) {
                    score += 3;
                }
            });

            if (score > 0) {
                results.push({
                    ...item,
                    score,
                    highlight: this.highlightMatches(item.title, queryWords)
                });
            }
        });

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        // Return top 10 results
        return results.slice(0, 10);
    },

    /**
     * Highlight matching words in text
     */
    highlightMatches(text, queryWords) {
        let result = text;
        queryWords.forEach(word => {
            const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
            result = result.replace(regex, '<mark>$1</mark>');
        });
        return result;
    },

    /**
     * Escape special regex characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Rebuild index when modules are unlocked
     */
    rebuildIndex() {
        this.buildIndex();
    }
};

// Export
if (typeof window !== 'undefined') {
    window.SearchSystem = SearchSystem;
}
