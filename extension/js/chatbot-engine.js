/**
 * Chatbot Engine for CS5008 AI Tutor
 * Integrates Chrome's Gemini Nano with RAG pipeline
 */

class ChatbotEngine {
  constructor() {
    this.session = null;
    this.isReady = false;
    this.conversationHistory = [];
    this.errorMessage = null;
  }

  /**
   * Initialize the chatbot engine with Gemini Nano
   */
  async init() {
    try {
      // Check if Prompt API is available
      if (!window.ai || !window.ai.languageModel) {
        throw new Error(
          'Prompt API not available. Please enable it in chrome://flags:\n' +
          '1. chrome://flags/#optimization-guide-on-device-model → Enabled\n' +
          '2. chrome://flags/#prompt-api-for-gemini-nano → Enabled\n' +
          '3. Restart Chrome'
        );
      }

      // Check capabilities
      const capabilities = await ai.languageModel.capabilities();

      if (capabilities.available === 'no') {
        throw new Error(
          'Gemini Nano is not available on this device. ' +
          'You may need Chrome 138+ or sufficient disk space (22GB required).'
        );
      }

      if (capabilities.available === 'after-download') {
        console.log('Gemini Nano model is downloading... This may take a few minutes (1-2GB)');
        // Model will download in background, session creation will wait for it
      }

      console.log('Gemini Nano capabilities:', capabilities);

      // Create session with system prompt
      this.session = await ai.languageModel.create({
        systemPrompt: this.getSystemPrompt(),
        temperature: 0.3, // Low temperature for factual, consistent answers
        topK: 3
      });

      this.isReady = true;
      console.log('✓ Chatbot engine initialized successfully');

    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      this.errorMessage = error.message;
      throw error;
    }
  }

  /**
   * Get system prompt with anti-cheat guardrails
   */
  getSystemPrompt() {
    return `You are a CS5008 course tutor at Northeastern University. Your role is to help students understand concepts from the Data Structures, Algorithms, and Computer Systems course.

STRICT RULES:
1. ONLY use information from the "Context" sections provided below in each query
2. If the question cannot be answered from the context, respond with: "I don't have information about that in your unlocked course modules. This topic might be covered in a module you haven't unlocked yet."
3. Always cite your sources using the format: [Module Name, Section Title]
4. NEVER provide complete code solutions for homework-style questions
5. When you detect homework/implementation questions (e.g., "write a function that...", "implement...", "complete the code...", "what is the output of..."):
   - Explain the underlying concept instead
   - Provide hints and general approach, NOT full solutions
   - Give pseudocode or conceptual steps, NOT working code
   - Suggest which course section to review
   - Example response: "This appears to be an implementation question. Instead of providing the solution, let me explain the concept: [explanation]. Key steps to consider: 1) [hint], 2) [hint]. Review the [Section Name] for more details."

RESPONSE FORMAT:
- Be concise and clear (2-4 paragraphs maximum)
- Use the student's course materials to guide explanations
- Focus on "why" and "how things work" rather than just "what"
- Include relevant terminology from the course
- Always end with a source citation

EXAMPLE GOOD RESPONSES:

Question: "How does pointer arithmetic work in C?"
Answer: "In C, pointer arithmetic allows you to navigate through memory efficiently. When you add 1 to an int pointer, it actually advances the pointer by sizeof(int) bytes (typically 4 bytes), moving it to the next integer in memory. This is why p+1 points to the next array element, not just one byte ahead. [Week 2: Intro to C, Pointers Section]"

Question: "Write a function to reverse a linked list"
Answer: "This appears to be an implementation question. Instead of providing code, let me explain the concept: You need to reverse the direction of all 'next' pointers in the list. Key steps: (1) Track the current, previous, and next nodes, (2) For each node, reverse its 'next' pointer to point to the previous node, (3) Move all three tracking pointers forward. Try working through a 3-node example on paper first. Review [Data Structures, Linked Lists] for the foundational concepts. [Week 6: Parser & AST, Data Structure Implementation]"

Question: "What's the difference between stack and heap memory?"
Answer: "The stack is automatically managed memory used for local variables and function calls. It's fast but limited in size and follows LIFO (Last In, First Out) order. The heap is manually managed memory (using malloc/free) for dynamic allocation. It's larger and more flexible but slower, and you're responsible for cleanup to avoid memory leaks. Stack variables are automatically cleaned up when functions return, while heap memory persists until you explicitly free it. [Memory & Pointers, Memory Management Section]"

Remember: Your goal is to teach concepts and guide learning, not to solve homework problems.`;
  }

  /**
   * Ask a question to the chatbot
   * @param {string} question - User's question
   * @returns {Object} { answer, citations }
   */
  async askQuestion(question) {
    if (!this.isReady) {
      throw new Error('Chatbot not initialized. Call init() first.');
    }

    try {
      // 1. Retrieve relevant content from course materials
      const chunks = ContentIndexer.search(question, 5);

      if (chunks.length === 0) {
        return {
          answer: "I don't have information about that in your unlocked course modules. This topic might be in a module you haven't unlocked yet, or it might not be covered in the course materials.",
          citations: []
        };
      }

      // 2. Build context with citations
      const context = chunks.map((chunk, i) => {
        const source = `Source ${i + 1}: ${chunk.citation}`;
        const content = chunk.content.substring(0, 800); // Limit context size
        return `[${source}]\n${content}`;
      }).join('\n\n---\n\n');

      // 3. Build prompt
      const prompt = `Context from course materials:\n\n${context}\n\n---\n\nStudent Question: ${question}\n\nProvide a helpful answer based ONLY on the context above. Remember to cite sources and follow the anti-cheat rules for implementation questions.`;

      console.log('Sending prompt to Gemini Nano...');

      // 4. Generate answer using Gemini Nano
      const response = await this.session.prompt(prompt);

      console.log('✓ Received response from Gemini Nano');

      // 5. Extract unique citations
      const citations = chunks.map(c => ({
        text: c.citation,
        url: c.url,
        moduleId: c.moduleId
      }));

      // Remove duplicate citations
      const uniqueCitations = citations.filter((c, i, arr) =>
        arr.findIndex(x => x.text === c.text) === i
      );

      // 6. Store in conversation history
      this.conversationHistory.push({
        question,
        answer: response,
        citations: uniqueCitations,
        timestamp: new Date(),
        chunksUsed: chunks.length
      });

      return {
        answer: response,
        citations: uniqueCitations
      };

    } catch (error) {
      console.error('Error generating answer:', error);

      // Provide helpful error messages
      if (error.message.includes('quota')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message.includes('session')) {
        throw new Error('Session expired. Please refresh the page.');
      } else {
        throw new Error(`Failed to generate answer: ${error.message}`);
      }
    }
  }

  /**
   * Reset conversation and create new session
   */
  async reset() {
    console.log('Resetting conversation...');

    if (this.session) {
      try {
        this.session.destroy();
      } catch (error) {
        console.warn('Error destroying session:', error);
      }
    }

    this.conversationHistory = [];
    this.session = null;
    this.isReady = false;

    // Re-initialize
    await this.init();
  }

  /**
   * Get conversation history
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Get statistics about the chatbot
   */
  getStats() {
    const totalQuestions = this.conversationHistory.length;
    const avgChunksUsed = totalQuestions > 0
      ? this.conversationHistory.reduce((sum, h) => sum + h.chunksUsed, 0) / totalQuestions
      : 0;

    return {
      isReady: this.isReady,
      totalQuestions,
      avgChunksUsed: avgChunksUsed.toFixed(1),
      hasError: !!this.errorMessage,
      errorMessage: this.errorMessage
    };
  }

  /**
   * Check if Prompt API is supported
   */
  static async isSupported() {
    if (!window.ai || !window.ai.languageModel) {
      return {
        supported: false,
        reason: 'Prompt API not available in this browser'
      };
    }

    try {
      const capabilities = await ai.languageModel.capabilities();

      if (capabilities.available === 'no') {
        return {
          supported: false,
          reason: 'Gemini Nano not available on this device'
        };
      }

      return {
        supported: true,
        needsDownload: capabilities.available === 'after-download',
        capabilities
      };
    } catch (error) {
      return {
        supported: false,
        reason: error.message
      };
    }
  }
}

// Export singleton instance
window.ChatbotEngine = new ChatbotEngine();
