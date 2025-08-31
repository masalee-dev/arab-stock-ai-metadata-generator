// Arab Stock AI Metadata Generator - Background Service Worker
// Handles extension lifecycle and cross-tab communication

class BackgroundService {
    constructor() {
        this.init();
    }

    init() {
        this.setupInstallListener();
        this.setupMessageHandlers();
        this.setupContextMenus();
        this.setupActionHandler();
    }

    setupInstallListener() {
        chrome.runtime.onInstalled.addListener((details) => {
            console.log('Arab Stock AI Metadata Generator installed!', details);
            
            if (details.reason === 'install') {
                this.showWelcomeNotification();
                this.openWelcomePage();
            } else if (details.reason === 'update') {
                this.showUpdateNotification(details);
            }
        });
    }

    setupMessageHandlers() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('Background received message:', message);
            
            switch (message.action) {
                case 'openPopup':
                    this.handleOpenPopup(message, sender);
                    break;
                    
                case 'generateMetadata':
                    this.handleGenerateMetadata(message, sendResponse);
                    return true; // Keep message channel open for async response
                    
                case 'saveSettings':
                    this.handleSaveSettings(message, sendResponse);
                    break;
                    
                case 'getSettings':
                    this.handleGetSettings(sendResponse);
                    return true;
                    
                case 'autoFill':
                    this.handleAutoFill(message, sender, sendResponse);
                    return true;
                    
                case 'trackUsage':
                    this.trackUsage(message.data);
                    break;
                    
                default:
                    console.log('Unknown message action:', message.action);
            }
        });
    }

    setupContextMenus() {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'generateMetadata',
                title: '🤖 Generate AI Metadata',
                contexts: ['image'],
                documentUrlPatterns: ['https://contributor.arabsstock.com/*']
            });

            chrome.contextMenus.create({
                id: 'openGenerator',
                title: '✨ Open Arab Stock AI Generator',
                contexts: ['page'],
                documentUrlPatterns: ['https://contributor.arabsstock.com/*']
            });
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === 'generateMetadata') {
                this.handleContextMenuGenerate(info, tab);
            } else if (info.menuItemId === 'openGenerator') {
                chrome.action.openPopup();
            }
        });
    }

    setupActionHandler() {
        chrome.action.onClicked.addListener((tab) => {
            console.log('Extension action clicked on tab:', tab.url);
            // The popup will open automatically due to manifest configuration
        });
    }

    async handleOpenPopup(message, sender) {
        try {
            // Store the source tab information
            await chrome.storage.local.set({
                sourceTab: {
                    id: sender.tab.id,
                    url: sender.tab.url,
                    title: sender.tab.title
                }
            });
            
            console.log('Stored source tab info for popup');
        } catch (error) {
            console.error('Error storing source tab info:', error);
        }
    }

    async handleGenerateMetadata(message, sendResponse) {
        try {
            console.log('Handling metadata generation request');
            
            // Here you could implement server-side metadata generation
            // or proxy the AI API calls to avoid CORS issues
            
            const result = {
                success: true,
                message: 'Metadata generation request processed'
            };
            
            sendResponse(result);
        } catch (error) {
            console.error('Error handling metadata generation:', error);
            sendResponse({
                success: false,
                error: error.message
            });
        }
    }

    async handleSaveSettings(message, sendResponse) {
        try {
            await chrome.storage.local.set(message.settings);
            sendResponse({ success: true });
        } catch (error) {
            console.error('Error saving settings:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async handleGetSettings(sendResponse) {
        try {
            const settings = await chrome.storage.local.get([
                'apiKey', 'aiProvider', 'category', 'mood', 'description',
                'autoFillEnabled', 'notificationsEnabled'
            ]);
            sendResponse({ success: true, settings });
        } catch (error) {
            console.error('Error getting settings:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async handleAutoFill(message, sender, sendResponse) {
        try {
            const tabId = message.tabId || sender.tab.id;
            
            // Execute the auto-fill content script
            const results = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: this.autoFillFunction,
                args: [message.metadata]
            });
            
            sendResponse({ 
                success: true, 
                result: results[0].result 
            });
            
        } catch (error) {
            console.error('Error during auto-fill:', error);
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // Function to be injected for auto-fill
    autoFillFunction(metadata) {
        const fillResults = {
            fieldsFound: 0,
            fieldsFilled: 0,
            errors: []
        };

        try {
            // Title fields
            const titleSelectors = [
                'input[name*="title"]:not([name*="ar"])',
                'input[placeholder*="title"]:not([placeholder*="عنوان"])',
                '.title input',
                '[data-field="title"] input'
            ];

            const titleArSelectors = [
                'input[name*="title_ar"]',
                'input[placeholder*="عنوان"]',
                '.title-ar input'
            ];

            // Keyword fields
            const keywordSelectors = [
                'textarea[name*="keywords"]:not([name*="ar"])',
                'textarea[placeholder*="keywords"]:not([placeholder*="كلمات"])',
                '.keywords textarea'
            ];

            const keywordArSelectors = [
                'textarea[name*="keywords_ar"]',
                'textarea[placeholder*="كلمات"]',
                '.keywords-ar textarea'
            ];

            // Fill English title
            const titleField = this.findFirstElement(titleSelectors);
            if (titleField) {
                fillResults.fieldsFound++;
                titleField.value = metadata.english.title;
                this.triggerEvents(titleField);
                fillResults.fieldsFilled++;
            }

            // Fill Arabic title
            const titleArField = this.findFirstElement(titleArSelectors);
            if (titleArField) {
                fillResults.fieldsFound++;
                titleArField.value = metadata.arabic.title;
                this.triggerEvents(titleArField);
                fillResults.fieldsFilled++;
            }

            // Fill English keywords
            const keywordField = this.findFirstElement(keywordSelectors);
            if (keywordField) {
                fillResults.fieldsFound++;
                keywordField.value = metadata.english.keywords;
                this.triggerEvents(keywordField);
                fillResults.fieldsFilled++;
            }

            // Fill Arabic keywords
            const keywordArField = this.findFirstElement(keywordArSelectors);
            if (keywordArField) {
                fillResults.fieldsFound++;
                keywordArField.value = metadata.arabic.keywords;
                this.triggerEvents(keywordArField);
                fillResults.fieldsFilled++;
            }

            return fillResults;

        } catch (error) {
            fillResults.errors.push(error.message);
            return fillResults;
        }
    }

    // Helper function for auto-fill
    findFirstElement(selectors) {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
        }
        return null;
    }

    // Helper function to trigger form events
    triggerEvents(element) {
        const events = ['input', 'change', 'blur', 'keyup'];
        events.forEach(eventType => {
            element.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
    }

    async handleContextMenuGenerate(info, tab) {
        try {
            // Send message to content script to generate metadata for selected image
            await chrome.tabs.sendMessage(tab.id, {
                action: 'generateFromImage',
                imageUrl: info.srcUrl
            });
        } catch (error) {
            console.error('Error handling context menu generate:', error);
        }
    }

    showWelcomeNotification() {
        chrome.notifications.create('welcome', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '🎉 Welcome to Arab Stock AI!',
            message: 'Generate professional bilingual metadata with AI. Click the extension icon to get started!'
        });
    }

    showUpdateNotification(details) {
        chrome.notifications.create('update', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '✨ Arab Stock AI Updated!',
            message: `Version ${chrome.runtime.getManifest().version} is ready with new features.`
        });
    }

    async openWelcomePage() {
        const welcomeUrl = chrome.runtime.getURL('welcome.html');
        await chrome.tabs.create({ url: welcomeUrl });
    }

    trackUsage(data) {
        // Simple usage tracking (you could expand this)
        console.log('Usage tracked:', data);
        
        // Store usage stats locally
        chrome.storage.local.get('usageStats').then(result => {
            const stats = result.usageStats || {
                totalGenerations: 0,
                totalAutoFills: 0,
                lastUsed: null
            };

            if (data.action === 'generate') {
                stats.totalGenerations++;
            } else if (data.action === 'autoFill') {
                stats.totalAutoFills++;
            }

            stats.lastUsed = new Date().toISOString();

            chrome.storage.local.set({ usageStats: stats });
        });
    }

    // Cleanup function for when extension is disabled/uninstalled
    cleanup() {
        chrome.contextMenus.removeAll();
        chrome.storage.local.clear();
    }
}

// Initialize background service
const backgroundService = new BackgroundService();

// Handle extension lifecycle
chrome.runtime.onSuspend.addListener(() => {
    console.log('Arab Stock AI extension is being suspended');
    backgroundService.cleanup();
});