/**
 * Content Indexer for CS5008 AI Chatbot
 * Builds a searchable index of course content from unlocked modules
 */

class ContentIndexer {
  constructor() {
    this.index = [];
    this.isIndexed = false;
  }

  /**
   * Build searchable index from all unlocked modules
   */
  async buildIndex() {
    console.log('Building content index...');

    // Get unlocked modules only
    const unlockedModules = MODULES.filter(m =>
      UnlockSystem.isModuleUnlocked(m.id)
    );

    console.log(`Indexing ${unlockedModules.length} unlocked modules...`);

    for (const module of unlockedModules) {
      try {
        // Fetch HTML content
        const response = await fetch(`content/${module.contentFile}`);
        if (!response.ok) {
          console.warn(`Failed to fetch ${module.contentFile}`);
          continue;
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract sections
        doc.querySelectorAll('.section').forEach(section => {
          const titleEl = section.querySelector('.section-title');
          const contentEl = section.querySelector('.section-content');

          if (titleEl && contentEl) {
            const sectionId = section.id || '';
            const sectionTitle = this.cleanText(titleEl.textContent);
            const content = this.cleanText(contentEl.textContent);

            // Chunk large sections (max 2000 chars ~= 500 tokens)
            const chunks = this.chunkText(content, 2000);

            chunks.forEach((chunk, i) => {
              this.index.push({
                moduleId: module.id,
                moduleTitle: module.title,
                sectionId,
                sectionTitle,
                content: chunk,
                citation: `${module.title}, Section: ${sectionTitle}`,
                url: `/content/${module.contentFile}#${sectionId}`,
                keywords: this.extractKeywords(chunk + ' ' + sectionTitle),
                type: 'section'
              });
            });
          }
        });

        // Also index code blocks separately
        doc.querySelectorAll('pre code').forEach((code, i) => {
          const codeContent = code.textContent.trim();
          if (codeContent.length > 10) { // Skip trivial code snippets
            this.index.push({
              moduleId: module.id,
              moduleTitle: module.title,
              type: 'code',
              content: codeContent,
              citation: `${module.title}, Code Example`,
              url: `/content/${module.contentFile}`,
              keywords: this.extractKeywords(codeContent)
            });
          }
        });

      } catch (error) {
        console.error(`Error indexing ${module.contentFile}:`, error);
      }
    }

    this.isIndexed = true;
    console.log(`✓ Indexed ${this.index.length} chunks from ${unlockedModules.length} modules`);
  }

  /**
   * Clean text by removing extra whitespace and normalizing
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?()-]/g, '')
      .trim();
  }

  /**
   * Chunk text into smaller pieces
   */
  chunkText(text, maxLength) {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';

    for (const para of paragraphs) {
      if ((currentChunk + para).length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        // If single paragraph is too long, split by sentences
        if (para.length > maxLength) {
          const sentences = para.split(/\. /);
          let sentenceChunk = '';
          for (const sentence of sentences) {
            if ((sentenceChunk + sentence).length > maxLength) {
              if (sentenceChunk) chunks.push(sentenceChunk.trim());
              sentenceChunk = sentence + '. ';
            } else {
              sentenceChunk += sentence + '. ';
            }
          }
          if (sentenceChunk) chunks.push(sentenceChunk.trim());
          currentChunk = '';
        } else {
          currentChunk = para;
        }
      } else {
        currentChunk += '\n\n' + para;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(c => c.length > 0);
  }

  /**
   * Extract keywords from text for better matching
   */
  extractKeywords(text) {
    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'it', 'its', 'as', 'by', 'from', 'up', 'about', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'between', 'under'
    ]);

    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .filter((w, i, arr) => arr.indexOf(w) === i); // Remove duplicates
  }

  /**
   * Search index for relevant content
   * @param {string} query - Search query
   * @param {number} topK - Number of results to return
   * @returns {Array} Top K matching chunks with scores
   */
  search(query, topK = 5) {
    if (!this.isIndexed || this.index.length === 0) {
      console.warn('Index not built yet');
      return [];
    }

    const queryWords = this.extractKeywords(query.toLowerCase());

    if (queryWords.length === 0) {
      return [];
    }

    // Score each chunk
    const scored = this.index.map(chunk => {
      let score = 0;

      // Keyword matching
      queryWords.forEach(word => {
        // Exact keyword match (high score)
        if (chunk.keywords.includes(word)) {
          score += 3;
        }

        // Content contains word (medium score)
        if (chunk.content.toLowerCase().includes(word)) {
          score += 2;
        }

        // Section title contains word (highest score)
        if (chunk.sectionTitle && chunk.sectionTitle.toLowerCase().includes(word)) {
          score += 5;
        }

        // Module title contains word (high score)
        if (chunk.moduleTitle.toLowerCase().includes(word)) {
          score += 4;
        }
      });

      // Boost for code if query contains code-like patterns
      if (chunk.type === 'code') {
        const codeKeywords = /\b(code|function|variable|pointer|struct|array|implementation|syntax)\b/i;
        if (codeKeywords.test(query)) {
          score *= 1.5;
        }
      }

      // Boost for section content (more comprehensive than code snippets)
      if (chunk.type === 'section') {
        score *= 1.2;
      }

      return { ...chunk, score };
    });

    // Filter out zero scores and sort by score
    const results = scored
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    console.log(`Search for "${query}" found ${results.length} results`);

    return results;
  }

  /**
   * Rebuild index (call when modules are unlocked)
   */
  async rebuildIndex() {
    console.log('Rebuilding index...');
    this.index = [];
    this.isIndexed = false;
    await this.buildIndex();
  }

  /**
   * Get stats about the index
   */
  getStats() {
    const moduleCount = new Set(this.index.map(c => c.moduleId)).size;
    const sectionCount = this.index.filter(c => c.type === 'section').length;
    const codeCount = this.index.filter(c => c.type === 'code').length;

    return {
      totalChunks: this.index.length,
      modules: moduleCount,
      sections: sectionCount,
      codeBlocks: codeCount,
      isIndexed: this.isIndexed
    };
  }
}

// Export singleton instance
window.ContentIndexer = new ContentIndexer();
