/**
 * CS5008 Guide - Quiz Component
 * Interactive self-check quizzes with immediate feedback
 */

const QuizEngine = {
    /**
     * Initialize all quizzes on the page
     */
    init() {
        document.querySelectorAll('.quiz').forEach(quiz => {
            this.setupQuiz(quiz);
        });
    },

    /**
     * Setup a single quiz element
     */
    setupQuiz(quizEl) {
        const options = quizEl.querySelectorAll('.quiz-option');
        const feedback = quizEl.querySelector('.quiz-feedback');
        const correctAnswer = quizEl.dataset.correct;
        const quizId = quizEl.dataset.quizId;
        const moduleId = quizEl.dataset.moduleId;

        let answered = false;

        options.forEach(option => {
            option.addEventListener('click', () => {
                if (answered) return;

                answered = true;
                const isCorrect = option.dataset.value === correctAnswer;

                // Mark selected
                option.classList.add('selected');

                // Show correct/incorrect
                if (isCorrect) {
                    option.classList.add('correct');
                    this.showFeedback(feedback, true, quizEl.dataset.explanation || 'Correct!');
                } else {
                    option.classList.add('incorrect');
                    // Highlight the correct answer
                    options.forEach(opt => {
                        if (opt.dataset.value === correctAnswer) {
                            opt.classList.add('correct');
                        }
                    });
                    this.showFeedback(feedback, false, quizEl.dataset.explanation || 'Incorrect. See the correct answer highlighted above.');
                }

                // Record progress
                if (window.ProgressTracker && moduleId && quizId) {
                    ProgressTracker.completeQuiz(moduleId, quizId, isCorrect ? 1 : 0, 1);
                }
            });
        });
    },

    /**
     * Show feedback message
     */
    showFeedback(feedbackEl, isCorrect, message) {
        if (!feedbackEl) return;

        feedbackEl.className = `quiz-feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackEl.innerHTML = `${isCorrect ? '✓' : '✗'} ${message}`;
    },

    /**
     * Create a quiz element from data
     */
    createQuizElement(data) {
        const quiz = document.createElement('div');
        quiz.className = 'quiz';
        quiz.dataset.correct = data.correct;
        quiz.dataset.quizId = data.id;
        quiz.dataset.moduleId = data.moduleId;
        quiz.dataset.explanation = data.explanation || '';

        quiz.innerHTML = `
      <div class="quiz-question">${data.question}</div>
      <div class="quiz-options">
        ${data.options.map((opt, i) => `
          <div class="quiz-option" data-value="${i}">
            <div class="quiz-radio"></div>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>
      <div class="quiz-feedback"></div>
    `;

        this.setupQuiz(quiz);
        return quiz;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    QuizEngine.init();
});

// Export
if (typeof window !== 'undefined') {
    window.QuizEngine = QuizEngine;
}
