// Arab Stock AI Metadata Generator - Popup Script
class ArabStockGenerator {
    constructor() {
        this.uploadedImageData = null;
        this.currentLanguage = 'english';
        this.init();
    }

    init() {
        this.loadSavedSettings();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        // Upload functionality
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const uploadBtn = document.getElementById('uploadBtn');

        uploadBtn.addEventListener('click', () => imageInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageUpload(files[0]);
            }
        });

        uploadArea.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageUpload(e.target.files[0]);
            }
        });

        // Language tabs
        document.querySelectorAll('.language-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchLanguage(e.target.dataset.lang);
            });
        });

        // Action buttons
        document.getElementById('generateBtn').addEventListener('click', () => this.generateMetadata());
        document.getElementById('demoBtn').addEventListener('click', () => this.showDemo());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportMetadata());
        document.getElementById('autoFillBtn').addEventListener('click', () => this.autoFillArabStock());

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.copyToClipboard(e.target.dataset.target, e.target);
            });
        });

        // API key saving
        document.getElementById('apiKey').addEventListener('change', (e) => {
            this.saveSettings();
        });

        // Other form elements
        ['category', 'description', 'mood'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.saveSettings());
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'g':
                        e.preventDefault();
                        this.generateMetadata();
                        break;
                    case '1':
                        e.preventDefault();
                        this.switchLanguage('english');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchLanguage('arabic');
                        break;
                }
            }
        });
    }

    async loadSavedSettings() {
        try {
            const result = await chrome.storage.local.get(['apiKey', 'aiProvider', 'category', 'mood', 'description']);
            
            if (result.apiKey) {
                document.getElementById('apiKey').value = result.apiKey;
            }
            if (result.aiProvider) {
                document.querySelector(`input[name="aiProvider"][value="${result.aiProvider}"]`).checked = true;
            }
            if (result.category) {
                document.getElementById('category').value = result.category;
            }
            if (result.mood) {
                document.getElementById('mood').value = result.mood;
            }
            if (result.description) {
                document.getElementById('description').value = result.description;
            }
        } catch (error) {
            console.log('No saved settings found');
        }
    }

    async saveSettings() {
        const settings = {
            apiKey: document.getElementById('apiKey').value,
            aiProvider: document.querySelector('input[name="aiProvider"]:checked').value,
            category: document.getElementById('category').value,
            mood: document.getElementById('mood').value,
            description: document.getElementById('description').value
        };

        try {
            await chrome.storage.local.set(settings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showError('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImageData = e.target.result;
            const previewContainer = document.getElementById('previewContainer');
            previewContainer.innerHTML = `<img src="${e.target.result}" class="preview-image" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update tabs
        document.querySelectorAll('.language-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.language-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(lang + '-content').classList.add('active');
    }

    async generateMetadata() {
        const apiKey = document.getElementById('apiKey').value;
        const provider = document.querySelector('input[name="aiProvider"]:checked').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const mood = document.getElementById('mood').value;

        if (!apiKey) {
            this.showError('Please enter your API key.');
            return;
        }

        if (!category) {
            this.showError('Please select a category.');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const metadata = await this.callAI(provider, apiKey, {
                category,
                description,
                mood,
                imageData: this.uploadedImageData
            });

            this.displayResults(metadata);
            this.showSuccess('Metadata generated successfully!');
            
            // Save successful generation
            await this.saveSettings();
            
        } catch (error) {
            this.showError('Error generating metadata: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async callAI(provider, apiKey, context) {
        const prompt = this.createPrompt(context);
        
        if (provider === 'openai') {
            return await this.callOpenAI(apiKey, prompt, context.imageData);
        } else {
            return await this.callGemini(apiKey, prompt, context.imageData);
        }
    }

    createPrompt(context) {
        return `Generate professional stock photo metadata for Arab Stock platform:

Category: ${context.category}
Description: ${context.description || 'Not provided'}
Style/Mood: ${context.mood || 'Professional'}

Requirements:
1. Create compelling titles in both English and Arabic (max 200 characters each)
2. Generate 35-45 relevant keywords in English and Arabic
3. Focus on Middle Eastern, Arabic, Gulf, and Islamic cultural themes
4. Include regional specificity (UAE, Saudi, Qatar, etc.)
5. Optimize for stock photo searchability
6. Include both literal descriptive and conceptual keywords
7. Consider cultural sensitivity and authenticity

Format response as valid JSON only:
{
  "english": {
    "title": "Professional English title optimized for search",
    "keywords": ["keyword1", "keyword2", "keyword3", ...],
    "tags": ["tag1", "tag2", "tag3", ...]
  },
  "arabic": {
    "title": "العنوان المهني بالعربية محسن للبحث",
    "keywords": ["كلمة1", "كلمة2", "كلمة3", ...],
    "tags": ["علامة1", "علامة2", "علامة3", ...]
  }
}`;
    }

    async callOpenAI(apiKey, prompt, imageData) {
        const messages = [
            {
                role: "system",
                content: "You are a professional stock photo metadata generator specializing in Arabic and Middle Eastern content. Always respond with valid JSON only."
            }
        ];

        // Add user message with image if available
        if (imageData) {
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { 
                        type: "image_url", 
                        image_url: { 
                            url: imageData,
                            detail: "low"
                        } 
                    }
                ]
            });
        } else {
            messages.push({
                role: "user",
                content: prompt
            });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: imageData ? "gpt-4-vision-preview" : "gpt-4",
                messages: messages,
                max_tokens: 2000,
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        try {
            return JSON.parse(content);
        } catch (e) {
            console.warn('Failed to parse OpenAI JSON response, using fallback parser');
            return this.parseAIResponse(content);
        }
    }

    async callGemini(apiKey, prompt, imageData) {
        let url, body;
        
        if (imageData) {
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`;
            const base64Data = imageData.split(',')[1];
            body = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Data
                            }
                        }
                    ]
                }]
            };
        } else {
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
            body = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...body,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${errorData.error?.message || response.status}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;
        
        try {
            const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanContent);
        } catch (e) {
            console.warn('Failed to parse Gemini JSON response, using fallback parser');
            return this.parseAIResponse(content);
        }
    }

    parseAIResponse(content) {
        // Fallback parser for non-JSON responses
        console.log('Using fallback parser for content:', content);
        
        const englishTitleMatch = content.match(/english.*?title.*?[":]\s*["']([^"']+)["']/i);
        const arabicTitleMatch = content.match(/arabic.*?title.*?[":]\s*["']([^"']+)["']/i);
        
        return {
            english: {
                title: englishTitleMatch ? englishTitleMatch[1] : "Professional Arab Stock Photo - High Quality Middle Eastern Content",
                keywords: this.generateFallbackKeywords('en'),
                tags: this.generateFallbackKeywords('en').slice(0, 20)
            },
            arabic: {
                title: arabicTitleMatch ? arabicTitleMatch[1] : "صورة احترافية عربية - محتوى عالي الجودة من الشرق الأوسط",
                keywords: this.generateFallbackKeywords('ar'),
                tags: this.generateFallbackKeywords('ar').slice(0, 20)
            }
        };
    }

    generateFallbackKeywords(lang) {
        const englishKeywords = [
            'arab', 'arabic', 'middle east', 'gulf', 'islamic', 'traditional', 'modern', 'culture', 'heritage',
            'business', 'professional', 'lifestyle', 'people', 'architecture', 'desert', 'city', 'dubai',
            'saudi arabia', 'emirates', 'qatar', 'kuwait', 'bahrain', 'oman', 'muslim', 'mosque',
            'bedouin', 'camel', 'oil', 'luxury', 'elegant', 'authentic', 'contemporary', 'urban',
            'traditional dress', 'thobe', 'hijab', 'calligraphy', 'geometric', 'pattern', 'gold',
            'hospitality', 'family', 'celebration', 'festival', 'ramadan', 'eid', 'prayer'
        ];
        
        const arabicKeywords = [
            'عربي', 'عرب', 'الشرق الأوسط', 'الخليج', 'إسلامي', 'تراثي', 'حديث', 'ثقافة', 'تراث',
            'أعمال', 'مهني', 'نمط حياة', 'أشخاص', 'عمارة', 'صحراء', 'مدينة', 'دبي',
            'السعودية', 'الإمارات', 'قطر', 'الكويت', 'البحرين', 'عمان', 'مسلم', 'مسجد',
            'بدوي', 'جمل', 'نفط', 'فخامة', 'أنيق', 'أصيل', 'معاصر', 'حضري',
            'زي تراثي', 'ثوب', 'حجاب', 'خط عربي', 'هندسي', 'نمط', 'ذهب',
            'ضيافة', 'عائلة', 'احتفال', 'مهرجان', 'رمضان', 'عيد', 'صلاة'
        ];
        
        return lang === 'en' ? englishKeywords : arabicKeywords;
    }

    showDemo() {
        const demoMetadata = {
            english: {
                title: "Professional Arab businessman working on laptop in modern Dubai office building with city skyline",
                keywords: [
                    "arab businessman", "professional", "laptop", "office", "dubai", "middle east", "gulf",
                    "business", "working", "technology", "modern", "corporate", "success", "finance",
                    "entrepreneur", "executive", "career", "suit", "confident", "meeting", "presentation",
                    "leadership", "innovation", "growth", "development", "strategic", "planning", "digital",
                    "communication", "urban", "contemporary", "lifestyle", "productivity", "achievement",
                    "arabic", "muslim", "professional arab", "gulf business", "middle eastern business"
                ],
                tags: [
                    "arab business", "dubai office", "professional", "technology", "success", "corporate",
                    "modern", "gulf business", "arabic businessman", "laptop work", "middle east business",
                    "entrepreneur", "executive", "finance", "innovation", "leadership", "productivity"
                ]
            },
            arabic: {
                title: "رجل أعمال عربي محترف يعمل على الكمبيوتر المحمول في مكتب دبي الحديث مع أفق المدينة",
                keywords: [
                    "رجل أعمال عربي", "محترف", "كمبيوتر محمول", "مكتب", "دبي", "الشرق الأوسط", "الخليج",
                    "أعمال", "عمل", "تكنولوجيا", "حديث", "شركات", "نجاح", "مالية",
                    "رائد أعمال", "تنفيذي", "مهنة", "بدلة", "واثق", "اجتماع", "عرض",
                    "قيادة", "ابتكار", "نمو", "تطوير", "استراتيجي", "تخطيط", "رقمي",
                    "تواصل", "حضري", "معاصر", "نمط حياة", "إنتاجية", "إنجاز",
                    "عربي", "مسلم", "عربي محترف", "أعمال خليجية", "أعمال شرق أوسطية"
                ],
                tags: [
                    "أعمال عربية", "مكتب دبي", "محترف", "تكنولوجيا", "نجاح", "شركات",
                    "حديث", "أعمال خليجية", "رجل أعمال عربي", "عمل محمول", "أعمال شرق أوسطية",
                    "رائد أعمال", "تنفيذي", "مالية", "ابتكار", "قيادة", "إنتاجية"
                ]
            }
        };
        
        this.displayResults(demoMetadata);
        this.showSuccess('Demo metadata generated! Try the real AI for custom results.');
    }

    displayResults(metadata) {
        // Show results section
        document.getElementById('results').style.display = 'block';

        // English results
        document.getElementById('enTitle').value = metadata.english.title;
        document.getElementById('enKeywords').value = metadata.english.keywords.join(', ');
        document.getElementById('enTitleCount').textContent = metadata.english.title.length;
        document.getElementById('enKeywordCount').textContent = metadata.english.keywords.length;

        // Arabic results
        document.getElementById('arTitle').value = metadata.arabic.title;
        document.getElementById('arKeywords').value = metadata.arabic.keywords.join('، ');
        document.getElementById('arTitleCount').textContent = metadata.arabic.title.length;
        document.getElementById('arKeywordCount').textContent = metadata.arabic.keywords.length;

        // Display tags
        this.displayKeywordTags('enKeywordTags', metadata.english.keywords.slice(0, 20));
        this.displayKeywordTags('arKeywordTags', metadata.arabic.keywords.slice(0, 20));

        // Scroll to results
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }

    displayKeywordTags(containerId, keywords) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        keywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.className = 'keyword-tag';
            tag.textContent = keyword;
            container.appendChild(tag);
        });
    }

    async copyToClipboard(targetId, button) {
        const element = document.getElementById(targetId);
        
        try {
            await navigator.clipboard.writeText(element.value);
            
            const originalText = button.textContent;
            button.textContent = targetId.includes('ar') ? 'تم النسخ!' : 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy: ', err);
            this.showError('Failed to copy to clipboard');
        }
    }

    exportMetadata() {
        const data = {
            timestamp: new Date().toISOString(),
            category: document.getElementById('category').value,
            mood: document.getElementById('mood').value,
            description: document.getElementById('description').value,
            english: {
                title: document.getElementById('enTitle').value,
                keywords: document.getElementById('enKeywords').value
            },
            arabic: {
                title: document.getElementById('arTitle').value,
                keywords: document.getElementById('arKeywords').value
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arab-stock-metadata-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Metadata exported successfully!');
    }

    async autoFillArabStock() {
        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('contributor.arabsstock.com')) {
                this.showError('Please navigate to Arab Stock contributor page first.');
                return;
            }

            const metadata = {
                english: {
                    title: document.getElementById('enTitle').value,
                    keywords: document.getElementById('enKeywords').value
                },
                arabic: {
                    title: document.getElementById('arTitle').value,
                    keywords: document.getElementById('arKeywords').value
                },
                category: document.getElementById('category').value
            };

            // Inject content script and auto-fill
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: this.fillArabStockForm,
                args: [metadata]
            });

            this.showSuccess('Auto-fill completed! Check the Arab Stock form.');
            
        } catch (error) {
            console.error('Auto-fill error:', error);
            this.showInstructions();
        }
    }

    // This function will be injected into the Arab Stock page
    fillArabStockForm(metadata) {
        // Find and fill title fields
        const titleSelectors = [
            'input[name*="title"]',
            'input[placeholder*="title"]', 
            'input[id*="title"]',
            '.title input',
            '[data-field="title"] input'
        ];
        
        const keywordSelectors = [
            'textarea[name*="keywords"]',
            'textarea[placeholder*="keywords"]',
            'textarea[id*="keywords"]', 
            '.keywords textarea',
            '[data-field="keywords"] textarea'
        ];

        // Fill English title
        for (const selector of titleSelectors) {
            const field = document.querySelector(selector);
            if (field && !field.value) {
                field.value = metadata.english.title;
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }

        // Fill English keywords
        for (const selector of keywordSelectors) {
            const field = document.querySelector(selector);
            if (field && !field.value) {
                field.value = metadata.english.keywords;
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }

        // Show notification
        const notification = document.createElement('div');
        notification.className = 'autofill-notification';
        notification.textContent = '✅ Auto-fill completed!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showInstructions() {
        const instructions = `🚀 Manual Auto-Fill Instructions:

1. Open Arab Stock contributor panel
2. Navigate to Upload Images section  
3. Upload your image file
4. Copy the generated metadata:

English Section:
• Title: ${document.getElementById('enTitle').value}
• Keywords: Copy from English Keywords field

Arabic Section:  
• العنوان: ${document.getElementById('arTitle').value}
• الكلمات المفتاحية: Copy from Arabic Keywords field

💡 Use the Copy buttons for quick transfer!`;
        
        alert(instructions);
    }

    clearAll() {
        // Clear form inputs
        document.getElementById('imageInput').value = '';
        document.getElementById('category').value = '';
        document.getElementById('description').value = '';
        document.getElementById('mood').value = '';
        
        // Clear results
        ['enTitle', 'enKeywords', 'arTitle', 'arKeywords'].forEach(id => {
            document.getElementById(id).value = '';
        });
        
        // Clear preview
        document.getElementById('previewContainer').innerHTML = '';
        
        // Clear tags
        document.getElementById('enKeywordTags').innerHTML = '';
        document.getElementById('arKeywordTags').innerHTML = '';
        
        // Reset stats
        ['enTitleCount', 'enKeywordCount', 'arTitleCount', 'arKeywordCount'].forEach(id => {
            document.getElementById(id).textContent = '0';
        });
        
        // Hide results
        document.getElementById('results').style.display = 'none';
        
        this.hideMessages();
        this.uploadedImageData = null;
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
        document.getElementById('generateBtn').disabled = show;
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => errorElement.style.display = 'none', 5000);
    }

    showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => successElement.style.display = 'none', 3000);
    }

    hideMessages() {
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArabStockGenerator();
});