/**
 * CS5008 Guide - Search System
 * Full-text search across unlocked module content
 */

const SearchSystem = {
    searchIndex: [],
    isInitialized: false,
    isIndexing: false,

    /**
     * Initialize the search system
     */
    async init() {
        if (this.isInitialized || this.isIndexing) return;

        this.isIndexing = true;
        // Build search index from unlocked modules
        await this.buildIndex();
        this.isInitialized = true;
        this.isIndexing = false;
    },

    /**
     * Build the search index from module data and actual content
     */
    async buildIndex() {
        this.searchIndex = [];

        for (const module of MODULES) {
            // Only index unlocked modules
            if (!UnlockSystem.isModuleUnlocked(module.id)) continue;

            // Add module metadata
            this.searchIndex.push({
                type: 'module',
                moduleId: module.id,
                title: module.title,
                description: module.description,
                topics: module.topics,
                url: `content/${module.contentFile}`,
                searchText: `${module.title} ${module.description} ${module.topics.join(' ')}`.toLowerCase()
            });

            // Fetch and index actual content
            try {
                const content = await this.fetchModuleContent(module);
                if (content) {
                    // Index sections
                    content.sections.forEach(section => {
                        this.searchIndex.push({
                            type: 'section',
                            moduleId: module.id,
                            moduleTitle: module.title,
                            title: section.title,
                            content: section.content,
                            url: `content/${module.contentFile}#${section.id}`,
                            searchText: `${section.title} ${section.content}`.toLowerCase()
                        });
                    });

                    // Index code snippets
                    content.codeSnippets.forEach((snippet, index) => {
                        this.searchIndex.push({
                            type: 'code',
                            moduleId: module.id,
                            moduleTitle: module.title,
                            title: `Code snippet in ${module.title}`,
                            content: snippet,
                            url: `content/${module.contentFile}`,
                            searchText: snippet.toLowerCase()
                        });
                    });
                }
            } catch (error) {
                console.warn(`Failed to index content for ${module.id}:`, error);
            }
        }
    },

    /**
     * Fetch and parse module content from HTML file
     */
    async fetchModuleContent(module) {
        try {
            const response = await fetch(`content/${module.contentFile}`);
            if (!response.ok) return null;

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const sections = [];
            const codeSnippets = [];

            // Extract sections
            doc.querySelectorAll('.section').forEach(section => {
                const header = section.querySelector('.section-title');
                const content = section.querySelector('.section-content');

                if (header && content) {
                    const sectionId = section.id || '';
                    const title = header.textContent.trim();
                    const text = content.textContent.trim().substring(0, 500); // Limit length

                    sections.push({
                        id: sectionId,
                        title: title,
                        content: text
                    });
                }
            });

            // Extract code snippets
            doc.querySelectorAll('pre code, .code-block').forEach(code => {
                const snippet = code.textContent.trim();
                if (snippet.length > 10 && snippet.length < 500) {
                    codeSnippets.push(snippet);
                }
            });

            return { sections, codeSnippets };
        } catch (error) {
            console.error(`Error fetching ${module.contentFile}:`, error);
            return null;
        }
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
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);

        const results = [];

        this.searchIndex.forEach(item => {
            let score = 0;

            // Type-based relevance boosting
            const typeBoost = {
                'module': 3,
                'section': 2,
                'topic': 2,
                'code': 1
            };

            // Exact phrase match in title (highest priority)
            if (item.title && item.title.toLowerCase().includes(queryLower)) {
                score += 20 * (typeBoost[item.type] || 1);
            }

            // Exact phrase match in content
            if (item.content && item.content.toLowerCase().includes(queryLower)) {
                score += 15 * (typeBoost[item.type] || 1);
            }

            // Exact phrase match in search text
            if (item.searchText.includes(queryLower)) {
                score += 10 * (typeBoost[item.type] || 1);
            }

            // Individual word matches
            queryWords.forEach(word => {
                // Title matches
                if (item.title && item.title.toLowerCase().includes(word)) {
                    score += 5 * (typeBoost[item.type] || 1);
                }

                // Content matches
                if (item.content && item.content.toLowerCase().includes(word)) {
                    score += 3 * (typeBoost[item.type] || 1);
                }

                // General search text matches
                if (item.searchText.includes(word)) {
                    score += 2 * (typeBoost[item.type] || 1);
                }
            });

            if (score > 0) {
                results.push({
                    ...item,
                    score,
                    highlight: this.highlightMatches(item.title || item.content?.substring(0, 100) || '', queryWords)
                });
            }
        });

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        // Return top 15 results
        return results.slice(0, 15);
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
    async rebuildIndex() {
        this.isInitialized = false;
        await this.buildIndex();
        this.isInitialized = true;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.SearchSystem = SearchSystem;
}
