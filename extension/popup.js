/**
 * CS5008 AI Tutor Chrome Extension
 * Popup script
 */

let isInitialized = false;

async function init() {
    try {
        updateStatus('loading', 'Initializing unlock system...');

        // Initialize unlock system
        UnlockSystem.init();

        // Fix for class vs instance issue
        if (typeof window.ContentIndexer === 'function') {
            window.ContentIndexer = new window.ContentIndexer();
        }
        if (typeof window.ChatbotEngine === 'function') {
            window.ChatbotEngine = new window.ChatbotEngine();
        }

        // Build content index
        updateStatus('loading', 'Indexing course content...');
        await window.ContentIndexer.buildIndex();

        const stats = window.ContentIndexer.getStats();
        console.log('✓ Index stats:', stats);

        // Initialize chatbot engine
        updateStatus('loading', 'Loading AI model...');
        await window.ChatbotEngine.init();

        // Ready
        updateStatus('ready', 'Ready to help!');
        document.getElementById('sendBtn').disabled = false;
        document.getElementById('input').focus();
        isInitialized = true;

    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus('error', 'Failed to initialize');

        // Show error message
        addMessage('assistant', `Sorry, I couldn't initialize.\n\n${error.message}`);
    }
}

function updateStatus(state, text) {
    const dot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    dot.className = 'status-dot ' + state;
    statusText.textContent = text;
}

function addMessage(role, content, citations = []) {
    const messagesDiv = document.getElementById('messages');

    // Remove intro if present
    const intro = document.getElementById('intro');
    if (intro) intro.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const icon = role === 'user' ? '👤' : '🤖';
    const name = role === 'user' ? 'You' : 'Tutor';

    let html = `
        <div class="message-header">
            <span>${icon}</span>
            <span>${name}</span>
        </div>
        <div>${escapeHtml(content)}</div>
    `;

    if (citations && citations.length > 0) {
        html += `
            <div class="citations">
                📚 Sources:
                ${citations.map(c =>
                    `<a href="${c.url}" class="citation-link" target="_blank" title="${escapeHtml(c.text)}">${escapeHtml(c.text.substring(0, 30))}...</a>`
                ).join('')}
            </div>
        `;
    }

    messageDiv.innerHTML = html;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addLoadingMessage() {
    const messagesDiv = document.getElementById('messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.id = 'loadingMessage';
    loadingDiv.innerHTML = `
        <div class="message-header">
            <span>🤖</span>
            <span>Tutor</span>
        </div>
        <div class="loading-dots">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;
    messagesDiv.appendChild(loadingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeLoadingMessage() {
    const loading = document.getElementById('loadingMessage');
    if (loading) loading.remove();
}

async function sendMessage() {
    const input = document.getElementById('input');
    const question = input.value.trim();

    if (!question || !isInitialized) return;

    // Disable input
    input.disabled = true;
    document.getElementById('sendBtn').disabled = true;

    // Add user message
    addMessage('user', question);
    input.value = '';
    input.style.height = 'auto';

    // Show loading
    addLoadingMessage();

    try {
        // Get answer from chatbot
        const result = await window.ChatbotEngine.askQuestion(question);

        // Remove loading
        removeLoadingMessage();

        // Add assistant message
        addMessage('assistant', result.answer, result.citations);

    } catch (error) {
        removeLoadingMessage();
        addMessage('assistant', `Sorry, I encountered an error: ${error.message}`);
    } finally {
        // Re-enable input
        input.disabled = false;
        document.getElementById('sendBtn').disabled = false;
        input.focus();
    }
}

function askExample(element) {
    const question = element.querySelector('p').textContent.trim();
    document.getElementById('input').value = question;
    sendMessage();
}

// Event listeners
document.getElementById('sendBtn').addEventListener('click', sendMessage);

document.getElementById('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea
document.getElementById('input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
});

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
