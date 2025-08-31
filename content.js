// Arab Stock AI Metadata Generator - Content Script
// This script runs on contributor.arabsstock.com pages

class ArabStockIntegrator {
    constructor() {
        this.init();
    }

    init() {
        this.addIntegrationButton();
        this.setupMessageListener();
        this.observeFormChanges();
    }

    addIntegrationButton() {
        // Wait for page to load
        setTimeout(() => {
            this.injectIntegrationButton();
        }, 2000);
    }

    injectIntegrationButton() {
        // Look for upload forms or title/keyword fields
        const uploadForms = document.querySelectorAll('form');
        const titleFields = document.querySelectorAll('input[name*="title"], input[placeholder*="title"]');
        
        if (titleFields.length > 0 || uploadForms.length > 0) {
            this.createIntegrationUI();
        }
    }

    createIntegrationUI() {
        // Create floating action button
        const fab = document.createElement('div');
        fab.id = 'arab-stock-ai-fab';
        fab.innerHTML = `
            <div class="arab-stock-ai-fab">
                <button id="arab-stock-ai-trigger" title="Generate AI Metadata">
                    🤖 AI Metadata
                </button>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .arab-stock-ai-fab {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50px;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                animation: pulse 2s infinite;
            }
            
            #arab-stock-ai-trigger {
                background: transparent;
                border: none;
                color: white;
                padding: 15px 20px;
                border-radius: 50px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            #arab-stock-ai-trigger:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3); }
                50% { box-shadow: 0 4px 30px rgba(102, 126, 234, 0.5); }
                100% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3); }
            }
            
            .arab-stock-ai-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                z-index: 10000;
                font-weight: bold;
                box-shadow: 0 4px 20px rgba(40, 167, 69, 0.3);
                animation: slideInRight 0.3s ease;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .arab-stock-ai-form-highlight {
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3) !important;
                border-color: #667eea !important;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(fab);
        
        // Add click handler
        document.getElementById('arab-stock-ai-trigger').addEventListener('click', () => {
            this.openExtensionPopup();
        });
    }

    openExtensionPopup() {
        // Send message to background script to open popup
        chrome.runtime.sendMessage({
            action: 'openPopup',
            url: window.location.href
        });
        
        this.showNotification('Opening AI Metadata Generator...', 'info');
    }

    setupMessageListener() {
        // Listen for messages from the extension popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'fillForm') {
                this.fillFormFields(message.data);
                sendResponse({ success: true });
            } else if (message.action === 'detectFields') {
                const fields = this.detectFormFields();
                sendResponse({ fields });
            }
        });
    }

    detectFormFields() {
        const fields = {
            title: {
                english: null,
                arabic: null
            },
            keywords: {
                english: null,
                arabic: null
            },
            category: null,
            description: null
        };

        // Detect title fields
        const titleSelectors = [
            'input[name*="title"]:not([name*="ar"])',
            'input[placeholder*="title"]:not([placeholder*="عنوان"])',
            'input[id*="title"]:not([id*="ar"])',
            '.title input:not([name*="ar"])',
            '[data-field="title"] input'
        ];

        const titleArSelectors = [
            'input[name*="title_ar"]',
            'input[name*="title"][name*="ar"]',
            'input[placeholder*="عنوان"]',
            'input[id*="title_ar"]',
            '.title-ar input',
            '[data-field="title_ar"] input'
        ];

        fields.title.english = this.findField(titleSelectors);
        fields.title.arabic = this.findField(titleArSelectors);

        // Detect keyword fields
        const keywordSelectors = [
            'textarea[name*="keywords"]:not([name*="ar"])',
            'textarea[placeholder*="keywords"]:not([placeholder*="كلمات"])',
            'input[name*="tags"]:not([name*="ar"])',
            '.keywords textarea:not([name*="ar"])'
        ];

        const keywordArSelectors = [
            'textarea[name*="keywords_ar"]',
            'textarea[name*="keywords"][name*="ar"]',
            'textarea[placeholder*="كلمات"]',
            'input[name*="tags_ar"]',
            '.keywords-ar textarea'
        ];

        fields.keywords.english = this.findField(keywordSelectors);
        fields.keywords.arabic = this.findField(keywordArSelectors);

        // Detect category field
        const categorySelectors = [
            'select[name*="category"]',
            'select[id*="category"]',
            '.category select',
            '[data-field="category"] select'
        ];

        fields.category = this.findField(categorySelectors);

        return fields;
    }

    findField(selectors) {
        for (const selector of selectors) {
            const field = document.querySelector(selector);
            if (field) {
                return {
                    element: field,
                    selector: selector,
                    type: field.tagName.toLowerCase(),
                    name: field.name || field.id,
                    placeholder: field.placeholder
                };
            }
        }
        return null;
    }

    fillFormFields(metadata) {
        const fields = this.detectFormFields();
        let filledCount = 0;

        try {
            // Fill English title
            if (fields.title.english && metadata.english.title) {
                this.fillField(fields.title.english.element, metadata.english.title);
                filledCount++;
            }

            // Fill Arabic title
            if (fields.title.arabic && metadata.arabic.title) {
                this.fillField(fields.title.arabic.element, metadata.arabic.title);
                filledCount++;
            }

            // Fill English keywords
            if (fields.keywords.english && metadata.english.keywords) {
                this.fillField(fields.keywords.english.element, metadata.english.keywords);
                filledCount++;
            }

            // Fill Arabic keywords
            if (fields.keywords.arabic && metadata.arabic.keywords) {
                this.fillField(fields.keywords.arabic.element, metadata.arabic.keywords);
                filledCount++;
            }

            // Try to select category
            if (fields.category && metadata.category) {
                this.selectCategory(fields.category.element, metadata.category);
            }

            if (filledCount > 0) {
                this.showNotification(`✅ Successfully filled ${filledCount} fields!`, 'success');
                this.highlightFilledFields();
            } else {
                this.showNotification('⚠️ No compatible form fields found', 'warning');
            }

        } catch (error) {
            console.error('Error filling form fields:', error);
            this.showNotification('❌ Error filling form fields', 'error');
        }
    }

    fillField(element, value) {
        if (!element || !value) return;

        element.value = value;
        element.classList.add('arab-stock-ai-form-highlight');
        
        // Trigger events to notify the form
        const events = ['input', 'change', 'blur'];
        events.forEach(eventType => {
            element.dispatchEvent(new Event(eventType, { bubbles: true }));
        });

        // Remove highlight after 3 seconds
        setTimeout(() => {
            element.classList.remove('arab-stock-ai-form-highlight');
        }, 3000);
    }

    selectCategory(element, category) {
        if (!element || !category) return;

        const options = Array.from(element.options);
        const matchingOption = options.find(option => {
            const optionText = option.text.toLowerCase();
            const optionValue = option.value.toLowerCase();
            const categoryLower = category.toLowerCase();
            
            return optionText.includes(categoryLower) || 
                   optionValue.includes(categoryLower) ||
                   this.getCategoryMapping(categoryLower, optionText);
        });

        if (matchingOption) {
            element.value = matchingOption.value;
            element.classList.add('arab-stock-ai-form-highlight');
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
            setTimeout(() => {
                element.classList.remove('arab-stock-ai-form-highlight');
            }, 3000);
        }
    }

    getCategoryMapping(category, optionText) {
        const mappings = {
            'people': ['people', 'lifestyle', 'portrait', 'human'],
            'business': ['business', 'office', 'corporate', 'finance'],
            'technology': ['technology', 'tech', 'computer', 'digital'],
            'culture': ['culture', 'heritage', 'traditional', 'ethnic'],
            'architecture': ['architecture', 'building', 'construction'],
            'nature': ['nature', 'landscape', 'outdoor', 'environment'],
            'food': ['food', 'cuisine', 'cooking', 'meal'],
            'travel': ['travel', 'tourism', 'destination', 'vacation'],
            'education': ['education', 'learning', 'school', 'student'],
            'healthcare': ['healthcare', 'medical', 'health', 'hospital'],
            'fashion': ['fashion', 'style', 'clothing', 'beauty'],
            'sports': ['sports', 'fitness', 'recreation', 'exercise'],
            'religion': ['religion', 'islamic', 'spiritual', 'mosque'],
            'transportation': ['transport', 'vehicle', 'car', 'travel'],
            'shopping': ['shopping', 'retail', 'store', 'commerce'],
            'events': ['events', 'celebration', 'party', 'festival'],
            'abstract': ['abstract', 'concept', 'graphic', 'design'],
            'animals': ['animals', 'pets', 'wildlife', 'creatures'],
            'home': ['home', 'interior', 'house', 'domestic'],
            'industrial': ['industrial', 'factory', 'manufacturing', 'production']
        };

        const categoryMappings = mappings[category] || [];
        return categoryMappings.some(mapping => optionText.includes(mapping));
    }

    highlightFilledFields() {
        const filledFields = document.querySelectorAll('.arab-stock-ai-form-highlight');
        filledFields.forEach((field, index) => {
            setTimeout(() => {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, index * 500);
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.arab-stock-ai-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = 'arab-stock-ai-notification';
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.background = colors[type] || colors.info;
        if (type === 'warning') {
            notification.style.color = '#000';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    observeFormChanges() {
        // Watch for dynamic form loading
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const hasFormElements = addedNodes.some(node => 
                        node.nodeType === 1 && (
                            node.tagName === 'FORM' ||
                            node.querySelector && (
                                node.querySelector('input[name*="title"]') ||
                                node.querySelector('textarea[name*="keywords"]')
                            )
                        )
                    );
                    
                    if (hasFormElements && !document.getElementById('arab-stock-ai-fab')) {
                        this.injectIntegrationButton();
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Method to get current page context for better metadata generation
    getPageContext() {
        const context = {
            url: window.location.href,
            title: document.title,
            hasUploadForm: false,
            formFields: this.detectFormFields(),
            pageType: 'unknown'
        };

        // Detect page type
        if (context.url.includes('/upload') || context.url.includes('/contribute')) {
            context.pageType = 'upload';
            context.hasUploadForm = true;
        } else if (context.url.includes('/edit')) {
            context.pageType = 'edit';
        }

        return context;
    }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ArabStockIntegrator();
    });
} else {
    new ArabStockIntegrator();
}

// Also initialize if page is loaded via AJAX
let lastUrl = window.location.href;
new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        setTimeout(() => {
            new ArabStockIntegrator();
        }, 1000);
    }
}).observe(document, { subtree: true, childList: true });