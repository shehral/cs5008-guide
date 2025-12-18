/**
 * Content Script for CS5008 AI Tutor Extension
 * Reads unlock state from website's localStorage and syncs to extension
 */

// Listen for requests from the popup to get unlock state
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getUnlockState') {
    try {
      // Read unlock state from website's localStorage
      const unlockedModules = localStorage.getItem('cs5008_unlocked_modules');
      const taUnlocked = localStorage.getItem('cs5008_ta_unlocked');

      sendResponse({
        success: true,
        unlockedModules: unlockedModules ? JSON.parse(unlockedModules) : [],
        taUnlocked: taUnlocked ? JSON.parse(taUnlocked) : []
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  return true; // Keep channel open for async response
});

console.log('CS5008 AI Tutor: Content script loaded');
